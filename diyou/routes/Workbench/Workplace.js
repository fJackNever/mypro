import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { Map, Marker  } from 'react-amap';
import { connect } from 'dva';
import utils from '../../utils/utils';
import request from '../../utils/request';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Row, Col, Card, List, Avatar,Radio,notification,Button,Modal,DatePicker,Popover,Breadcrumb  } from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Workplace.less';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class Workplace extends PureComponent {
  state = {
    TodayTime:'2018年3月8号',
    MoneyKey:'a',
    isNew:0,
    is_show:false,
    datetype:1,
  }

  componentDidMount() {
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.resetIndexRedis();
    this.getLocalTimeInter(1);
    //限制除了车管和管理员，其他只能看

    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
    this.getTotalHostInter();
    this.checkNewCompany();
    this.getwarningInter();
    this.getVehicleGpsInter();
  }
  /*工作台刷新缓存*/
  resetIndexRedis = ()=>{
    let HostFormData = new FormData();
    HostFormData.append('key','diuber2017');
    HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/resetIndexRedis',{
      method:'POST',
      body:HostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {}).catch(()=>{})
  }
  /*查看是否是显示新手教学*/
  checkNewCompany = ()=>{
    let HostFormData = new FormData();
    HostFormData.append('key','diuber2017');
    HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/newCom',{
      method:'POST',
      body:HostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        if(data.data.data.code!=0){
          this.setState({
            is_show:true,
          })
        }
      }
    }).catch((e)=>{})
  }
  //显示新手教学
  ModelhandleOk = () => {
    let HostFormData = new FormData();
    HostFormData.append('key','diuber2017');
    HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/checkNewCompany',{
      method:'POST',
      body:HostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
        if(data.data.data.staff==0){
          this.setState({
            is_show: false,
            isNew:1,
          });
        }else if(data.data.data.template==0){
          this.setState({
            is_show: false,
            isNew:2,
          });
        }else if(data.data.data.vehicle==0){
          this.setState({
            is_show: false,
            isNew:3,
          });
        }
      }
    }).catch((e)=>{})
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }

  getTotalHostInter=()=>{
      let getHostFormData = new FormData();
      getHostFormData.append('key','diuber2017');
      getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      request('/api/web/admin_setting/getWorkHost',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code == 1) {
        this.setState({
          Rents: data.data.data.yizu,
          payRents: data.data.data.huankuan,
          OutRents: data.data.data.shigu,
          NewCarRents: data.data.data.new_rent,
          ReturnCarRents: data.data.data.return_rent,
          RefundRents: data.data.data.refund,
          DepositRefundRents: data.data.data.deposit_refund,
        })
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch((e)=>{})
  }
  onMoneyChange = (e) =>{
    this.setState({
      MoneyKey:e.target.value
    })
  }
  onMoneyDateChange = (e) =>{
  }
  //选择时间更新财务收支情况
  ChangeDate = (e)=>{
    console.log(e)
   if(e[0]){
     var startTime = (e[0]._d).getFullYear()+'-'+utils.UpdateDate(((e[0]._d).getMonth()+1))+'-'+utils.UpdateDate((e[0]._d).getDate());
     var endTime = (e[1]._d).getFullYear()+'-'+utils.UpdateDate(((e[1]._d).getMonth()+1))+'-'+utils.UpdateDate((e[1]._d).getDate());
   }else{
     const TodayTime = new Date();
     var startTime =TodayTime.getFullYear()+'-'+(TodayTime.getMonth()+1)+'-'+TodayTime.getDate();
     var endTime =TodayTime.getFullYear()+'-'+(TodayTime.getMonth()+1)+'-'+TodayTime.getDate()
   }
    this.setState({
      beforetime:new Date(startTime),
      aftertime:new Date(endTime),
    })
    let SSGFIFormData = new FormData();
    SSGFIFormData.append('key','diuber2017');
    SSGFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SSGFIFormData.append('end',endTime);
    SSGFIFormData.append('start',startTime);
    request('/api/web/finance/getFinanceHost',{
      method:'POST',
      body:SSGFIFormData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          refund:data.data.data.refund,
          contract_deposit:data.data.data.contract_deposit,
          other:data.data.data.other,
          collection:data.data.data.collection,
          deposit:data.data.data.deposit,
        })
      }

    }).catch((e)=>{})
  }
  //检查时间
  Update = (target) =>{
    if(target<10){
      return '0'+target;
    }else{
      return target
    }
  }
  //获取系统公告
  getwarningInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('limit', 9999);
    request('/api/web/admin_setting/getSystemNotice', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data) => {
      if(data.data.code==1){
        var noticeList = data.data.data.rows.map(item=>{
          return <Card.Grid className={styles.NoticeGrid} style={{width:'100%'}} key={item.id}>
            {
              item.is_show==1 &&
              <Card bodyStyle={{ padding: 0 }} bordered={false}>
                <Card.Meta
                  description={<div style={{color:'rgba(0, 0, 0, 0.65)'}}>{item.content}</div>}
                />
                <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                  <div style={{flex:'1',textAlign:'right'}}>
                    <span  style={{color:'rgba(0, 0, 0, 0.45)'}}>{item.create_time}</span>
                  </div>
                </div>
              </Card>
            }
          </Card.Grid>
        })
        this.setState({noticeList})
      }
    }).catch(()=>{})
  }
  //获取车辆位置GPS分布
  getVehicleGpsInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/vehicle/getVehicleGpsInfo', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data) => {
      if(data.data.code==1){
        const styleDiv = {
          width:'200px',
          padding:'5px',
        };
        const styleB = {
          background:'#fff',
          color: '#000',
          fontSize:'14px',
          padding: '5px'
        };
        var MapMarks = data.data.data.map((item) => {
          return <Marker position={{longitude: item.lng, latitude: item.lat }} >
            {item.device_info_new==0  && <div style={styleDiv}>
              <div><span style={styleB}>{item.license_plate_no}[ 正常 ]</span></div>
              <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
            </div>}
            {item.device_info_new==1  && <div style={styleDiv}>
              <div><span style={styleB}>{item.license_plate_no}[ 未上线 ]</span></div>
              <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
            </div>}
            {item.device_info_new==2  && <div style={styleDiv}>
              <div><span style={styleB}>{item.license_plate_no}[ 已过期 ]</span></div>
              <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
            </div>}
            {item.device_info_new==3  && <div style={styleDiv}>
              <div><span style={styleB}>{item.license_plate_no}[ 离线 ]</span></div>
              <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845061029452048"/></div>
            </div>}
            {item.device_info_new==4  && <div style={styleDiv}>
              <div><span style={styleB}>{item.license_plate_no}[ 静止 ]</span></div>
              <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845061080752696"/></div>
            </div>}
          </Marker>;
        });
        this.setState({MapMarks})
      }
    }).catch(()=>{})
  }
  //选择时间
  chanceDate = (e)=>{
    this.setState({datetype:e.target.value})
    if(e.target.value==1){
      this.getLocalTimeInter(1);
    }else  if(e.target.value==2){
      this.getLocalTimeInter(2);
    }else  if(e.target.value==3){
      this.getLocalTimeInter(3);
    }else  if(e.target.value==4){
      this.getLocalTimeInter(4);
    }
  }
  getLocalTimeInter = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('type',target);
    request('/api/web/admin_setting/getLocalTime',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          beforetime:new Date(data.data.data.start),
          aftertime:new Date(data.data.data.end),
        })
        this.getmoneyTimeInter(data.data.data.start,data.data.data.end)
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
  }
  getmoneyTimeInter = (startTime,endTime)=>{
    let SSGFIFormData = new FormData();
    SSGFIFormData.append('key','diuber2017');
    SSGFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SSGFIFormData.append('end',endTime);
    SSGFIFormData.append('start',startTime);
    request('/api/web/finance/getFinanceHost',{
      method:'POST',
      body:SSGFIFormData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          refund:data.data.data.refund,
          contract_deposit:data.data.data.contract_deposit,
          other:data.data.data.other,
          collection:data.data.data.collection,
          deposit:data.data.data.deposit,
        })
      }
    }).catch(()=>{})
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const { Rents,payRents,OutRents,NewCarRents,ReturnCarRents,RefundRents,DepositRefundRents,deposit,refund,collection,contract_deposit,other} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}管理员！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );
    const BreadcrumbList=(
      <Breadcrumb>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>
    );
    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>租出率</p>
          <p>{Rents}<span> %</span></p>
        </div>
        <div className={styles.statItem}>
          <p>交租金率</p>
          <p>{payRents}<span> %</span></p>
        </div>
        <div className={styles.statItem}>
          <p>出险率</p>
          <p>{OutRents}<span> %</span></p>
        </div>
      </div>
    );
    const OutMoney = [
      {
        key:'deposit',
        x: '退押金',
        y: deposit,
      },
      {
        key:'otherdeposit',
        x: '其他付款',
        y: collection,
      }
    ];
    const workTotal = [
      {
        key:'NewCarRents',
        title:'今日新租车辆',
        total:NewCarRents,
        dayrent:'7%',
      },{
        key:'ReturnCarRents',
        title:'今日退租车辆',
        total:ReturnCarRents,
        dayrent:'7%',
      },{
        key:'RefundRents',
        title:'今日交租金客户',
        total:RefundRents,
        dayrent:'7%',
      },{
        key:'DepositRefundRents',
        title:'今日退押金客户',
        total:DepositRefundRents,
        dayrent:'7%',
      }
    ];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const EnterMoney =  [
      {
        key:'refund',
        x: '租金收款',
        y:refund,
      },
      {
        key:'contract_deposit',
        x: '签约收款',
        y:contract_deposit,
      },
      {
        key:'collection',
        x: '其它收款',
        y:other,
      }
    ];
    return (
      <Router>
      <PageHeaderLayout
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Switch>
          <Route exact path="/workbench/workplace" component={
            () => <div>
                <Modal
                  okText="立即开始"
                  title="嘀友新用户您好"
                  visible={this.state.is_show}
                  onOk={this.ModelhandleOk}
                  onCancel={this.ModelhandleOk}
                >
                  <p>为了能让您能快速的熟悉嘀友管车系统的使用流程，这里将为您提供免费的新手教学。</p>
                </Modal>
                <Row gutter={24}>
                  <Col xl={16} lg={24} md={24} sm={24} xs={24}>
                    <Row gutter={24}>
                      {
                        workTotal.map(item=>(
                          <Col xl={6} lg={12} md={24} sm={24} xs={24}>
                            <ChartCard style={{marginBottom:'24px',}}
                                       title={item.title}
                                       total={<span>{item.total}</span>}
                            />
                          </Col>
                        ))
                      }
                    </Row>
                    <Card
                      style={{ marginBottom: 24 }}
                      bodyStyle={{ padding: 0 }}
                      bordered={false}
                      className={styles.activeCard}
                      title="今日财务动态"
                      extra={
                        <div>
                          <RadioGroup onChange={this.onMoneyChange} defaultValue="a" style={{marginRight:'24px'}}>
                            <RadioButton value="a">收入情况</RadioButton>
                            <RadioButton value="b">支出情况</RadioButton>
                          </RadioGroup>
                          <RadioGroup onChange={this.chanceDate} value={this.state.datetype}>
                            <RadioButton value={1}>今日</RadioButton>
                            <RadioButton value={2}>本周</RadioButton>
                            <RadioButton value={3}>本月</RadioButton>
                            <RadioButton value={4}>全年</RadioButton>
                          </RadioGroup>
                          <RangePicker
                            className={styles.MoneyPicker}
                            style={{width:'300px',padding:'0px 15px'}}
                            value={[moment(this.state.beforetime), moment(this.state.aftertime)]}
                            format={dateFormat}
                            onChange={this.ChangeDate}
                          />
                        </div>}
                    >
                      <List size="large">
                        <div className={styles.activitiesList}>
                          {
                            this.state.MoneyKey === 'a' &&
                            <Pie
                              hasLegend
                              title="全部收入"
                              subTitle="全部收入"
                              total={yuan(EnterMoney.reduce((pre, now) => now.y + pre, 0))}
                              data={EnterMoney}
                              valueFormat={val => yuan(val)}
                              height={294}
                            />
                          }{
                          this.state.MoneyKey === 'b' &&
                          <Pie
                            hasLegend
                            title="全部支出"
                            subTitle="全部支出"
                            total={yuan(OutMoney.reduce((pre, now) => now.y + pre, 0))}
                            data={OutMoney}
                            valueFormat={val => yuan(val)}
                            height={294}
                          />
                        }
                        </div>
                      </List>
                    </Card>
                    <Card
                      style={{marginBottom: 24}}
                      bodyStyle={{padding: 0}}
                      bordered={false}
                      className={styles.activeCard}
                      title="全部车辆GPS定位"
                      extra={<Button type="primary" ghost onClick={()=>window.open('http://121.201.65.117','_blank')}>GPS定位平台</Button>}
                    >
                      <div style={{width: '100%', height: 480}}>
                        <Map
                          plugins={this.mapPlugins}
                          center={this.mapCenter}
                          zoom={6}
                        >
                          {this.state.MapMarks}
                        </Map>
                      </div>
                    </Card>
                  </Col>
                  <Col xl={8} lg={24} md={24} sm={24} xs={24}>
                    <Card
                      style={{ marginBottom: 24 }}
                      title="快速开始 / 便捷导航"
                      bordered={false}
                      bodyStyle={{ padding: 10 }}
                    >
                      <Row>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          {
                            this.state.isNew == 1 &&
                            <Popover content={<div>立即新增公司第一位员工</div>} visible={true}>
                              <div style={{position:'relative',zIndex:'1500',background:'#fff',padding:'10px 0px',textAlign:'center'}}>
                                  <Link style={{color:'#1890ff'}} to="/Setting/Employees/AddEmployees?is_new=1"><Button type="primary" ghost>新增员工</Button></Link>
                              </div>
                            </Popover>
                          }
                          {this.state.isNew!=1 && <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Setting/Employees/AddEmployees"><Button type="primary" ghost>新增员工</Button></Link></div>}
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          {
                            this.state.isNew == 2 &&
                            <Popover content={<div>立即新增公司第一种车型</div>} visible={true}>
                              <div style={{position:'relative',zIndex:'1500',background:'#fff',padding:'10px 0px',textAlign:'center'}}>
                                 <Link style={{color:'#1890ff'}} to="/Setting/CarType?is_new=1"><Button type="primary" ghost>新增车型</Button></Link>
                              </div>
                            </Popover>
                          }
                          {this.state.isNew!=2 && <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Setting/CarType"><Button type="primary" ghost>新增车型</Button></Link></div>}
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          {
                            this.state.isNew == 3 &&
                            <Popover content={<div>立即新增公司第一辆车</div>} visible={true}>
                              <div style={{position:'relative',zIndex:'1500',background:'#fff',padding:'10px 0px',textAlign:'center'}}>
                                <Link style={{color:'#1890ff'}} to="/Car/CarManager/NewCar?is_new=1"><Button type="primary" ghost>新增车辆</Button></Link>
                              </div>
                            </Popover>
                          }
                          {this.state.isNew!=3 && <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Car/CarManager/NewCar"><Button type="primary" ghost>新增车辆</Button></Link></div>}
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/BrokenQuery/workplace"><Button type="primary" ghost>失信查询</Button></Link></div>
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Car/CarManager/CheckIllegal"><Button type="primary" ghost>违章查询</Button></Link></div>
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Setting/ImportExport"><Button type="primary" ghost>导入导出</Button></Link></div>
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          <div style={{padding:'10px 0px',textAlign:'center'}}><Link style={{color:'#1890ff'}} to="/Setting/Partner/AddPartner?PartnerRole=AddGarage"><Button type="primary" ghost>新增合作伙伴</Button></Link></div>
                        </Col>
                        <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                          <Popover placement="bottom" content={<div><img style={{width:'150px',height:'150px'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG153069167083725082"/></div>} >
                          <div style={{padding:'10px 0px',textAlign:'center'}}><Button type="primary" ghost>司机征信核查</Button></div>
                          </Popover>
                        </Col>
                      </Row>

                    </Card>
                    <Card
                      style={{ marginBottom: 24 }}
                      title="公告"
                      bordered={false}
                      bodyStyle={{ padding: 0 }}
                      extra={<Link to="/Announcement">查看更多</Link>}
                    >
                      {this.state.noticeList=='' &&<div style={{padding:'10% 0px',textAlign:'center'}}>暂无工作提醒</div>}
                      {this.state.noticeList!='' &&<div>{this.state.noticeList}</div>}
                    </Card>
                  </Col>
                </Row>
              </div>}/>
        </Switch>
      </PageHeaderLayout>
      </Router>
    );
  }
}
const WorkPlace = Form.create()(Workplace);

export default WorkPlace;
