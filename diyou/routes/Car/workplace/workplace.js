import React, { PureComponent } from 'react';
import { Map, Marker  } from 'react-amap';
import { connect } from 'dva';
import utils from '../../../utils/utils';
import request from '../../../utils/request';
import { Link } from 'dva/router';
import { Row, Col, Card, Avatar,notification,Tag,Button} from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './../../Workbench/Workplace.less';

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
export default class Workplace extends PureComponent {
  constructor() {
    super();
    this.mapPlugins = ['ToolBar'];
    this.mapCenter = {longitude: 121.4628270000, latitude: 31.2361380000};
  }

  state = {
    noticeList:'',
    TodayTime: '2018年3月8号',
    MoneyKey: 'a',
    markers:[{position: {longitude: 121.5088240000, latitude: 31.2436370000}},{position: {longitude: 121.4937860000, latitude: 31.2339730000 }},],
  }


  componentDidMount() {
    this.getwarningInter();
    for(var i =0;i<this.state.markers.length;i++){
      this.state.markers[i].position.longitude = utils.gaoDeToBaidu(this.state.markers[i].position.longitude,this.state.markers[i].position.latitude).bd_lng;
      this.state.markers[i].position.latitude = utils.gaoDeToBaidu(this.state.markers[i].position.longitude,this.state.markers[i].position.latitude).bd_lat;
    }
    const TodayTime = new Date();
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    this.setState({
      TodayTime: TodayTime.getFullYear() + '年' + (TodayTime.getMonth() + 1) + '月' + TodayTime.getDate() + '日',
      weekday: week[TodayTime.getDay()],
      company_name: window.localStorage.getItem("company_name")
    })
    this.getTotalInter();
    this.getVehicleGpsInter();
  }
  //获取今日提醒
  getwarningInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('type', 1);
    request('/api/web/admin_setting/getwarning', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        var noticeList = data.data.data.map(item=>{
          return <Card.Grid className={styles.NoticeGrid} style={{width:'100%'}} key={item.id}>
            {
              item.type==1 &&
              <Card onClick={()=>{window.location.href="/#/Car/CarManager?CarType=12"}} bodyStyle={{ padding: 0 }} bordered={false}>
                <Card.Meta
                  description={item.content}
                />
                <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                  <div style={{flex:'1',textAlign:'right'}}>
                    <Tag color="#87d068">车管提醒</Tag>
                  </div>
                </div>
              </Card>
            }
            {
              item.type==2 &&
              <Card onClick={()=>{window.location.href="/#/Car/CarManager?CarType=7"}} bodyStyle={{ padding: 0 }} bordered={false}>
                <Card.Meta
                  description={item.content}
                />
                <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                  <div style={{flex:'1',textAlign:'right'}}>
                    <Tag color="#87d068">车管提醒</Tag>
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
  //获取车辆总情况
  getTotalInter= ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('plat_form', 'app');
    request('/api/diuber/index/getHost', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
    }).then((data) => {
      if (data.data.code == 1) {
        this.setState({
          Rents: data.data.info.yizu,
          payRents: data.data.info.huankuan,
          OutRents: data.data.info.shigu,
          NewCarRents: data.data.info.new_rent,
          ReturnCarRents: data.data.info.return_rent,
          RefundRents: data.data.info.refund,
          DepositRefundRents: data.data.info.deposit_refund,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.info);
      }
    }).catch((e)=>{})
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
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  render() {
    const {NewCarRents, ReturnCarRents, RefundRents, DepositRefundRents,notice} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"/>
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}车管！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );
    const workTotal = [
      {
        key: 'NewCarRents',
        title: '今日借车',
        total: NewCarRents,
      }, {
        key: 'ReturnCarRents',
        title: '今日退车',
        total: ReturnCarRents,
      }, {
        key: 'RefundRents',
        title: '今日验车',
        total: RefundRents,
      }, {
        key: 'DepositRefundRents',
        title: '今日保养',
        total: DepositRefundRents,
      }, {
        key: 'DepositRefundRents01',
        title: '今日维修',
        total: DepositRefundRents,
      }, {
        key: 'DepositRefundRents02',
        title: '今日事故',
        total: DepositRefundRents,
      }
    ];
    const workOperation = [
      {key: 'NewBorrowCarNotes', title: '借车',describe:'向合作伙伴借车', href: '/Car/CarManager/NewBorrowCarNotes',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955402934776500'},
      {key: 'RefundCar', title: '退车',describe:'停止租车合同',  href: '/Car/CarManager/RefundCar',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955402940301737'},
      {key: 'NewCheckCarNotes', title: '验车',describe:'记录车况信息',  href: '/Car/CarManager/NewCheckCarNotes',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955418065780075'},
      {key: 'BackCar', title: '还车',describe:'合作伙伴还车',href: '/Car/CarManager/BackCar',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955212857851445'},
      {key: 'NewKeepCarNotes', title: '保养', describe:'记录保养信息', href: '/Car/CarManager/NewKeepCarNotes',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955848813343040'},
      {key: 'NewMaintainCarNotes', title: '维修', describe:'记录维修信息', href: '/Car/CarManager/NewMaintainCarNotes',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955855658763668'},
      {key: 'NewAccidentCarNotes', title: '事故', describe:'记录事故信息', href: '/Car/CarManager/NewAccidentCarNotes',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955863673125852'},
      {key: 'CheckIllegal', title: '查违章',describe:'查询违章车辆',href: '/Car/CarManager/CheckIllegal',color:'#f60',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152955384294295495'},
    ];
    return (
      <PageHeaderLayout
        content={pageHeaderContent}
      >
        <Row gutter={24}>
          {
            workOperation.map(item => (
              <Col xl={6} lg={12} md={24} sm={24} xs={24}>
                <Card bodyStyle={{padding:0}} className={styles.workOperation} style={{marginBottom: '24px',textAlign:'center',display:'flex',flexFlow:'row'}}>
                  <Link to={item.href}>
                  <div className={styles.workOperationfirst} style={{background:item.color}}><img style={{width:'40%'}} src={item.icon}/></div>
                  <div className={styles.workOperationlast}>
                    <div style={{color:'#000',fontSize:'20px', lineHeight:'38px',}}>{item.title}</div>
                    <div style={{color:'rgba(0,0,0,0.45)'}}>{item.describe}</div>
                  </div>
                  </Link>
                </Card>
              </Col>
            ))
          }
        </Row>
        <Row gutter={24}>
          <Col xl={17} lg={24} md={24} sm={24} xs={24}>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
              <Row gutter={24}>
                {
                  workTotal.map(item => (
                    <Col xl={4} lg={12} md={24} sm={24} xs={24}>
                      <ChartCard style={{marginBottom: '24px',}} title={item.title} total={<span>{item.total}</span>}/>
                    </Col>
                  ))
                }
              </Row>
            </Col>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
              <Card
                style={{marginBottom: 24}}
                bodyStyle={{padding: 0}}
                bordered={false}
                className={styles.activeCard}
                title="GPS定位"
                extra={<div></div>}
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
          </Col>
          <Col xl={7} lg={24} md={24} sm={24} xs={24}>
            <Card
              style={{marginBottom: 24}}
              title="工作提醒"
              bordered={false}
              bodyStyle={{padding: 0}}
            >
              {this.state.noticeList=='' &&<div style={{padding:'10% 0px',textAlign:'center'}}>暂无工作提醒</div>}
              {this.state.noticeList!='' &&<div>{this.state.noticeList}</div>}
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
