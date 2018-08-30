import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import FileSaver from 'file-saver';
import moment from 'moment';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select, Row, Col, Button,Table,notification,Tag,DatePicker,message,Pagination } from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './../Sale/Sale.less';

import ShowCustomer from './ShowCustomer/ShowCustomer';
import AddCustomer from './AddCustomer/AddCustomer';
import AddCustomerRecord from './AddCustomerRecord/AddCustomerRecord';
import request from "../../utils/request";
import utils from "../../utils/utils";

const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class customer extends PureComponent {
  state = {
    ListTitle:'全部客户',
    tableLoading:false,
    search:'',
    chanceType:1,
    type:5,
    chanceDate:1,

    pagecurrent:1,
    pageSize:10
  }
  componentWillReceiveProps (){
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.componentDidMount();
  }
  componentDidMount() {
    //限制除了车管、销售和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3 || permision==7){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}

    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.resetCustomerRedis();
    this.getHostInter();
    if(window.location.href.split('CustomerID=')[1]){
      this.ShowCustomerReocrdList(window.location.href.split('CustomerID=')[1])
    }else if(window.location.href.split('customer_type=')[1]){
      const targetType = window.location.href.split('customer_type=')[1];
      if(targetType==1){
        this.setState({ListTitle:'全部客户',});
        this.getCustomerInter('',10,0);
      }else if(targetType==2){
        this.setState({ListTitle:'已租车客户',});
        this.getCustomerYizuInter('','',10,0);
      }else if(targetType==3){
        this.setState({ListTitle:'需交租金客户',});
        this.getCustomerHuankuanInter('','','','',10,0);
      }else if(targetType==4){
        this.setState({ListTitle:'未缴清客户',});
        this.getCustomerWeihuanqingInter('','',10,0);
      }else if(targetType==5){
        this.setState({ListTitle:'即将到期客户',});
        this.getCustomerDaoqiInter('','',10,0);
      }else if(targetType==6){
        this.setState({ListTitle:'需退押金客户',});
        this.getCustomerTuiyajinInter('',10,0);
      }else if(targetType==7){
        this.setState({ListTitle:'押金未退清客户',});
        this.getCustomerUnyajinInter('',10,0);
      }else if(targetType==8){
        this.setState({ListTitle:'有交流客户',});
        this.getCustomerContact('',10,0);
      }
    }else{
      this.setState({ListTitle:'全部客户',});
      this.getCustomerInter('',10,0);
    }
    const TodayTime = new Date();
    console.log(moment(new Date(parseInt(Date.parse(TodayTime)) - (3600 * 24 * 7 * 1000))))
    this.setState({
      QuickerStartTime:moment(new Date(parseInt(Date.parse(TodayTime)) - (3600 * 24 * 7 * 1000))),
      QuickerEndTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()),
    })
  }
  componentWillUnmount = ()=>{
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  /*客户信息刷新缓存*/
  resetCustomerRedis=()=>{
    let HostFormData = new FormData();
    HostFormData.append('key','diuber2017');
    HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/resetCustomerRedis',{
      method:'POST',
      body:HostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {}).catch(()=>{})
  }
  //分割
  ShowCustomerReocrdList = (target)=>{
    if(target==1){
      this.setState({ListTitle:'全部客户',});
      this.getCustomerInter('');
    }else if(target==2){
      this.setState({ListTitle:'已租车客户',});
      this.getCustomerYizuInter('','');
    }else if(target==3){
      this.setState({ListTitle:'需交租金客户',});
      this.getCustomerHuankuanInter('','','','');
    }else if(target==4){
      this.setState({ListTitle:'未缴清客户',});
      this.getCustomerWeihuanqingInter('','');
    }else if(target==5){
      this.setState({ListTitle:'即将到期客户',});
      this.getCustomerDaoqiInter('','');
    }else if(target==6){
      this.setState({ListTitle:'需退押金客户',});
      this.getCustomerTuiyajinInter('');
    }else if(target==7){
      this.setState({ListTitle:'押金未退清客户',});
      this.getCustomerUnyajinInter('');
    }else if(target==8){
      this.setState({ListTitle:'有交流客户',});
      this.getCustomerContact('');
    }
  }
  //获取客户首页信息
  getHostInter = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/customer/getHost',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          total:data.data.data.total,
          yi_zu:data.data.data.yi_zu,
          huan_kuan:data.data.data.huan_kuan,
          wei_huan_qing:data.data.data.wei_huan_qing,
          dao_qi:data.data.data.dao_qi,
          tui_ya_jin:data.data.data.tui_ya_jin,
          wei_tui_qing:data.data.data.wei_tui_qing,
          contact:data.data.data.contact,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取所有客户记录列表
  getCustomerInter = (search,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    GFHFormData.append('limit',10000);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomer',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取已租车客户记录列表
  getCustomerYizuInter = (search,type,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    if(type!=5){GFHFormData.append('type',type);}
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerYizu',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取即将到期客户记录列表
  getCustomerDaoqiInter = (search,type,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    if(type!=5){GFHFormData.append('type',type);}
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerDaoqi',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取退押金客户记录列表
  getCustomerTuiyajinInter = (search,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerTuiyajin',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取需交租金客户记录列表
  getCustomerHuankuanInter = (startTime,endTime,search,type,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    if(type!=5){GFHFormData.append('type',type);}
    GFHFormData.append('endTime',endTime);
    GFHFormData.append('startTime',startTime);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerHuankuan',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取未还清租金客户列表
  getCustomerWeihuanqingInter = (search,type,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    if(type!=5){GFHFormData.append('type',type);}
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerWeihuanqing',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取押金未退清客户列表
  getCustomerUnyajinInter = (search,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerUnyajin',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取客户交流列表
  getCustomerContact = (search,limit,offset)=>{
    this.setState({tableLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('search',search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/customer/getCustomerContact',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.total,
        })
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //跳转查看客户详细信息页面
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      tableLoading:true,
      search:'',
      type:5,
      pagecurrent:1,
    })
    if(e=='全部客户'){
      this.setState({chanceType:1,chanceDate:1})
      this.getCustomerInter('',this.state.pageSize,0);
    }else if(e=='已租车客户'){
      this.setState({chanceType:2,chanceDate:1})
      this.getCustomerYizuInter('','',this.state.pageSize,0);
    }else if(e=='需交租金客户'){
      this.setState({chanceType:2,chanceDate:2})
      this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,$("input[name='search']").val(),this.state.type,this.state.pageSize,0);
    }else if(e=='未缴清客户'){
      this.setState({chanceType:2,chanceDate:1})
      this.getCustomerWeihuanqingInter('','',this.state.pageSize,0);
    }else if(e=='即将到期客户'){
      this.setState({chanceType:2,chanceDate:1})
      this.getCustomerDaoqiInter('','',this.state.pageSize,0);
    }else if(e=='需退押金客户'){
      this.setState({chanceType:1,chanceDate:1})
      this.getCustomerTuiyajinInter('',this.state.pageSize,0);
    }else if(e=='押金未退清客户'){
      this.setState({chanceType:1,chanceDate:1})
      this.getCustomerUnyajinInter('',this.state.pageSize,0);
    }else if(e=='有交流客户'){
      this.setState({chanceType:1,chanceDate:1})
      this.getCustomerContact('',this.state.pageSize,0);
    }
  }
  //跳转新增客户页面
  AddCustomer = () =>{
    this.props.history.push('/Customer/AddCustomer');
  }
  //跳转新增客户交流记录页面
  AddCustomerRecord = () =>{
    this.props.history.push('/Customer/AddCustomerRecord');
  }
  //删除客户
  DeleteCustomer = (e)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('id',e);
    request('/api/web/customer/delCustomer',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        message.success('成功删除该客户！');
        this.setState({
          tableLoading:true,
        })
        if(this.state.ListTitle=='全部客户'){
          this.setState({chanceType:1,chanceDate:1})
          this.getCustomerInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='已租车客户'){
          this.setState({chanceType:2,chanceDate:1})
          this.getCustomerYizuInter('','',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='需交租金客户'){
          this.setState({chanceType:2,chanceDate:2})
          this.getCustomerHuankuanInter('','','','',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='未缴清客户'){
          this.setState({chanceType:2,chanceDate:1})
          this.getCustomerWeihuanqingInter('','',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='即将到期客户'){
          this.setState({chanceType:2,chanceDate:1})
          this.getCustomerDaoqiInter('','',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='需退押金客户'){
          this.setState({chanceType:1,chanceDate:1})
          this.getCustomerTuiyajinInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='押金未退清客户'){
          this.setState({chanceType:1,chanceDate:1})
          this.getCustomerUnyajinInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }else if(this.state.ListTitle=='有交流客户'){
          this.setState({chanceType:1,chanceDate:1})
          this.getCustomerContact('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
        }
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //查看客户
  ShowCustomer = (target,type)=>{
    this.props.history.push('/Customer/ShowCustomer?customerId='+target+'&customerType='+type);
  }
  //选择类型
  changeType = (value)=>{
    this.setState({
      type:value,
      tableLoading:true
    })
    if(value!=5){
      if(this.state.ListTitle=='已租车客户'){
        this.getCustomerYizuInter('',value,this.state.pageSize,0);
      }else if(this.state.ListTitle=='需交租金客户') {
        this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,'',value,this.state.pageSize,0);
      }else if(this.state.ListTitle=='未缴清客户') {
        this.getCustomerWeihuanqingInter('',value,this.state.pageSize,0);
      }else if(this.state.ListTitle=='即将到期客户') {
        this.getCustomerDaoqiInter('',value,this.state.pageSize,0);
      }
    }else{
      if(this.state.ListTitle=='已租车客户'){
        this.getCustomerYizuInter('','',this.state.pageSize,0);
      }else if(this.state.ListTitle=='需交租金客户') {
        this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,'','',this.state.pageSize,0);
      }else if(this.state.ListTitle=='未缴清客户') {
        this.getCustomerWeihuanqingInter('','',this.state.pageSize,0);
      }else if(this.state.ListTitle=='即将到期客户') {
        this.getCustomerDaoqiInter('','',this.state.pageSize,0);
      }
    }
  }
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
      if(this.state.ListTitle=='全部客户'){
        this.getCustomerInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='已租车客户'){
        this.getCustomerYizuInter('',this.state.type,this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='需交租金客户'){
        this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,'',this.state.type,this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='未缴清客户'){
        this.getCustomerWeihuanqingInter('',this.state.type,this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='即将到期客户'){
        this.getCustomerDaoqiInter('',this.state.type,this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='需退押金客户'){
        this.getCustomerTuiyajinInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='押金未退清客户'){
        this.getCustomerUnyajinInter('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else if(this.state.ListTitle=='有交流客户'){
        this.getCustomerContact('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }
    }else{
    }
  }
  //快捷查询
  SearchSubmit =()=>{
    this.setState({
      search:$("input[name='search']").val(),
      tableLoading:true,
      pagecurrent:1,
    })
    if(this.state.ListTitle=='全部客户'){
      this.getCustomerInter($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='已租车客户'){
      this.getCustomerYizuInter($("input[name='search']").val(),this.state.type,this.state.pageSize,0);
    }else if(this.state.ListTitle=='需交租金客户'){
      this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,$("input[name='search']").val(),this.state.type,this.state.pageSize,0);
    }else if(this.state.ListTitle=='未缴清客户'){
      this.getCustomerWeihuanqingInter($("input[name='search']").val(),this.state.type,this.state.pageSize,0);
    }else if(this.state.ListTitle=='即将到期客户'){
      this.getCustomerDaoqiInter($("input[name='search']").val(),this.state.type,this.state.pageSize,0);
    }else if(this.state.ListTitle=='需退押金客户'){
      this.getCustomerTuiyajinInter($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='押金未退清客户'){
      this.getCustomerUnyajinInter($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='有交流客户'){
      this.getCustomerContact($("input[name='search']").val(),this.state.pageSize,0);
    }
  }

  //由合同开始时间结束时间进行筛选
  RangeChange=(date,dateString)=> {
    this.setState({RefundLoading: true})
    if (dateString[0]) {
      this.setState({
        QuickerStartTime: dateString[0],
        QuickerEndTime: dateString[1],
      })
      var type = this.state.type;
      if(type==5) {
        type = '';
      }
      let GFHFormData = new FormData();
      GFHFormData.append('key','diuber2017');
      GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      GFHFormData.append('search',this.state.search);
      GFHFormData.append('type',type);
      GFHFormData.append('endTime',dateString[1]);
      GFHFormData.append('startTime',dateString[0]);
      GFHFormData.append('limit',9999);
      request('/api/web/customer/getCustomerHuankuan',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
        signal:this.state.signal,
      }).then((data)=> {
        this.setState({tableLoading:false})
        if(data.data.code==1){
          this.setState({
            CustomerRecord:data.data.data.rows,
            CustomerRecordLen:data.data.data.rows.length,
            CustomerLoading:false
          })
        }else  if(data.data.code==90001){
          this.props.history.push('/user/login')
        }else{
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }
  }

  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    if(this.state.ListTitle=='全部客户'){
      this.getCustomerInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已租车客户'){
      this.getCustomerYizuInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='需交租金客户'){
      this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,$("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='未缴清客户'){
      this.getCustomerWeihuanqingInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='即将到期客户'){
      this.getCustomerDaoqiInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='需退押金客户'){
      this.getCustomerTuiyajinInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='押金未退清客户'){
      this.getCustomerUnyajinInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='有交流客户'){
      this.getCustomerContact($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    if(this.state.ListTitle=='全部客户'){
      this.getCustomerInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已租车客户'){
      this.getCustomerYizuInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='需交租金客户'){
      this.getCustomerHuankuanInter(this.state.QuickerStartTime,this.state.QuickerEndTime,$("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='未缴清客户'){
      this.getCustomerWeihuanqingInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='即将到期客户'){
      this.getCustomerDaoqiInter($("input[name='search']").val(),this.state.type,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='需退押金客户'){
      this.getCustomerTuiyajinInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='押金未退清客户'){
      this.getCustomerUnyajinInter($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='有交流客户'){
      this.getCustomerContact($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }
  }


  //导出
  OutputExcelSubmit = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append('limit',99999);
    if(this.state.ListTitle=='全部客户') {
      this.OutputExcelAllKEHU(GFHFormData);
    }else if(this.state.ListTitle=='已租车客户'){
      this.OutputExcelYZCKH(GFHFormData);
    }else if(this.state.ListTitle=='需交租金客户'){
      this.OutputExcelXJZJKH(GFHFormData);
    }else if(this.state.ListTitle=='未缴清客户'){
      this.OutputExcelWJQKH(GFHFormData);
    }else if(this.state.ListTitle=='即将到期客户'){
      this.OutputExcelJJDQKH(GFHFormData);
    }else if(this.state.ListTitle=='需退押金客户'){
      this.OutputExcelXTYJKH(GFHFormData);
    }else if(this.state.ListTitle=='押金未退清客户'){
      this.OutputExcelYJWTQKH(GFHFormData);
    }else if(this.state.ListTitle=='有交流客户'){
      this.OutputExcelYJLKH(GFHFormData);
    }
  }

  //导出全部客户
  OutputExcelAllKEHU = (target)=>{
    request('/api/web/customer/getCustomer',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '类型(1:个人；2:公司),客户姓名,手机号,身份证号,地址,备注';
      for (const i in data) {
        str += '\n' +
          data[i].type + ',' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].id_number + ',' +
          data[i].home_address + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "全部客户.xls");
    })
  }
  //导出已租车客户
  OutputExcelYZCKH = (target)=>{
    request('/api/web/customer/getCustomerYizu',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,租车类型(1:月租；2:日租；3:以租代购),租金,合同开始日期,合同结束日期,车牌号,品牌车型,下次交租金日期';
      for (const i in data) {
        str += '\n' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].rent_type + ',' +
          data[i].rent_month_amount + ',' +
          data[i].contract_start_time + ',' +
          data[i].contract_end_time+ ',' +
          data[i].license_plate_no+ ',' +
          data[i].vehicle_template+ ',' +
          data[i].next_refund_time
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "已租车客户.xls");
    })
  }
  //导出需交租金客户
  OutputExcelXJZJKH = (target)=>{
    request('/api/web/customer/getCustomerHuankuan',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,租车类型(1:月租；2:日租；3:以租代购),租金,合同开始日期,合同结束日期,车牌号,品牌车型,下次交租金日期,交租金剩余天数';
      for (const i in data) {
        str += '\n' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].rent_type + ',' +
          data[i].rent_month_amount + ',' +
          data[i].contract_start_time + ',' +
          data[i].contract_end_time+ ',' +
          data[i].license_plate_no+ ',' +
          data[i].vehicle_template+ ',' +
          data[i].next_refund_time+ ',' +
          data[i].refund_remain_days
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "需交租金客户.xls");
    })
  }
  //导出未缴清客户
  OutputExcelWJQKH = (target)=>{
    request('/api/web/customer/getCustomerWeihuanqing',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,车牌号,品牌车型,租车类型(1:月租；2:日租；3:以租代购),已交租金金额,下次交租金日期,交租金剩余天数,备注';
      for (const i in data) {
        str += '\n' +
          data[i].customer_name + ',' +
          data[i].telephone + ',' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].rent_type + ',' +
          data[i].refunded_total + ',' +
          data[i].next_refund_time + ',' +
          data[i].refund_remain_days + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "未缴清客户.xls");
    })
  }
  //导出即将到期客户
  OutputExcelJJDQKH = (target)=>{
    request('/api/web/customer/getCustomerDaoqi',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,租车类型,租金,合同开始日期,合同结束日期,车牌号,品牌车型,合同剩余天数';
      for (const i in data) {
        str += '\n' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].rent_type + ',' +
          data[i].rent_month_amount + ',' +
          data[i].contract_start_time + ',' +
          data[i].contract_end_time+ ',' +
          data[i].license_plate_no+ ',' +
          data[i].vehicle_template+ ',' +
          data[i].contract_end_days
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "即将到期客户.xls");
    })
  }
  //导出需退押金客户
  OutputExcelXTYJKH = (target)=>{
    request('/api/web/customer/getCustomerTuiyajin',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,车牌号,押金,距离退车天数';
      for (const i in data) {
        str += '\n' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].license_plate_no + ',' +
          data[i].deposit_refund_amount + ',' +
          data[i].contract_end_days
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "需退押金客户.xls");
    })
  }
  //导出押金未退清客户
  OutputExcelYJWTQKH = (target)=>{
    request('/api/web/customer/getCustomerUnyajin',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,车牌号,品牌车型,押金,已退押金金额,退车剩余天数,备注';
      for (const i in data) {
        str += '\n' +
          data[i].customer_name + ',' +
          data[i].telephone + ',' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].deposit + ',' +
          data[i].deposit_refund_amount_total+ ',' +
          data[i].refund_remain_days+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "押金未退清客户.xls");
    })
  }
  //导出有交流客户
  OutputExcelYJLKH = (target)=>{
    request('/api/web/customer/getCustomerContact',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '客户姓名,手机号,交流次数';
      for (const i in data) {
        str += '\n' +
          data[i].name + ',' +
          data[i].telephone + ',' +
          data[i].contacts
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "有交流客户.xls");
    })
  }


  render() {
    const {total,yi_zu,huan_kuan,wei_huan_qing,dao_qi,tui_ya_jin,wei_tui_qing,contact,CustomerRecord,CustomerRecordLen} = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 24 },
      },
    };
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const SaleTopData = [
      {key:'total',title:'全部客户',value:total,bordered:true},
      {key:'yi_zu',title:'已租车客户',value:yi_zu,bordered:true},
      {key:'huan_kuan',title:'需交租金客户',value:huan_kuan,bordered:true},
      {key:'wei_huan_qing',title:'未缴清客户',value:wei_huan_qing,bordered:true},
      {key:'dao_qi',title:'即将到期客户',value:dao_qi,bordered:true},
      {key:'tui_ya_jin',title:'需退押金客户',value:tui_ya_jin,bordered:true},
      {key:'wei_tui_qing',title:'押金未退清客户',value:wei_tui_qing,bordered:true},
      {key:'contact',title:'有交流客户',value:contact,bordered:false},
    ];
    //全部客户列表记录
    const columns = [
      { title: '类型', dataIndex: 'type', key: 'type',
        render: (text,record) =>
          <div>
            {record.type==1 && <span>个人</span>}
            {record.type==2 && <span>公司</span>}
          </div>
      },
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '身份证号', dataIndex: 'id_number', key: 'id_number',},
      { title: '地址', dataIndex: 'home_address', key: 'home_address',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,20)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
      },
    ];
    //已租车列表记录
    const yzccolumns = [
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '租车类型', dataIndex: 'rent_type', key: 'rent_type',
        render: (text,record) =>
          <div>
            {record.rent_type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.rent_type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.rent_type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
        ,
      },
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '下次交租金日期', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,2)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
      },
    ];
    //需交租金列表记录
    const xjzjcolumns =  [
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '租车类型', dataIndex: 'rent_type', key: 'rent_type',
        render: (text,record) =>
          <div>
            {record.rent_type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.rent_type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.rent_type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
        ,
      },
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '下次交租金日期', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '交租金剩余天数', dataIndex: 'refund_remain_days', key: 'refund_remain_days',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,2)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
      },
    ];
    //未还清客户列表
    const CustomerWeihuanqingColumns = [
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '租车类型', dataIndex: 'rent_type', key: 'rent_type',
        render: (text,record) =>
          <div>
            {record.rent_type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.rent_type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.rent_type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
        ,
      },
      { title: '已交租金金额', dataIndex: 'refunded_total', key: 'refunded_total',},
      { title: '下次交租金日期', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '交租金剩余天数', dataIndex: 'refund_remain_days', key: 'refund_remain_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,3)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
      },
    ];
    //即将到期列表记录
    const jjdqcolumns =  [
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '租车类型', dataIndex: 'rent_type', key: 'rent_type',
        render: (text,record) =>
          <div>
            {record.rent_type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.rent_type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.rent_type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
        ,
      },
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '合同剩余天数', dataIndex: 'contract_end_days', key: 'contract_end_days',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,2)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
      },
    ];
    //需退押金列表记录
    const xtyjcolumns = [
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '押金', dataIndex: 'deposit_refund_amount', key: 'deposit_refund_amount',},
      { title: '距离退车天数', dataIndex: 'contract_end_days', key: 'contract_end_days',
        render: (text,record) =>
            <span>{record.contract_end_days}</span>
      },
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,2)} className={styles.TagBtn} color="green">查看</Tag>
          </div>
      },
    ];
    //押金未退清客户列表
    const CustomerUnyajinColumns = [
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '已退押金金额', dataIndex: 'deposit_refund_amount_total', key: 'deposit_refund_amount_total',},
      { title: '退车剩余天数', dataIndex: 'refund_remain_days', key: 'refund_remain_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,4)} className={styles.TagBtn} color="green"  >查看</Tag>
          </div>
      },
    ];
    //客户交流记录列表
    const CustomerContactColumns = [
      { title: '客户姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '交流次数', dataIndex: 'contacts', key: 'contacts',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCustomer.bind(this,record.id,10)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
      },
    ];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Customer" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={3} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button disabled={this.state.ButtonDisabled} onClick={this.AddCustomer} type="primary" className={styles.QuickButton} >新增客户</Button>
                      <Button disabled={this.state.ButtonDisabled} onClick={this.AddCustomerRecord} type="primary" className={styles.QuickButton} >新增客户交流记录</Button>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          {
                            this.state.chanceType!=1 &&
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                              <FormItem
                                className={styles.QuickFormItem}
                                {...formItemLayout}
                              >
                                <Select value={this.state.type} placeholder="选择类型" onChange={this.changeType}>
                                  <Option value={5}>选择类型</Option>
                                  <Option value={1}>月租</Option>
                                  <Option value={2}>日租</Option>
                                  <Option value={3}>以租代购</Option>
                                </Select>
                              </FormItem>
                          </Col>
                          }
                          {/*{*/}
                            {/*this.state.chanceDate==2 &&*/}
                            {/*<Col xl={6} lg={12} md={12} sm={24} xs={24}>*/}
                              {/*<RangePicker value={[moment(this.state.QuickerStartTime), moment(this.state.QuickerEndTime)]} onChange={this.RangeChange} className={styles.QuickFormItem}  name="date"/>*/}
                            {/*</Col>*/}
                          {/*}*/}
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Input style={{width:'80%'}} name="search" onChange={this.SearchInput} placeholder="输入关键字" defaultValue={this.state.search}/>
                          </Col>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Button onClick={this.SearchSubmit} type="primary">搜索</Button>
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                    </StandardFormRow>
                  </Card>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false} title={this.state.ListTitle}
                        extra={<Button type="primary" ghost onClick={this.OutputExcelSubmit}>导出</Button>}>
                    {
                      this.state.ListTitle=='全部客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={columns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='已租车客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={yzccolumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='需交租金客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={xjzjcolumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='未缴清客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={CustomerWeihuanqingColumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='即将到期客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={jjdqcolumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='需退押金客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={xtyjcolumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='押金未退清客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={CustomerUnyajinColumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='有交流客户' &&
                      <Table pagination={false}  loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={CustomerContactColumns} dataSource={CustomerRecord} footer={() => <p>总共 {CustomerRecordLen} 条数据</p>}/>
                    }
                    <Pagination style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.CustomerRecordLen} />
                  </Card>
                </div>
              </div>
            }/>
            <Route path="/Customer/ShowCustomer" component={ShowCustomer}/>
            <Route path="/Customer/AddCustomer" component={AddCustomer}/>
            <Route path="/Customer/AddCustomerRecord" component={AddCustomerRecord}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const Customer = Form.create()(customer);

export default Customer;
