import React, { PureComponent } from 'react';
import { Menu, Icon, Tag, Dropdown, Divider, Tooltip,Button,Popover} from 'antd';
import request from '../../utils/request';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import $ from 'jquery';
import { urlToList } from '../utils/pathTools';
import styles from './index.less';

const { SubMenu } = Menu;

export default class GlobalHeader extends PureComponent {
  state = {
    selectedKeys:'/workbench/workplace',
    headerVisible:false,
  }
  componentDidMount = () =>{
    this.setState({
      permission :window.localStorage.getItem("permision"),
      company_name:window.localStorage.getItem("EmployeesName"),
      companyName:window.localStorage.getItem("company_name"),
      companyType:window.localStorage.getItem("com_type")
    })
    this.ModelhandleOk();
  }

  //显示新手教学
  ModelhandleOk = () => {
    let is_new = window.localStorage.getItem("is_new");
    if(is_new==0){
      let HostFormData = new FormData();
      HostFormData.append('key','diuber2017');
      HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      request('/api/web/admin_setting/newCom',{
        method:'POST',
        body:HostFormData,
        credentials: 'include',
      }).then((data)=> {
        if(data.data.code==1){
          console.log(data.data.data.code)
          if(data.data.data.code!=0){
            window.localStorage.setItem("is_new",0)
            let HostFormData = new FormData();
            HostFormData.append('key','diuber2017');
            HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
            request('/api/web/admin_setting/checkNewCompany',{
              method:'POST',
              body:HostFormData,
              credentials: 'include',
            }).then((data)=> {
              console.log(data)
              if(data.data.code==1){
                console.log('新手教学最后一步')
                if(data.data.data.staff>0 && data.data.data.template>0 && data.data.data.vehicle>0){
                  $('#Layoutheader').css('zIndex','1800');
                  this.setState({headerVisible:true})
                }
              }
            }).catch((e)=>{})
          }else{
            window.localStorage.setItem("is_new",1)
            this.setState({headerVisible:false})
          }
        }
      }).catch((e)=>{})
    }
  }

  constructor(props) {
    super(props);
    this.menus = props.menuData;
  }
  getDefaultCollapsedSubMenus(props) {
    const { location: { pathname } } = props || this.props;
    return urlToList(pathname)
      .map((item) => {
        return getMeunMatcheys(this.flatMenuKeys, item)[0];
      })
      .filter(item => item);
  }
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  //点击导航，menu  selected变色
  SelectMenu = () =>{
    var path = window.location.href.split('#')[1];
    this.setState({
      selectedKeys:path
    })
  }
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = (item) => {
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={item.name}
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return (
        <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
      );
    }
  };
  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = (item) => {
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
        onClick={
          this.props.isMobile
            ? () => {
              this.props.onCollapse(true);
            }
            : undefined
        }
      >
        <span>{name}</span>
      </Link>
    );
  };
  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const { location: { pathname } } = this.props;
    return urlToList(pathname).map(itemPath =>
      getMeunMatcheys(this.flatMenuKeys, itemPath).pop(),
    );
  };
  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    if (this.props.Authorized && this.props.Authorized.check) {
      const { check } = this.props.Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map((item) => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };
  // conversion Path
  // 转化路径
  conversionPath = (path) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  //点击个人中心和退出登录
  handleClick = (e) =>{
    if(e.key=="personalCenter"){
      window.location.href='#/PersonalCenter';
    }
    if(e.key=="logout"){
      window.localStorage.clear();
	  	let formData = new FormData();
      formData.append("plat_form", "app");
      request('/api/diuber/login/logoutAction',{
        method:'POST',
        body:formData,
        credentials: 'include',
      }).then((data)=>{
      })
      window.location.href="/#/user/login";
      }
  }
  //返回登陆页面（重新登录）
  toLogin =()=>{
    window.location.href="/#/user/login";
  }
  render() {
    const {
      collapsed, fetchingNotices, isMobile, logo,
      onNoticeVisibleChange, onNoticeClear,
    } = this.props;
    const { currentUser} = this.state;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]}  onClick={this.handleClick}>
        <Menu.Item style={{padding:'10px'}} key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );
    const content = (
      <div><img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845159615557512"/></div>
    );
    return (
     <div>
         <div className={styles.header} id="Layoutheader"  style={{position:'fixed',top:'0px',left:'0px',right:'0px',zIndex:'1000',}}>
           {isMobile && (
             [
               (
                 <div className={styles.logo} key="logo">
                   <img src={logo} alt="logo" />
                 </div>
               ),
               <Divider style={{display:'inline-block',height:'30%',marginTop:'35%'}} type="vertical" key="line" />,
               <Icon
                 className={styles.trigger}
                 type={collapsed ? 'menu-unfold' : 'menu-fold'}
                 onClick={this.toggle}
               />
             ]
           )}
           <div className={styles.sjlogo} key="logo">
             <h1 style={{color:'rgba(255, 255, 255, 0.9)'}}>{this.state.companyName}</h1>
           </div>
             <div className={styles.TopMenu} style={{flex: '1', height: '64px',}}>
               <Menu
                 theme="dark"
                 mode="horizontal"
                 style={{
                   height: '64px',
                   lineHeight: '64px',
                   borderBottom: 'none',
                   paddingLeft: '8%',
                   overflow: 'hidden'
                 }}
                 selectedKeys={[this.state.selectedKeys]}
                 onClick={this.SelectMenu()}
               >
                 {this.getNavMenuItems(this.menus)}
               </Menu>
             </div>
           <div className={styles.right} style={{display:'flex',flexFlow:'row'}} >
             {
               this.state.headerVisible?
                 <Tooltip title="在线客服" visible={true}>
                   <a className={styles.action}
                   href="javascript:_MEIQIA('showPanel')"
                   >
                   <Icon type="customer-service" />
                   </a>
                 </Tooltip>:
                 <Tooltip title="在线客服">
                   <a className={styles.action}
                      href="javascript:_MEIQIA('showPanel')"
                   >
                     <Icon type="customer-service" />
                   </a>
                 </Tooltip>
             }
             <Popover placement="bottom" title={<div style={{textAlign:'center',padding:'15px 0px'}}>司机征信核查小程序</div>} content={<div><img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153069167083725082"/></div>} trigger="hover">
               <div className={styles.action}>
                 <Icon type="bulb" />
               </div>
             </Popover>
             <Popover placement="bottom" title={<div style={{textAlign:'center',padding:'15px 0px'}}>扫描二维码下载管车App</div>} content={content} trigger="hover">
               <div className={styles.action}>
                 <Icon type="mobile" />
               </div>
             </Popover>
             {
               this.state.headerVisible?
                 <Tooltip title="使用文档" visible={true}>
                   <a
                     target="_blank"
                     href="https://help.diuber.com/help"
                     rel="noopener noreferrer"
                     className={styles.action}
                   >
                     <Icon type="question-circle-o" />
                   </a>
                 </Tooltip>:
                 <Tooltip title="使用文档">
                   <a
                     target="_blank"
                     href="https://help.diuber.com/help"
                     rel="noopener noreferrer"
                     className={styles.action}
                   >
                     <Icon type="question-circle-o" />
                   </a>
                 </Tooltip>
             }
             <div  className={styles.ShowDropdown}>
               <Dropdown overlay={menu}>
                <span className={`${styles.action} ${styles.account}`}>
                  <Icon type="user" />
                </span>
               </Dropdown>
             </div>
             <div className={styles.Dropdown}>
               {this.state.company_name ? (
                 <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <span className={styles.name}>{this.state.company_name}<span style={{color:'#f50',marginLeft:'5px'}}> ({this.state.companyType}) </span></span>
                <Icon style={{ marginLeft:'10px'}} type="down" />
              </span>
                 </Dropdown>
               ) : <Button onClick={this.toLogin} type="primary"> 重新登陆</Button>}
             </div>
           </div>
         </div>
     </div>
    );
  }
}
