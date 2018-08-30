import React, { PureComponent } from 'react';
import $ from 'jquery';
import FileSaver from 'file-saver';
import moment from 'moment';
import { connect } from 'dva';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Radio,Select,Row, Col, Button,Table,DatePicker,Popconfirm,notification,Tag,Pagination} from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import numeral from 'numeral';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import styles from './../Sale/Sale.less';
import utils from "../../utils/utils";
import request from "../../utils/request";

import workplace from "../Money/workplace/workplace";
import ShowRent from "../Money/ShowRent/ShowRent";
import ShowContract from "../Money/ShowContract/ShowContract";
import ShowDeposit from "../Money/ShowDeposit/ShowDeposit";
import ShowPayment from "../Money/ShowPayment/ShowPayment";
import AddPayRent from "../Money/AddPayRent/AddPayRent";
import AddContractPayment from "../Money/AddContractPayment/AddContractPayment";
import AddOtherPayment from "../Money/AddOtherPayment/AddOtherPayment";
import AddPayment from "../Money/AddPayment/AddPayment";
import AddRefundDeposit from "../Money/AddRefundDeposit/AddRefundDeposit";

const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};



class Money extends PureComponent {
  state = {
    chancepaytype:false,
    QuickerStartTime:'',
    QuickerEndTime:'',
    QuickerRefundtype:'',
    QuickerSearch:'',
    RefundLoading:false,
    pagecurrent:1,
    pageSize:10,
    datetype:1,
  };
  componentWillReceiveProps (){
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.componentDidMount();
  }
  componentDidMount = () => {
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    if(window.location.href.split('?paging=')[1]=="OtherPayment" || this.state.ListTitle=="全部其他收款") {
      this.setState({ListTitle: '全部其他收款'})
    }else if(window.location.href.split('?paging=')[1]=="RentPayment" || this.state.ListTitle=="全部租金收款"){
      this.setState({ListTitle: '全部租金收款'})
    }else if(window.location.href.split('?paging=')[1]=="ContractPayment"  || this.state.ListTitle=="管理费和押金收入"){
      this.setState({ListTitle: '管理费和押金收入'})
    }else if(window.location.href.split('?paging=')[1]=="Spending" || this.state.ListTitle=="全部付款"){
      this.setState({ListTitle: '全部付款'})
    }else if(window.location.href.split('?paging=')[1]=="RefundDeposit"  || this.state.ListTitle=="退押金"){
      this.setState({ListTitle: '退押金'})
    }else if(window.location.href.split('?paging=')[1]=="GetSigning"  || this.state.ListTitle=="待签约司机"){
      this.setState({ListTitle: '待签约司机'})
      this.getVehicleSignInter('',10,0);
    }else{
      this.setState({ListTitle: '全部租金收款'})}
    this.getLocalTimeInter(1);
  }
  componentWillUnmount = ()=>{
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  //按照时间获取财务总数统计
  getTotalInter = (startTime,endTime)=>{
    let GFIFormData = new FormData();
    GFIFormData.append('key','diuber2017');
    GFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFIFormData.append('end',endTime);
    GFIFormData.append('start',startTime);
    request('/api/web/finance/getFinanceHost',{
      method:'POST',
      body:GFIFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1){
        this.setState({
          GetTotal:data.data.data.in_total,
          Refund:data.data.data.refund	,
          ContractDeposit:data.data.data.contract_deposit,
          Other:data.data.data.other,
          collection:data.data.data.collection,
          Deposit:data.data.data.deposit,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //全部租金收款接口请求
  RentPaymentInter = (start,end,search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("start", start);
    GFHFormData.append("end", end);
    GFHFormData.append("search", search);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/finance/getRefundRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({RefundLoading:false})
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //全部签约收款接口请求
  ContractPaymentInter = (start,end,search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("start", start);
    GFHFormData.append("end", end);
    GFHFormData.append("search", search);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/finance/getContractDeposit',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
          RefundLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //全部其他收款接口请求
  OtherPaymentInter = (start,end,search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("start", start);
    GFHFormData.append("end", end);
    GFHFormData.append("search", search);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/finance/getOtherRefund',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
          RefundLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //全部付款接口请求
  PaymentInter = (start,end,search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("start", start);
    GFHFormData.append("end", end);
    GFHFormData.append("search", search);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/finance/getCollectionRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({RefundLoading:false})
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //全部退押金接口请求
  RefundDepositInter = (start,end,search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("start", start);
    GFHFormData.append("end", end);
    GFHFormData.append("search", search);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/finance/getDepositRefundRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
          RefundLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //待签约司机接口请求
  getVehicleSignInter = (search,limit,offset) =>{
    this.setState({RefundLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("sign_status", 0);
    GFHFormData.append("limit", limit);
    GFHFormData.append("offset", offset);
    request('/api/web/show/getVehicleSign',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({RefundLoading:false})
      if (data.data.code === 1) {
        this.setState({
          Refundrecord:data.data.data.rows,
          RefundrecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //跳转新增签约页面
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      RefundLoading:true,
      pagecurrent:1,
      QuickerSearch:'',
    })
    if(e==="全部其他收款"){
      this.OtherPaymentInter(this.state.StartTime,this.state.EndTime,'',this.state.pageSize,0);
    }else if(e==="全部收入" || e==="全部租金收款"){
      this.RentPaymentInter(this.state.StartTime,this.state.EndTime,'',this.state.pageSize,0);
    }else if(e==="管理费和押金收入"){
      this.ContractPaymentInter(this.state.StartTime,this.state.EndTime,'',this.state.pageSize,0);
    }else if(e==="全部付款"){
      this.PaymentInter(this.state.StartTime,this.state.EndTime,'',this.state.pageSize,0);
    }else{
      this.RefundDepositInter(this.state.StartTime,this.state.EndTime,'',this.state.pageSize,0);
    }
  };
  //快速查询
  InputChange = (e)=>{
    if(e.target.value==''){
      this.setState({
        QuickerSearch: ''
      })
    }else{
    }
  }
  TypeChange = (value) =>{
    this.setState({
      QuickerRefundtype:value
    })
  }
  RangeChange=(date,dateString)=>{
    this.setState({RefundLoading:true})
    if(dateString[0]) {
      this.setState({
        QuickerStartTime: dateString[0],
        QuickerEndTime: dateString[1],
        StartTime:dateString[0],
        EndTime: dateString[1],
      })
      this.getTotalInter(dateString[0],dateString[1]);
      if(this.state.ListTitle=="全部收入"){
        this.RentPaymentInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部其他收款"){
        this.OtherPaymentInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部租金收款"){
        this.RentPaymentInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="管理费和押金收入"){
        this.ContractPaymentInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部付款"){
        this.PaymentInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="退押金"){
        this.RefundDepositInter(dateString[0],dateString[1],this.state.QuickerSearch,this.state.pageSize,0)
      }
    }else{
      const TodayTime = new Date();
      this.setState({
        QuickerStartTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()-1)+'-'+utils.UpdateDate(TodayTime.getDate()),
        QuickerEndTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()),
      })
      var starttime = TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()-1)+'-'+utils.UpdateDate(TodayTime.getDate());
      var endtime = TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate());
      this.getTotalInter(starttime,endtime);
      if(this.state.ListTitle=="全部收入"){
        this.RentPaymentInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部其他收款"){
        this.OtherPaymentInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部租金收款"){
        this.RentPaymentInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="管理费和押金收入"){
        this.ContractPaymentInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="全部付款"){
        this.PaymentInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }else if(this.state.ListTitle=="退押金"){
        this.RefundDepositInter(starttime,endtime,this.state.QuickerSearch,this.state.pageSize,0)
      }
    }
  }
  SearchSubmit = () => {
    if(this.state.StartTime){
      var startTime = this.state.StartTime;
    }else{
      var startTime = '';
    }
    if(this.state.EndTime){
      var endTime = this.state.EndTime;
    }else{
      var endTime = '';
    }
    this.getTotalInter(startTime,endTime);
    this.setState({
      QuickerStartTime:this.state.QuickerStartTime,
      QuickerEndTime:this.state.QuickerEndTime,
      QuickerSearch:$("input[name='search']").val(),
      RefundLoading:true
    })
    if(this.state.ListTitle=="全部收入"){
      this.RentPaymentInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=="全部其他收款"){
      this.OtherPaymentInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=="全部租金收款"){
      this.RentPaymentInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=="管理费和押金收入"){
      this.ContractPaymentInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=="全部付款"){
      this.PaymentInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=="退押金"){
      this.RefundDepositInter(this.state.StartTime,this.state.EndTime,$("input[name='search']").val(),this.state.pageSize,0);
    }
  };
  //删除某条列表
  DeleteListItem = (e) =>{
    this.setState({RefundLoading:true})
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('entity_id',e);
    request('/api/web/vehicle/delRecord',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          RefundLoading:false
        })
        this.props.history.push(-1);
        if(this.state.ListTitle==="全部其他收款"){
          this.OtherPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
        }else if(this.state.ListTitle==="全部收入" || e==="全部租金收款"){
          this.RentPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
        }else if(this.state.ListTitle==="管理费和押金收入"){
          this.ContractPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
        }else if(this.state.ListTitle==="全部付款"){
          this.PaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
        }else{
          this.RefundDepositInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
        }
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  };
  //查看某条列表
  ShowListItem = (e) =>{
    this.props.history.push('/Money/MoneyManager/ShowRent?entity_id='+e)
  };
  //查看全部付款某条列表记录
  ShowPaymentListItem = (e) =>{
    this.props.history.push('/Money/MoneyManager/ShowPayment?entity_id='+e)
  };
  //查看退押金某条列表记录
  ShowDepositListItem = (e) =>{
    this.props.history.push('/Money/MoneyManager/ShowDeposit?entity_id='+e)
  };
  //查看签约记录某条列表记录
  ShowContractListItem = (e) =>{
    this.props.history.push('/Money/MoneyManager/ShowContract?entity_id='+e)
  };
  ShowsignItem = (e)=>{
    this.props.history.push('/Sale/SaleManager/ShowSignNotes?entity_id='+e)
  }
  //新增交租金记录
  AddNewRent = (e) =>{
    if(e=='CheckSigningList'){
      this.setState({
        ListTitle:'待签约司机'
      })
      this.getVehicleSignInter('',10,0);
    }else{
      this.props.history.push('/Money/MoneyManager/'+e)
    }
  };


  //不同时间段筛选财务详情
  //选择时间
  chanceDate = (e)=>{
    this.setState({
      datetype:e.target.value,
    })
    this.setState({RefundLoading:true})
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
          QuickerStartTime:new Date(data.data.data.start),
          QuickerEndTime:new Date(data.data.data.end),
          StartTime:data.data.data.start,
          EndTime:data.data.data.end
        })
        this.getTotalInter(data.data.data.start,data.data.data.end);
        if(this.state.ListTitle=="全部收入"){
          this.RentPaymentInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }else if(this.state.ListTitle=="全部其他收款"){
          this.OtherPaymentInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }else if(this.state.ListTitle=="全部租金收款"){
          this.RentPaymentInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }else if(this.state.ListTitle=="管理费和押金收入"){
          this.ContractPaymentInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }else if(this.state.ListTitle=="全部付款"){
          this.PaymentInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }else if(this.state.ListTitle=="退押金"){
          this.RefundDepositInter(data.data.data.start,data.data.data.end,this.state.QuickerSearch,this.state.pageSize,0)
        }
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
  }

  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    if(this.state.ListTitle==="全部其他收款"){
      this.OtherPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="全部收入" || this.state.ListTitle==="全部租金收款"){
      this.RentPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="管理费和押金收入"){
      this.ContractPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="全部付款"){
      this.PaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="待签约司机"){
      this.getVehicleSignInter(this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else{
      this.RefundDepositInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    if(this.state.ListTitle==="全部其他收款"){
      this.OtherPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="全部收入" || this.state.ListTitle==="全部租金收款"){
      this.RentPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="管理费和押金收入"){
      this.ContractPaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="全部付款"){
      this.PaymentInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==="待签约司机"){
      this.getVehicleSignInter(this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }else{
      this.RefundDepositInter(this.state.StartTime,this.state.EndTime,this.state.QuickerSearch,pageSize,(current-1)*pageSize);
    }
  }

  //导出
  OutputExcelSubmit = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('limit',99999);
    if(this.state.ListTitle=='全部租金收款') {
      this.OutputExcelZJSK(GFHFormData);
    }else if(this.state.ListTitle=='全部收入'){
      this.OutputExcelZJSK(GFHFormData);
    }else if(this.state.ListTitle=='管理费和押金收入'){
      this.OutputExcelQYSK(GFHFormData);
    }else if(this.state.ListTitle=='全部其他收款'){
      this.OutputExcelQTSK(GFHFormData);
    }else if(this.state.ListTitle=='全部付款'){
      this.OutputExcelQBFK(GFHFormData);
    }else if(this.state.ListTitle=='退押金'){
      this.OutputExcelTYJ(GFHFormData);
    }
  }

  //导出全部租金收款
  OutputExcelZJSK = (target)=>{
    request('/api/web/finance/getRefundRecord',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,交租金时间,交租金金额,车牌号,下次交租金时间,交租金状态,备注';
      for (const i in data) {
        str += '\n' +
          data[i].customer_name + ',' +
          data[i].refund_time + ',' +
          data[i].amount + ',' +
          data[i].license_plate_no + ',' +
          data[i].next_refund_time + ',' +
          data[i].refund_status + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "全部租金收款.xls");
    })
  }
  //导出管理费和押金收入
  OutputExcelQYSK = (target)=>{
    request('/api/web/finance/getContractDeposit',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,支付时间,首租金,管理费,总押金,车牌号,支付状态,备注';
      for (const i in data) {
        str += '\n' +
          data[i].customer_name + ',' +
          data[i].pay_time + ',' +
          data[i].first_amount + ',' +
          data[i].manager_amount + ',' +
          data[i].deposit + ',' +
          data[i].license_plate_no + ',' +
          data[i].status+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "管理费和押金收入.xls");
    })
  }
  //导出全部其他收款
  OutputExcelQTSK = (target)=>{
    request('/api/web/finance/getOtherRefund',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,付款类型,名称,收款时间,收款总金额,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].collection_type + ',' +
          data[i].collection_name + ',' +
          data[i].refund_time + ',' +
          data[i].amount + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "全部其他收款.xls");
    })
  }
  //导出全部付款
  OutputExcelQBFK = (target)=>{
    request('/api/web/finance/getCollectionRecord',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,付款类型,名称,支付时间,支付总金额,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].collection_type + ',' +
          data[i].collection_name + ',' +
          data[i].expend_time + ',' +
          data[i].pay_amount + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "全部付款.xls");
    })
  }
  //导出退押金
  OutputExcelTYJ = (target)=>{
    request('/api/web/finance/getDepositRefundRecord',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '记录编号,车牌号,客户姓名,退押金时间,退押金总金额,退押金状态(0:未退清；1:已退),备注';
      for (const i in data) {
        str += '\n' +
          data[i].entity_id + ',' +
          data[i].license_plate_no + ',' +
          data[i].customer_name + ',' +
          data[i].deposit_refund_time + ',' +
          data[i].deposit_refund_amount + ',' +
          data[i].deposit_refund_status + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "退押金.xls");
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>￥ {numeral(value).format('0,0')}</p>
        {bordered && <em />}
      </div>
    );
    const SaleTopData = [
      {key:'SaleTopData01',title:'全部收入',value:this.state.GetTotal,bordered:true},
      {key:'SaleTopData02',title:'全部租金收款',value:this.state.Refund,bordered:true},
      {key:'SaleTopData03',title:'管理费和押金收入',value:this.state.ContractDeposit,bordered:true},
      {key:'SaleTopData04',title:'全部其他收款',value:this.state.Other,bordered:true},
      {key:'SaleTopData05',title:'全部付款',value:this.state.collection,bordered:true},
      {key:'SaleTopData06',title:'退押金',value:this.state.Deposit,bordered:false},
    ];
    const RefundDepositColumns =[
      { title: '记录编号', dataIndex: 'entity_id', key: 'entity_id', },
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '退押金时间', dataIndex: 'deposit_refund_time', key: 'deposit_refund_time',  },
      { title: '退押金总金额', dataIndex: 'deposit_refund_amount', key: 'deposit_refund_amount',},
      { title: '退押金状态', dataIndex: 'deposit_refund_status', key: 'deposit_refund_status',
        render: (text,record) =>
          <div>
            {
              record.deposit_refund_status==0 && <span style={{color:'#f50'}}>未退清</span>
            }
            {
              record.deposit_refund_status==1 && <span>已退</span>
            }
          </div>,
      },
      { title: '备注', dataIndex: 'comment', key: 'comment',width:200},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
        ,
      },
    ];
    const PaymentColumns =[
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '付款类型', dataIndex: 'collection_type', key: 'collection_type',
        render: (text,record) =>
          <div>
            {record.collection_type==1 && <span>客户</span>}
            {record.collection_type==2 && <span>合作伙伴</span>}
          </div>},
      { title: '名称', dataIndex: 'collection_name', key: 'collection_name',
        render: (text,record) =>
          <div>
            {record.collection_type==1 && <span>{record.customer_name}</span>}
            {record.collection_type==2 && <span>{record.collection_name}</span>}
          </div>
      },
      { title: '支付时间', dataIndex: 'expend_time', key: 'expend_time',  },
      { title: '支付总金额', dataIndex: 'pay_amount', key: 'pay_amount',},
      { title: '备注', dataIndex: 'comment', key: 'comment'},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            <Tag onClick={this.ShowPaymentListItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
        ,
      },
    ];
    const ContractColumns = [
      { title: '客户姓名',  dataIndex: 'customer_name', key: 'customer_name',},
      { title: '支付时间', dataIndex: 'pay_time', key: 'pay_time', },
      { title: '首租金', dataIndex: 'first_amount', key: 'first_amount',},
      { title: '管理费', dataIndex: 'manager_amount', key: 'manager_amount',},
      { title: '总押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '支付状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 && <span style={{color:'#f50'}}>未支付</span>}
            {record.status==1 && <span>已支付</span>}
          </div>
      },
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            <Tag onClick={this.ShowContractListItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
        ,
      },
    ];
    const OtherColumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '付款类型', dataIndex: 'collection_type', key: 'collection_type',
        render: (text,record) =>
          <div>
            {record.collection_type==1 && <span>客户</span>}
            {record.collection_type==2 && <span>合作伙伴</span>}
          </div>},
      { title: '名称', dataIndex: 'collection_name', key: 'collection_name',},
      { title: '收款时间', dataIndex: 'refund_time', key: 'refund_time',  },
      { title: '收款总金额', dataIndex: 'amount', key: 'amount',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width:200},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            <Popconfirm title="确定删除?" onConfirm={this.DeleteListItem.bind(this,record.entity_id)}>
              <Tag className={styles.TagBtn} color="orange">删除</Tag>
            </Popconfirm>
          </div>
        ,
      },
    ]
    const columns = [
      { title: '客户姓名',  dataIndex: 'customer_name', key: 'customer_name',width:100},
      { title: '交租金时间', dataIndex: 'refund_time', key: 'refund_time', },
      { title: '交租金金额', dataIndex: 'amount', key: 'amount',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no', },
      { title: '下次交租金时间', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '交租金状态', dataIndex: 'refund_status', key: 'refund_status' ,
        render: (text,record) =>
          <div>
            {
              record.refund_status=="0" && <span style={{color:'#f00'}}>未还清</span>
            }
            {
              record.refund_status=="1" && <span>正常交租金</span>
            }
          </div>,
      },
      { title: '备注', dataIndex: 'comment', key: 'comment',width:200 },
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowListItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
        ,
      },
    ];
    const signingColumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '签约人', dataIndex: 'name', key: 'name', },
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '签约日期', dataIndex: 'sign_date', key: 'sign_date' ,},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowsignItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
        ,
      },
    ];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Money/MoneyManager" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={4} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速操作入口" block style={{ paddingBottom: 11 }}>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('AddPayRent')} type="primary" >新增交租金记录</Button>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('AddContractPayment')} type="primary">新增签约收款记录</Button>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('AddOtherPayment')} type="primary">新增其他收款记录</Button>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('AddPayment')} type="primary" ghost>新增付款记录</Button>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('AddRefundDeposit')} type="primary" ghost>新增退押金记录</Button>
                      <Button className={styles.QuickButton} onClick={()=>this.AddNewRent('CheckSigningList')} type="danger" ghost>待签约司机列表</Button>
                    </StandardFormRow>
                    <StandardFormRow title="快速统计入口" block style={{ padding:'12px 0px 24px'}}>
                      <Row>
                        <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                          <RangePicker value={[moment(this.state.QuickerStartTime), moment(this.state.QuickerEndTime)]} onChange={this.RangeChange} className={styles.QuickFormItem}  name="date"/>
                        </Col>
                        <Col xl={18} lg={12} md={12} sm={24} xs={24}>
                          <Radio.Group value={this.state.datetype} onChange={this.chanceDate}>
                            <Radio.Button value={1}>今日租金查询</Radio.Button>
                            <Radio.Button value={2}>本周租金查询</Radio.Button>
                            <Radio.Button value={3}>本月租金查询</Radio.Button>
                            <Radio.Button value={4}>本年租金查询</Radio.Button>
                          </Radio.Group>
                        </Col>
                      </Row>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Row>
                        {
                          this.state.chancepaytype &&
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Select className={styles.QuickFormItem} value={this.state.QuickerRefundtype} onChange={this.TypeChange} name="refund_type"  placeholder="选择支付方式">
                              <Option value="">所有支付方式</Option>
                              <Option value="weixin">微信支付</Option>
                              <Option value="ali">支付宝支付</Option>
                              <Option value="card">银行卡支付</Option>
                              <Option value="cash">现金支付</Option>
                              <Option value="other">其他支付</Option>
                            </Select>
                          </Col>
                        }
                        <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                          <Input defaultValue={this.state.QuickerSearch} className={styles.QuickFormItem} onChange={this.InputChange}  name="search" placeholder="输入关键字" />
                        </Col>
                        <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                          <Button onClick={()=>this.SearchSubmit()} type="primary">搜索</Button>
                        </Col>
                      </Row>
                    </StandardFormRow>
                  </Card>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false} title={this.state.ListTitle}
                        extra={<Button type="primary" ghost onClick={this.OutputExcelSubmit}>导出</Button>}>
                    {
                      this.state.ListTitle==='全部收入'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true} loading={this.state.RefundLoading} scroll={{x:600}} columns={columns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='全部租金收款'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={columns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='管理费和押金收入'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={ContractColumns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='全部其他收款'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={OtherColumns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='全部付款'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={PaymentColumns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='退押金'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={RefundDepositColumns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    {
                      this.state.ListTitle==='待签约司机'&&
                      <Table pagination={false}  rowKey="entity_id" bordered={true}  loading={this.state.RefundLoading} scroll={{x:600}} columns={signingColumns} dataSource={this.state.Refundrecord}  footer={() => <span>总共 {this.state.RefundrecordLen} 条数据</span>}/>
                    }
                    <Pagination hideOnSinglePage={true} style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.RefundrecordLen} />
                  </Card>
                </div>
              </div>
            }/>
            <Route path="/Money/workplace" component={workplace}/>
            <Route path="/Money/MoneyManager/ShowRent" component={ShowRent}/>
            <Route path="/Money/MoneyManager/ShowContract" component={ShowContract}/>
            <Route path="/Money/MoneyManager/ShowDeposit" component={ShowDeposit}/>
            <Route path="/Money/MoneyManager/ShowPayment" component={ShowPayment}/>
            <Route path="/Money/MoneyManager/AddPayRent" component={AddPayRent}/>
            <Route path="/Money/MoneyManager/AddContractPayment" component={AddContractPayment}/>
            <Route path="/Money/MoneyManager/AddOtherPayment" component={AddOtherPayment}/>
            <Route path="/Money/MoneyManager/AddPayment" component={AddPayment}/>
            <Route path="/Money/MoneyManager/AddRefundDeposit" component={AddRefundDeposit}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const Moneys = Form.create()(Money);

export default Moneys;
