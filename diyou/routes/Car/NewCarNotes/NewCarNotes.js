import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select, InputNumber, Table, message, Button,AutoComplete,Badge,notification} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class newCarNotes extends PureComponent {
  state = {
    type:1,
    rent_vehicle_status:1,
    deposit_status:0,
    customerIDNum:'',
    customerTel:'',
    checkCarData:'',
    ViolationCarData:'',
    RentCarData:'',
    ButtonLoading:false,
    xuzu:0,
    ADDNewRoecord:1,
    licensePlateNodisabled:false,
    CarModel:''
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}

    var toDay  = new Date();
    if(window.location.href.split('IsRenewal=')[1]) {
      if(window.location.href.split('IsRenewal=')[1].split('&license_plate_no=')[0]=='1'){
        this.setState({xuzu:1})}else{this.setState({xuzu:0})
      }
    }

    const getQueryString = (name) => {

      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = this.props.location.search.substr(1).match(reg);
      console.log(r)
      if(r!=null)
        return decodeURIComponent(r[2]);
      return null;
    }

    if(getQueryString('license_plate_no')){
      this.setState({license_plate_no:getQueryString('license_plate_no'),CarModel:getQueryString('vehicle_template')})
      this.props.form.setFields({
        license_plate_no: {value:getQueryString('license_plate_no')}
      })

    }
    if(window.location.href.split('entity_id=')[1]) {
      this.setState({
        ADDNewRoecord:0,
        licensePlateNodisabled: true,
        entity_id:window.location.href.split('entity_id=')[1],
      })
      this.GetRentReocrd(window.location.href.split('entity_id=')[1])
    }else{
      this.props.form.setFields({
        rent_month_amount:{values:0},
        rent_days:{values:0},
        manager_amount:{values:0},
        basic_premium:{values:0},
        other_basic_premium:{values:0},
        contract_start_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        delivery_vehicle_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        contract_end_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 2) + '-' + new Date(toDay).getDate())},
      })
    }
  }
  //获取租车记录详情
  GetRentReocrd = (target) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id",target);
    request('/api/web/vehicle/getRentInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.searchCustomerID(data.data.data.customer_id);
        this.searchRecordList(data.data.data.vehicle_id);
        this.setState({
          id:data.data.data.id,
          type:data.data.data.type,
          rent_vehicle_status:data.data.data.rent_vehicle_status,
          deposit_status:data.data.data.deposit_status,
          license_plate_no:data.data.data.license_plate_no
        })
        if(data.data.data.type!=2){
          if(data.data.data.next_refund_time!='0000-00-00'){
            this.props.form.setFields({
              next_refund_time: {value: moment(data.data.data.next_refund_time)},
            })
          }
        }else{
          this.props.form.setFields({
            basic_premium:{value:data.data.data.basic_premium},
            other_basic_premium:{value:data.data.data.other_basic_premium},
            rent_days:{value:data.data.data.rent_days},
            total_amount:{value:data.data.data.total_amount},
          })
        }
        if(data.data.data.refund_vehicle_time!='0000-00-00'){this.props.form.setFields({refund_vehicle_time:{value:moment(data.data.data.refund_vehicle_time)},})}
        this.props.form.setFields({
          license_plate_no:{value:data.data.data.license_plate_no},
          customer_name:{value:data.data.data.customer_name},
          contract_no:{value:data.data.data.contract_no},
          contract_start_time:{value:moment(data.data.data.contract_start_time)},
          contract_end_time:{value:moment(data.data.data.contract_end_time)},
          delivery_vehicle_time:{value:moment(data.data.data.delivery_vehicle_time)},
          rent_month_amount:{value:data.data.data.rent_month_amount},
          deposit:{value:data.data.data.deposit},
          manager_amount:{value:data.data.data.manager_amount},
          comment:{value:data.data.data.comment},
        })
      }
    }).catch(()=>{})
  }
  //新增租车记录
  AddRentRecordSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({ButtonLoading:true})
        let ARRFormData = new FormData();
        ARRFormData.append('key','diuber2017');
        ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        ARRFormData.append('license_plate_no',values.license_plate_no);
        ARRFormData.append('customer_name',values.customer_name);
        ARRFormData.append('xuzu',this.state.xuzu);
        ARRFormData.append('type',this.state.type);
        ARRFormData.append('contract_start_time',new Date(values.contract_start_time._d).getFullYear()+'-'+(new Date(values.contract_start_time._d).getMonth()+1)+'-'+new Date(values.contract_start_time._d).getDate());
        ARRFormData.append('contract_end_time',new Date(values.contract_end_time._d).getFullYear()+'-'+(new Date(values.contract_end_time._d).getMonth()+1)+'-'+new Date(values.contract_end_time._d).getDate());
        ARRFormData.append('delivery_vehicle_time',new Date(values.delivery_vehicle_time._d).getFullYear()+'-'+(new Date(values.delivery_vehicle_time._d).getMonth()+1)+'-'+new Date(values.delivery_vehicle_time._d).getDate());
        ARRFormData.append('rent_month_amount',values.rent_month_amount);
        ARRFormData.append('deposit',values.deposit);
        if(this.state.type!=2) {
          ARRFormData.append('next_refund_time', new Date(values.next_refund_time._d).getFullYear() + '-' + (new Date(values.next_refund_time._d).getMonth() + 1) + '-' + new Date(values.next_refund_time._d).getDate());
        }else{
          if(values.basic_premium){
            ARRFormData.append('basic_premium',values.basic_premium);
          }
          if(values.other_basic_premium){
            ARRFormData.append('other_basic_premium',values.other_basic_premium);
          }
          if(values.rent_days){
            ARRFormData.append('rent_days',values.rent_days);
          }
          if(values.total_amount){
            var total_amount = values.rent_month_amount*values.rent_days+values.manager_amount+values.basic_premium+values.other_basic_premium;
            ARRFormData.append('total_amount',total_amount);
          }
        }
        if(values.manager_amount){
          ARRFormData.append('manager_amount',values.manager_amount);
        }
        ARRFormData.append('rent_vehicle_status',this.state.rent_vehicle_status);
        ARRFormData.append('deposit_status',this.state.deposit_status);
        if(values.contract_no){
          ARRFormData.append('contract_no',values.contract_no);
        }
        if(values.comment){
          ARRFormData.append('comment',values.comment);
        }
        if(values.refund_vehicle_time){
          ARRFormData.append('refund_vehicle_time',new Date(values.refund_vehicle_time._d).getFullYear()+'-'+(new Date(values.refund_vehicle_time._d).getMonth()+1)+'-'+new Date(values.refund_vehicle_time._d).getDate());
        }
        if(this.state.ADDNewRoecord==1){
          request('/api/web/vehicle/addRent',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增租车记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=3&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          ARRFormData.append('id',this.state.id);
          request('/api/web/vehicle/editRent',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改租车记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=3&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }
  //自动计算总金额
  TotalAmount = (value)=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.props.form.setFields({
          total_amount: {value:parseInt(values.rent_month_amount*value)+parseInt(values.manager_amount)+parseInt(values.basic_premium)+parseInt(values.other_basic_premium)+parseInt(values.deposit)}
        })
      }
    })
  }
  //多选
  selectType = (value) =>{
    this.setState({
      type:value
    })
  }
  selectRentStatus = (value) =>{
    this.setState({
      rent_vehicle_status:value
    })
  }
  selectDepositStatus = (value) =>{
    this.setState({
      deposit_status:value
    })
  }
  searchRecordList = (target) =>{
    let CarReocrdFormData = new FormData();
    CarReocrdFormData.append('key','diuber2017');
    CarReocrdFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CarReocrdFormData.append("vehicle_id", target);
    request('/api/web/vehicle/getValidataRecord',{
      method:'POST',
      body:CarReocrdFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        checkCarData:data.data.data.rows
      })
    }).catch(()=>{})
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:CarReocrdFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        RentCarData:data.data.data.rows
      })
    }).catch(()=>{})
    let ViolationFormData = new FormData();
    ViolationFormData.append('key','diuber2017');
    ViolationFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    ViolationFormData.append("vehicle_id", target);
    ViolationFormData.append("limit", 9999);
    request('/api/web/vehicle_violation/getViolationRecord',{
      method:'POST',
      body:ViolationFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        ViolationCarData:data.data.data.rows
      })
    }).catch(()=>{})
  }

  searchCustomer = (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", value);
    GFHFormData.append("limit", 10000);
    request('/api/web/customer/getCustomer',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.data.total==1){
        this.setState({
          customerTel : data.data.data.rows[0].telephone,
          customerIDNum : data.data.data.rows[0].id_number,
        })
      }else{
        this.setState({
          customerTel : '',
          customerIDNum : '',
        })
      }
    }).catch(()=>{})
  }
  searchCustomerID = (id) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", id);
    request('/api/web/customer/getCutsomerInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          customerTel : data.data.data.telephone,
          customerIDNum : data.data.data.id_number,
        })
      }else{
        this.setState({
          customerTel : '',
          customerIDNum : '',
        })
      }
    }).catch(()=>{})
  }
  //联想客户
  CustomerNameSearch =  (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    GFHFormData.append("limit",9999);
    request('/api/web/customer/thinkCustomerName',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const CustomerName = data.data.data.rows.map((item)=>{
          return <Option value={item.name}>{item.name}</Option>
        })
        this.setState({CustomerName})
      }
    }).catch(()=>{})
  }
  //联想车牌号
  CarNumberSearch =  (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    GFHFormData.append("limit",9999);
    request('/api/web/vehicle/thinkVehicleLicensePlateNo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const carName = data.data.data.rows.map((item)=>{
          return <Option value={item.license_plate_no}>{item.license_plate_no}</Option>
        })

        let CarModel = ''

        data.data.data.rows.map(item => {
          if(item.license_plate_no === value){
            CarModel =  item.vehicle_template;
          }else{
            CarModel = ''
          }
        })


        this.setState({carName,CarModel})
      }
    }).catch(()=>{})
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
    };
    const config1 = {
      rules: [{ type: 'object', required: false, message: '请选择具体时间!' }],
    };
    //验车记录
    const checkColumn = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '保单复印件', dataIndex: 'is_insurance', key: 'is_insurance',
        render: (text,record) =>
          <div>
            {record.is_insurance==1 && <span>有</span>}
            {record.is_insurance==0 && <span style={{color:'red'}}>无</span>}
          </div>
      },
      { title: '行驶证', dataIndex: 'is_travel', key: 'is_travel',
        render: (text,record) =>
          <div>
            {record.is_travel==1 && <span>有</span>}
            {record.is_travel==0 && <span style={{color:'red'}}>无</span>}
          </div>
      },
      { title: '营运证', dataIndex: 'is_operate', key: 'is_operate',
        render: (text,record) =>
          <div>
            {record.is_operate==1 && <span>有</span>}
            {record.is_operate==0 && <span style={{color:'red'}}>无</span>}
          </div>
      },
      { title: '公里数', dataIndex: 'even_number', key: 'even_number',},
      { title: '验车状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==1 && <span>无车损</span>}
            {record.status==0 && <Badge status="error" text="有车损" />}
          </div>
      },
      { title: '完成时间', dataIndex: 'validata_time', key: 'validata_time',},
    ];
    //租车记录
    const RentColumn = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',  },
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time',  },
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit',},
      { title: '租车类型', dataIndex: 'type', key: 'type',
        render: (text,record) =>
          <div>
            {record.type==1 && <span>月租</span>}
            {record.type==2 && <span>日租</span>}
            {record.type==3 && <span>以租代购</span>}
          </div>
      },
      { title: '租车状态', dataIndex: 'rent_vehicle_status', key: 'rent_vehicle_status',
        render: (text,record) =>
          <div>
            {record.rent_vehicle_status==1 && <span>正常租车</span>}
            {record.rent_vehicle_status==0 && <span>已退车</span>}
          </div>
      },
    ];
    //违章记录
    const WZColumn = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
      { title: '违章时间', dataIndex: 'violation_time', key: 'violation_time',},
      { title: '违章地点', dataIndex: 'violation_address', key: 'violation_address',  },
      { title: '详细内容', dataIndex: 'content', key: 'content',  },
      { title: '违章金额', dataIndex: 'price', key: 'price',},
      { title: '违章扣分', dataIndex: 'score', key: 'score',},
      { title: '状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 && <span>未处理</span>}
            {record.status==1 && <span>已处理</span>}
          </div>
      },
    ];

    return (
      <div>
        <Card title={<div>租车记录</div>} style={{marginBottom:24}}>
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout}
                label="租车类型"
              >
                  <Select value={this.state.type} placeholder="请选择租车类型" onChange={this.selectType} >
                    <Option value={1}>月租</Option>
                    <Option value={2}>日租</Option>
                    <Option value={3}>以租代购</Option>
                  </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="车牌号"
              >
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete disabled={this.state.licensePlateNodisabled} dataSource={this.state.carName} onChange={this.CarNumberSearch} placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="品牌车型">
                <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="客户姓名"
              >
                {getFieldDecorator('customer_name', {
                  rules: [
                    { required: true, message: '请输入客户姓名!' },
                  ],
                })(
                  <AutoComplete dataSource={this.state.CustomerName} disabled={this.state.licensePlateNodisabled} onSearch={this.CustomerNameSearch} onChange={this.searchCustomer}  placeholder="请输入客户姓名"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="客户身份证号">
                    <Input value={this.state.customerIDNum} disabled={true} placeholder="客户身份证号会自动联想" />
              </FormItem>
              <FormItem {...formItemLayout} label="客户联系方式">
                  <Input value={this.state.customerTel} disabled={true} placeholder="客户联系方式会自动联想" />
              </FormItem>
              <FormItem
                {...formItemLayout} label="合同编号">
                {getFieldDecorator('contract_no', {
                  rules: [{required: false, message: '请输入合同编号!',}],
                })(
                  <Input placeholder="请输入合同编号" />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="合同开始日期">
                {getFieldDecorator('contract_start_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="合同结束日期">
                {getFieldDecorator('contract_end_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="提车日期">
                {getFieldDecorator('delivery_vehicle_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="退车日期">
                {getFieldDecorator('refund_vehicle_time',config1)(
                  <DatePicker />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout} label="租金(元)">
                {getFieldDecorator('rent_month_amount', {
                  rules: [{required: true, message: '请输入租金!',}],
                })(
                  <InputNumber min={0}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="押金(元)">
                {getFieldDecorator('deposit', {
                  rules: [{required: true, message: '请输入押金!',}],
                })(
                  <InputNumber min={0}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="管理费(元)">
                {getFieldDecorator('manager_amount', {
                  rules: [{required: false, message: '请输入管理费!',}],
                })(
                  <InputNumber min={0}/>
                )}
              </FormItem>
              {
                this.state.type != 2 &&
                <FormItem
                  {...formItemLayout} label="下次交租金日期">
                  {getFieldDecorator('next_refund_time', config)(
                    <DatePicker/>
                  )}
                </FormItem>
              }
              {
                this.state.type==2 &&
                <div>
                  <FormItem
                    {...formItemLayout} label="基础保险费(元)">
                    {getFieldDecorator('basic_premium', {
                      rules: [{required: false, message: '请输入基础保险费!',}],
                    })(
                      <InputNumber min={0}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="不计免赔保险费(元)">
                    {getFieldDecorator('other_basic_premium', {
                      rules: [{required: false, message: '请输入不计免赔保险费!',}],
                    })(
                      <InputNumber min={0}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="租期(天)">
                    {getFieldDecorator('rent_days', {
                      rules: [{required: false, message: '请输入租期!',}],
                    })(
                      <InputNumber min={0} onChange={this.TotalAmount}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="总计金额(元)">
                    {getFieldDecorator('total_amount', {
                      rules: [{required: false, message: '请输入总计金额!',}],
                    })(
                      <InputNumber min={0}/>
                    )}
                  </FormItem>
                </div>
              }
              <FormItem
                {...formItemLayout}
                label="租车状态"
              >
                  <Select value={this.state.rent_vehicle_status} placeholder="请选择租车状态" onChange={this.selectRentStatus}>
                    <Option value={1}>正常租车</Option>
                    <Option value={0}>已退车</Option>
                  </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="押金状态"
              >
                  <Select  value={this.state.deposit_status} placeholder="请选择押金状态" onChange={this.selectDepositStatus}>
                    <Option value={0}>未退</Option>
                    <Option value={1}>已退</Option>
                  </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入备注',}],
                })(
                  <TextArea placeholder="如需备注，请输入备注信息"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                {
                  this.state.ADDNewRoecord == 1 &&
                  <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddRentRecordSubmit} type="primary">确认增加</Button>
                }
                {
                  this.state.ADDNewRoecord != 1 &&
                  <div className={styles.TagBtnDiv}>
                    <Button disabled={this.state.ButtonDisabled} loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddRentRecordSubmit} type="primary">确认修改</Button>
                    <Button disabled={this.state.ButtonDisabled} className={styles.formButton} style={{marginLeft:'15px'}} onClick={()=>window.open("/#/ShowContract?entity_id="+this.state.entity_id,"_blank")} type="primary">合同打印</Button>
                  </div>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
        <Card title="验车记录" style={{marginBottom:24}}>
          <Table scroll={{x: 600}} columns={checkColumn} dataSource={this.state.checkCarData}></Table>
        </Card>
        <Card title="租车记录" style={{marginBottom:24}}>
          <Table scroll={{x: 600}} columns={RentColumn} dataSource={this.state.RentCarData}></Table>
        </Card>
        <Card title="违章记录" style={{marginBottom:24}}>
          <Table scroll={{x: 600}} columns={WZColumn} dataSource={this.state.ViolationCarData}></Table>
        </Card>
      </div>
    );
  }
}
const NewCarNotes = Form.create()(newCarNotes);

export default NewCarNotes;
