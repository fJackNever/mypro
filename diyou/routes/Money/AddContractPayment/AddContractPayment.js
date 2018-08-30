import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card, Select,Radio, Button,InputNumber,AutoComplete,message } from 'antd';

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

class addContractPayment extends PureComponent {
  state = {

  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      pay_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      weixin_amount:{value:0},
      ali_amount:{value:0},
      cash_amount:{value:0},
      card_amount:{value:0},
      other_amount:{value:0},
      comment:{value:''},
      deposit:{value:0},
      rent_weixin_amount:{value:0},
      rent_ali_amount:{value:0},
      rent_cash_amount:{value:0},
      rent_card_amount:{value:0},
      rent_other_amount:{value:0},
      rent_comment:{value:''},
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
  //输入车牌号关键字进行联想
  AboutSelect = (value) => {
    this.setState({
      license_plate_no:value
    })
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('search',value);
    QuickreFormData.append('status',0);
    request('/api/web/vehicle/getSignRecord',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      var licenseList =[];
      if(data.data.code == 1) {
          licenseList = data.data.data.rows.map((item) => {
            return <Option key={item.id+';'+item.customer_name+','+item.license_plate_no}>{item.license_plate_no+' => '+item.customer_name}</Option>;
          });
        this.setState({ licenseList });
      }
    }).catch(()=>{})
  }
  //最后选定的车牌号
  AboutValueSelect = (value)=> {
    this.setState({
      licenseNo:value.split(';')[0],
      license_plate_no:value.split(',')[1],
    })
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('id',value.split(';')[0]);
    request('/api/web/show/getSignRecordInfo',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code == 1) {
        this.props.form.setFields({
          customer_name:{value:value.split(';')[1].split(',')[0]},
          first_amount:{value:data.data.data.rent_month_amount},
          deposit:{value:data.data.data.deposit},
          manager_amount:{value:data.data.data.manager_amount},
        })
      }
    }).catch(()=>{})
  }
  //由最后选定的车牌号来获取其余信息
  ShowContractData =()=>{
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('id',this.state.licenseNo);
    request('/api/web/show/getSignRecordInfo',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code == 1) {
        this.props.form.setFields({
          customer_name:{value:value.split(';')[1]},
          first_amount:{value:data.data.data.rent_month_amount},
          deposit:{value:data.data.data.deposit},
          manager_amount:{value:data.data.data.manager_amount},
        })
      }
    }).catch(()=>{})
  }
  //新增签约收款记录
  AddContractSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({submitLoading:true})
        var PayTime = new Date(values.pay_time._d).getFullYear()+'-'+utils.UpdateDate(new Date(values.pay_time._d).getMonth()+1)+'-'+utils.UpdateDate(new Date(values.pay_time._d).getDate());
        let  AddContractData= new FormData();
        AddContractData.append('key','diuber2017');
        AddContractData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        AddContractData.append('license_plate_no',this.state.license_plate_no);
        AddContractData.append('customer_name',values.customer_name);
        AddContractData.append('pay_time',PayTime);
        AddContractData.append('refund_type',5);
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
        AddContractData.append('deposit',values.deposit);
        AddContractData.append('manager_amount',values.manager_amount);
        AddContractData.append('comment',values.comment);
        AddContractData.append('first_amount',values.first_amount);
        request('/api/web/finance/addContractDeposit',{
          method:'POST',
          body:AddContractData,
          credentials:'include',
        }).then((data)=>{
          this.setState({submitLoading:false})
          if (data.data.code == 1) {
            message.success('成功新增签约收款记录');
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
          <Card title={<div>签约收款记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 租车、签约收款 )</span></div>} >
            <Form className={styles.form}>
              <div className={styles.formDiv}>
                <FormItem {...formItemLayout} label="车牌号">
                  {getFieldDecorator('license_plate_no', {
                    rules: [{required: true, message: '请输入车牌号',}],
                  })(
                    <AutoComplete id="listsearch" dataSource={licenseList} style={{width:'65%',display:'inline-block'}} onSelect = {this.AboutValueSelect} onSearch={this.AboutSelect} placeholder="请输入车牌号"/>
                  )}
                  <Button style={{marginLeft:'10px'}} onClick={()=>this.ShowContractData()}>快速查询</Button>
                </FormItem>
                <FormItem {...formItemLayout} label="客户姓名">
                  {getFieldDecorator('customer_name', {
                    rules: [{required: true, message: '请输入客户姓名',}],
                  })(
                    <Input placeholder="请输入客户姓名" />
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
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                  <Button loading={this.state.submitLoading} className={styles.formButton} onClick={()=>this.AddContractSubmit()} type="primary">确认增加</Button>
                </FormItem>
              </div>
            </Form>
          </Card>
        </div>

    );
  }
}
const AddContractPayment = Form.create()(addContractPayment);

export default AddContractPayment;
