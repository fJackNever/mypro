import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import FileSaver from 'file-saver';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select,Tag,Icon, Row, Col, Button,Table,Badge,AutoComplete,notification,message,Modal,Pagination,Breadcrumb,Popover} from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import request from "../../utils/request";

import ShowCar from './ShowCar/ShowCar';
import BackCar from './BackCar/BackCar';
import RefundCar from './RefundCar/RefundCar';
import ShowAccidentCarNotes from './ShowAccidentCarNotes/ShowAccidentCarNotes';
import NewAccidentCarNotes from './NewAccidentCarNotes/NewAccidentCarNotes';
import NewBorrowCarNotes from './NewBorrowCarNotes/NewBorrowCarNotes';
import NewCheckCarNotes from './NewCheckCarNotes/NewCheckCarNotes';
import NewExtensionCarNotes from './NewExtensionCarNotes/NewExtensionCarNotes';
import NewMaintainCarNotes from './NewMaintainCarNotes/NewMaintainCarNotes';
import NewPolicyCarNotes from './NewPolicyCarNotes/NewPolicyCarNotes';
import NewSurveryCarNotes from './NewSurveryCarNotes/NewSurveryCarNotes';
import NewKeepCarNotes from './NewKeepCarNotes/NewKeepCarNotes';
import NewSignCarNotes from './NewSignCarNotes/NewSignCarNotes';
import NewCarNotes from './NewCarNotes/NewCarNotes';
import ToMentionCar from './ToMentionCar/ToMentionCar';
import CarType from './CarType/CarType';
import NewCar from './NewCar/NewCar';
import CheckIllegal from './CheckIllegal/CheckIllegal';
import AddIllegal from './CheckIllegal/AddIllegal/AddIllegal';
import AddCheckllsgal from './AddCheckllsgal/AddCheckllsgal';

import styles from './../Sale/Sale.less';

const { Option } = Select;
const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class BasicList extends PureComponent {
  state = {
    RentRecordType:0,
    ListTitle:'全部车辆',
    carRecord:"",
    carType:0,
    search:'',
    chooseCarType:true,
    CarLoading:false,
    visible: false,
    confirmLoading: false,
    Refundvisible: false,
    RefundconfirmLoading: false,
    isNew:0,
    is_newShow:false,
    violatLoading:false,
    SearchCarType:'',
    pagecurrent:1,
    pageSize:10
  }
  componentWillReceiveProps (){
    if ("AbortController" in window) {window.controller = new AbortController();this.setState({signal: controller.signal,})}
    this.componentDidMount();
  }

  componentDidMount =() =>{
    if ("AbortController" in window) {window.controller = new AbortController();this.setState({signal: controller.signal,})}
    this.setState({ListTitle:'全部车辆',RentRecordType:0,})
    this.resetVehicleRedis();
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}
    this.setState({CarLoading:true})
    this.vehicleHostInter();
    if(window.location.href.split('is_new=')[1]==2){
      $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
      this.setState({isNew:1,is_newShow:true,})
    }
    if(window.location.href.split('CarType=')[1]){
      this.differenceParam(window.location.href.split('CarType=')[1]);
    }else{
      this.TotalCarInter(this.state.SearchCarType,'',this.state.pageSize,0);
    }
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  /*车辆管理刷新缓存*/
  resetVehicleRedis =()=>{
    let HostFormData = new FormData();
    HostFormData.append('key','diuber2017');
    HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/resetVehicleRedis',{
      method:'POST',
      body:HostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {}).catch(()=>{})
  }
  differenceParam = (target)=>{
    if(target==2){
      this.setState({ListTitle:'已租车辆'})
      this.HaveRentCarInter('',this.state.pageSize,0);
    }else if(target==3){
      this.setState({ListTitle:'待租车辆'})
      this.ForRentCarInter('',this.state.pageSize,0);;
    }else if(target==4){
      this.setState({ListTitle:'退出运营车辆'})
      this.BackRentCarInter('',this.state.pageSize,0);
    }else if(target==5){
      this.setState({ListTitle:'维修中车辆'})
      this.WxCarInter('',this.state.pageSize,0);
    }else if(target==6){
      this.setState({ListTitle:'待出库车辆'})
      this.DueCarInter('',this.state.pageSize,0);
    }else if(target==7){
      this.setState({ListTitle:'需续保车辆'})
      this.RenewalCarInter('',this.state.pageSize,0);
    }else if(target==1){
      this.setState({ListTitle:'全部车辆'})
      this.TotalCarInter('','',this.state.pageSize,0);
    }else if(target==8){
      this.setState({ListTitle:'需年检车辆'})
      this.ASCarInter('',this.state.pageSize,0);
    }else if(target==9){
      this.setState({ListTitle:'GPS离线车辆'})
      this.GPSCarInter('',this.state.pageSize,0);
    }else if(target==10){
      this.setState({ListTitle:'需保养车辆'})
      this.KeepCarInter('',this.state.pageSize,0);
    }else if(target==11){
      this.setState({ListTitle:'出险车辆'})
      this.OutCarInter('',this.state.pageSize,0);
    }else if(target==12){
      this.setState({ListTitle:'有违章车辆'})
      this.IllegalCarInter('',this.state.pageSize,0);
      this.getHandViolationInter('');
    }
  }
  vehicleHostInter = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/vehicle/vehicleHost',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          yizu:data.data.data.yizu,
          sign:data.data.data.sign,
          daizu:data.data.data.daizu,
          weixiu:data.data.data.weixiu,
          xubao:data.data.data.xubao,
          nianjian:data.data.data.nianjian,
          baoyang:data.data.data.baoyang,
          chuxian:data.data.data.chuxian,
          tuihuan:data.data.data.tuihuan,
          total:data.data.data.total,
          weizhang:data.data.data.violation,
          offline:data.data.data.offline,
          tiche:data.data.data.tiche,
        })

        let getCarType = new FormData();
        getCarType.append('key','diuber2017');
        getCarType.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        getCarType.append('limit',1000);
        request('/api/web/vehicle/getTemplate',{
          method:'POST',
          body:getCarType,
          credentials:'include',
          signal:this.state.signal,
        }).then((data)=> {
          var vehicleTemplateList  = data.data.data.rows.map((item)=>{
            return <Option key={item.id}>{item.brand+'-'+item.model}</Option>
          })
          this.setState({vehicleTemplateList })
        }).catch(()=>{})
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch((e)=>{})
  }
  //全部车辆数据接口
  TotalCarInter = (cartype,search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("template", cartype);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({ CarLoading:false})
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  //已租车辆数据接口
  HaveRentCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getvehicleyizu',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  //车辆待租数据接口
  ForRentCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleDaizu',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //已退还车辆列表数据接口
  BackRentCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleTuihuan',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //维修中车辆列表数据接口
  WxCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleWeixiu',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //待出库车辆列表数据接口
  DueCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('search',search);
    DeleteData.append('limit',limit);
    DeleteData.append('offset',offset);
    request('/api/web/vehicle/getVehicleTiche',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        })
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{

    })
  }
  //需续保车辆列表数据接口
  RenewalCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleXubao',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //需年检车辆列表数据接口
  ASCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleNianjian',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //GPS车辆列表数据接口
  GPSCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleGps',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //需保养车辆列表数据接口
  KeepCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleBaoyang',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //出险车辆列表数据接口
  OutCarInter = (search,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleChuxian',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //有手动违章车辆列表数据接口
  getHandViolationInter = (search) =>{
    this.setState({violatLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle_violation/getVehicleHandViolation',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({ violatLoading:false})
      if (data.data.code === 1) {
        this.setState({
          violatRecord:data.data.data.rows,
          violatRecordLen:data.data.data.rows.length,
          violatLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  IllegalCarInter = (search,limit,offset)=>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getVehicleWeizhang',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取签约记录列表数据接口
  getSignRecordInter = (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append('limit',limit);
    GFHFormData.append("search", search);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getSignRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:1,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取租车记录列表数据接口
  getRentRecordInter = (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:2,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取出险记录列表数据接口
  getAccidentRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:3,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取年检记录列表数据接口
  getSurveryRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getSurveryRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:4,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取退车记录列表数据接口
  getBackRecordInterInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getBackRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:5,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取延期记录列表数据接口
  getExtensionRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getExtensionRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:6,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取保单记录列表数据接口
  getPolicyRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getPolicyRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:7,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取保养记录列表数据接口
  getKeepRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getKeepRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({ CarLoading:false,})
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.info.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:8,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取维修记录列表数据接口
  getMaintainRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:9,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取验车记录列表数据接口
  getValidataRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("status", status);
    GFHFormData.append("search", search);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getValidataRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:10,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取违章记录列表数据接口
  getViolationRecordInter= (search,status,limit,offset) =>{
    this.setState({CarLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("status", status);
    GFHFormData.append('limit',limit);
    GFHFormData.append('offset',offset);
    request('/api/web/vehicle/getViolationRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.total,
          CarLoading:false,
          ListTitle:'全部车辆',
          RentRecordType:11,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //跳转新增车辆信息页面
  NewCar = () =>{
    this.props.history.push('/Car/CarManager/NewCar');
  }
  //跳转新增租车记录页面
  NewCarNotes = () =>{
    this.props.history.push('/Car/CarManager/NewCarNotes');
  }
  //跳转到借车记录
  BorrorCarNotes= () =>{
    this.props.history.push('/Car/CarManager/NewBorrowCarNotes');
  }
  //跳转待提车辆记录页面
  ToMentionCar = ()=>{
    this.props.history.push('/Car/CarManager/ToMentionCar');
  }
  //跳转新增签约页面
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      RentRecordType:0,
      selectCarRecord:'',
      CarLoading:true,
      carState:'',
      carType:'',
      search:'',
      pagecurrent:1,
    })
    if(e==="已租车辆"){
      this.HaveRentCarInter('',this.state.pageSize,0);
    }else if(e==='待租车辆'){
      this.ForRentCarInter('',this.state.pageSize,0);
    }else if(e==='退出运营车辆'){
      this.BackRentCarInter('',this.state.pageSize,0);
    }else if(e==='维修中车辆'){
      this.WxCarInter('',this.state.pageSize,0);
    }else if(e==='待出库车辆'){
      this.DueCarInter('',this.state.pageSize,0);
    }else if(e==='需续保车辆'){
      this.RenewalCarInter('',this.state.pageSize,0);
    }else if(e==='全部车辆'){
      this.TotalCarInter('','',this.state.pageSize,0);
    }else if(e==='需年检车辆'){
      this.ASCarInter('',this.state.pageSize,0);
    }else if(e==='GPS离线车辆'){
      this.GPSCarInter('',this.state.pageSize,0);
    }else if(e==='需保养车辆'){
      this.KeepCarInter('',this.state.pageSize,0);
    }else if(e==='出险车辆'){
      this.OutCarInter('',this.state.pageSize,0);
    }else if(e==='有违章车辆'){
      this.IllegalCarInter('',this.state.pageSize,0);
      this.getHandViolationInter('');
    }
  }
  //还车某辆车
  DeleteListItem = (e) =>{
    this.props.history.push('/Car/CarManager/BackCar?Car_id='+e);
  };
  //退车某辆车
  BackListItem = (carId,customerId)=>{
    this.setState({CarLoading:true})
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('vehicle_id',carId);
    DeleteData.append('customer_id',customerId);
    request('/api/web/vehicle/tuiche',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      this.setState({CarLoading:false})
      if(data.data.code==1){
        message.success('退车成功！')
        this.vehicleHostInter();
        this.HaveRentCarInter('',this.state.pageSize,0);
        this.setState({
          ListTitle:'已租车辆'
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        this.props.history.push('/Car/CarManager/BackCar?Car_id='+e);
      }
    }).catch((e)=>{
    })
  }
  //查看退押金某条列表记录
  ShowDepositListItem = (car_id,type) =>{
    this.setState({search:''})
    this.props.history.push('/Car/CarManager/ShowCar?type='+type+'&Car_id='+car_id)
  };
  //快捷查询
  SearchSubmit =()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          search:$("input[name='search']").val(),
        })
        if(this.state.ListTitle==="已租车辆"){
          this.HaveRentCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='待租车辆'){
          this.ForRentCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='退出运营车辆'){
          this.BackRentCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='维修中车辆'){
          this.WxCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='待出库车辆'){
          this.DueCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='需续保车辆'){
          this.RenewalCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='全部车辆'){
          if(values.carType){
            switch(this.state.selectCarRecord){
              case '1':
                this.getSignRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '2':
                this.getRentRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '3':
                this.getAccidentRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '4':
                this.getSurveryRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '5':
                this.getBackRecordInterInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '6':
                this.getExtensionRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '7':
                this.getPolicyRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '8':
                this.getKeepRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '9':
                this.getMaintainRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '10':
                this.getValidataRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '11':
                this.getViolationRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              default:
                this.TotalCarInter(values.carType,$("input[name='search']").val(),this.state.pageSize,0);
                break;
            }
          }else{
            switch(this.state.selectCarRecord){
              case '1':
                this.getSignRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '2':
                this.getRentRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '3':
                this.getAccidentRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '4':
                this.getSurveryRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '5':
                this.getBackRecordInterInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '6':
                this.getExtensionRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '7':
                this.getPolicyRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '8':
                this.getKeepRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '9':
                this.getMaintainRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '10':
                this.getValidataRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              case '11':
                this.getViolationRecordInter($("input[name='search']").val(),this.state.carState,this.state.pageSize,0);
                break;
              default:
                this.TotalCarInter('',$("input[name='search']").val(),this.state.pageSize,0);
                break;
            }
          }
        }else if(this.state.ListTitle==='需年检车辆'){
          this.ASCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='GPS离线车辆'){
          this.GPSCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='需保养车辆'){
          this.KeepCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='出险车辆'){
          this.OutCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }else if(this.state.ListTitle==='有违章车辆'){
          this.IllegalCarInter($("input[name='search']").val(),this.state.pageSize,0);
        }
      }
    })
  }
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
    }else{
    }
  }
  chooseCarRecord = (value) =>{
    if(value){
      this.setState({
        selectCarRecord:value,
        chooseCarType:false,
        carState:'',
        carState:'1',
        search:'',
        CarLoading:true,
        pagecurrent:1,
      })
      var carRecordListData = [];
      switch(value){
        case '1':
          carRecordListData = [{id:0,name:'未签'},{id:1,name:'已签'},{id:2,name:'作废'},];
          this.getSignRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '2':
          carRecordListData = [{id:0,name:'已退车'},{id:1,name:'正常租车'},];
          this.getRentRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '3':
          carRecordListData = [{id:0,name:'处理中'},{id:1,name:'已完成'}];
          this.getAccidentRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '4':
          carRecordListData = [{id:1,name:'已完成'}];
          this.getSurveryRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '5':
          carRecordListData = [{id:0,name:'未退'},{id:1,name:'已退'}];
          this.getBackRecordInterInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '6':
          carRecordListData =  [{id:1,name:'已完成'}];
          this.getExtensionRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '7':
          carRecordListData =  [{id:1,name:'已完成'}];
          this.getPolicyRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '8':
          carRecordListData =  [{id:1,name:'已完成'}];
          this.getKeepRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '9':
          carRecordListData = [{id:0,name:'修理中'},{id:1,name:'已修好'}];
          this.getMaintainRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '10':
          carRecordListData = [{id:1,name:'已完成'}];
          this.getValidataRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
        case '11':
          carRecordListData = [{id:0,name:'未处理'},{id:1,name:'已处理'}];
          this.getViolationRecordInter(this.state.search,1,this.state.pageSize,0);
          break;
      }
      var carRecordList = carRecordListData.map((item)=>{
        return <Option key={item.id}>{item.name}</Option>
      })
      this.setState({carRecordList})
    }else{
      this.TotalCarInter('','',this.state.pageSize,0);
      this.setState({
        chooseCarType:true,
        selectCarRecord:'',
        RentRecordType:0,
      })
    }
  }
  changeCarType= (value) =>{
    this.setState({
      SearchCarType:value,
      search:''
    })
    if(value=='0'){
      this.TotalCarInter('','',this.state.pageSize,0);
    }else{
      this.TotalCarInter(value,'',this.state.pageSize,0);
    }
  }
  changeCarRecord = (value)=>{
    this.setState({
      CarLoading:true,
      carState:value,
      pagecurrent:1,
    })
    switch(this.state.selectCarRecord){
      case '1':
        this.getSignRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '2':
        this.getRentRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '3':
        this.getAccidentRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '4':
        this.getSurveryRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '5':
        this.getBackRecordInterInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '6':
        this.getExtensionRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '7':
        this.getPolicyRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '8':
        this.getKeepRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '9':
        this.getMaintainRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '10':
        this.getValidataRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
      case '11':
        this.getViolationRecordInter(this.state.search,value,this.state.pageSize,0);
        break;
    }
  }

  //还车
  showBackModal= () => {
    this.props.history.push('/Car/CarManager/BackCar');
  }
  //退车\
  showRefundLink= () => {
    this.props.history.push('/Car/CarManager/RefundCar');
  }
  //维修
  wxCarNotes = ()=>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes');
  }
  //出险
  cxCarNotes = ()=>{
    this.props.history.push('/Car/CarManager/NewAccidentCarNotes');
  }
  //年检
  njCarNotes= ()=>{
    this.props.history.push('/Car/CarManager/NewSurveryCarNotes');
  }
  //保单
  bdCarNotes = ()=>{
    this.props.history.push('/Car/CarManager/NewPolicyCarNotes');
  }
  //保养
  byCarNotes = ()=>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes');
  }
  //验车
  showCheckLink = () => {
    this.props.history.push('/Car/CarManager/NewCheckCarNotes');
  }
  showRefundModal= (carid,rentid) => {
    this.props.history.push('/Car/CarManager/RefundCar?Car_id='+carid+'&rent_id='+rentid);
  }
  //重新租借
  reRentVehicleSubmit = (target)=>{
    this.setState({CarLoading:true})
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('vehicle_id',target);
    request('/api/web/vehicle/reRentVehicle',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      this.setState({CarLoading:false})
      if(data.data.code==1){
        message.success('成功重新租借！')
        this.vehicleHostInter();
        this.BackRentCarInter('');
        this.setState({
          ListTitle:'退出运营车辆',
        })
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }

  //进行完新手教程
  IsNewLink = ()=>{
    $("#Showed").remove();
    this.setState({
      is_newShow:false,
      isNew:0,
    })
    let NewFormData = new FormData();
    NewFormData.append('key','diuber2017');
    NewFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/newCom',{
      method:'POST',
      body:NewFormData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        let UpdateFormData = new FormData();
        UpdateFormData.append('key','diuber2017');
        UpdateFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        UpdateFormData.append('id',data.data.data.code);
        request('/api/web/admin_setting/iknow',{
          method:'POST',
          body:UpdateFormData,
          credentials:'include',
          signal:this.state.signal,
        }).then((res)=>{
          if(res.data.code==1){
          }
          if(data.data.code==90001){
            this.props.history.push('/user/login')
          }
        }).catch(()=>{})
      }
    }).catch(()=>{})
  }
  backWrokplace = ()=>{
    $("#Showed").remove();
    let NewFormData = new FormData();
    NewFormData.append('key','diuber2017');
    NewFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/newCom',{
      method:'POST',
      body:NewFormData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        let UpdateFormData = new FormData();
        UpdateFormData.append('key','diuber2017');
        UpdateFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        UpdateFormData.append('id',data.data.data.code);
        request('/api/web/admin_setting/iknow',{
          method:'POST',
          body:UpdateFormData,
          credentials:'include',
          signal:this.state.signal,
        }).then((res)=>{
          if(res.data.code==1){
          }
          if(data.data.code==90001){
            this.props.history.push('/user/login')
          }
        }).catch(()=>{})
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
    this.props.history.push('/workbench/workplace');
  }
  //手动添加违章
  AddIllegalLink = ()=>{
    this.props.history.push('/Car/CarManager/AddIllegal');
  }

  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    if(this.state.ListTitle==="已租车辆"){
      this.HaveRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='待租车辆'){
      this.ForRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='退出运营车辆'){
      this.BackRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='维修中车辆'){
      this.WxCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='待出库车辆'){
      this.DueCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='需续保车辆'){
      this.RenewalCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='全部车辆'){
      switch(this.state.selectCarRecord){
        case '1':
          this.getSignRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '2':
          this.getRentRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '3':
          this.getAccidentRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '4':
          this.getSurveryRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '5':
          this.getBackRecordInterInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '6':
          this.getExtensionRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '7':
          this.getPolicyRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '8':
          this.getKeepRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '9':
          this.getMaintainRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '10':
          this.getValidataRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '11':
          this.getViolationRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        default:
          this.TotalCarInter(this.state.SearchCarType,this.state.search,pageSize,(current-1)*pageSize);
          break;
      }
    }else if(this.state.ListTitle==='需年检车辆'){
      this.ASCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='GPS离线车辆'){
      this.GPSCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='需保养车辆'){
      this.KeepCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='出险车辆'){
      this.OutCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='有违章车辆'){
      this.IllegalCarInter('',pageSize,(current-1)*pageSize);
      this.getHandViolationInter('');
    }
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    if(this.state.ListTitle==="已租车辆"){
      this.HaveRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='待租车辆'){
      this.ForRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='退出运营车辆'){
      this.BackRentCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='维修中车辆'){
      this.WxCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='待出库车辆'){
      this.DueCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='需续保车辆'){
      this.RenewalCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='全部车辆'){
      switch(this.state.selectCarRecord){
        case '1':
          this.getSignRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '2':
          this.getRentRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '3':
          this.getAccidentRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '4':
          this.getSurveryRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '5':
          this.getBackRecordInterInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '6':
          this.getExtensionRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '7':
          this.getPolicyRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '8':
          this.getKeepRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '9':
          this.getMaintainRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '10':
          this.getValidataRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        case '11':
          this.getViolationRecordInter(this.state.search,this.state.carState,pageSize,(current-1)*pageSize);
          break;
        default:
          this.TotalCarInter(this.state.SearchCarType,this.state.search,pageSize,(current-1)*pageSize);
          break;
      }

    }else if(this.state.ListTitle==='需年检车辆'){
      this.ASCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='GPS离线车辆'){
      this.GPSCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='需保养车辆'){
      this.KeepCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='出险车辆'){
      this.OutCarInter('',pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle==='有违章车辆'){
      this.IllegalCarInter('',pageSize,(current-1)*pageSize);
      this.getHandViolationInter('');
    }
  }



  //导出
  OutputExcelSubmit = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", this.state.search);
    GFHFormData.append('limit',99999);
    if(this.state.ListTitle=='需续保车辆') {
      this.OutputExcelXubao(GFHFormData);
    }else if(this.state.ListTitle=='全部车辆'){
      this.OutputExcelAllCar(GFHFormData);
    }else if(this.state.ListTitle=='待租车辆'){
      this.OutputExcelDaizu(GFHFormData);
    }else if(this.state.ListTitle=='已租车辆'){
      this.OutputExcelYizu(GFHFormData);
    }else if(this.state.ListTitle=='退出运营车辆'){
      this.OutputExcelTuihuan(GFHFormData);
    }else if(this.state.ListTitle=='维修中车辆'){
      this.OutputExcelWeixiu(GFHFormData);
    }else if(this.state.ListTitle=='待出库车辆'){
      this.OutputExcelTiche(GFHFormData);
    }else if(this.state.ListTitle=='需年检车辆'){
      this.OutputExcelNianjian(GFHFormData);
    }else if(this.state.ListTitle=='GPS离线车辆'){
      this.OutputExcelGPS(GFHFormData);
    }else if(this.state.ListTitle=='需保养车辆'){
      this.OutputExcelBaoyang(GFHFormData);
    }else if(this.state.ListTitle=='出险车辆'){
      this.OutputExcelChuxian(GFHFormData);
    }
  }
  //导出需续保
  OutputExcelXubao = (target)=>{
    request('/api/web/vehicle/getVehicleXubao',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,交强险到期日期,商业险到期日期,交强险剩余天数,商业险剩余天数';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].insurance_policy_end_time + ',' +
          data[i].commercial_insurance_policy_end_time + ',' +
          data[i].insurance_policy_remaining_days + ',' +
          data[i].commercial_insurance_policy_remaining_days
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "需续保车辆.xls");
    })
  }
  //导出全部车辆
  OutputExcelAllCar = (target)=>{
    request('/api/web/vehicle/getVehicle',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,实际车主,车身颜色,车架号,发动机号,负责车管,负责驾管,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].actual_owner + ',' +
          data[i].body_color + ',' +
          data[i].frame_number + ',' +
          data[i].engine_number+ ',' +
          data[i].responsible_vehicle_admin+ ',' +
          data[i].responsible_drive_admin+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "全部车辆.xls");
    })
  }
  //导出待租车辆
  OutputExcelDaizu = (target)=>{
    request('/api/web/vehicle/getVehicleDaizu',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,当前公里数,空置天数,注册时间,车架号';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].travel_range + ',' +
          data[i].vacant_days + ',' +
          data[i].create_time + ',' +
          data[i].frame_number
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "待租车辆.xls");
    })
  }
  //导出已租车辆
  OutputExcelYizu = (target)=>{
    request('/api/web/vehicle/getvehicleyizu',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,实际车主,承租人,手机号,租车类型(1:月租；2:日租；3:以租代购)';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].actual_owner + ',' +
          data[i].customer_name + ',' +
          data[i].telephone + ',' +
          data[i].type
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "已租车辆.xls");
    })
  }
  //导出退出运营车辆
  OutputExcelTuihuan = (target)=>{
    request('/api/web/vehicle/getVehicleTuihuan',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,实际车主,车身颜色,车架号,发动机号,负责车管,负责驾管,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].actual_owner + ',' +
          data[i].body_color + ',' +
          data[i].frame_number + ',' +
          data[i].engine_number+ ',' +
          data[i].responsible_vehicle_admin+ ',' +
          data[i].responsible_drive_admin+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "退出运营车辆.xls");
    })
  }
  //导出维修中车辆
  OutputExcelWeixiu = (target)=>{
    request('/api/web/vehicle/getVehicleWeixiu',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,进厂时间,维修内容,修理厂,状态(1:已修好；0:维修中),备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].maintain_time + ',' +
          data[i].content + ',' +
          data[i].partner_name + ',' +
          data[i].maintain_status + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "维修中车辆.xls");
    })
  }
  //导出待出库车辆
  OutputExcelTiche = (target)=>{
    request('/api/web/vehicle/getVehicleTiche',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,实际车主,车身颜色,车架号,发动机号,负责车管,负责驾管,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].actual_owner + ',' +
          data[i].body_color + ',' +
          data[i].frame_number+ ',' +
          data[i].engine_number+ ',' +
          data[i].responsible_vehicle_admin+ ',' +
          data[i].responsible_drive_admin+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "待出库车辆.xls");
    })
  }
  //导出需年检车辆
  OutputExcelNianjian = (target)=>{
    request('/api/web/vehicle/getVehicleNianjian',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,年检到期日期,年检剩余天数';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].next_annual_survery_time + ',' +
          data[i].remaining_days
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "需年检车辆.xls");
    })
  }
  //导出GPS离线车辆
  OutputExcelGPS = (target)=>{
    request('/api/web/vehicle/getVehicleGps',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,实际车主,车身颜色,车架号,发动机号,负责车管,负责驾管,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].actual_owner + ',' +
          data[i].body_color + ',' +
          data[i].frame_number + ',' +
          data[i].engine_number + ',' +
          data[i].responsible_vehicle_admin + ',' +
          data[i].responsible_drive_admin + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "GPS离线车辆.xls");
    })
  }
  //导出需保养车辆
  OutputExcelBaoyang = (target)=>{
    request('/api/web/vehicle/getVehicleBaoyang',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,品牌车型,所属公司,修理厂名称,修理金额,进厂公里数,下次保养公里数,下次保养剩余日期,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].vehicle_template + ',' +
          data[i].belong_company + ',' +
          data[i].factory_name + ',' +
          data[i].amount + ',' +
          data[i].last_vkt + ',' +
          data[i].next_keep_rent_vkt + ',' +
          data[i].next_keep_rent_days + ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "需保养车辆.xls");
    })
  }
  //导出出险车辆
  OutputExcelChuxian = (target)=>{
    request('/api/web/vehicle/getVehicleChuxian',{
      method:'POST',
      body:target,
      credentials: 'include',
    }).then((data)=> {
      console.log(data.data.data.rows);
      var data = data.data.data.rows;
      let str = '车牌号,客户姓名,出险时间,详细描述,修理厂,进厂时间,修理内容,修理状态,出厂时间,责任方,备注';
      for (const i in data) {
        str += '\n' +
          data[i].license_plate_no + ',' +
          data[i].customer_name + ',' +
          data[i].accident_time + ',' +
          data[i].detail_record + ',' +
          data[i].partner_name + ',' +
          data[i].in_maintain_time + ',' +
          data[i].maintian_content + ',' +
          data[i].maintian_status + ',' +
          data[i].miantain_finsih_time + ',' +
          data[i].responsible_party+ ',' +
          data[i].comment
      }
      let exportContent = "\uFEFF";
      let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "出险车辆.xls");
    })
  }


  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 24 },
      },
    };
    const formItemLayout2 = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const SaleTopData = [
      {id:'SaleTopData01',title:'全部车辆',value:this.state.total,bordered:true},
      {id:'SaleTopData02',title:'已租车辆',value:this.state.yizu,bordered:true},
      {id:'SaleTopData03',title:'待租车辆',value:this.state.daizu,bordered:true},
      {id:'SaleTopData04',title:'退出运营车辆',value:this.state.tuihuan,bordered:true},
      {id:'SaleTopData05',title:'维修中车辆',value:this.state.weixiu,bordered:true},
      {id:'SaleTopData06',title:'待出库车辆',value:this.state.tiche,bordered:false},
    ];
    const  SaleTopData02= [
      {id:'SaleTopData07',title:'需续保车辆',value:this.state.xubao,bordered:true},
      {id:'SaleTopData08',title:'需年检车辆',value:this.state.nianjian,bordered:true},
      {id:'SaleTopData05',title:'GPS离线车辆',value:this.state.offline,bordered:true},
      {id:'SaleTopData06',title:'需保养车辆',value:this.state.baoyang,bordered:true},
      {id:'SaleTopData07',title:'出险车辆',value:this.state.chuxian,bordered:true},
      {id:'SaleTopData08',title:'有违章车辆',value:this.state.weizhang,bordered:false},
    ];

    const columns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',  },
      { title: '车身颜色', dataIndex: 'body_color', key: 'body_color',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',},
      { title: '发动机号', dataIndex: 'engine_number', key: 'engine_number',},
      { title: '负责车管', dataIndex: 'responsible_vehicle_admin', key: 'responsible_vehicle_admin',},
      { title: '负责驾管', dataIndex: 'responsible_drive_admin', key: 'responsible_drive_admin',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginRight:'10px'}} >查看</Tag>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >退出运营</Tag>:
              <span>{
                record.belong_company && <Tag onClick={this.DeleteListItem.bind(this,record.id)} className={styles.TagBtn} color="magenta">退出运营</Tag>
              }</span>
            }
          </div>
        ,
      },
    ];
    const HaveRentCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',
        render: (text,record) =>
          <div>
            {record.belong_company &&
            <span>{record.belong_company}</span>
            }
            {!record.belong_company &&
            <span> - </span>
            }
          </div>
      },
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',  },
      { title: '承租人', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '租车类型', dataIndex: 'type', key: 'type',
        render: (text,record) =>
          <div>
            {record.type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
        ,},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled ? <Tag className={styles.TagBtn}>退车</Tag> :
                <Tag  onClick={this.showRefundModal.bind(this,record.id,record.vehicle_rent_record_id)} className={styles.TagBtn} color="magenta">退车</Tag>
            }
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,3)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const ForRentCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',
        render: (text,record) =>
          <div>
            {record.belong_company &&
            <span>{record.belong_company}</span>
            }
            {!record.belong_company &&
            <span> - </span>
            }
          </div>},
      { title: '当前公里数', dataIndex: 'travel_range', key: 'travel_range',},
      { title: '空置天数', dataIndex: 'vacant_days', key: 'vacant_days',},
      { title: '注册时间', dataIndex: 'create_time', key: 'create_time',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',
        render: (text,record) =>
          <div>
            {record.frame_number &&
            <span>{record.frame_number}</span>
            }
            {!record.frame_number &&
            <span> - </span>
            }
          </div>},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,0)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
        ,
      },
    ];
    const BackRentCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',
      },
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',  },
      { title: '车身颜色', dataIndex: 'body_color', key: 'body_color',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',},
      { title: '发动机号', dataIndex: 'engine_number', key: 'engine_number',},
      { title: '负责车管', dataIndex: 'responsible_vehicle_admin', key: 'responsible_vehicle_admin',},
      { title: '负责驾管', dataIndex: 'responsible_drive_admin', key: 'responsible_drive_admin',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn}>重新租借</Tag>:
            <Tag onClick={this.reRentVehicleSubmit.bind(this,record.id)} className={styles.TagBtn} color="gold" >重新租借</Tag>}
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,9)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const MaintenanceCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '进厂时间', dataIndex: 'maintain_time', key: 'maintain_time',  },
      { title: '维修内容', dataIndex: 'content', key: 'content',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '状态', dataIndex: 'maintain_status', key: 'maintain_status',
        render:(text,record) =>
          <div>
            <Badge status="processing" text={<span style={{color:'#1890FF'}}>维修中</span>}/>
          </div>

      },
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,11)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
        ,
      },
    ];
    const DueCar = [
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型',  dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',},
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',},
      { title: '车身颜色', dataIndex: 'body_color', key: 'body_color',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',},
      { title: '发动机号', dataIndex: 'engine_number', key: 'engine_number',},
      { title: '负责车管', dataIndex: 'responsible_vehicle_admin', key: 'responsible_vehicle_admin',},
      { title: '负责驾管', dataIndex: 'responsible_drive_admin', key: 'responsible_drive_admin',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            {
              record.record_type=='maintain' &&
              <Tag onClick={this.ShowDepositListItem.bind(this,record.id,11)} className={styles.TagBtn} color="green">查看</Tag>
            }
            {
              record.record_type=='keep' &&
              <Tag onClick={this.ShowDepositListItem.bind(this,record.id,12)} className={styles.TagBtn} color="green">查看</Tag>
            }
            {
              record.record_type=='accident' &&
              <Tag onClick={this.ShowDepositListItem.bind(this,record.id,13)} className={styles.TagBtn} color="green">查看</Tag>
            }
          </div>
        ,
      },
    ];
    const RenewalCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '交强险到期日期', dataIndex: 'insurance_policy_end_time', key: 'insurance_policy_end_time',  },
      { title: '商业险到期日期', dataIndex: 'commercial_insurance_policy_end_time', key: 'commercial_insurance_policy_end_time',},
      { title: '交强险剩余天数', dataIndex: 'insurance_policy_remaining_days', key: 'insurance_policy_remaining_days',
        render: (text,record) =>
          <div>
            {record.insurance_policy_remaining_days>0 && <span>剩余{record.insurance_policy_remaining_days}天</span>}
            {record.insurance_policy_remaining_days==0 && <span>-</span>}
            {record.insurance_policy_remaining_days<=0 && <span style={{color:'#f50'}}>已逾期 {Math.abs(record.insurance_policy_remaining_days)} 天</span>}
          </div>},
      { title: '商业险剩余天数', dataIndex: 'commercial_insurance_policy_remaining_days', key: 'commercial_insurance_policy_remaining_days',
        render: (text,record) =>
          <div>
            {record.commercial_insurance_policy_remaining_days>0 && <span>剩余{record.commercial_insurance_policy_remaining_days}天</span>}
            {record.commercial_insurance_policy_remaining_days==0 && <span>-</span>}
            {record.commercial_insurance_policy_remaining_days<=0 && <span style={{color:'#f50'}}>已逾期 {Math.abs(record.commercial_insurance_policy_remaining_days)} 天</span>}
          </div>},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,15)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const ASCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '年检到期日期', dataIndex: 'next_annual_survery_time', key: 'next_annual_survery_time',  },
      { title: '年检剩余天数', dataIndex: 'remaining_days', key: 'remaining_days',
        render: (text,record) =>
          <div>
            {record.remaining_days>0 && <span>剩余{record.remaining_days}天</span>}
            {record.remaining_days==0 && <span>-</span>}
            {record.remaining_days<=0 && <span style={{color:'#f50'}}>已逾期 {Math.abs(record.remaining_days)} 天</span>}
          </div>},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,14)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const GPSCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',  },
      { title: '车身颜色', dataIndex: 'body_color', key: 'body_color',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',},
      { title: '发动机号', dataIndex: 'engine_number', key: 'engine_number',},
      { title: '负责车管', dataIndex: 'responsible_vehicle_admin', key: 'responsible_vehicle_admin',},
      { title: '负责驾管', dataIndex: 'responsible_drive_admin', key: 'responsible_drive_admin',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',

        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const KeepCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '修理厂名称', dataIndex: 'factory_name', key: 'factory_name',  },
      { title: '修理金额', dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数', dataIndex: 'last_vkt', key: 'last_vkt',},
      { title: '下次保养公里数', dataIndex: 'next_keep_rent_vkt', key: 'next_keep_rent_vkt',},
      { title: '下次保养剩余日期', dataIndex: 'next_keep_rent_days', key: 'next_keep_rent_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,12)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
        ,
      },
    ];
    const OutCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '出险时间', dataIndex: 'accident_time', key: 'accident_time',  },
      { title: '详细描述', dataIndex: 'detail_record', key: 'detail_record',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '进厂时间', dataIndex: 'in_maintain_time', key: 'in_maintain_time',},
      { title: '修理内容', dataIndex: 'maintian_content', key: 'maintian_content',},
      { title: '修理状态', dataIndex: 'maintian_status', key: 'maintian_status',
        render:(text,record) =>
          <div>
            {record.maintian_status==0 && <Badge status="processing" text={<span style={{color:'#1890FF'}}>维修中</span>}/>}
            {record.maintian_status==1 && <Badge status="success" text="已修好"/>}
          </div>
      },
      { title: '出厂时间', dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
      { title: '责任方', dataIndex: 'responsible_party', key: 'responsible_party',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id,13)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
        ,
      },
    ];
    const IllegalCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '违章金额', dataIndex: 'prices', key: 'prices',},
      { title: '违章扣分', dataIndex: 'scores', key: 'scores',},
      { title: '违章次数', dataIndex: 'count', key: 'count',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id,16)} className={styles.TagBtn} color="green" >查看</Tag>
          </div>
        ,
      },
    ];
    const Signcolumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '签约日期', dataIndex: 'sign_date', key: 'sign_date',},
      { title: '签约状态', dataIndex: 'sign_status', key: 'sign_status',
        render: (text,record) =>
          <div>
            {record.sign_status==0 &&
            <span>未签</span>
            }
            {record.sign_status==1 &&
            <span>已签</span>
            }
            {record.sign_status==2 &&
            <span>作废</span>
            }
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Rentcolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '下次交租金日期', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '租车状态', dataIndex: 'rent_vehicle_status', key: 'rent_vehicle_status',
        render: (text,record) =>
          <div>
            {record.rent_vehicle_status==0 &&
            <span>已退车</span>
            }
            {record.rent_vehicle_status==1 &&
            <span>正常租车</span>
            }
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Accidentcolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '出险时间', dataIndex: 'accident_time', key: 'accident_time',},
      { title: '责任方', dataIndex: 'responsible_party', key: 'responsible_party',},
      { title: '理赔状态', dataIndex: 'settlement_claims_status', key: 'settlement_claims_status',
        render: (text,record) =>
          <div>
            {record.settlement_claims_status==1 &&
            <span>已完成</span>
            }
            {record.settlement_claims_status==0 &&
            <span>处理中</span>
            }
          </div>
      },
      { title: '己方金额', dataIndex: 'own_amount', key: 'own_amount',},
      { title: '第三方金额', dataIndex: 'thirdparty_amount', key: 'thirdparty_amount',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '出厂时间', dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
      { title: '详细描述', dataIndex: 'detail_record', key: 'detail_record',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Surverycolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '年检日期', dataIndex: 'annual_survey_time', key: 'annual_survey_time',},
      { title: '年检处理人', dataIndex: 'annual_survey_manager', key: 'annual_survey_manager',},
      { title: '金额', dataIndex: 'amount', key: 'amount',},
      { title: '下次年检日期', dataIndex: 'next_annual_survery_time', key: 'next_annual_survery_time',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const BackRecordcolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '品牌车型', dataIndex: 'template', key: 'template',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '退车日期', dataIndex: 'back_time', key: 'back_time',},
      { title: '退车状态', dataIndex: 'back_status', key: 'back_status',
        render: (text,record) =>
          <div>
            {record.back_status==0 &&
            <span>未退</span>
            }
            {record.back_status==1 &&
            <span>已退</span>
            }
          </div>
      },
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Extensioncolumns= [
      { title: '操作时间', dataIndex: 'create_time', key: 'create_time',},
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '延期天数', dataIndex: 'extension_days', key: 'extension_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Policycolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '交强险开始日期', dataIndex: 'insurance_policy_start_time', key: 'insurance_policy_start_time',},
      { title: '交强险结束日期', dataIndex: 'insurance_policy_end_time', key: 'insurance_policy_end_time',},
      { title: '商业险开始日期', dataIndex: 'commercial_insurance_policy_start_time', key: 'commercial_insurance_policy_start_time',},
      { title: '商业险结束日期', dataIndex: 'commercial_insurance_policy_end_time', key: 'commercial_insurance_policy_end_time',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Keepcolumns= [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '金额', dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数', dataIndex: 'last_vkt', key: 'last_vkt',},
      { title: '进厂时间', dataIndex: 'this_keep_time', key: 'this_keep_time',},
      { title: '下次保养公里数', dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const Maintaincolumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '进厂时间', dataIndex: 'maintain_time', key: 'maintain_time',},
      { title: '维修总金额', dataIndex: 'total_amount', key: 'total_amount',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '维修状态', dataIndex: 'maintain_status', key: 'maintain_status',
        render: (text,record) =>
          <div>
            {record.maintain_status==0 &&
            <Badge status="processing" text={<span style={{color:'#1890FF'}}>维修中</span>}/>
            }
            {record.maintain_status==1 &&
            <Badge status="success" text="已修好"/>
            }
          </div>
      },
      { title: '出厂时间', dataIndex: 'maintain_finish_time', key: 'maintain_finish_time',},
      { title: '维修天数', dataIndex: 'use_days', key: 'use_days',},
      { title: '延期天数', dataIndex: 'extension_days', key: 'extension_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',width: 200,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },];
    const checkColumn = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '保单复印件', dataIndex: 'is_insurance', key: 'is_insurance',
        render: (text,record) =>
          <div>
            {record.is_insurance==1 && <span>有</span>}
            {record.is_insurance==0 && <span style={{color:'#f50'}}>无</span>}
          </div>
      },
      { title: '行驶证', dataIndex: 'is_travel', key: 'is_travel',
        render: (text,record) =>
          <div>
            {record.is_travel==1 && <span>有</span>}
            {record.is_travel==0 && <span style={{color:'#f50'}}>无</span>}
          </div>
      },
      { title: '营运证', dataIndex: 'is_operate', key: 'is_operate',
        render: (text,record) =>
          <div>
            {record.is_operate==1 && <span>有</span>}
            {record.is_operate==0 && <span style={{color:'#f00'}}>无</span>}
          </div>
      },
      { title: '公里数', dataIndex: 'even_number', key: 'even_number',},
      { title: '验车状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==1 && <span>无车损</span>}
            {record.status==0 && <span style={{color:'#f00'}}>有车损</span>}
          </div>
      },
      { title: '完成时间', dataIndex: 'validata_time', key: 'validata_time',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const Violationcolumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '违章时间', dataIndex: 'violation_time', key: 'violation_time',},
      { title: '违章地点', dataIndex: 'violation_address', key: 'violation_address',  },
      { title: '详细内容', dataIndex: 'content', key: 'content', width: 200,},
      { title: '违章金额', dataIndex: 'price', key: 'price',},
      { title: '违章扣分', dataIndex: 'score', key: 'score',},
      { title: '状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 && <span style={{color:'red'}}>未处理</span>}
            {record.status==1 && <span>已处理</span>}
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Car/CarManager" component={
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
                  <Row style={{marginTop:24}}>
                    {
                      SaleTopData02.map(item => (
                          <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={4} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.NewCar} type="primary">新增车辆</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.NewCarNotes} type="primary" >租车</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.BorrorCarNotes} type="primary" >借车</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.showRefundLink} type="primary" >退车</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.showCheckLink} type="primary" >验车</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.wxCarNotes} type="primary" ghost>维修</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.byCarNotes} type="primary" ghost>保养</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.cxCarNotes} type="primary" ghost>出险</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.njCarNotes} type="primary" ghost>年检</Button>
                      <Button disabled={this.state.ButtonDisabled} className={styles.QuickButton} onClick={this.bdCarNotes} type="primary" ghost>保单</Button>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          {
                            this.state.ListTitle==='全部车辆'
                            &&
                            <div>
                              <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                                <FormItem
                                  className={styles.QuickFormItem}
                                  {...formItemLayout}
                                >
                                  <Select onChange={this.chooseCarRecord} placeholder="请选择车辆记录" value={this.state.selectCarRecord}>
                                    <Option value="">请选择车辆记录</Option>
                                    <Option value="1">签约记录</Option>
                                    <Option value="2">租车记录</Option>
                                    <Option value="3">出险记录</Option>
                                    <Option value="4">年检记录</Option>
                                    <Option value="5">退车记录</Option>
                                    <Option value="6">延期记录</Option>
                                    <Option value="7">保单记录</Option>
                                    <Option value="8">保养记录</Option>
                                    <Option value="9">维修记录</Option>
                                    <Option value="10">验车记录</Option>
                                    <Option value="11">违章记录</Option>
                                  </Select>
                                </FormItem>
                              </Col>
                              <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                                {
                                  this.state.chooseCarType == true ?
                                    <FormItem
                                      className={styles.QuickFormItem}
                                      {...formItemLayout}
                                    >
                                      {getFieldDecorator('carType', {})(
                                        <Select placeholder="选择品牌车型" value={this.state.carType} onChange={this.changeCarType}
                                        >
                                          <Option value={0}>全部车型</Option>
                                          {this.state.vehicleTemplateList}
                                        </Select>
                                      )}
                                    </FormItem> :
                                    <FormItem
                                      className={styles.QuickFormItem}
                                      {...formItemLayout}
                                    >
                                      <AutoComplete dataSource={this.state.carRecordList} placeholder="选择记录状态" value={this.state.carState} onChange={this.changeCarRecord}/>
                                    </FormItem>
                                }
                              </Col>
                            </div>
                          }
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
                  {this.state.isNew == 1 &&
                  <Popover overlayStyle={{width:'430px'}} content={<div>这里就是刚才新增的车辆。如果在使用过程中遇到了困难，可点击帮助文档或直接咨询嘀友在线客服。如需批量导入导出，请点击侧边栏的导入导出模块。<span style={{color:'#1890ff',cursor:'pointer'}} onClick={()=>{this.backWrokplace()}}>我知道了！</span></div>} visible={this.state.is_newShow}>
                    <Card bordered={false} title={this.state.ListTitle} style={{position: 'relative', zIndex: '1010',}}>
                    {
                      this.state.ListTitle === '全部车辆' &&
                      <div>
                        {
                          this.state.RentRecordType == 0 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={columns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 1 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Signcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 2 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Rentcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 3 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Accidentcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 4 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Surverycolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 5 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={BackRecordcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 6 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Extensioncolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 7 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Policycolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 8 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Keepcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 9 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Maintaincolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 10 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={checkColumn}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.RentRecordType == 11 &&
                          <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={Violationcolumns}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                      </div>
                    }
                    {
                      this.state.ListTitle === '已租车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={HaveRentCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '待租车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={ForRentCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '退出运营车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={BackRentCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '维修中车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={MaintenanceCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '待出库车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={DueCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '需续保车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={RenewalCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '需年检车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={ASCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === 'GPS离线车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={GPSCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '需保养车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={KeepCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '出险车辆' &&
                      <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={OutCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '有违章车辆' &&
                      <div>
                        <Table pagination={false} rowKey="id" bordered={true} scroll={{x: 600}} columns={IllegalCar}
                               loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                               footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>

                      </div>
                    }
                  </Card>
                  </Popover>
                  }
                  {
                    this.state.isNew != 1 &&
                    <div>
                      <Card bordered={false} title={this.state.ListTitle} style={{marginBottom:24}}
                            extra={this.state.ListTitle!='有违章车辆' && <Button type="primary" ghost onClick={this.OutputExcelSubmit}>导出</Button>}>
                        {
                          this.state.ListTitle === '全部车辆' &&
                          <div>
                            {
                              this.state.RentRecordType == 0 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={columns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 1 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Signcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 2 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Rentcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 3 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Accidentcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 4 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Surverycolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 5 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={BackRecordcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 6 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Extensioncolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 7 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Policycolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 8 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Keepcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 9 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Maintaincolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 10 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={checkColumn}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                            {
                              this.state.RentRecordType == 11 &&
                              <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={Violationcolumns}
                                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                            }
                          </div>
                        }
                        {
                          this.state.ListTitle === '已租车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={HaveRentCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '待租车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={ForRentCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '退出运营车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={BackRentCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '维修中车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={MaintenanceCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '待出库车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={DueCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '需续保车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={RenewalCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '需年检车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={ASCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === 'GPS离线车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={GPSCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '需保养车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={KeepCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '出险车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={OutCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }
                        {
                          this.state.ListTitle === '有违章车辆' &&
                          <Table pagination={false}  rowKey="id" bordered={true} scroll={{x: 600}} columns={IllegalCar}
                                 loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                                 footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                        }

                        <Pagination hideOnSinglePage={true} style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.CarRecordLen} />
                      </Card>
                      {
                        this.state.ListTitle === '有违章车辆' &&
                        <Card title={<div>手动新增违章记录（不参与系统违章统计）</div>} bordered={false}  extra={<Button onClick={this.AddIllegalLink} type="primary" ghost>手动新增违章记录</Button>}>
                          <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={IllegalCar}
                                 loading={this.state.violatLoading} dataSource={this.state.violatRecord}
                                 footer={() => <p>总共 {this.state.violatRecordLen} 条数据</p>}/>
                        </Card>
                      }
                    </div>
                  }
                </div>
              </div>
            }/>
            <Route path="/Car/CarType" component={CarType}/>
            <Route path="/Car/CarManager/AddIllegal" component={AddIllegal}/>
            <Route path="/Car/CarManager/CheckIllegal" component={CheckIllegal}/>
            <Route path="/Car/CarManager/AddCheckllsgal" component={AddCheckllsgal}/>
            <Route path="/Car/CarManager/NewCarNotes" component={NewCarNotes}/>
            <Route path="/Car/CarManager/ShowAccidentCarNotes" component={ShowAccidentCarNotes}/>
            <Route path="/Car/CarManager/NewAccidentCarNotes" component={NewAccidentCarNotes}/>
            <Route path="/Car/CarManager/NewBorrowCarNotes" component={NewBorrowCarNotes}/>
            <Route path="/Car/CarManager/NewSignCarNotes" component={NewSignCarNotes}/>
            <Route path="/Car/CarManager/NewCheckCarNotes" component={NewCheckCarNotes}/>
            <Route path="/Car/CarManager/NewExtensionCarNotes" component={NewExtensionCarNotes}/>
            <Route path="/Car/CarManager/NewMaintainCarNotes" component={NewMaintainCarNotes}/>
            <Route path="/Car/CarManager/NewPolicyCarNotes" component={NewPolicyCarNotes}/>
            <Route path="/Car/CarManager/NewSurveryCarNotes" component={NewSurveryCarNotes}/>
            <Route path="/Car/CarManager/NewKeepCarNotes" component={NewKeepCarNotes}/>
            <Route path="/Car/CarManager/NewCar" component={NewCar}/>
            <Route path="/Car/CarManager/ToMentionCar" component={ToMentionCar}/>
            <Route path="/Car/CarManager/ShowCar" component={ShowCar}/>
            <Route path="/Car/CarManager/BackCar" component={BackCar}/>
            <Route path="/Car/CarManager/RefundCar" component={RefundCar}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const BasicLists = Form.create()(BasicList);

export default BasicLists;
