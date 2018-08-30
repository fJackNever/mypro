import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select, InputNumber, AutoComplete, Button, message,notification} from 'antd';

import styles from './../NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class Workplaces extends PureComponent {
  state = {
    type:1,
    sign_status:0,
    ButtonLoading:false,
    CarModel:''
  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      contract_end_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 2) + '-' + new Date(toDay).getDate())},
      contract_start_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      delivery_vehicle_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      contract_no:{value:new Date(toDay).getFullYear()+ this.checkDate(new Date(toDay).getMonth() + 1) + new Date(toDay).getDate()+new Date().getTime()}
    })
  }
  checkDate =(target)=>{if(target<10){return '0'+target;}else{return target;}}
  //新增签约记录
  AddSignSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          ButtonLoading: true
        })
        let AddMonthRentData = new FormData();
        AddMonthRentData.append('key', 'diuber2017');
        AddMonthRentData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddMonthRentData.append('type', this.state.type);
        AddMonthRentData.append('license_plate_no', values.license_plate_no);
        AddMonthRentData.append('customer_name', values.customer_name);
        AddMonthRentData.append('contract_start_time',new Date(values.contract_start_time._d).getFullYear()+'-'+(new Date(values.contract_start_time._d).getMonth()+1)+'-'+new Date(values.contract_start_time._d).getDate());
        AddMonthRentData.append('contract_end_time',new Date(values.contract_end_time._d).getFullYear()+'-'+(new Date(values.contract_end_time._d).getMonth()+1)+'-'+new Date(values.contract_end_time._d).getDate());
        AddMonthRentData.append('delivery_vehicle_time',new Date(values.delivery_vehicle_time._d).getFullYear()+'-'+(new Date(values.delivery_vehicle_time._d).getMonth()+1)+'-'+new Date(values.delivery_vehicle_time._d).getDate());
        AddMonthRentData.append('rent_month_amount', values.rent_month_amount);
        AddMonthRentData.append('deposit', values.deposit);
        if(values.manager_amount){AddMonthRentData.append('manager_amount', values.manager_amount);}
        if(values.contract_no){AddMonthRentData.append('contract_no', values.contract_no);}
        if(values.basic_premium){AddMonthRentData.append('basic_premium',values.basic_premium);}
        if(values.other_basic_premium){AddMonthRentData.append('other_basic_premium',values.other_basic_premium);}
        if(values.rent_days){AddMonthRentData.append('rent_days',values.rent_days);}
        if(values.total_amount){var total_amount = values.rent_month_amount*values.rent_days+values.manager_amount+values.basic_premium+values.other_basic_premium;AddMonthRentData.append('total_amount',total_amount);}
        if(values.comment){AddMonthRentData.append('comment', values.comment);}
        request('/api/web/show/addSignRecord',{
          method:'POST',
          body:AddMonthRentData,
          credentials: 'include',
        }).then((data)=> {
          this.setState({
            ButtonLoading:false
          })
          if(data.data.code==1){
            message.success('新增待签约记录成功');
            this.props.history.push('/Sale/SaleManager?ListTitle=6');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //车辆具体信息多选
  onChange = (checkedList) => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    });
  }
  //选择租车类型
  changeType = (value) =>{
    this.setState({
      type:value
    })
  }
  //自动计算总金额
  TotalAmount = (value)=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.props.form.setFields({
          total_amount: {value:values.rent_month_amount*value+values.manager_amount+values.basic_premium+values.other_basic_premium+values.deposit}
        })
      }
    })
  }
  //更改签约状态
  selectSignStatus = (value) =>{
    this.setState({
      sign_status:value
    })
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
  searchCarNo =  (value)=>{
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
    return (
      <div>
        <div style={{margin:24}}>
          <Card  title={<div>签约记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 签订租车合同 )</span></div>} >
            <Form className={styles.form}>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout}
                  label="租车类型"
                >
                  <Select value={this.state.type} onChange={this.changeType} placeholder="请选择车辆租车类型">
                    <Option value={1}>月租</Option>
                    <Option value={2}>日租</Option>
                    <Option value={3}>以租代购</Option>
                  </Select>
                </FormItem>
                <FormItem {...formItemLayout} label="车牌号">
                  {getFieldDecorator('license_plate_no', {
                    rules: [{required: true, message: '请输入车牌号',}],
                  })(
                    <AutoComplete placeholder="请输入车牌号" onChange={this.searchCarNo} dataSource={this.state.carName} disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>

                <FormItem {...formItemLayout} label="品牌车型">
                  <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
                </FormItem>

                <FormItem {...formItemLayout} label="客户姓名 ">
                  {getFieldDecorator('customer_name', {
                    rules: [{required: true, message: '请输入客户姓名 ',}],
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
                <FormItem {...formItemLayout} label="合同编号">
                  {getFieldDecorator('contract_no', {
                    rules: [{required: false, message: '请输入合同编号',}],
                  })(
                    <Input placeholder="请输入合同编号" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="提车日期">
                  {getFieldDecorator('delivery_vehicle_time', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="合同开始日期">
                  {getFieldDecorator('contract_start_time', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="合同结束日期">
                  {getFieldDecorator('contract_end_time', config)(
                    <DatePicker />
                  )}
                </FormItem>
              </div>
              <div className={styles.formDiv}>
                <FormItem {...formItemLayout} label="租金 （元）">
                  {getFieldDecorator('rent_month_amount', {
                    rules: [{required: true, message: '请输入租金',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="押金 （元）">
                  {getFieldDecorator('deposit', {
                    rules: [{required: true, message: '请输入押金',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="管理费 （元）">
                  {getFieldDecorator('manager_amount', {
                    rules: [{required: false, message: '请输入管理费',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                {
                  this.state.type==2 &&
                  <div>
                    <FormItem
                      {...formItemLayout} label="基础保险费(元)">
                      {getFieldDecorator('basic_premium', {
                        rules: [{required: false, message: '请输入基础保险费!',}],
                      })(
                        <InputNumber min={1}/>
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout} label="不计免赔保险费(元)">
                      {getFieldDecorator('other_basic_premium', {
                        rules: [{required: false, message: '请输入不计免赔保险费!',}],
                      })(
                        <InputNumber min={1}/>
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout} label="租期(天)">
                      {getFieldDecorator('rent_days', {
                        rules: [{required: false, message: '请输入租期!',}],
                      })(
                        <InputNumber min={1} onChange={this.TotalAmount}/>
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout} label="总计金额(元)">
                      {getFieldDecorator('total_amount', {
                        rules: [{required: false, message: '请输入总计金额!',}],
                      })(
                        <InputNumber min={1} max={999999}/>
                      )}
                    </FormItem>
                  </div>
                }
                <FormItem
                  {...formItemLayout}
                  label="签约状态"
                >
                  <Select value={this.state.sign_status} placeholder="请选择签约状态" onChange={this.selectSignStatus}>
                    <Option value={0}>未签约</Option>
                  </Select>
                </FormItem>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('comment', {
                    rules: [{required: false, message: '请输入备注',}],
                  })(
                    <TextArea placeholder="如需备注，请记录备注信息"  rows={4} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                  <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddSignSubmit} type="primary">确认增加</Button>
                </FormItem>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}
const Workplace = Form.create()(Workplaces);

export default Workplace;
