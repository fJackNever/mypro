import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import utils from '../../utils/utils';
import request from '../../utils/request';
import { Link } from 'dva/router';
import { Form, Input,Row, Col, Card, List, Avatar,Tag,Radio,notification,Tooltip,Icon,Modal,DatePicker,Popconfirm  } from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import Trend from 'components/Trend';
import numeral from 'numeral';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './../Workbench/Workplace.less';

const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY/MM';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const today = new Date();
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
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==4){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}

    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
    this.getTotalHostInter();
    this.checkNewCompany();
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
    }).then((data)=> {
      if(data.data.code==1){
        if(data.data.data.code!=0){
          this.setState({
            is_show:true,
          })
        }
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch((e)=>{
    })
  }
  //显示新手教学
  ModelhandleOk = () => {
    let staffFormData = new FormData();
    staffFormData.append('key','diuber2017');
    staffFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/staff/getStaffHost',{
      method:'POST',
      body:staffFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        if(data.data.data.total==0){
          $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
          this.setState({
            is_show: false,
            isNew:1,
          });
        }else{
          let carTypeFormData = new FormData();
          carTypeFormData.append('key','diuber2017');
          carTypeFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          request('/api/web/vehicle/getTemplateAll',{
            method:'POST',
            body:carTypeFormData,
            credentials: 'include',
          }).then((data)=> {
            if(data.data.code==1){
              if(data.data.data.all_template==0){
                $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
                this.setState({
                  is_show: false,
                  isNew:2,
                })
              }else{
                this.props.history.push('/Car/CarType?is_new=1');
              }
            }
          }).catch(()=>{})
        }
      }
    }).catch(()=>{})
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
  }
  //新手介绍新增第一个员工
  AddEmployessLink = ()=>{
    $("#Showed").remove()
    this.props.history.push('/Employees/AddEmployees');
  }
  //新手介绍新增第一个车型
  AddcartypeLink = ()=>{
    $("#Showed").remove()
    this.props.history.push('/Car/CarType?is_new=1');
  }
  getTotalHostInter=()=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key','diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append('plat_form','app');
    request('/api/diuber/index/getHost',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
    }).then((data)=> {
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
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getfinanceindex',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code == 1) {
        this.setState({
          contract_deposit: data.data.data.info.contract_deposit,
          collection:data.data.data.info.collection,
          refund:data.data.data.info.refund,
          deposit: data.data.data.info.deposit,
          other: data.data.data.info.other,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
    let NoticeFormData = new FormData();
    NoticeFormData.append('key','diuber2017');
    NoticeFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getwarning',{
      method:'POST',
      body:NoticeFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){

      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
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
    if(e[0]){
      var startTime = (e[0]._d).getFullYear()+'-'+utils.UpdateDate(((e[0]._d).getMonth()+1))+'-'+utils.UpdateDate((e[0]._d).getDate());
      var endTime = (e[1]._d).getFullYear()+'-'+utils.UpdateDate(((e[1]._d).getMonth()+1))+'-'+utils.UpdateDate((e[1]._d).getDate());
    }else{
      var startTime ='';
      var endTime ='';
    }
    let SSGFIFormData = new FormData();
    SSGFIFormData.append('key','diuber2017');
    SSGFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SSGFIFormData.append('end',endTime);
    SSGFIFormData.append('start',startTime);
    request('/api/web/admin_setting/getfinanceindex',{
      method:'POST',
      body:SSGFIFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          refund:data.data.data.info.refund,
          contract_deposit:data.data.data.info.contract_deposit,
          other:data.data.data.info.other,
          collection:data.data.data.info.collection,
          deposit:data.data.data.info.deposit,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
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
  render() {
    const {getFieldDecorator} = this.props.form;
    const { Rents,payRents,OutRents,NewCarRents,ReturnCarRents,RefundRents,DepositRefundRents,deposit,refund,collection,contract_deposit,other} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}驾管！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
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
      <PageHeaderLayout
        content={pageHeaderContent}
        extraContent={extraContent}
      >
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
              <Col xl={24} lg={24} md={24} sm={24} xs={24} >
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
              </Col>
            </Row>
      </PageHeaderLayout>
    );
  }
}
const WorkPlace = Form.create()(Workplace);

export default WorkPlace;
