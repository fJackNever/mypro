import React, { PureComponent } from 'react';
import $ from 'jquery';
import { connect } from 'dva';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select, Tag, Row, Col, Button, notification, Popconfirm,Table,message,Pagination } from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import workplace from './workplace/workplace';
import NewRentalCar from './NewRentalCar/NewRentalCar';
import UnderCar from './UnderCar/UnderCar';
import NewSaleCar from './NewSaleCar/NewSaleCar';
import NewSigning from './NewSigning/NewSigning';
import ShowSignNotes from './ShowSignNotes/ShowSignNotes';
import ShowCompanyRent from './ShowCompanyRent/ShowCompanyRent';
import ShowBookingOrder from './ShowBookingOrder/ShowBookingOrder';

import styles from './Sale.less';
import request from "../../utils/request";

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
    ListTitle:'已上架出租车辆',
    SaleLoading:false,
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
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.getSaleHost();
    if(window.location.href.split('ListTitle=')[1]){
      this.ShowReocrdList(window.location.href.split('ListTitle=')[1])
    }else{
      this.getShowVehicle(1,'',4,this.state.pageSize,0);
    }
  }
  componentWillUnmount = ()=>{
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  ShowReocrdList = (target)=>{
    if(target==1){
      this.setState({ListTitle:'已上架出租车辆',});
      this.getShowVehicle(1,'',4,this.state.pageSize,0);
    }else if(target==2){
      this.setState({ListTitle:'已下架出租车辆',});
      this.getShowVehicle(0,'',4,this.state.pageSize,0);
    }else if(target==3){
      this.setState({ListTitle:'已上架出售车辆',});
      this.getShowVehicle(1,'',3,this.state.pageSize,0);
    }else if(target==4){
      this.setState({ListTitle:'已下架出售车辆',});
      this.getShowVehicle(0,'',3,this.state.pageSize,0);
    }else if(target==5){
      this.setState({ListTitle:'预定订单',});
      this.getOrder('',this.state.pageSize,0);
    }else if(target==6){
      this.setState({ListTitle:'待签约',});
      this.getVehicleSign('',this.state.pageSize,0);
    }else if(target==7){
      this.setState({ListTitle:'公司求租',});
      this.getCompanyWantRent('',this.state.pageSize,0);
    }else if(target==8){
      this.getPublicWantRent('',this.state.pageSize,0);
    }
  }
  getSaleHost = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/show/getHost',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          unsale:data.data.data.unsale,
          showed:data.data.data.showed,
          unshow:data.data.data.unshow,
          qiuzu:data.data.data.qiuzu,
          allqiuzu:data.data.data.allqiuzu,
          yuding:data.data.data.yuding,
          sign:data.data.data.sign,
          sale:data.data.data.sale,
        })
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
  }
  //获取上架/下架/租（售）车辆列表
  getShowVehicle = (is_show,search,SaleType,limit,offset)=>{
    this.setState({SaleLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append("is_show", is_show);
    TotalData.append("search", search);
    TotalData.append("type", SaleType);
    TotalData.append("limit", limit);
    TotalData.append("offset", offset);
    request('/api/web/show/getShowVehicle',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({SaleLoading:false})
      if (data.data.code === 1) {
        this.setState({
          SaleRecord:data.data.data.rows,
          SaleRecordLen:data.data.data.total,
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取预订订单列表
  getOrder = (search,limit,offset)=>{
    this.setState({SaleLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append("search", search);
    TotalData.append("limit", limit);
    TotalData.append("offset", offset);
    request('/api/web/show/getOrder',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        SaleLoading:false
      })
      if (data.data.code === 1) {
        this.setState({
          SaleRecord:data.data.data.rows,
          SaleRecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取待签约订单列表
  getVehicleSign = (search,limit,offset)=>{
    this.setState({SaleLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append("search", search);
    TotalData.append("status", 0);
    TotalData.append("limit", limit);
    TotalData.append("offset", offset);
    request('/api/web/vehicle/getSignRecord',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({SaleLoading:false})
      if (data.data.code === 1) {
        this.setState({
          SaleRecord:data.data.data.rows,
          SaleRecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取公司求租列表
  getCompanyWantRent = (search,limit,offset)=>{
    this.setState({SaleLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append("search", search);
    TotalData.append("limit", limit);
    TotalData.append("offset", offset);
    request('/api/web/show/getCompanyWantRent',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({SaleLoading:false})
      if (data.data.code === 1) {
        this.setState({
          SaleRecord:data.data.data.rows,
          SaleRecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //获取公共求租列表
  getPublicWantRent = (search,limit,offset)=>{
    this.setState({SaleLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append("search", search);
    TotalData.append("limit", limit);
    TotalData.append("offset", offset);
    request('/api/web/show/getPublicWantRent',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        SaleLoading:false
      })
      if (data.data.code === 1) {
        this.setState({
          ListTitle:'公共求租',
          SaleRecord:data.data.data.rows,
          SaleRecordLen:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //跳转新增上架租车页面
  NewCarRental = () =>{
    this.props.history.push('/Sale/SaleManager/NewRentalCar');
  }
  //跳转新增上架卖车页面
  NewSaleCar = () =>{
    this.props.history.push('/Sale/SaleManager/NewSaleCar');
  }
  //跳转新增签约页面
  NewSigning = () =>{
    this.props.history.push('/Sale/SaleManager/NewSigning');
  }
  //跳转新增签约页面
  chooseList = (e) =>{
    if(e!='公共求租'){
      this.setState({
        search:'',
        ListTitle:e,
        SaleLoading:true,
        pagecurrent:1,
      })
    }
    if(e=='已上架出租车辆'){
      this.getShowVehicle(1,'',4,this.state.pageSize,0);
    }else if(e=='已下架出租车辆'){
      this.getShowVehicle(0,'',4,this.state.pageSize,0);
    }else if(e=='已上架出售车辆'){
      this.getShowVehicle(1,'',3,this.state.pageSize,0);
    }else if(e=='已下架出售车辆'){
      this.getShowVehicle(0,'',3,this.state.pageSize,0);
    }else if(e=='预定订单'){
      this.getOrder('',this.state.pageSize,0);
    }else if(e=='待签约'){
      this.getVehicleSign('',this.state.pageSize,0);
    }else if(e=='公司求租'){
      this.getCompanyWantRent('',this.state.pageSize,0);
    }else if(e=='公共求租'){
      this.getPublicWantRent('',this.state.pageSize,0);
    }
  }

  //下架
  SoldOut = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id",target);
    GFHFormData.append("is_show",0);
    request('/api/web/show/editVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        message.success('下架车辆成功');
        this.UpdateRecord();
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //上架
  SoldUp = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id",target);
    GFHFormData.append("is_show",1);
    request('/api/web/show/editVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        message.success('上架车辆成功');
        this.UpdateRecord();
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //刷新列表
  UpdateRecord = ()=>{
    this.getSaleHost();
    this.setState({
      SaleLoading:true,
    })
    if(this.state.ListTitle=='已上架出租车辆'){
      this.getShowVehicle(1,'',4,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已下架出租车辆'){
      this.getShowVehicle(0,'',4,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已上架出售车辆'){
      this.getShowVehicle(1,'',3,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已下架出售车辆'){
      this.getShowVehicle(0,'',3,this.state.pageSize,0);
    }else if(this.state.ListTitle=='预定订单'){
      this.getOrder('',this.state.pageSize,0);
    }else if(this.state.ListTitle=='待签约'){
      this.getVehicleSign('',this.state.pageSize,0);
    }else if(this.state.ListTitle=='公司求租'){
      this.getCompanyWantRent('',this.state.pageSize,0);
    }else if(this.state.ListTitle=='公共求租'){
      this.getPublicWantRent('',this.state.pageSize,0);
    }
  }
  //查看已上架出租车辆
  ShowUpRent = (target)=>{
    this.props.history.push('/Sale/SaleManager/NewRentalCar?SaleId='+target);
  }
  //查看出售车辆
  ShowUpSale= (target)=>{
    this.props.history.push('/Sale/SaleManager/NewSaleCar?SaleId='+target);
  }
  //查看预订订单信息
  ShowBookingOrder= (target)=>{
    this.props.history.push('/Sale/SaleManager/ShowBookingOrder?OrderId='+target);
  }
  //查看签约记录
  ShowSignNotes = (target)=>{
    this.props.history.push('/Sale/SaleManager/ShowSignNotes?entity_id='+target);
  }
  //查看公司求组信息
  ShowCompanyRent = (target)=>{
    this.props.history.push('/Sale/SaleManager/ShowCompanyRent?OrderId='+target);
  }
  //查看公共求租信息
  ShowpublicRent = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id",target);
    request('/api/web/show/checkWantRentTel',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        this.getPublicWantRent('',this.state.pageSize,(this.state.pagecurrent-1)*this.state.pageSize);
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //模糊查询
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
    }else{
    }
  }
  //快捷查询
  SearchSubmit =()=>{
    this.setState({search:$("input[name='search']").val(),SaleLoading:true})
    if(this.state.ListTitle=='已上架出租车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),4,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已下架出租车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),4,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已上架出售车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),3,this.state.pageSize,0);
    }else if(this.state.ListTitle=='已下架出售车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),3,this.state.pageSize,0);
    }else if(this.state.ListTitle=='预定订单'){
      this.getOrder($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='待签约'){
      this.getVehicleSign($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='公司求租'){
      this.getCompanyWantRent($("input[name='search']").val(),this.state.pageSize,0);
    }else if(this.state.ListTitle=='公共求租'){
      this.getPublicWantRent($("input[name='search']").val(),this.state.pageSize,0);
    }
  }

  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    if(this.state.ListTitle=='已上架出租车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),4,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已下架出租车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),4,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已上架出售车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),3,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已下架出售车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),3,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='预定订单'){
      this.getOrder($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='待签约'){
      this.getVehicleSign($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='公司求租'){
      this.getCompanyWantRent($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='公共求租'){
      this.getPublicWantRent($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    if(this.state.ListTitle=='已上架出租车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),4,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已下架出租车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),4,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已上架出售车辆'){
      this.getShowVehicle(1,$("input[name='search']").val(),3,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='已下架出售车辆'){
      this.getShowVehicle(0,$("input[name='search']").val(),3,pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='预定订单'){
      this.getOrder($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='待签约'){
      this.getVehicleSign($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='公司求租'){
      this.getCompanyWantRent($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }else if(this.state.ListTitle=='公共求租'){
      this.getPublicWantRent($("input[name='search']").val(),pageSize,(current-1)*pageSize);
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
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
      {id:'showed',title:'已上架出租车辆',value:this.state.showed,bordered:true},
      {id:'unshow',title:'已下架出租车辆',value:this.state.unshow,bordered:true},
      {id:'sale',title:'已上架出售车辆',value:this.state.sale,bordered:true},
      {id:'unsale',title:'已下架出售车辆',value:this.state.unsale,bordered:true},
      {id:'yuding',title:'预定订单',value:this.state.yuding,bordered:true},
      {id:'sign',title:'待签约',value:this.state.sign,bordered:true},
      {id:'qiuzu',title:'公司求租',value:this.state.qiuzu,bordered:true},
      {id:'allqiuzu',title:'公共求租',value:this.state.allqiuzu,bordered:false},
    ];
    //已上架出租车辆
    const UpRentColumns = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '类型',dataIndex: 'type', key: 'type',
        render:(text,record) =>
          <div>
            {record.type==1 && <span>月租</span>}
            {record.type==2 && <span>日租</span>}
            {record.type==3 && <span>出售</span>}
          </div>
      },
      { title: '品牌车型', dataIndex: 'model', key: 'model',
        render:(text,record) => <div>{record.brand}-{record.model}</div>
      },
      { title: '租金', dataIndex: 'rent_amount', key: 'rent_amount', },
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '注册日期', dataIndex: 'register_date', key: 'register_date'},
      { title: '行驶里程', dataIndex: 'mileage', key: 'mileage'},
      { title: '保养周期（公里）', dataIndex: 'keep_cycle', key: 'keep_cycle' },
      { title: '提车日期', dataIndex: 'get_vehicle_date', key: 'get_vehicle_date',},
      { title: '最短租期（月）', dataIndex: 'shortest_term', key: 'shortest_term' ,},
      { title: '预定状态', dataIndex: 'status', key: 'status' ,
        render:(text,record) =>
          <div>
            {record.status==0 && <span>未预定</span>}
            {record.status==1 && <span>已预定</span>}
          </div>
      },
      { title: '库存', dataIndex: 'inventory', key: 'inventory',},
      { title: '已上架天数', dataIndex: 'show_days', key: 'show_days' ,},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Popconfirm title="确定下架?" onConfirm={this.SoldOut.bind(this,record.id,'rent')}>
              <Tag className={styles.TagBtn} color="gold">下架</Tag>
            </Popconfirm>
            <Tag onClick={this.ShowUpRent.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //已下架出租车辆
    const DownRentColumns = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '类型',dataIndex: 'type', key: 'type',
        render:(text,record) =>
          <div>
            {record.type==1 && <span>月租</span>}
            {record.type==2 && <span>日租</span>}
            {record.type==3 && <span>出售</span>}
          </div>
      },
      { title: '品牌车型', dataIndex: 'model', key: 'model',
        render:(text,record) => <div>{record.brand}-{record.model}</div>},
      { title: '租金', dataIndex: 'rent_amount', key: 'rent_amount', },
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '注册日期', dataIndex: 'register_date', key: 'register_date'},
      { title: '行驶里程', dataIndex: 'mileage', key: 'mileage'},
      { title: '保养周期（公里）', dataIndex: 'keep_cycle', key: 'keep_cycle' },
      { title: '提车日期', dataIndex: 'get_vehicle_date', key: 'get_vehicle_date',},
      { title: '最短租期（月）', dataIndex: 'shortest_term', key: 'shortest_term' ,},
      { title: '预定状态', dataIndex: 'status', key: 'status' ,
        render:(text,record) =>
          <div>
            {record.status==0 && <span>未预定</span>}
            {record.status==1 && <span>已预定</span>}
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Popconfirm title="确定上架?" onConfirm={this.SoldUp.bind(this,record.id)}>
              <Tag className={styles.TagBtn} color="gold">上架</Tag>
            </Popconfirm>
            <Tag onClick={this.ShowUpRent.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //已上架出售车辆
    const UPSaleColumns = [
      { title: '品牌车型', dataIndex: 'model', key: 'model',
        render:(text,record) => <div>{record.brand}-{record.model}</div>
      },
      { title: '首付', dataIndex: 'first_amount', key: 'first_amount', },
      { title: '月供', dataIndex: 'month_amount', key: 'month_amount',},
      { title: '分期', dataIndex: 'stage', key: 'stage',},
      { title: '尾款', dataIndex: 'last_amount', key: 'last_amount',},
      { title: '注册日期', dataIndex: 'register_date', key: 'register_date'},
      { title: '行驶里程', dataIndex: 'mileage', key: 'mileage'},
      { title: '提车日期', dataIndex: 'get_vehicle_date', key: 'get_vehicle_date',},
      { title: '上架数量', dataIndex: 'inventory', key: 'inventory',},
      { title: '已上架天数', dataIndex: 'show_days', key: 'show_days',},
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Popconfirm title="确定下架?" onConfirm={this.SoldOut.bind(this,record.id,'sale')}>
              <Tag className={styles.TagBtn} color="gold">下架</Tag>
            </Popconfirm>
            <Tag onClick={this.ShowUpSale.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //已下架出售车辆
    const DownSaleColumns = [
      { title: '品牌车型', dataIndex: 'model', key: 'model',
        render:(text,record) => <div>{record.brand}-{record.model}</div>
      },
      { title: '首付', dataIndex: 'first_amount', key: 'first_amount', },
      { title: '月供', dataIndex: 'month_amount', key: 'month_amount',},
      { title: '分期', dataIndex: 'stage', key: 'stage',},
      { title: '尾款', dataIndex: 'last_amount', key: 'last_amount',},
      { title: '注册日期', dataIndex: 'register_date', key: 'register_date'},
      { title: '行驶里程', dataIndex: 'mileage', key: 'mileage'},
      { title: '提车日期', dataIndex: 'get_vehicle_date', key: 'get_vehicle_date',},
      { title: '上架数量', dataIndex: 'inventory', key: 'inventory',},
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Popconfirm title="确定上架?" onConfirm={this.SoldUp.bind(this,record.id)}>
              <Tag className={styles.TagBtn} color="gold">上架</Tag>
            </Popconfirm>
            <Tag onClick={this.ShowUpSale.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //预定订单
    const BookingColumns = [
      { title: '订单编号', dataIndex: 'order_no', key: 'order_no', },
      { title: '订单详情', dataIndex: 'order_info', key: 'order_info', },
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no', },
      { title: '品牌车型', dataIndex: 'template', key: 'template'},
      { title: '定金（元）', dataIndex: 'rent_deposit', key: 'rent_deposit', },
      { title: '客户名称', dataIndex: 'name', key: 'name', },
      { title: '手机号', dataIndex: 'telephone', key: 'telephone', },
      { title: '提车日期', dataIndex: 'get_vehicle_time', key: 'get_vehicle_time'},
      { title: '支付状态', dataIndex: 'pay_status', key: 'pay_status',
        render:(text,record) =>
          <div>
            {record.pay_status==1 && <span>未支付</span>}
            {record.pay_status==2 && <span>已支付</span>}
          </div>
      },
      { title: '处理状态', dataIndex: 'status', key: 'status',
        render:(text,record) =>
          <div>
            {record.status==1 && <span>未完成</span>}
            {record.status==2 && <span>已完成</span>}
            {record.status==3 && <span>取消</span>}
            {record.status==4 && <span>已联系</span>}
          </div>
      },
      { title: '退款状态', dataIndex: 'refund_status', key: 'refund_status',
        render:(text,record) =>
          <div>
            {record.refund_status==1 && <span>未退款</span>}
            {record.refund_status==2 && <span>已退款</span>}
          </div>
      },
      { title: '提交日期', dataIndex: 'create_time', key: 'create_time',},
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowBookingOrder.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //待签约
    const SignColumns= [
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no', },
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name'},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone', },
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time', },
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time', },
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount'},
      { title: '押金', dataIndex: 'deposit', key: 'deposit'},
      { title: '签约日期', dataIndex: 'sign_date', key: 'sign_date'},
      { title: '签约类型', dataIndex: 'type', key: 'type',
        render:(text,record) =>
          <div>
            {record.type==1 && <span>月租</span>}
            {record.type==2 && <span>日租</span>}
            {record.type==3 && <span>以租代购</span>}
          </div>
      },
      { title: '签约状态', dataIndex: 'sign_status', key: 'sign_status',
        render:(text,record) =>
          <div>
            {record.sign_status==0 && <span>未签约</span>}
            {record.sign_status==1 && <span>已签约</span>}
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowSignNotes.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //公司求租
    const soliciting = [
      { title: '姓名', dataIndex: 'name', key: 'name', },
      { title: '手机号', dataIndex: 'telephone', key: 'telephone', },
      { title: '品牌车型', dataIndex: 'template', key: 'template'},
      { title: '希望时间', dataIndex: 'hope_time', key: 'hope_time'},
      { title: '处理状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
        <div>
          {record.status==0 && <span style={{color:'#f50'}}>未处理</span>}
          {record.status==1 && <span>已处理</span>}
        </div>
      },
      { title: '提交日期', dataIndex: 'create_time', key: 'create_time'},
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCompanyRent.bind(this,record.id,'company')} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //公共求租
    const Allsoliciting = [
      { title: '姓名', dataIndex: 'name', key: 'name', },
      { title: '手机号', dataIndex: 'telephone', key: 'telephone', },
      { title: '品牌车型', dataIndex: 'template', key: 'template'},
      { title: '希望时间', dataIndex: 'hope_time', key: 'hope_time'},
      { title: '处理状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 && <span style={{color:'#f50'}}>未处理</span>}
            {record.status==1 && <span>已处理</span>}
          </div>
      },
      { title: '提交日期', dataIndex: 'create_time', key: 'create_time'},
      {
        title: '操作',
        key: 'operation',
        width: 180,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {record.status == 0 &&
              <Tag onClick={this.ShowpublicRent.bind(this, record.id)} className={styles.TagBtn} color="green">查看手机号</Tag>
            }
          </div>
        ,
      },
    ];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Sale/SaleManager" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                        <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={3} sm={8} xs={24}>
                          <Info title={item.title} value={item.value} bordered={item.bordered}/>
                        </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <Form layout="inline">
                      <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                        <Button className={styles.QuickButton} onClick={this.NewCarRental} type="primary">新增上架租车车辆</Button>
                        <Button className={styles.QuickButton} onClick={this.NewSaleCar} type="primary">新增上架卖车车辆</Button>
                        <Button className={styles.QuickButton} onClick={this.NewSigning} type="primary">新增待签约记录</Button>
                      </StandardFormRow>
                      <StandardFormRow
                        title="快速查询"
                        grid
                        last
                      >
                        <Row gutter={16}>
                          <Col xl={12} lg={12} md={12} sm={24} xs={24} style={{display:'flex',flexFlow:'row'}}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Input style={{width:'80%'}} name="search" onChange={this.SearchInput} placeholder="输入关键字" defaultValue={this.state.search}/>
                            </FormItem>
                            <FormItem className={styles.QuickFormItem}>
                               <Button  onClick={this.SearchSubmit}  type="primary">搜索</Button>
                            </FormItem>
                          </Col>
                        </Row>
                      </StandardFormRow>
                    </Form>
                  </Card>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false} title={<div>
                    {this.state.ListTitle!='公共求租' && <span>{this.state.ListTitle}</span>}
                    {this.state.ListTitle=='公共求租' && <span>{this.state.ListTitle}<span style={{color:'#f50'}}>(只显示一周之内的数据)</span></span>}
                  </div>}>
                    {
                      this.state.ListTitle=='已上架出租车辆' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={UpRentColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='已下架出租车辆' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={DownRentColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='已上架出售车辆' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={UPSaleColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='已下架出售车辆' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={DownSaleColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='预定订单' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={BookingColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='待签约' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={SignColumns} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='公司求租' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={soliciting} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='公共求租' &&
                      <Table scroll={{x: 600}} pagination={false} bordered={true} columns={Allsoliciting} loading={this.state.SaleLoading} dataSource={this.state.SaleRecord}  footer={() => <p>总共 {this.state.SaleRecordLen} 条数据</p>}/>
                    }
                    <Pagination hideOnSinglePage={true} style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.SaleRecordLen} />
                  </Card>
                </div>
              </div>
            }/>
            <Route path="/Sale/workplace" component={workplace}/>
            <Route path="/Sale/SaleManager/UnderCar" component={UnderCar}/>
            <Route path="/Sale/SaleManager/NewRentalCar" component={NewRentalCar}/>
            <Route path="/Sale/SaleManager/ShowCompanyRent" component={ShowCompanyRent}/>
            <Route path="/Sale/SaleManager/ShowBookingOrder" component={ShowBookingOrder}/>
            <Route path="/Sale/SaleManager/ShowSignNotes" component={ShowSignNotes}/>
            <Route path="/Sale/SaleManager/NewSaleCar" component={NewSaleCar}/>
            <Route path="/Sale/SaleManager/NewSigning" component={NewSigning}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const BasicLists = Form.create()(BasicList);

export default BasicLists;
