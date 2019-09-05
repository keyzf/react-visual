/* 页面设计器
 * @Author: houxingzhang
 * @Date: 2019-08-28 20:00:24
 * @Last Modified by: houxingzhang
 * @Last Modified time: 2019-09-05 20:35:23
 */
import React, { Component } from 'react'
import {
  Layout,
  Tabs,
  Button,
  Tooltip,
  Modal
} from 'antd'
import '../assets/scss/page_designer.scss'

import RightSider from './components/right/RightSider'
import LeftSider from './components/left/LeftSider'
import DesignArea from './components/DesignArea'
import Code from './components/Code'
import { connect } from 'react-redux'
import _ from 'lodash'

import { updateDynamicComponent, updateBaseState } from '../redux/reducers/designer/action'

const { Content } = Layout
const { TabPane } = Tabs
class Designer extends Component {
  // 设计器与源码预览切换
  tabCallback (key) {
    // TODO: 源码预览切换,请进行编辑逻辑
    if (key === 'code') {
      // this.renderJSONtoJSX()
    }
    this.props.updateBaseState('tabActiveKey', key)
  }

  // 把当前json转为JSX代码
  renderJSONtoJSX () {
    const { dynamicComponentList } = this.props
    const dependComponents = []
    const element = []

    dynamicComponentList.forEach(item => {
      dependComponents.push(item.name) // 依赖的组件
    })
    return `import React, { Component } from 'react';
  /*
  * 这里声明要引入的组件
  */
  import 'antd/dist/antd.css'
  import '../assets/scss/preview.scss'
  import allComponents from '../components'
  const { ${_.uniq(dependComponents).join(
    ', '
  )} } = allComponents
     

  /**
  * Preivew 一般是当前页面名称 Preivew.html 
  */
  class Preivew extends Component {
    constructor (props) {
      super(props)
      this.state= {
        dataSource: {
          ${this.renderObjToJSX(this.props.dataSource)}
        }
      }
    }
    render(){
      return(<div class='ant-row design_preview'>
      ${this.renderElementtoJSX(dynamicComponentList).replace(/\n    /, '')}
      </div>)
    }
  }
  export default Preivew;

  `
  }
  // 对象转为JSX
  renderObjToJSX (obj) {
    let attrs = ''
    Object.keys(obj).forEach(name => {
      attrs += ` ${name}: ${JSON.stringify(obj[name])}, \n        `
    })

    return attrs
  }

  // 渲染子级填充内容或子级组件
  renderChildrensAndContainer (config) {
    const { type } = config // 组件类型
    let result = config.slot || '' // 默认内容
    switch (type) {
      case 'Div': // TODO: 容器
      case 'Form':
      case 'Panel':
        result = '这个是容器,需要再次编辑'
        break
      case 'Select': // 可以绑定数据源的组件,
        if (config.props.staticDataSource) { // 包含有静态数据源
          const list = this.props.dataSource.static[config.props.staticDataSource] // 筛选出当前所属的静态数据源
          list.forEach(item => {
            result += `<Select.Option key='${item.key}' value='${item.key}'>${item.value}</Select.Option>\n        `
          })
        }
        break
      default:
        break
    }
    return result
  }
  // 渲染组件元素到JSX
  renderElementtoJSX (data, indent = '') {
    let result = ''
    indent += '    ' // 缩进
    // FIXME: 当前组件还没有嵌套,需要嵌套处理, 下级为childrens
    data.forEach(el => {
      const { col, gutter } = el.config.grid
      const gridStyle = {
        padding: gutter
      }
   
      result += `
      ${indent}
      <span key='${el.name + '_' + el.id}' id='${el.name + '_' + el.id}' className={'${col}'} style={${JSON.stringify(gridStyle)}}>
        <${el.name} ${this.renderProps(el.config)}>
        ${this.renderChildrensAndContainer(el.config)}
        </${el.name}>
      </span>`
    })
    return result
    /*

     ${!el.config.slot ? '' : (el.config.childrens ? this.renderElementtoJSX(el.config.childrens) : el.config.slot)}
    var result = ''
    this.state.indent_space += '    '
    data.forEach(d => {
      if (d.hasDelete) return
      console.log(d)
      console.log(d.props)
      result += `
    ${this.state.indent_space}<${d.type}${this.renderProps(d.props, d)}>${
  d.props.content
    ? [d.props.content]
    : d.childrens
      ? this.renderElementtoJSX(d.childrens)
      : ''
}</${d.type}>
    `
    })
    this.state.indent_space = this.state.indent_space.replace('    ', '')
    result += `${this.state.indent_space}`
    return result */
  }
  // 渲染属性
  renderProps (config) {
    let props = config.props
    // 处理样式部分
    props.style = { ...props.style }
    const baseStyle = _.cloneDeep(config.config.style.props)
    baseStyle && Object.keys(baseStyle).forEach(name => {
      if (name !== 'className') {
        props.style[name] = baseStyle[name].value
        delete props[name] // 移除不必要的props
      }
    })

    // TODO: 根据不同条件进行不同props处理
    let attrs = ''
    Object.keys(props).forEach(name => {
      if (name === 'style') {
        attrs += ` ${name}={${JSON.stringify(props[name])}}`
      } else {
        attrs += ` ${name}=${JSON.stringify(props[name])}`
      }
    })
    return attrs
  }

  // 重做,清除全部组件
  reloadComponents () {
    const props = this.props
    Modal.confirm({
      okText: '确认',
      cancelText: '取消',
      title: '您确认要重做吗?',
      content: `重做,将会把之前所有的组件给清空`,
      onOk () {
        props.updateDynamicComponent(null, 'reload')
      },
      onCancel () {}
    })
  }
  render () {
    return (
      <Layout className='page_designer'>
        <LeftSider />
        <Layout className='page_designer_panel'>
          <Content>
            <div className='drag-container'>
              <div className='page_designer_toolbar'>
                <Tooltip title='数据源管理' >
                  <Button type='primary' shape='circle' icon='codepen' />
                </Tooltip>
                <Tooltip title='弹窗管理' >
                  <Button type='primary' shape='circle' icon='block' />
                </Tooltip>
                <Tooltip title='自定义CSS样式' >
                  <Button type='primary' shape='circle' icon='container' />
                </Tooltip>
                <Tooltip title='重做，清除全部组件' >
                  <Button type='danger' shape='circle' icon='reload' onClick={this.reloadComponents.bind(this)} disabled={this.props.dynamicComponentList.length === 0} />
                </Tooltip>
              </div>
              <Tabs onChange={this.tabCallback.bind(this)} type='card' activeKey={this.props.tabActiveKey}>
                <TabPane tab='设计器' key='designer'>
                  <DesignArea />
                </TabPane>
                <TabPane tab='代码' key='code'>
                  <Code code={this.renderJSONtoJSX()} />
                </TabPane>
              </Tabs>
            </div>
          </Content>
        </Layout>
        <RightSider />
      </Layout>
    )
  }
}

const mapStateToProps = store => {
  const { designer } = store
  const { dynamicComponentList, timespan, dataSource, tabActiveKey } = designer
  return { dynamicComponentList, timespan, dataSource, tabActiveKey }
}

export default connect(mapStateToProps, { updateDynamicComponent, updateBaseState })(Designer)
