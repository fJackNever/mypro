import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select,message, Button,Table,notification,AutoComplete,InputNumber } from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import utils from "../../../utils/utils";
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

class addPayRent extends PureComponent {
  state = {
    licenseList:[],
    addsubmitLoading:false
  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      refund_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      refund_status:{ value:'正常交租金'},
      weixin_amount:{value:0},
      ali_amount:{value:0},
      cash_amount:{value:0},
      card_amount:{value:0},
      other_amount:{value:0},
      comment:{value:''},
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
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('search',value);
    QuickreFormData.append('status',1);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        var licenseList = data.data.data.rows.map((item) => {
          return <Option key={item.id}>{item.license_plate_no+' => '+item.customer_name}</Option>;
        });
        this.setState({ licenseList });
      }
    }).catch(()=>{})
  }
  //最后选定的车牌号
  AboutValueSelect = (value)=> {
    this.setState({
      licenseNo:value
    })
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('id',value);
    QuickreFormData.append('status',1);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        let submitFormData = new FormData();
        submitFormData.append('key','diuber2017');
        submitFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        submitFormData.append('vehicle_id',data.data.data.rows[0].vehicle_id);
        request('/api/web/vehicle/getRentRecord',{
          method:'POST',
          body:submitFormData,
          credentials:'include',
        }).then((data)=>{
          if(data.data.code==1){
            this.setState({
              RentRecordData:data.data.data.rows
            })
          }
        }).catch(()=>{})
        this.setState({
          license_plate_no:data.data.data.rows[0].license_plate_no
        })
        this.props.form.setFields({
          customer_name:{value:data.data.data.rows[0].customer_name},
          refund_amount:{value:data.data.data.rows[0].rent_month_amount},
          next_refund_time:{value:moment(data.data.data.rows[0].next_refund_time)},
        })
      }
    })
  }
  //快速查询按钮
  Quicker = () =>{
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('license_plate_no',this.state.licenseNo);
    request('/api/web/vehicle_rent_record/thinkRefundCustomer',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        var licenseNoIndex = data.data.data.info.license_plate_no.indexOf(this.state.licenseNo);
        var nextRefundTime =data.data.data.info.next_refund_time[licenseNoIndex];
        this.props.form.setFields({
          license_plate_no_name:{value:data.data.data.info.license_plate_no_name[licenseNoIndex]},
          refund_amount:{value:data.data.data.info.rent_month_amount[licenseNoIndex]},
          customer_name:{value:data.data.data.info.customer_name[licenseNoIndex]},
          next_refund_time:{value:moment(new Date(nextRefundTime).getFullYear() + '-' + (new Date(nextRefundTime).getMonth() + 1) + '-' + new Date(nextRefundTime).getDate())},
        })
        let RentRecordFormData = new FormData();
        RentRecordFormData.append('key','diuber2017');
        RentRecordFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        RentRecordFormData.append('customer_id',data.data.data.info.customer_id[licenseNoIndex]);
        RentRecordFormData.append('vehicle_id',data.data.data.info.back_vehicle[licenseNoIndex]);
        request('/api/web/vehicle_rent_record/getRentRecord',{
          method:'POST',
          body:RentRecordFormData,
          credentials:'include',
        }).then((data)=>{
          if (data.data.code == 1) {
            this.setState({
              RentRecordData:data.data.data.rows
            })
          }else{
            this.setState({
              RentRecordData:[]
            })
          }
        }).catch(()=>{})
      }
    }).catch(()=>{})
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
      refund_amount:{value:this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  ALMoneyNum = (value) =>{
    this.setState({ALMoney:value})
    this.props.form.setFields({
      refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CashMoneyNum = (value) =>{
    this.setState({CashMoney:value})
    this.props.form.setFields({
      refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.OtherMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  OtherMoneyNum = (value) =>{
    this.setState({OtherMoney:value})
    this.props.form.setFields({
      refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.CardMoney)}
    })
  }
  CardMoneyNum = (value) =>{
    this.setState({CardMoney:value})
    this.props.form.setFields({
      refund_amount:{value:this.ChangeNull(this.state.WXMoney)+this.ChangeNull(value)+this.ChangeNull(this.state.ALMoney)+this.ChangeNull(this.state.CashMoney)+this.ChangeNull(this.state.OtherMoney)}
    })
  }
  //新增租金收款记录
  AddPayRentSubmit = () =>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({addsubmitLoading:true})
        var refund_status = 0;
        if(values.refund_status=="正常交租金") {
          refund_status = 1;
        }
        var PayTime = new Date(values.refund_time._d).getFullYear()+'-'+utils.UpdateDate(new Date(values.refund_time._d).getMonth()+1)+'-'+utils.UpdateDate(new Date(values.refund_time._d).getDate());
        var NextPayTime = new Date(values.next_refund_time._d).getFullYear()+'-'+utils.UpdateDate(new Date(values.next_refund_time._d).getMonth()+1)+'-'+utils.UpdateDate(new Date(values.next_refund_time._d).getDate());
        let AddPayRentData = new FormData();
        AddPayRentData.append('key', 'diuber2017');
        AddPayRentData.append('secret_key', '09e8b1b88e615f0d9650886977af33e9');
        AddPayRentData.append('license_plate_no', this.state.license_plate_no);
        AddPayRentData.append('customer_name', values.customer_name);
        AddPayRentData.append('refund_time', PayTime);
        AddPayRentData.append('refund_type', 5);
        AddPayRentData.append('refund_amount', values.refund_amount);
        AddPayRentData.append('next_refund_time',NextPayTime);
        AddPayRentData.append('refund_status', refund_status);
        AddPayRentData.append('comment', values.comment);
        AddPayRentData.append('weixin_amount', values.weixin_amount);
        AddPayRentData.append('ali_amount', values.ali_amount);
        AddPayRentData.append('cash_amount', values.cash_amount);
        AddPayRentData.append('other_amount', values.other_amount);
        AddPayRentData.append('card_amount', values.card_amount);
        request('/api/web/finance/addRefund',{
          method:'POST',
          body:AddPayRentData,
          credentials:'include',
        }).then((data)=>{
          this.setState({addsubmitLoading:false})
          if (data.data.code == 1) {
            message.success('成功新增交租金记录！');
            this.props.history.push('/Money/MoneyManager?paging=RentPayment')
          } else {
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
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
    const RentRecordColumn = [
      {
      title: '车牌号',
      dataIndex: 'license_plate_no',
    }, {
      title: '客户姓名',
      dataIndex: 'customer_name',
    }, {
      title: '手机号',
      dataIndex: 'telephone',
    }, {
      title: '合同开始日期',
        dataIndex: 'contract_start_time',
    },{
      title: '合同结束日期',
      dataIndex: 'contract_end_time',
    },{
      title: '租金',
      dataIndex: 'rent_month_amount',
    },{
      title: '押金',
      dataIndex: 'deposit',
    },{
      title: '下次交租金日期',
      dataIndex: 'next_refund_time',
    },{
      title: '租车类型',
      dataIndex: 'type',
      render:(text,record) =>(
        <div>
          {
            record.type==1 &&
            <text>月租</text>
          }
          {
            record.type==2 &&
            <text>日租</text>
          }
          {
            record.type==3 &&
            <text>以租代购</text>
          }
        </div>
      )
    },{
      title: '租车状态',
      dataIndex: 'rent_vehicle_status',
    }];
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
    };
    return (
      <div>
        <Card title={<div>交租金记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 月租、日租、以租代购交租金 )</span></div>} >
            <Form className={styles.form}>
              <div className={styles.formDiv}>
                <FormItem {...formItemLayout} label="车牌号">
                  {getFieldDecorator('license_plate_no', {
                    rules: [{required: true, message: '请输入车牌号',}],
                  })(
                    <AutoComplete dataSource={licenseList} style={{width:'65%',display:'inline-block'}} onSelect = {this.AboutValueSelect} onSearch={this.AboutSelect} placeholder="请输入车牌号"/>
                  )}
                  <Button style={{marginLeft:'10px'}} onClick={()=>this.Quicker()}>快速查询</Button>
                </FormItem>
                <FormItem {...formItemLayout} label="客户姓名">
                  {getFieldDecorator('customer_name', {
                    rules: [{required: true, message: '请输入客户姓名',}],
                  })(
                    <Input placeholder="请输入客户姓名" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="交租金日期">
                  {getFieldDecorator('refund_time', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="交租金方式"
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
                <FormItem {...formItemLayout} label="交租金金额">
                  {getFieldDecorator('refund_amount', {
                    rules: [{required: true, message: '请输入交租金金额',}],
                  })(
                    <Input placeholder="请输入交租金金额" />
                  )}
                </FormItem>
              </div>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout} label="下次交租金日期">
                  {getFieldDecorator('next_refund_time', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="租金缴纳状态"
                >
                  {getFieldDecorator('refund_status', {
                    rules: [
                      { required: true, message: '请选择租金缴纳状态!' },
                    ],
                  })(
                    <Select placeholder="请选择租金缴纳状态">
                      <Option value="正常交租金">正常交租金</Option>
                      <Option value="未还清">未还清</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('comment', {
                    rules: [{required: false, message: '请输入备注',}],
                  })(
                    <TextArea placeholder="请输入缴纳租金备注信息"  rows={4} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                  <Button loading={this.addsubmitLoading} className={styles.formButton} onClick={()=>this.AddPayRentSubmit()} type="primary">确认增加</Button>
                </FormItem>
              </div>
            </Form>
          </Card>
        <Card title="租车记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={RentRecordColumn} dataSource={this.state.RentRecordData}/>
        </Card>
      </div>
    );
  }
}
const AddPayRent = Form.create()(addPayRent);

export default AddPayRent;
