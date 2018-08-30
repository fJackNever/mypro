import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card, Select,Radio, Button,InputNumber,notification,message } from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";
import utils from "../../../utils/utils";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class showContract extends PureComponent {
  state = {
    deleteLoading:false,
    is_admin:0,
  }
  componentDidMount() {
    let permision = window.localStorage.getItem("permision");
    if(permision==1){this.setState({is_admin:1})}else{this.setState({is_admin:0})}

    if(window.location.href.split('entity_id=')[1]) {
      var UpdatePayRent = new FormData();
      UpdatePayRent.append('key', 'diuber2017');
      UpdatePayRent.append('secret_key', '09e8b1b88e615f0d9650886977af33e9');
      UpdatePayRent.append('entity_id', window.location.href.split('entity_id=')[1]);
    }
    request('/api/web/finance/getContractDeposit',{
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
          CardMoney:data.data.data.rows[0].card_amount,
          RentWXMoney:data.data.data.rows[0].rent_weixin_amount,
          RentALMoney:data.data.data.rows[0].rent_ali_amount,
          RentCashMoney:data.data.data.rows[0].rent_cash_amount,
          RentOtherMoney:data.data.data.rows[0].rent_other_amount,
          RentCardMoney:data.data.data.rows[0].rent_card_amount,
        })
        this.props.form.setFields({
          license_plate_no: {value: data.data.data.rows[0].license_plate_no,},
          customer_name: {value: data.data.data.rows[0].customer_name,},
          weixin_amount: {value: data.data.data.rows[0].weixin_amount,},
          ali_amount: {value: data.data.data.rows[0].ali_amount,},
          card_amount: {value: data.data.data.rows[0].card_amount,},
          cash_amount: {value: data.data.data.rows[0].cash_amount,},
          other_amount: {value: data.data.data.rows[0].other_amount,},
          rent_weixin_amount: {value: data.data.data.rows[0].rent_weixin_amount,},
          rent_ali_amount: {value: data.data.data.rows[0].rent_ali_amount,},
          rent_card_amount: {value: data.data.data.rows[0].rent_card_amount,},
          rent_cash_amount: {value: data.data.data.rows[0].rent_cash_amount,},
          rent_other_amount: {value: data.data.data.rows[0].rent_other_amount,},
          first_amount:{value: data.data.data.rows[0].first_amount},
          manager_amount:{value: data.data.data.rows[0].manager_amount},
          deposit:{value: data.data.data.rows[0].deposit},
          comment:{value: data.data.data.rows[0].comment,},
          pay_time:{value: moment(new Date(data.data.data.rows[0].pay_time).getFullYear()+'-'+(new Date(data.data.data.rows[0].pay_time).getMonth()+1)+'-'+new Date(data.data.data.rows[0].pay_time).getDate())},
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //新增签约收款记录
  AddContractSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        var PayTime = new Date(values.pay_time._d).getFullYear()+'-'+utils.UpdateDate(new Date(values.pay_time._d).getMonth()+1)+'-'+utils.UpdateDate(new Date(values.pay_time._d).getDate());
        let  AddContractData= new FormData();
        AddContractData.append('key','diuber2017');
        AddContractData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        AddContractData.append('id',window.location.href.split('entity_id=')[1]);
        AddContractData.append('pay_time',PayTime);
        AddContractData.append('type',5);
        AddContractData.append('first_amount',values.first_amount);
        AddContractData.append('deposit',values.deposit);
        AddContractData.append('manager_amount',values.manager_amount);
        AddContractData.append('weixin_amount',values.weixin_amount);
        AddContractData.append('ali_amount',values.ali_amount);
        AddContractData.append('cash_amount',values.cash_amount);
        AddContractData.append('other_amount',values.other_amount);
        AddContractData.append('card_amount',values.card_amount);
        AddContractData.append('rent_weixin_amount',values.rent_weixin_amount);
        AddContractData.append('rent_ali_amount',values.rent_ali_amount);
        AddContractData.append('rent_card_amount',values.rent_card_amount);
        AddContractData.append('rent_cash_amount',values.rent_cash_amount);
        AddContractData.append('rent_other_amount',values.rent_other_amount);
        AddContractData.append('comment',values.comment);
        request('/api/web/finance/editContractDeposit',{
          method:'POST',
          body:AddContractData,
          credentials:'include',
        }).then((data)=>{
          if (data.data.code == 1) {
            message.success('成功修改签约收款记录！')
            this.props.history.push('/Money/MoneyManager?paging=ContractPayment')
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
  //押金各支付方式支付金额
  WXMoneyNum = (value) =>{
    this.setState({WXMoney:value})
    this.props.form.setFields({
      deposit:{value:this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  ALMoneyNum = (value) =>{
    this.setState({ALMoney:value})
    this.props.form.setFields({
      deposit:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CashMoneyNum = (value) =>{
    this.setState({CashMoney:value})
    this.props.form.setFields({
      deposit:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  OtherMoneyNum = (value) =>{
    this.setState({OtherMoney:value})
    this.props.form.setFields({
      deposit:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CardMoneyNum = (value) =>{
    this.setState({CardMoney:value})
    this.props.form.setFields({
      deposit:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)}
    })
  }
  //首月租金各支付方式支付金额
  RentWXMoneyNum = (value) =>{
    this.setState({RentWXMoney:value})
    this.props.form.setFields({
      first_amount:{value:this.ChangeNull(value)+this.ChangeNull(this.state.RentALMoney)+this.ChangeNull(this.state.RentCashMoney)+this.ChangeNull(this.state.RentOtherMoney)+this.ChangeNull(this.state.RentCardMoney)}
    })
  }
  RentALMoneyNum = (value) =>{
    this.setState({RentALMoney:value})
    this.props.form.setFields({
      first_amount:{value:this.ChangeNull(this.state.RentWXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.RentCashMoney)+this.ChangeNull(this.state.RentOtherMoney)+this.ChangeNull(this.state.RentCardMoney)}
    })
  }
  RentCashMoneyNum = (value) =>{
    this.setState({RentCashMoney:value})
    this.props.form.setFields({
      first_amount:{value:this.ChangeNull(this.state.RentWXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.RentALMoney)+this.ChangeNull(this.state.RentOtherMoney)+this.ChangeNull(this.state.RentCardMoney)}
    })
  }
  RentOtherMoneyNum = (value) =>{
    this.setState({RentOtherMoney:value})
    this.props.form.setFields({
      first_amount:{value:this.ChangeNull(this.state.RentWXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.RentALMoney)+this.ChangeNull(this.state.RentCashMoney)+this.ChangeNull(this.state.RentCardMoney)}
    })
  }
  RentCardMoneyNum = (value) =>{
    this.setState({RentCardMoney:value})
    this.props.form.setFields({
      first_amount:{value:this.ChangeNull(this.state.RentWXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.RentALMoney)+this.ChangeNull(this.state.RentCashMoney)+this.ChangeNull(this.state.RentOtherMoney)}
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
    const { licenseList } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const formMoneyLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 10 },
    };
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
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
                  <Input disabled placeholder="请输入车牌号" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="客户姓名">
                {getFieldDecorator('customer_name', {
                  rules: [{required: true, message: '请输入客户姓名',}],
                })(
                  <Input disabled placeholder="请输入客户姓名" />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="缴纳日期">
                {getFieldDecorator('pay_time', config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="首次缴纳租金方式"
              >
                <div>
                  <FormItem
                    {...formMoneyLayout}
                    label="微信支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('rent_weixin_amount', {
                      rules: [{required: false, message: '请输入微信支付金额',}],
                    })(
                      <InputNumber
                        onChange={this.RentWXMoneyNum}
                        min={0}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formMoneyLayout}
                    label="支付宝支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('rent_ali_amount', {
                      rules: [{required: false, message: '请输入支付宝支付金额',}],
                    })(
                      <InputNumber
                        onChange={this.RentALMoneyNum}
                        min={0}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formMoneyLayout}
                    label="银行卡支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('rent_card_amount', {
                      rules: [{required: false, message: '请输入银行卡支付金额',}],
                    })(
                      <InputNumber
                        onChange={this.RentCardMoneyNum}
                        min={0}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formMoneyLayout}
                    label="现金支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('rent_cash_amount', {
                      rules: [{required: false, message: '请输入现金支付金额',}],
                    })(
                      <InputNumber
                        onChange={this.RentCashMoneyNum}
                        min={0}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    {...formMoneyLayout}
                    label="其他支付"
                    style={{width:'50%',display:'inline-block'}}
                  >
                    {getFieldDecorator('rent_other_amount', {
                      rules: [{required: false, message: '请输入其他支付金额',}],
                    })(
                      <InputNumber
                        onChange={this.RentOtherMoneyNum}
                        min={0}
                      />
                    )}
                  </FormItem>
                </div>
              </FormItem>
              <FormItem {...formItemLayout} label="首租金缴纳金额">
                {getFieldDecorator('first_amount', {
                  rules: [{required: true, message: '请输入首租金缴纳金额',}],
                })(
                  <Input placeholder="请输入首租金缴纳金额" />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout}
                label="押金缴纳方式"
              >
                <div>
                  <FormItem
                    {...formMoneyLayout}
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
                    {...formMoneyLayout}
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
                    {...formMoneyLayout}
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
                    {...formMoneyLayout}
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
                    {...formMoneyLayout}
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
              <FormItem {...formItemLayout} label="押金缴纳金额">
                {getFieldDecorator('deposit', {
                  rules: [{required: true, message: '请输入押金缴纳金额',}],
                })(
                  <Input placeholder="请输入押金缴纳金额" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="管理费缴纳金额">
                {getFieldDecorator('manager_amount', {
                  rules: [{required: true, message: '请输入管理费缴纳金额',}],
                })(
                  <Input placeholder="请输入管理费缴纳金额" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入备注',}],
                })(
                  <TextArea placeholder="请输入签约收款备注信息"  rows={4} />
                )}
              </FormItem>
              {
                this.state.is_admin==1 &&
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                    <Button loading={this.state.deleteLoading} className={styles.formButton} onClick={this.DeleteListItem} type="danger" ghost>删除</Button>
                </FormItem>
              }
            </div>
          </Form>
        </Card>
      </div>

    );
  }
}
const ShowContract = Form.create()(showContract);

export default ShowContract;
