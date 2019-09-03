/* 设计器区域
 * @Author: houxingzhang
 * @Date: 2019-09-03 16:30:28
 * @Last Modified by: houxingzhang
 * @Last Modified time: 2019-09-03 16:55:17
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tooltip, Button } from 'antd'
import componentConfig from '../../config/index'

import _ from 'lodash'
import { updateDynamicComponent, updateEditComponentId, updateDraggable, updateBaseState } from '../../redux/reducers/designer/action'

const allComponents = require('../../components/index').default

class DesignArea extends Component {
  constructor () {
    super()
    this.state = {
      componentIndex: 0
    }
  }
  // 拖拽到上面
  dragOverHandle (e, dom) {
    e.preventDefault()
    if (!this.props.draggable.hover) {
      this.props.updateDraggable('hover', true) // 当前拖拽的对象
      this.props.updateBaseState('activeId', dom) 
    }
    console.log('拖拽到上面', this.props.draggable.hover)
  }

  // 拖拽移除目录对象
  dragLeaveHandle (e, dom) {
    this.props.updateDraggable('hover', false) // 当前拖拽的对象
    this.props.updateBaseState('activeId', null)
    console.log('移出去了')
  }

  // 拖拽释放结束
  dropHandle (e, dom) {
    this.props.updateDraggable('hover', false) // 当前拖拽的对象
    this.props.updateBaseState('isDesign', true)
    this.props.updateBaseState('activeId', null)

    const component = this.getComponent(this.props.draggable.current) // 获取对应类型的组件
    if (!component) return
    this.props.updateDynamicComponent(component) // 添加动态组件
    this.currentComponentEditHandle(e, component)
    console.log('拖拽释放,并获取组件:', component)
  }

  // 获取对应组件类型及相关配置
  getComponent (type) {
    if (!type || !type.key) return
    const name = type
      .key
      .substring(0, 1)
      .toUpperCase() + type
      .key
      .substring(1) // 保障首字大写

    const component = allComponents[name] // 组件类型
    const config = _.cloneDeep(componentConfig[name]) // 组件配置
    if (!component || !config) {
      console.error(`缺少'${name}组件'的相关配置`)
      return
    }
    const id = this.state.componentIndex + 1
    this.setState({ componentIndex: id })
    return { config, id, name, type: component }
  }

  // 当前组件进入编辑模式
  currentComponentEditHandle (e, component) {
    e.stopPropagation() // 阻止事件冒泡
    // e.nativeEvent.stopImmediatePropagation()
    const domId = `dom_${component.name}_${component.id}`
    this.props.updateBaseState('activeId', domId)
    const currentComponentId = this.props.editComponentId
    if (currentComponentId && component.id === currentComponentId) return
    this.props.updateEditComponentId(component.id)
    console.log('记录当前要编辑的组件对象:' + domId)
  }

  // 显示页面属性
  showPageAttribute (e) {
    this.props.updateBaseState('editComponentId', null)
    this.props.updateBaseState('activeId', 'dom_0')
  }
  // 删除当前编辑的组件
  deleteCurrentComponent (e) {
    e && e.stopPropagation()
    this.props.editComponentId && _.remove(this.props.dynamicComponentList, { id: this.props.editComponentId })
    this.props.updateBaseState('editComponentId', null) // 更新视图与状态
    this.props.updateBaseState('activeId', 'dom_0') // 更新视图与状态
    console.log('删除当前组件')
  }
  // 动态渲染拖拽生成的组件
  renderComponent (component, index) {
    if (!component) return false
    const { config, id, name, type } = component // 组件类型
    const domId = `dom_${name}_${id}`
    const props = config.props // 组件的属性
    if (config.grid) { // 带有栅格属性
      const { col, gutter } = config.grid
      const style = {
        padding: gutter
      }
      return (
        <span
          className={'page_designer_item ' + col + (this.props.activeId === domId
            ? ' isactive'
            : '')}
          key={index}
          id={domId}
          style={style}
          onClick={(e) => this.currentComponentEditHandle(e, component)}>
          <Tooltip title='删除此组件'>
            <Button type='danger' size='small' icon='close' shape='circle' className='actionBtn' onClick={this.deleteCurrentComponent.bind(this)}  />
          </Tooltip>
          <label>{config.grid.label}</label>
          <span>{React.createElement(type, props, config.slot)}</span>
        </span>
      )
    } else {
      props.key = index
      props.id = domId
      return React.createElement(type, props, config.slot)
    }
  }
  render () {
    return (
      <div
        id='dom_0'
        className={'draggable ant-row ' + (this.props.activeId === 'dom_0'
          ? 'isdroping'
          : '')}
        onClick={ this.showPageAttribute.bind(this)}
        onDragOver={e => this.dragOverHandle(e, 'dom_0')}
        onDragLeave={e => this.dragLeaveHandle(e, 'dom_0')}
        onDrop={e => this.dropHandle(e, 'dom_0')}>
        {!this.props.isDesign && <div className='page_designer_tip'>
          <span>请拖组件到这里进行设计</span>
        </div>}
        {this
          .props
          .dynamicComponentList
          .map((component, index) => this.renderComponent(component, index))}
      </div>
    )
  }
}

const mapStateToProps = store => {
  const { designer } = store
  const { editComponentId, dynamicComponentList, draggable, timespan, isDesign, activeId } = designer
  return { editComponentId, dynamicComponentList, draggable, timespan, isDesign, activeId }
}

export default connect(mapStateToProps, {
  updateDynamicComponent, updateEditComponentId, updateDraggable, updateBaseState })(DesignArea)
