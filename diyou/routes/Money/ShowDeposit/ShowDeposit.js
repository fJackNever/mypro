import React, { PureComponent } from 'react';
import $ from 'jquery';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card, Select,Radio, Button ,InputNumber,notification,message } from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import utils from "../../../utils/utils";
import request from "../../../utils/request";

const dateFormat = 'YYYY-MM-DD';
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

class showDeposit extends PureComponent {
  state = {
    deleteLoading:false,
    is_admin:0,
  }
  componentWillMount() {
    let permision = window.localStorage.getItem("permision");
    if(permision==1){this.setState({is_admin:1})}else{this.setState({is_admin:0})}

    if(window.location.href.split('entity_id=')[1]){
      var UpdatePayRent = new FormData();
      UpdatePayRent.append('key','diuber2017');
      UpdatePayRent.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
      UpdatePayRent.append('entity_id',window.location.href.split('entity_id=')[1]);
    }else{
      var UpdatePayRent = new FormData();
      UpdatePayRent.append('key','diuber2017');
      UpdatePayRent.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    }
    request('/api/web/finance/getDepositRefundRecord',{
      method:'POST',
      body:UpdatePayRent,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        this.setState({
          WXMoney:data.data.data.rows[0].weixin_amount,
          ALMoney:data.data.data.rows[0].ali_amount,
          CashMoney:data.data.data.rows[0].cash_amount,
          OtherMoney:data.data.data.rows[0].other_amount,
          CardMoney:data.data.data.rows[0].card_amount
        })
        if(data.data.data.rows[0].deposit_refund_status==0){
          this.props.form.setFields({
            deposit_refund_status: {value: "未退清",},
          })
        }else{
          this.props.form.setFields({
            deposit_refund_status: {value: "已退清所有押金",},
          })
        }
        this.props.form.setFields({
          license_plate_no: {value: data.data.data.rows[0].license_plate_no,},
          customer_name: {value: data.data.data.rows[0].customer_name,},
          weixin_amount: {value: data.data.data.rows[0].weixin_amount,},
          ali_amount: {value: data.data.data.rows[0].ali_amount,},
          card_amount: {value: data.data.data.rows[0].card_amount,},
          cash_amount: {value: data.data.data.rows[0].cash_amount,},
          other_amount: {value: data.data.data.rows[0].other_amount,},
          deposit_refund_amount:{value: data.data.data.rows[0].deposit_refund_amount},
          comment:{value: data.data.data.rows[0].comment,},
          deposit_refund_time:{value: moment(new Date(data.data.data.rows[0].deposit_refund_time).getFullYear()+'-'+(new Date(data.data.data.rows[0].deposit_refund_time).getMonth()+1)+'-'+new Date(data.data.data.rows[0].deposit_refund_time).getDate())},
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }

  //提交修改内容
  UpdateRentSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if(!err){
        let UpdateRentData = new FormData();
        UpdateRentData.append('key','diuber2017');
        UpdateRentData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        UpdateRentData.append('entity_id',window.location.href.split('entity_id=')[1]);
        UpdateRentData.append('deposit_refund_time',$("#deposit_refund_time input").val());
        if(values.deposit_refund_status=='未退清'){
          UpdateRentData.append('deposit_refund_status',0);
        }else{
          UpdateRentData.append('deposit_refund_status',1)
        }
        UpdateRentData.append('deposit_refund_type',5);
        UpdateRentData.append('deposit_refund_amount',values.deposit_refund_amount);
        if(values.weixin_amount){UpdateRentData.append('weixin_amount',values.weixin_amount);}
        if(values.ali_amount){UpdateRentData.append('ali_amount',values.ali_amount);}
        if(values.card_amount){UpdateRentData.append('card_amount',values.card_amount);}
        if(values.cash_amount){UpdateRentData.append('cash_amount',values.cash_amount);}
        if(values.other_amount){UpdateRentData.append('other_amount',values.other_amount);}
        UpdateRentData.append('comment',values.comment);
        request('/api/web/finance/editDepositRefund',{
          method:'POST',
          body:UpdateRentData,
          credentials:'include',
        }).then((data)=>{
          if (data.data.code == 1) {
            message.success('成功修改退押金记录!');
            this.props.history.push('/Money/MoneyManager?paging=RefundDeposit')
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
      return parseInt(target);
    }
  }
  WXMoneyNum = (value) =>{
    this.setState({WXMoney:value})
    this.props.form.setFields({
      deposit_refund_amount:{value:this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  ALMoneyNum = (value) =>{
    this.setState({ALMoney:value})
    this.props.form.setFields({
      deposit_refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CashMoneyNum = (value) =>{
    this.setState({CashMoney:value})
    this.props.form.setFields({
      deposit_refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  OtherMoneyNum = (value) =>{
    this.setState({OtherMoney:value})
    this.props.form.setFields({
      deposit_refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CardMoneyNum = (value) =>{
    this.setState({CardMoney:value})
    this.props.form.setFields({
      deposit_refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)}
    })
  }
  //删除某条列表
  DeleteListItem = (e) => {
    this.setState({deleteLoading: true})
    let DeleteData = new FormData();
    DeleteData.append('key', 'diuber2017');
    DeleteData.append('secret_key', '09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('entity_id', window.location.href.split('entity_id=')[1]);
    request('/api/web/refund_record/delRecord', {
      method: 'POST',
      body: DeleteData,
      credentials: 'include',
    }).then((data) => {
      if (data.data.code == 1) {
        this.setState({
          deleteLoading: false
        })
        message.success('删除成功！');
        this.props.history.push('/Money/MoneyManager')
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
    };
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div>
        <Card>
          <Form className={styles.form}>
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <Input disabled placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="客户姓名">
                {getFieldDecorator('customer_name', {
                  rules: [{required: true, message: '请输入客户姓名',}],
                })(
                  <Input disabled placeholder='请输入客户姓名' />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="退押金时间">
                {getFieldDecorator('deposit_refund_time', config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="退押金方式"
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
              <FormItem {...formItemLayout} label="退押金总金额">
                {getFieldDecorator('deposit_refund_amount', {
                  rules: [{required: true, message: '请输入退押金总金额',}],
                })(
                  <Input placeholder="请输入退押金总金额" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="退押金状态">
                {getFieldDecorator('deposit_refund_status', {
                  rules: [{required: true, message: '请选择退押金状态',}],
                })(
                  <Select>
                    <Option key="已退清所有押金">已退清所有押金</Option>
                    <Option key="未退清">未退清</Option>
                  </Select>
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
                <Button className={styles.formButton} onClick={()=>this.UpdateRentSubmit()} type="primary">确认修改</Button>
                {
                  this.state.is_admin==1 &&
                  <Button loading={this.state.deleteLoading} className={styles.formButton} style={{marginLeft:'24px'}}  onClick={this.DeleteListItem} type="danger" ghost>删除</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const ShowDeposit = Form.create()(showDeposit);

export default ShowDeposit;
