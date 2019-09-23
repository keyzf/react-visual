/* 左边菜单
 * @Author: houxingzhang
 * @Date: 2019-09-03 16:30:46
 * @Last Modified by: houxingzhang
 * @Last Modified time: 2019-09-05 20:37:16
 */
import React, { Component } from 'react';
import { Layout, Icon, Menu } from 'antd';
import { connect } from 'react-redux';
import menulist from '@assets/data/compontMenu';
// import tableList from '@assets/data/tableMenu'
import {
  updateDraggable,
  updateBaseState
} from '@redux/reducers/designer/action';

const { Sider } = Layout;
const { SubMenu } = Menu;

class LeftSider extends Component {
  constructor() {
    super();
    this.state = {
      openKeys: ['from']
    };
    this.rootSubmenuKeys = [];
  }

  // 拖拽开始
  dragStartHandle(e, data) {
    this.props.updateDraggable('current', data); // 当前拖拽的对象
    this.props.updateBaseState('tabActiveKey', 'designer');
  }
  // 组件菜单列表
  menuList(list = menulist) {
    return list.map(item => {
      if (!item.subMenus || item.subMenus.length === 0) {
        return (
          <Menu.Item key={item.key}>
            <div
              draggable="true"
              id={'comp_' + item.key}
              key={item.key}
              onDragStart={e => this.dragStartHandle(e, item)}
            >
              <Icon type={item.icon} /> {item.name}
            </div>
          </Menu.Item>
        );
      } else {
        return (
          <SubMenu
            key={item.key}
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <strong>{item.name}</strong>
                </span>
              ) : (
                <strong>{item.name}</strong>
              )
            }
          >
            {this.menuList(item.subMenus)}
          </SubMenu>
        );
      }
    });
  }

  // 菜单点击展开
  onOpenChange(openKeys) {
    const latestOpenKey = openKeys.find(
      key => this.state.openKeys.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : []
      });
    }
  }

  render() {
    return (
      <Sider className="page_designer_sider page_designer_compent" width="240">
        <h4>表数据结构</h4>
        <Menu
          className="page_designer_menu"
          mode="inline"
          onOpenChange={this.onOpenChange.bind(this)}
          openKeys={this.state.openKeys}
        ></Menu>
        <h4 className="page_designer_title">控件类型</h4>
        <Menu
          className="page_designer_menu"
          mode="inline"
          onOpenChange={this.onOpenChange.bind(this)}
          openKeys={this.state.openKeys}
        >
          {this.menuList()}
        </Menu>
      </Sider>
    );
  }
}

const mapStateToProps = store => {
  const { designer } = store;
  const { menus } = designer;
  return { menus };
};
export default connect(
  mapStateToProps,
  { updateDraggable, updateBaseState }
)(LeftSider);
