import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import request from '../../../utils/request';
import { Link } from 'dva/router';
import { Form,Row, Col, Card, List, Avatar,Tag,notification,Tooltip,DatePicker ,Button } from 'antd';
import {AreaChart,Area,XAxis, YAxis, CartesianGrid,} from 'Recharts';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './../../Workbench/Workplace.less';

const {RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class Workplace extends PureComponent {
  state = {
    MoneyKey:'a',
    comtype:2,
  }
  componentDidMount() {
    let com_type = window.localStorage.getItem("com_type");
    if(com_type=='营销版'){this.setState({comtype:3})}
    $('#active2').css('color','#1890ff');
    this.getHostInter();
    this.getwarningInter();
    this.gettimeInter(2);
    var TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
  }
  chanceDate = (target)=>{
   if(target==2){
      $('#active2').css('color','#1890ff');
      $('#active3').css('color','rgba(0,0,0,0.65)');
      $('#active4').css('color','rgba(0,0,0,0.65)');
      this.gettimeInter(2);
    }else  if(target==3){
      $('#active3').css('color','#1890ff');
      $('#active2').css('color','rgba(0,0,0,0.65)');
      $('#active4').css('color','rgba(0,0,0,0.65)');
      this.gettimeInter(3);
    }else  if(target==4){
      $('#active4').css('color','#1890ff');
      $('#active3').css('color','rgba(0,0,0,0.65)');
      $('#active2').css('color','rgba(0,0,0,0.65)');
      this.gettimeInter(4);
    }
  }
  //获取开始时间，结束时间
  gettimeInter = (type)=>{
    let TableFormData = new FormData();
    TableFormData.append('key','diuber2017');
    TableFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    TableFormData.append('type',type);
    request('/api/web/admin_setting/getLocalTime',{
      method:'POST',
      body:TableFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
          this.setState({
            start_time:data.data.data.start,
            end_time:data.data.data.end,
          })

        this.getSignNumberInter(data.data.data.start,data.data.data.end);
      }
    }).catch(()=>{})
  }
  //获取每日签约数量
  getSignNumberInter = (startTime,endTime)=>{
    let TableFormData = new FormData();
    TableFormData.append('key','diuber2017');
    TableFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    TableFormData.append('start',startTime);
    TableFormData.append('end',endTime);
    request('/api/web/show/getDailySign',{
      method:'POST',
      body:TableFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          TableData:data.data.data
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取今日提醒
  getwarningInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('type', 3);
    request('/api/web/admin_setting/getwarning', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        var noticeList = data.data.data.map(item=>{
          return <Card.Grid className={styles.NoticeGrid} style={{width:'100%'}} key={item.id}>
            {
              item.type == 6 &&
              <Card onClick={()=>window.location.href="/#/Sale/SaleManager?ListTitle=7"} bodyStyle={{padding: 0}} bordered={false}>
                <Card.Meta
                  description={item.content}
                />
                <div className={styles.projectItemContent} style={{marginTop: '10px', display: 'flex',}}>
                  <div style={{flex: '1', textAlign: 'right'}}>
                    <Tag color="#2db7f5">销售提醒</Tag>
                  </div>
                </div>
              </Card>
            }
            {
              item.type == 7 &&
              <Card onClick={()=>window.location.href="/#/Sale/SaleManager?ListTitle=7"} bodyStyle={{padding: 0}} bordered={false}>
                <Card.Meta
                  description={item.content}
                />
                <div className={styles.projectItemContent} style={{marginTop: '10px', display: 'flex',}}>
                  <div style={{flex: '1', textAlign: 'right'}}>
                    <Tag color="#2db7f5">销售提醒</Tag>
                  </div>
                </div>
              </Card>
            }
            {
              item.type == 8 &&
              <Card onClick={()=>window.location.href="/#/Sale/SaleManager?ListTitle=5"} bodyStyle={{padding: 0}} bordered={false}>
                <Card.Meta
                  description={item.content}
                />
                <div className={styles.projectItemContent} style={{marginTop: '10px', display: 'flex',}}>
                  <div style={{flex: '1', textAlign: 'right'}}>
                    <Tag color="#2db7f5">销售提醒</Tag>
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
  //获取销售工作台数据
  getHostInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/show/getShowHost', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          sign:data.data.data.sign,
          shangjia:data.data.data.shangjia,
          xiajia:data.data.data.xiajia,
        })
      }
    }).catch(()=>{})
  }
  //选择时间更新财务收支情况
  ChangeDate = (date, dateString)=>{
    this.setState({start_time:dateString[0],end_time:dateString[1]})
    this.getSignNumberInter(dateString[0],dateString[1]);
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}销售！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );
    const extraContent = (
      <div className={styles.extraContent}>
        {
          this.state.comtype!=3 &&
          <div className={styles.statItem}>
            <p>今日签约</p>
            <p>{this.state.sign}</p>
          </div>
        }
        <div className={styles.statItem}>
          <p>今日上架</p>
          <p>{this.state.shangjia}</p>
        </div>
        <div className={styles.statItem}>
          <p>今日下架</p>
          <p>{this.state.xiajia}</p>
        </div>
      </div>
    );
    const workOperation = [
      {key: 'BackCar', title: '签约',describe:'签订租车合同',href: '/Sale/SaleManager/NewSigning',color:'#f60',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956003091546244'},
      {key: 'NewBorrowCarNotes', title: '上架',describe:'新增小程序上架车辆', href: '/Sale/SaleManager/NewRentalCar',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956026039886466'},
      {key: 'RefundCar', title: '下架',describe:'删除小程序上架车辆',  href: '/Sale/SaleManager/UnderCar',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956035467402868'},
    ];
    const workOperation1 = [
      {key: 'NewBorrowCarNotes', title: '上架',describe:'新增小程序上架车辆', href: '/Sale/SaleManager/NewRentalCar',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956026039886466'},
      {key: 'RefundCar', title: '下架',describe:'删除小程序上架车辆',  href: '/Sale/SaleManager/UnderCar',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956035467402868'}
    ];

    return (
      <PageHeaderLayout
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Row gutter={24}>
          {
            this.state.comtype!=3 ?
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
              </Row>:
            <Row gutter={24}>
              {
                workOperation1.map(item => (
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
          }
          {
            this.state.comtype!=3 &&
          <Col xl={16} lg={12} md={24} sm={24} xs={24}>
            <Card
              style={{ marginBottom: 24 }}
              bodyStyle={{ padding: 0 }}
              bordered={false}
              className={styles.activeCard}
              title="签约动态"
              extra={
                <div>
                  <a id="active2" onClick={()=>this.chanceDate(2)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>本周</a>
                  <a id="active3" onClick={()=>this.chanceDate(3)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>本月</a>
                  <a id="active4" onClick={()=>this.chanceDate(4)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>全年</a>
                  <RangePicker
                    className={styles.MoneyPicker}
                    style={{padding:'0px 15px'}}
                    value={[moment(this.state.start_time), moment(this.state.end_time)]}
                    format={dateFormat}
                    onChange={this.ChangeDate}
                  />
                </div>}
            >
              <List>
                <div className={styles.activitiesList}>
                  <AreaChart width={900} height={450} style={{margin:'50px auto'}} data={this.state.TableData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis/>
                    <Tooltip/>
                    <Area type="monotone" dataKey="sign"  stroke='#82ca9d' fill='#82ca9d'/>
                  </AreaChart>
                </div>
              </List>
            </Card>
          </Col>}
          {
            this.state.comtype!=3 &&
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <Card
              style={{ marginBottom: 24 }}
              bordered={false}
              title="工作提醒"
              bodyStyle={{padding: 0}}
            >
              {this.state.noticeList=='' &&<div style={{padding:'10% 0px',textAlign:'center'}}>暂无工作提醒</div>}
              {this.state.noticeList!='' &&<div>{this.state.noticeList}</div>}
            </Card>
          </Col>}
        </Row>
      </PageHeaderLayout>
    );
  }
}
const WorkPlace = Form.create()(Workplace);

export default WorkPlace;
