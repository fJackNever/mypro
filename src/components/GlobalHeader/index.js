import React, { PureComponent } from 'react';
import { Menu,Tooltip,Icon,Popover,Dropdown } from 'antd';
import { Link } from 'dva/router';
import styles from './index.less';
import { logoutStart } from '../../utils/api'

const getIcon = icon => {
  if (typeof icon === 'string') {
    if (icon.indexOf('http') === 0) {
      return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
    }
    return <Icon type={icon} />;
  }

  return icon;
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => [path,path2]
 * @param  menu
 */
export const getFlatMenuKeys = menu =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))),
    []
  );

export default class GlobalHeader extends PureComponent {
    constructor(props) {
      super(props);
      this.flatMenuKeys = getFlatMenuKeys(props.menuData);

    }

    state = {
      current: '/workbench/workplace',
    }

    componentDidMount(){
      this.setState({
        companyName:'上海网约车租赁公司'
      })
    }


  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    //console.log(item)
    const itemPath = this.conversionPath(item.path);
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          <span>{name}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
      >
        <span>{name}</span>
      </Link>
    );
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    //console.log(item.path)
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </span>
              ) : (
                item.name
              )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
    }
  };

  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {
      location: { pathname },
    } = this.props;
    return getMenuMatchKeys(this.flatMenuKeys, urlToList(pathname));
  };

  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };

  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    const { Authorized } = this.props;
    if (Authorized && Authorized.check) {
      const { check } = Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };

  isMainMenu = key => {
    const { menuData } = this.props;
    return menuData.some(item => key && (item.key === key || item.path === key));
  };

  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };

  //点击个人中心和退出登录
  handleLogout = (e) =>{
      window.localStorage.clear();
      let formData = new FormData();
      formData.append("plat_form", "app");
      logoutStart(formData).then((data)=>{
      })
      window.location.href="/#/user/login";
  }


  render() {
    const { menuData } = this.props;
    const content1 = (
      <div>
        <img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153069167083725082" alt=""/>
      </div>
    )

    const content2 = (
      <div>
        <img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845159615557512" alt=""/>
      </div>
    )

    const content3 = (
      <div>
        <img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845159615557512" alt=""/>
      </div>
    )

    const logoutmenu = (
                  <Menu>
                    <Menu.Item style={{padding:'10px'}} onClick={this.handleLogout}>
                      <Icon type="logout" />&nbsp;&nbsp;退出登录
                    </Menu.Item>
                  </Menu>
                );
    return (
      <div className={styles.header}>
         <div className={styles.companyTitle}>
           <h1>{this.state.companyName}</h1>
         </div>
         <Menu
           theme="dark"
           mode="horizontal"
           selectedKeys={[this.state.current]}
         >
           {this.getNavMenuItems(menuData)}
         </Menu>
        <div className={styles.toolnav}>
          <Tooltip placement="bottom" title="在线客服">
            <a className={styles.toolaction} href="javascript:_MEIQIA('showPanel')" >
              <Icon type="customer-service" />
            </a>
          </Tooltip>

          <Popover content={content1} title={<div style={{textAlign:'center',padding:'2px 10px'}}>司机征信核查小程序</div>}>
            <div className={styles.toolaction}>
              <Icon type="bulb" />
            </div>
          </Popover>

          <Popover content={content2} title={<div style={{textAlign:'center',padding:'2px 10px'}}>扫描二维码下载管车App</div>}>
            <div className={styles.toolaction}>
              <Icon type="mobile" />
            </div>
          </Popover>

          <Tooltip placement="bottom" title="使用文档">
            <a className={styles.toolaction} target="_blank" href="https://help.diuber.com/help" >
              <Icon type="question-circle-o" />
            </a>
          </Tooltip>

          <Dropdown overlay={logoutmenu}>
            <a className="ant-dropdown-link logoutSelect" href="#">
              <span className="logoutSpan1" >管理员</span>
              <span className="logoutSpan2" >(智享版)</span>
              <Icon type="down" />
            </a>
          </Dropdown>,
        </div>
       </div>
    );
  }
}
