import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select,Radio, Button,InputNumber,notification,message } from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class addPayment extends PureComponent {
  state = {
    licenseList:[],
    roleVal:1,
    roleName:'客户姓名'
  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      expend_time:{value: moment(new Date(toDay).getFullYear()+'-'+(new Date(toDay).getMonth()+1)+'-'+new Date(toDay).getDate())},
      weixin_amount:{value:0},
      ali_amount:{value:0},
      cash_amount:{value:0},
      card_amount:{value:0},
      other_amount:{value:0},
      pay_amount:{value:0},
      comment:{value:''},
    })
  }
  //选择收款角色
  ChangeRole = (e)=>{
    if(e.target.value==1){
      this.setState({
        roleName:'客户姓名'
      })
    }else if(e.target.value==2){
      this.setState({
        roleName:'合作伙伴'
      })
    }
  }
  //增加其他收款
  AddOtherPaymentSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        var startTime = new Date(values.expend_time._d).getFullYear()+'-'+(new Date(values.expend_time._d).getMonth()+1)+'-'+new Date(values.expend_time._d).getDate();
        let AddPaymentData = new FormData();
        if(values.collection_type==1){
          AddPaymentData.append('customer_name',values.name);
        }else if(values.collection_type==2){
          AddPaymentData.append('partner_name',values.name);
        }
        AddPaymentData.append('key','diuber2017');
        AddPaymentData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        AddPaymentData.append('license_plate_no',values.license_plate_no);
        AddPaymentData.append('expend_time',startTime);
        AddPaymentData.append('pay_type',5);
        AddPaymentData.append('collection_type',values.collection_type);
        AddPaymentData.append('weixin_amount',values.weixin_amount);
        AddPaymentData.append('ali_amount',values.ali_amount);
        AddPaymentData.append('cash_amount',values.cash_amount);
        AddPaymentData.append('other_amount',values.other_amount);
        AddPaymentData.append('card_amount',values.card_amount);
        AddPaymentData.append('pay_amount',values.pay_amount);
        AddPaymentData.append('comment',values.comment);
        request('/api/web/finance/addCollection',{
          method:'POST',
          body:AddPaymentData,
          credentials:'include',
        }).then((data)=>{
          if (data.data.code == 1) {
            message.success('成功新增付款记录！');
            this.props.history.push('/Money/MoneyManager?paging=Spending')
          } else {
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //自动改变缴纳总金额
  ChangeNull = (target) =>{
    if(!target){
      return 0;
    }else{
      return target;
    }
  }
  WXMoneyNum = (value) =>{
    this.setState({WXMoney:value})
    this.props.form.setFields({
      pay_amount:{value:this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  ALMoneyNum = (value) =>{
    this.setState({ALMoney:value})
    this.props.form.setFields({
      pay_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CashMoneyNum = (value) =>{
    this.setState({CashMoney:value})
    this.props.form.setFields({
      pay_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  OtherMoneyNum = (value) =>{
    this.setState({OtherMoney:value})
    this.props.form.setFields({
      pay_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CardMoneyNum = (value) =>{
    this.setState({CardMoney:value})
    this.props.form.setFields({
      pay_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)}
    })
  }
  render() {
    const { licenseList,roleName,roleVal } = this.state;
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
        <Card title={<div>付款记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 客户、合作伙伴付款 )</span></div>}>
          <Form className={styles.form}>
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <Input placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="收款方角色">
                {getFieldDecorator('collection_type', {
                  rules: [{required: true, message: '请选择收款方角色',}],
                })(
                  <RadioGroup onChange={this.ChangeRole} setFieldsValue={this.state.roleVal}>
                    <Radio value={1}>客户</Radio>
                    <Radio value={2}>合作伙伴</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={roleName}>
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入角色名称',}],
                })(
                  <Input placeholder='请输入角色名称' />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="缴纳日期">
                {getFieldDecorator('expend_time', config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="交租金方式"
              >
                <div>
                  <FormItem
                    {...formItemLayout}
                    label="微信支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('weixin_amount', {
                      rules: [{required: false, message: '请输入微信支付金额',}],
                    })(
                      <InputNumber
                        min={0}
                        onChange={this.WXMoneyNum}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="支付宝支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('ali_amount', {
                      rules: [{required: false, message: '请输入支付宝支付金额',}],
                    })(
                      <InputNumber
                        min={0}
                        onChange={this.ALMoneyNum}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="银行卡支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('card_amount', {
                      rules: [{required: false, message: '请输入银行卡支付金额',}],
                    })(
                      <InputNumber
                        min={0}
                        onChange={this.CardMoneyNum}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="现金支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('cash_amount', {
                      rules: [{required: false, message: '请输入现金支付金额',}],
                    })(
                      <InputNumber
                        min={0}
                        onChange={this.CashMoneyNum}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="其他支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('other_amount', {
                      rules: [{required: false, message: '请输入其他支付金额',}],
                    })(
                      <InputNumber
                        min={0}
                        onChange={this.OtherMoneyNum}
                      />
                    )}
                  </FormItem>
                </div>
              </FormItem>
              <FormItem {...formItemLayout} label="首租金缴纳金额">
                {getFieldDecorator('pay_amount', {
                  rules: [{required: true, message: '请输入首租金缴纳金额',}],
                })(
                  <Input placeholder="请输入首租金缴纳金额" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: true, message: '请输入备注',}],
                })(
                  <TextArea placeholder="请输入签约收款备注信息"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                <Button className={styles.formButton} onClick={()=>this.AddOtherPaymentSubmit()} type="primary">确认增加</Button>
              </FormItem>
            </div>

          </Form>
        </Card>
      </div>
    );
  }
}
const AddPayment = Form.create()(addPayment);

export default AddPayment;
