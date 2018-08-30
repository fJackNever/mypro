import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import $ from 'jquery';
import utils from '../../../utils/utils';
import request from '../../../utils/request';
import { Link } from 'dva/router';
import numeral from 'numeral';
import { Form, Input,Row, Col, Card, List, Avatar,Tag,Radio,notification,DatePicker,Button  } from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './../../Workbench/Workplace.less';

const {RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
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
    MoneyKey:'a',
  }
  componentDidMount() {
    $('#active1').css('color','#1890ff');
    this.getLocalTimeInter(1);
    this.getwarningInter();
    this.getTodayInter();
    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
  }
  //获取今日提醒
  getwarningInter = ()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key', 'diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('type', 2);
    request('/api/web/admin_setting/getwarning', {
      method: 'POST',
      body: getHostFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        var noticeList = data.data.data.map(item=>{
          return <Card.Grid className={styles.NoticeGrid} style={{width:'100%'}} key={item.id}>
            {
              item.type==3 &&
                <Card onClick={()=>window.location.href="/#/Money/MoneyManager?paging=GetSigning"} bodyStyle={{ padding: 0 }} bordered={false} >
                  <Card.Meta
                    description={item.content}
                  />
                  <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                    <div style={{flex:'1',textAlign:'right'}}>
                      <Tag color="#f50">财务提醒</Tag>
                    </div>
                  </div>
                </Card>
            }
            {
              item.type==4 &&
                <Card onClick={()=>window.location.href="/#/Customer?customer_type=3"} bodyStyle={{ padding: 0 }} bordered={false} >
                  <Card.Meta
                    description={item.content}
                  />
                  <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                    <div style={{flex:'1',textAlign:'right'}}>
                      <Tag color="#f50">财务提醒</Tag>
                    </div>
                  </div>
                </Card>
            }
            {
              item.type==5 &&
                <Card onClick={()=>window.location.href="/#/Customer?customer_type=6"} bodyStyle={{ padding: 0 }} bordered={false} >
                  <Card.Meta
                    description={item.content}
                  />
                  <div className={styles.projectItemContent} style={{marginTop:'10px',display:'flex',}}>
                    <div style={{flex:'1',textAlign:'right'}}>
                      <Tag color="#f50">财务提醒</Tag>
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
  //获取今日财务收支情况
  getTodayInter = ()=>{
    const TodayTime = new Date();
    let SSGFIFormData = new FormData();
    SSGFIFormData.append('key','diuber2017');
    SSGFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SSGFIFormData.append('end',TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()));
    SSGFIFormData.append('start',TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()));
    request('/api/web/finance/getFinanceHost',{
      method:'POST',
      body:SSGFIFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          Todayrefund:data.data.data.refund,
          Todaycontract_deposit:data.data.data.contract_deposit,
          Todayother:data.data.data.other,
          Todaycollection:data.data.data.collection,
          Todaydeposit:data.data.data.deposit,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  onMoneyChange = (e) =>{
    this.setState({
      MoneyKey:e.target.value
    })
  }
  AddQuickEntry = (e) =>{
    this.props.form.validateFields((err, values) => {
      if (!err) {

      }
    })
  }
  //选择时间更新财务收支情况
  ChangeDate = (e)=>{
    var startTime = (e[0]._d).getFullYear()+'-'+utils.UpdateDate(((e[0]._d).getMonth()+1))+'-'+utils.UpdateDate((e[0]._d).getDate());
    var endTime = (e[1]._d).getFullYear()+'-'+utils.UpdateDate(((e[1]._d).getMonth()+1))+'-'+utils.UpdateDate((e[1]._d).getDate());
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
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          refund:data.data.data.refund,
          contract_deposit:data.data.data.contract_deposit,
          other:data.data.data.other,
          collection:data.data.data.collection,
          deposit:data.data.data.deposit,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //选择时间
  chanceDate = (target)=>{
    if(target==1){
      $('#active1').css('color','#1890ff');
      $('#active2').css('color','rgba(0,0,0,0.65)');
      $('#active3').css('color','rgba(0,0,0,0.65)');
      $('#active4').css('color','rgba(0,0,0,0.65)');
      this.getLocalTimeInter(1);
    }else  if(target==2){
      $('#active2').css('color','#1890ff');
      $('#active1').css('color','rgba(0,0,0,0.65)');
      $('#active3').css('color','rgba(0,0,0,0.65)');
      $('#active4').css('color','rgba(0,0,0,0.65)');
      this.getLocalTimeInter(2);
    }else  if(target==3){
      $('#active3').css('color','#1890ff');
      $('#active1').css('color','rgba(0,0,0,0.65)');
      $('#active2').css('color','rgba(0,0,0,0.65)');
      $('#active4').css('color','rgba(0,0,0,0.65)');
      this.getLocalTimeInter(3);
    }else  if(target==4){
      $('#active4').css('color','#1890ff');
      $('#active1').css('color','rgba(0,0,0,0.65)');
      $('#active3').css('color','rgba(0,0,0,0.65)');
      $('#active2').css('color','rgba(0,0,0,0.65)');
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
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          beforetime:new Date(data.data.data.start),
          aftertime:new Date(data.data.data.end),
        })
        this.getmoneyTimeInter(data.data.data.start,data.data.data.end)
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
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          refund:data.data.data.refund,
          contract_deposit:data.data.data.contract_deposit,
          other:data.data.data.other,
          collection:data.data.data.collection,
          deposit:data.data.data.deposit,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const { Todaycontract_deposit,Todayrefund,Todaydeposit,Todaycollection,deposit,refund,collection,contract_deposit,other} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}财务！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
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
        title:'今日签约收款',
        total:Todaycontract_deposit,
      },{
        key:'ReturnCarRents',
        title:'今日收租',
        total:Todayrefund,
      },{
        key:'RefundRents',
        title:'今日退押金',
        total:Todaydeposit,
      },{
        key:'DepositRefundRents',
        title:'今日付款',
        total:Todaycollection,
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
    const workOperation = [
      {key: 'BackCar', title: '签约收款',describe:'租车、签约收款',href: '/Money/MoneyManager/AddContractPayment',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956003091546244'},
      {key: 'NewBorrowCarNotes', title: '收租金',describe:'月/日租、以租代购交租金', href: '/Money/MoneyManager/AddPayRent',color:'red',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956026039886466'},
      {key: 'RefundCar', title: '退押金',describe:'退租车辆、退押金',  href: '/Money/MoneyManager/AddRefundDeposit',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956035467402868'},
      {key: 'NewCheckCarNotes', title: '付款',describe:'客户、合作伙伴付款',  href: '/Money/MoneyManager/AddPayment',color:'#30a5ff',icon:'http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152956043653495871'},
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
                    <div className={styles.workOperationfirst} style={{background:item.color}}><img style={{width:'40%',}} src={item.icon}/></div>
                    <div className={styles.workOperationlast}>
                      <div style={{color:'#000',fontSize:'20px', lineHeight:'38px',}}>{item.title}</div>
                      <div  className={styles.workOperationtext} style={{color:'rgba(0,0,0,0.45)'}}>{item.describe}</div>
                    </div>
                  </Link>
                </Card>
              </Col>
            ))
          }
        </Row>
        <Row gutter={24}>
          <Col xl={16} lg={24} md={24} sm={24} xs={24}>
            <Row gutter={24}>
              {
                workTotal.map(item=>(
                  <Col xl={6} lg={12} md={24} sm={24} xs={24}>
                    <ChartCard style={{marginBottom:'24px',}}
                               title={item.title}
                               total={<span>{numeral(item.total).format('0,0')}</span>}
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
                  <RadioGroup onChange={this.onMoneyChange} defaultValue="a">
                    <RadioButton value="a">收入情况</RadioButton>
                    <RadioButton value="b">支出情况</RadioButton>
                  </RadioGroup>
                  <a id="active1" onClick={()=>this.chanceDate(1)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>今日</a>
                  <a id="active2" onClick={()=>this.chanceDate(2)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>本周</a>
                  <a id="active3" onClick={()=>this.chanceDate(3)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>本月</a>
                  <a id="active4" onClick={()=>this.chanceDate(4)} style={{marginLeft:'24px',color:'rgba(0,0,0,0.65)'}}>全年</a>
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
          </Col>
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
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
const WorkPlace = Form.create()(Workplace);

export default WorkPlace;
