import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon,Popover,Menu, Dropdown,Carousel,notification } from 'antd';
import GlobalFooter from 'components/GlobalFooter';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import { getRoutes, getPageQuery, getQueryPath } from 'utils/utils';
import { loginAction } from 'utils/api'

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

const links = [
  {
    key: 'help',
    title: '帮助',
    href: '',
  },
  {
    key: 'privacy',
    title: '隐私',
    href: '',
  },
  {
    key: 'terms',
    title: '条款',
    href: '',
  },
];

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

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2018 蚂蚁金服体验技术部出品
  </Fragment>
);

function getLoginPathWithRedirectPath() {
  const params = getPageQuery();
  const { redirect } = params;
  return getQueryPath('/user/login', {
    redirect,
  });
}

class UserLayout extends React.PureComponent {

  yanshiSubmit = (admin_no,entity_id,password)=>{

    let formData = new FormData();
    formData.append('key', 'diuber2017');
    formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    formData.append("admin_no",admin_no);
    formData.append("entity_id", entity_id);
    formData.append("password", password);
    loginAction(formData).then((data)=>{
      if(data.data.code==1){
        console.log(data.data)
        // window.localStorage.setItem("EmployeesName",data.data.data.info.name);
        // window.localStorage.setItem("companyId",data.data.data.info.company_id);
        window.localStorage.setItem("company_name",data.data.data.info.company_name);
        // window.localStorage.setItem("partner_id",data.data.data.info.partner_id);
        // window.localStorage.setItem("permision",data.data.data.permision);
        if(data.data.data.com_type==1){
          window.localStorage.setItem("com_type",'免费版');
          if(data.data.data.permision==0){
            window.location.href="http://gc2.diuber.com/diuber/index/admin.html";
          }else if(data.data.data.permision==1){
            this.props.history.push('/Workbench/Workplace');
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
            this.props.history.push('/Workbench/Workplace');
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
    if(key==='1'){
      this.yanshiSubmit('test','test','test');
    }else if(key==='2'){
      this.yanshiSubmit('18900002222','test','test');
    }else if(key==='3'){
      this.yanshiSubmit('15888888888','test','test');
    }else if(key==='4'){
      this.yanshiSubmit('15577777777','test','test');
    }else if(key==='5'){
      this.yanshiSubmit('15599999999','test','test');
    }else if(key==='6'){
      this.yanshiSubmit('18544447777','test','test');
    }else if(key==='7'){
      this.yanshiSubmit('18965859652','test','test');
    }
  }


  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Ant Design Pro';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Ant Design Pro`;
    }
    return title;
  }

  render() {
    const { routerData, match } = this.props;

    const menu = (
      <Menu style={{marginTop:'15px'}} onClick={this.RoleLogin}>
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
        <div className={styles.container}>
            <div className={styles.top}>
              <div><img src="https://gc.diuber.com/public/diuber/images/logo/logo-guanche.png" alt=""/></div>
              <div className={styles.nav}>
                <ul>
                  <li><Popover content={content1} title={<div style={{textAlign:'center',padding:'2px 10px'}}>扫描二维码</div>}>管车助手</Popover></li>
                  <li><Popover content={content2} title={<div style={{textAlign:'center',padding:'2px 10px'}}>扫描二维码</div>}>手机</Popover></li>
                  <li>
                    <Dropdown overlay={menu}>
                        <span href="#" style={{color:'red'}}>
                          Hover me <Icon type="down" />
                        </span>
                    </Dropdown>
                  </li>
                  <li>
                    <a href="#" style={{color:'rgba(0, 0, 0, 0.65)'}}>回旧版</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.content} style={{display:'flex',flexFlow:'row'}}>
              <div className={styles.contentIn}>
                <Carousel autoplay className={styles.antCarousel}>
                  <div className={styles.divWrap}>
                    <div className={styles.divImg}>
                      <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084400249125442"/>
                    </div>
                    <div className={styles.divText}>
                      <h3>嘀友管车App</h3>
                      <h5>嘀友管车App扫码立即下载</h5>
                      <div className={styles.divDescImg}>
                        <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084409151953539"/>
                      </div>
                    </div>
                  </div>
                  <div className={styles.divWrap}>
                    <div className={styles.divImg}>
                      <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084400249125442"/>
                    </div>
                    <div className={styles.divText}>
                      <h3>嘀友管车App</h3>
                      <h5>嘀友管车App扫码立即下载</h5>
                      <div className={styles.divDescImg}>
                        <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084409151953539"/>
                      </div>
                    </div>
                  </div>
                  <div className={styles.divWrap}>
                    <div className={styles.divImg}>
                      <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084400249125442"/>
                    </div>
                    <div className={styles.divText}>
                      <h3>嘀友管车App</h3>
                      <h5>嘀友管车App扫码立即下载</h5>
                      <div className={styles.divDescImg}>
                        <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084409151953539"/>
                      </div>
                    </div>
                  </div>
                  <div className={styles.divWrap}>
                    <div className={styles.divImg}>
                      <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084400249125442"/>
                    </div>
                    <div className={styles.divText}>
                      <h3>嘀友管车App</h3>
                      <h5>嘀友管车App扫码立即下载</h5>
                      <div className={styles.divDescImg}>
                        <img src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153084409151953539"/>
                      </div>
                    </div>
                  </div>
                </Carousel>
              </div>

              <Switch>
                {getRoutes(match.path, routerData).map(item => (
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                  />
                ))}
                <Redirect from="/user" to="/user/login" />
              </Switch>
            </div>

          <GlobalFooter links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
