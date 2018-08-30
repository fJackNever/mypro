import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon,Popover,notification,Select,Modal,Carousel,Dropdown,Menu  } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import { getRoutes } from '../utils/utils';
import request from "../utils/request";

const Option = Select.Option;
const links = [
  {
    key: '关于嘀友',
    title: '关于嘀友',
    href: 'http://www.diuber.com/',
    blankTarget: true,
  }, {
    key: '服务条款',
    title: '服务条款',
    href: 'https://gc.diuber.com/diuber/login/terms.html',
    blankTarget: true,
  }, {
    key: '技术支持',
    title: '技术支持',
    href: "javascript:_MEIQIA('showPanel')",
    blankTarget: true,
  }, {
    key: '帮助中心',
    title: '帮助中心',
    href: 'https://help.diuber.com/help',
    blankTarget: true,
  }, {
    key: '合作加盟',
    title: '合作加盟',
    href: 'http://diubersh.mikecrm.com/0AB9jGd',
    blankTarget: true,
  }];

const content = (
  <div>
    <img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845159615557512"/>
  </div>
);

const content1 = (
  <div>
    <img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153069167083725082"/>
  </div>
);

const copyright = <div>Copyright <Icon type="copyright" /> 2017 - 2018 Diuber Inc. All Rights Reserved</div>;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class UserLayout extends React.PureComponent {
  state={
    role:1,
  }
  componentDidMount(){
    if(window.location.href.split('?demo=')[1]){this.yanshiSubmit('test','test','test');}
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '嘀友管车';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - 嘀友管车`;
    }
    return title;
  }

  yanshiSubmit = (admin_no,entity_id,password)=>{
    let formData = new FormData();
    formData.append('key', 'diuber2017');
    formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    formData.append("admin_no",admin_no);
    formData.append("entity_id", entity_id);
    formData.append("password", password);
    request('/api/web/login/loginaction',{
      method:'POST',
      body:formData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        window.localStorage.setItem("EmployeesName",data.data.data.info.name);
        window.localStorage.setItem("companyId",data.data.data.info.company_id);
        window.localStorage.setItem("company_name",data.data.data.info.company_name);
        window.localStorage.setItem("partner_id",data.data.data.info.partner_id);
        window.localStorage.setItem("permision",data.data.data.permision);
        if(data.data.data.com_type==1){
          window.localStorage.setItem("com_type",'免费版');
          if(data.data.data.permision==0){
            window.location.href="http://gc2.diuber.com/diuber/index/admin.html";
          }else if(data.data.data.permision==1){
            this.props.history.push('/workbench/workplace');
          }else if(data.data.data.permision==3){
            this.props.history.push('/Car/workplace');
          }else if(data.data.data.permision==4){
            this.props.history.push('/Driller/workplace');
          }else if(data.data.data.permision==5){
            this.props.history.push('/Money/workplace');
          }else if(data.data.data.permision==6){
            this.props.history.push('/Garage/workplace');
          }else if(data.data.data.permision==7){
            this.props.history.push('/Sale/workplace');
          }else if(data.data.data.permision==8){
            this.props.history.push('/workbench/InsuranceCommissioner');
          }
        }else if(data.data.data.com_type==2){
          window.localStorage.setItem("com_type",'智享版');
          if(data.data.data.permision==0){
            window.location.href="http://gc2.diuber.com/diuber/index/admin.html";
          }else if(data.data.data.permision==1){
            this.props.history.push('/workbench/workplace');
          }else if(data.data.data.permision==3){
            this.props.history.push('/Car/workplace');
          }else if(data.data.data.permision==4){
            this.props.history.push('/Driller/workplace');
          }else if(data.data.data.permision==5){
            this.props.history.push('/Money/workplace');
          }else if(data.data.data.permision==6){
            this.props.history.push('/Garage/workplace');
          }else if(data.data.data.permision==7){
            this.props.history.push('/Sale/workplace');
          }else if(data.data.data.permision==8){
            this.props.history.push('/workbench/InsuranceCommissioner');
          }
        }else if(data.data.data.com_type==3){
          window.localStorage.setItem("com_type",'营销版');
          this.props.history.push('/Sale/workplace');
        }else if(data.data.data.com_type==4){
          window.localStorage.setItem("com_type",'定制版');
        }
      }else{
        openNotificationWithIcon('error','登录失败提醒',data.data.msg)
      }
    })
  }

  RoleLogin = ({key})=>{
    console.log({key}.key)
      if({key}.key==1){
        this.yanshiSubmit('test','test','test');
      }else if({key}.key==2){
        this.yanshiSubmit('18900002222','test','test');
      }else if({key}.key==3){
        this.yanshiSubmit('15888888888','test','test');
      }else if({key}.key==4){
        this.yanshiSubmit('15577777777','test','test');
      }else if({key}.key==5){
        this.yanshiSubmit('15599999999','test','test');
      }else if({key}.key==6){
        this.yanshiSubmit('18544447777','test','test');
      }else if({key}.key==7){
        this.yanshiSubmit('18965859652','test','test');
      }
  }
  render() {
    const { routerData, match } = this.props;
    const DropdownMenu = (
      <Menu style={{marginTop:'15%'}} onClick={this.RoleLogin}>
        <Menu.Item style={{padding:'10px 15px'}} key="1">管理员</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="2">车管</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="3">财务</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="4">销售</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="5">驾管</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="6">合作修理厂</Menu.Item>
        <Menu.Item style={{padding:'10px 15px'}} key="7">保险专员</Menu.Item>
      </Menu>
    );
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container} style={{height:'100vh'}}>
          <div className={styles.loginTop}>
            <div><img src="https://gc.diuber.com/public/diuber/images/logo/logo-guanche.png"/></div>
            <div className={styles.ul}><ul>
              <li><Popover content={content1} title={<div style={{textAlign:'center',padding:'10px 0px'}}>扫描二维码</div>}>管车助手</Popover></li>
              <li  className={styles.lineLi}>|</li>
              <li> <Popover content={content} title={<div style={{textAlign:'center',padding:'10px 0px'}}>扫描二维码</div>}>手机APP</Popover></li>
              <li  className={styles.lineLi}>|</li>
              <li><Dropdown overlay={DropdownMenu}><div style={{height:'100%',color:'red'}}>演示体验 <Icon type="down" /></div></Dropdown></li>
              <li  className={styles.lineLi}>|</li>
              <li><div style={{cursor:'pointer'}} onClick={()=>window.location.href="https://gc.diuber.com/diuber/login/admin.html"}>回旧版</div></li>
            </ul></div>
          </div>
          <div className={styles.login} style={{display:'flex',flexFlow:'row'}}>
            <div style={{width:'50%',marginLeft:'10%'}}>
              <Carousel autoplay={true} autoplaySpeed={6000} className={styles.antCarousel}>
                <div className={styles.slickslide}>
                  <div className={styles.divImg}>
                    <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084400249125442"/>
                  </div>
                  <div className={styles.divText}>
                    <div className={styles.divTextTitle}>嘀友管车App</div>
                    <div className={styles.divTextdesc} >扫码立即下载</div>
                    <div className={styles.divTextdesc}><img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084409151953539"/></div>
                  </div>
                </div>
                <div className={styles.slickslide}>
                  <div className={styles.divText} style={{marginTop:'30px'}}>
                    <div className={styles.divTextTitle} style={{textAlign:'center'}}>高效管好每一辆车</div>
                    <div className={styles.divTextdesc} style={{textAlign:'center'}}>老板、车管、财务、销售工作台</div>
                    <div className={styles.divTextdesc} style={{textAlign:'center'}}>让每一个角色轻松处理管理事务</div>
                  </div>
                  <div className={styles.divImg}>
                    <img style={{width:'320px',marginTop:'70px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153077084282635424"/>
                  </div>
                </div>
                <div className={styles.slickslide}>
                  <div className={styles.divImg}>
                    <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153075788663402396"/>
                  </div>
                  <div className={styles.divText}>
                    <div className={styles.divTextTitle}>租车、品牌推广 不二选择</div>
                    <div className={styles.divTextdesc} >扫码立即体验</div>
                    <div className={styles.divTextdesc}><img src="http://le195525.oss-cn-shanghai.aliyuncs.com/Diyou/xcxerma.jpg"/></div>
                  </div>
                </div>
                <div className={styles.slickslide}>
                  <div className={styles.divText}>
                    <div className={styles.divTextTitle} style={{textAlign:'right'}}>微信小程序 营销利器</div>
                    <div className={styles.divTextdesc} style={{textAlign:'right'}}>扫码立即体验</div>
                    <div className={styles.divTextdesc} style={{textAlign:'right'}}><img style={{float:'right'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153085587250675122"/></div>
                  </div>
                  <div className={styles.divImg}>
                    <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153085617666974380"/>
                  </div>
                </div>
                <div className={styles.slickslide}>
                  <div className={styles.divImg}>
                    <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084675399080375"/>
                  </div>
                  <div className={styles.divText}>
                    <div className={styles.divTextTitle}>嘀友管车助手小程序</div>
                    <div className={styles.divTextdesc} >扫码立即体验</div>
                    <div className={styles.divTextdesc}><img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153069167083725082"/></div>
                  </div>
                </div>
              </Carousel>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item =>
                (
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                  />
                )
              )}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter className={styles.footer} links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
