import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select, InputNumber, AutoComplete , Button,notification,message } from 'antd';

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
class newBorrowCarNotes extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    borrow_vehicle_status:1,
    deposit_status:1,
    ButtonLoading:false,
    ADDNewRoecord:1,
    CarModel:''
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}


    var toDay  = new Date();

    const getQueryString = (name) => {

      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = this.props.location.search.substr(1).match(reg);
      console.log(r)
      if(r!=null)
        return decodeURIComponent(r[2]);
      return null;
    }

    if(getQueryString('license_plate_no')){
      this.props.form.setFields({
        license_plate_no: {value:getQueryString('license_plate_no')}
      })

      const CarModel = getQueryString('vehicle_template')

      this.setState({CarModel})

    }
    if(window.location.href.split('entity_id=')[1]){
      this.setState({
        licensePlateNodisabled:true,
        ADDNewRoecord:0,
      })
      let GFHFormData = new FormData();
      GFHFormData.append('key','diuber2017');
      GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      GFHFormData.append("entity_id", window.location.href.split('entity_id=')[1]);
      request('/api/web/vehicle/getBorrowInfo',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        if(data.data.code==1){
          this.setState({
            RecordId:data.data.data.id,
            borrow_vehicle_status:data.data.data.borrow_vehicle_status,
            deposit_status:data.data.data.deposit_status
          })
          this.props.form.setFields({
            license_plate_no: {value: data.data.data.license_plate_no},
            name: {value: data.data.data.partner_name},
            contract_no: {value: data.data.data.contract_no},
            contract_start_time: {value: moment(data.data.data.contract_start_time)},
            contract_end_time: {value: moment(data.data.data.contract_end_time)},
            delivery_vehicle_time: {value: moment(data.data.data.delivery_vehicle_time)},
            deposit: {value: data.data.data.deposit},
            month_amount:{value: data.data.data.month_amount},
            next_refund_time:{value: moment(data.data.data.next_refund_time)},
            comment: {value: data.data.data.comment},
          })
          if(data.data.data.refund_vehicle_time!='0000-00-00'){
            this.props.form.setFields({
              refund_vehicle_time: {value: moment(data.data.data.refund_vehicle_time)},
            })
          }
        }else{
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      this.setState({
        licensePlateNodisabled:false
      })
      this.props.form.setFields({
        next_refund_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 2) + '-' + new Date(toDay).getDate())},
        contract_end_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 2) + '-' + new Date(toDay).getDate())},
        contract_start_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        delivery_vehicle_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("partner_type", 1);
    request('/api/web/partner/getPartner',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      var CompanyList = data.data.data.rows.map((item) => {
        return <Option key={item.id}>{item.name}</Option>;
      });
      this.setState({CompanyList})
    }).catch(()=>{})
  }

  //新增借车记录
  AddBorrowReocrdSubmit = () =>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ButtonLoading:true})
        if(this.state.ADDNewRoecord==1){
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('license_plate_no',values.license_plate_no);
          AddCarData.append('contract_start_time',new Date(values.contract_start_time._d).getFullYear()+'-'+(new Date(values.contract_start_time._d).getMonth()+1)+'-'+new Date(values.contract_start_time._d).getDate());
          AddCarData.append('contract_end_time',new Date(values.contract_end_time._d).getFullYear()+'-'+(new Date(values.contract_end_time._d).getMonth()+1)+'-'+new Date(values.contract_end_time._d).getDate());
          AddCarData.append('delivery_vehicle_time',new Date(values.delivery_vehicle_time._d).getFullYear()+'-'+(new Date(values.delivery_vehicle_time._d).getMonth()+1)+'-'+new Date(values.delivery_vehicle_time._d).getDate());
          if(values.refund_vehicle_time){
            AddCarData.append('refund_vehicle_time',new Date(values.refund_vehicle_time._d).getFullYear()+'-'+(new Date(values.refund_vehicle_time._d).getMonth()+1)+'-'+new Date(values.refund_vehicle_time._d).getDate());
          }
          AddCarData.append('month_amount',values.month_amount);
          AddCarData.append('deposit',values.deposit);
          AddCarData.append('next_refund_time',new Date(values.next_refund_time._d).getFullYear()+'-'+(new Date(values.next_refund_time._d).getMonth()+1)+'-'+new Date(values.next_refund_time._d).getDate());
          if(values.belong_company){
            AddCarData.append('belong_company',values.belong_company);
          }
          if(values.contract_no){
            AddCarData.append('contract_no',values.contract_no);
          }
          AddCarData.append('borrow_vehicle_status',this.state.borrow_vehicle_status);
          AddCarData.append('deposit_status',this.state.deposit_status);
          if(values.comment){
            AddCarData.append('comment',values.comment);
          }
          request('/api/web/vehicle/addBorrow',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增借车记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=9&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append("id", this.state.RecordId);
          AddCarData.append('contract_start_time',new Date(values.contract_start_time._d).getFullYear()+'-'+(new Date(values.contract_start_time._d).getMonth()+1)+'-'+new Date(values.contract_start_time._d).getDate());
          AddCarData.append('contract_end_time',new Date(values.contract_end_time._d).getFullYear()+'-'+(new Date(values.contract_end_time._d).getMonth()+1)+'-'+new Date(values.contract_end_time._d).getDate());
          AddCarData.append('delivery_vehicle_time',new Date(values.delivery_vehicle_time._d).getFullYear()+'-'+(new Date(values.delivery_vehicle_time._d).getMonth()+1)+'-'+new Date(values.delivery_vehicle_time._d).getDate());
          if(values.refund_vehicle_time){
            AddCarData.append('refund_vehicle_time',new Date(values.refund_vehicle_time._d).getFullYear()+'-'+(new Date(values.refund_vehicle_time._d).getMonth()+1)+'-'+new Date(values.refund_vehicle_time._d).getDate());
          }
          AddCarData.append('month_amount',values.month_amount);
          AddCarData.append('deposit',values.deposit);
          AddCarData.append('next_refund_time',new Date(values.next_refund_time._d).getFullYear()+'-'+(new Date(values.next_refund_time._d).getMonth()+1)+'-'+new Date(values.next_refund_time._d).getDate());
          if(values.contract_no){
            AddCarData.append('contract_no',values.contract_no);
          }
          AddCarData.append('borrow_vehicle_status',this.state.borrow_vehicle_status);
          AddCarData.append('deposit_status',this.state.deposit_status);
            AddCarData.append('comment',values.comment);
          request('/api/web/vehicle/editBorrow',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('更新借车记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=9&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }
  //选择借车状态
  BorrowStatus= (value) =>{
    this.setState({
      borrow_vehicle_status:value
    })
  }
  DepositStatus= (value) =>{
    this.setState({
      deposit_status:value
    })
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
    return (
      <div>
        <Card title={<div>借车记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 向合作伙伴借车 )</span></div>} style={{marginBottom:24}}>
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete disabled={this.state.licensePlateNodisabled} dataSource={this.state.carName} onChange={this.CarNumberSearch} placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="品牌车型">
                <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
              </FormItem>
              {
                this.state.ADDNewRoecord==0 &&
                <FormItem {...formItemLayout} label="合作伙伴名称">
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: '请输入合作伙伴名称',}],
                  })(
                    <Input disabled={this.state.licensePlateNodisabled} placeholder="请输入合作伙伴名称" />
                  )}
                </FormItem>
              }
              {
                this.state.ADDNewRoecord==1 &&
                <FormItem
                  {...formItemLayout}
                  label="合作伙伴名称"
                >
                  {getFieldDecorator('belong_company', {
                    rules: [
                      { required: true, message: '请选择合作伙伴名称!' },
                    ],
                  })(
                    <Select placeholder="请选择合作伙伴名称" disabled={this.state.licensePlateNodisabled}>
                      {this.state.CompanyList}
                    </Select>
                  )}
                </FormItem>
              }
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
                {...formItemLayout} label="还车日期">
                {getFieldDecorator('refund_vehicle_time',config1)(
                  <DatePicker />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout} label="月租金(元)">
                {getFieldDecorator('month_amount', {
                  rules: [{required: true, message: '请输入月租金!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="押金(元)">
                {getFieldDecorator('deposit', {
                  rules: [{required: true, message: '请输入押金!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="下次交租金日期">
                {getFieldDecorator('next_refund_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="借车状态"
              >
                <Select value={this.state.borrow_vehicle_status} placeholder="请选择借车状态" onChange={this.BorrowStatus}>
                  <Option value={1}>正常借车</Option>
                  <Option value={0}>已退车</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="押金状态"
              >
                <Select value={this.state.deposit_status} placeholder="请选择押金状态" onChange={this.DepositStatus}>
                  <Option value={1}>未退</Option>
                  <Option value={0}>已退</Option>
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
                <Button disabled={this.state.ButtonDisabled} loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddBorrowReocrdSubmit} type="primary">确认增加</Button>
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const NewBorrowCarNotes = Form.create()(newBorrowCarNotes);

export default NewBorrowCarNotes;
