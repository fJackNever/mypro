import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card, Row, Col, Select,Radio, Button,Table,notification,AutoComplete,InputNumber,message } from 'antd';

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
    accident_amount:0,
    annual_amount:0,
    maintain_amount:0,
    keep_amount:0,
    violation_amount:0,
    total_amount:0,
    need_deposit:0,
  });
};

class addRefundDeposit extends PureComponent {
  state = {
    licenseList:[]
  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      refund_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      deposit_refund_status: {value:'已退清'},
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
    this.setState({license_plate_no:value})
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('search',value);
    QuickreFormData.append('status',0);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if (data.data.code == 1) {
        var licenseList = data.data.data.rows.map((item) => {
          return <Option key={item.entity_id}>{item.license_plate_no+' => '+item.customer_name}</Option>;
        });
        this.setState({ licenseList });
      }
    }).catch(()=>{})
  }
  //最后选定的车牌号
  AboutValueSelect = (value)=> {
    this.setState({licenseNo:value})
    let QuickreFormData = new FormData();
    QuickreFormData.append('key','diuber2017');
    QuickreFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreFormData.append('entity_id',value);
    QuickreFormData.append('status',1);
    request('/api/web/vehicle/getRentInfo',{
      method:'POST',
      body:QuickreFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          license_plate_no:data.data.data.license_plate_no,
          vehicle_id:data.data.data.vehicle_id,
          customer_id:data.data.data.customer_id,
        })
        this.props.form.setFields({
          customer_name:{value:data.data.data.customer_name},
          deposit_refund_amount:{value:data.data.data.deposit},
        })
        this.Quicker();
      }
    })
  }
  //快速查询按钮
  Quicker = () =>{
    let QuickreListFormData = new FormData();
    QuickreListFormData.append('key','diuber2017');
    QuickreListFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    QuickreListFormData.append('vehicle_id',this.state.vehicle_id);
    QuickreListFormData.append('customer_id',this.state.customer_id);
    QuickreListFormData.append('license_plate_no',this.state.license_plate_no);
    request('/api/web/finance/getDepositAllInfo',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        accident_amount:data.data.data.accident_amount,
        annual_amount:data.data.data.annual_amount,
        maintain_amount:data.data.data.maintain_amount,
        keep_amount:data.data.data.keep_amount,
        violation_amount:data.data.data.violation_amount,
        total_amount:data.data.data.total_amount,
        need_deposit:data.data.data.need_deposit,
      })
    }).catch(()=>{})
    //获取车辆保养记录
    request('/api/web/vehicle/getKeepRecord',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        KeepRecordData:data.data.data.rows
      })
    }).catch(()=>{})
    // 获得车辆维修记录
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        MaintenanceRecordData:data.data.data.rows
      })
    }).catch(()=>{})
    // 获取车辆年检记录
    request('/api/web/vehicle/getSurveryRecord',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        SurveryRecordData:data.data.data.rows
      })
    }).catch(()=>{})
    // 获取车辆出险记录
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        AccidentRecordData:data.data.data.rows
      })
    }).catch(()=>{})
    // 获取车辆违章记录
    request('/api/web/vehicle/getViolationRecord',{
      method:'POST',
      body:QuickreListFormData,
      credentials:'include',
    }).then((data)=>{
      this.setState({
        ViolationRecordData:data.data.data.rows
      })
    }).catch(()=>{})
  }
  //添加退押金记录
  addRefundDepositSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        var deposit_refund_status = 0;
        if(values.deposit_refund_status=="已退清"){
          deposit_refund_status = 1;
        }
        var startTime = new Date(values.refund_time._d).getFullYear()+'-'+(new Date(values.refund_time._d).getMonth()+1)+'-'+new Date(values.refund_time._d).getDate();
        let AddListFormData = new FormData();
        AddListFormData.append('key','diuber2017');
        AddListFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddListFormData.append('customer_name',values.customer_name);
        AddListFormData.append('license_plate_no',this.state.license_plate_no);
        AddListFormData.append('deposit_refund_time',startTime);
        AddListFormData.append('deposit_refund_type',5);
        AddListFormData.append('deposit_refund_amount',values.deposit_refund_amount);
        AddListFormData.append('deposit_refund_status',deposit_refund_status);
        AddListFormData.append('weixin_amount',values.weixin_amount);
        AddListFormData.append('ali_amount',values.ali_amount);
        AddListFormData.append('card_amount',values.card_amount);
        AddListFormData.append('cash_amount',values.cash_amount);
        AddListFormData.append('other_amount',values.other_amount);
        AddListFormData.append('comment',values.comment);
        request('/api/web/finance/addDepositRefund',{
          method:'POST',
          body:AddListFormData,
          credentials:'include',
        }).then((data)=>{
          if(data.data.code==1){
            message.success('成功新增退押金记录！');
            this.props.history.push('/Money/MoneyManager?paging=RefundDeposit')
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
          this.setState({
            ViolationRecordData:data.data.data.rows
          })
        }).catch(()=>{})
      }
    })
  }
  //更改退押金方式及金额
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
    //维修记录
    const MaintenanceRecord = [
      {  title: '车牌号', dataIndex: 'license_plate_no',},
      {  title: '客户姓名', dataIndex: 'customer_name',},
      {  title: '进厂时间', dataIndex: 'maintain_time',},
      {  title: '修理厂名称', dataIndex: 'partner_name',},
      {  title: '维修总金额', dataIndex: 'total_amount',},
      {  title: '维修状态', dataIndex: 'maintain_status',},
      {  title: '出厂时间', dataIndex: 'maintain_finish_time',},
      {  title: '维修天数', dataIndex: 'use_days',},
      {  title: '延期天数', dataIndex: 'extension_days',},
      {  title: '备注', dataIndex: 'comment',},
    ];
    //保养记录
    const KeepRecord = [
      {  title: '车牌号', dataIndex: 'license_plate_no',},
      {  title: '客户姓名', dataIndex: 'customer_name',},
      {  title: '修理厂名称', dataIndex: 'partner_name',},
      {  title: '保养总金额', dataIndex: 'amount',},
      {  title: '进厂公里数', dataIndex: 'last_vkt',},
      {  title: '进厂时间', dataIndex: 'maintain_finish_time',},
      {  title: '下次保养公里数', dataIndex: 'next_keep_vkt',},
      {  title: '备注', dataIndex: 'comment',},
    ];
    //年检记录
    const SurveryRecord = [
      {  title: '车牌号', dataIndex: 'license_plate_no',},
      {  title: '年检日期', dataIndex: 'annual_survey_time',},
      {  title: '年检处理人', dataIndex: 'annual_survey_manager',},
      {  title: '金额', dataIndex: 'amount',},
      {  title: '下次年检日期', dataIndex: 'next_annual_survery_time',},
      {  title: '备注', dataIndex: 'comment',},
    ];
    //出险记录
    const AccidentRecord = [
      {  title: '车牌号', dataIndex: 'license_plate_no',},
      {  title: '客户姓名', dataIndex: 'customer_name',},
      {  title: '出险时间', dataIndex: 'accident_time',},
      {  title: '责任方', dataIndex: 'responsible_party',},
      {  title: '理赔状态', dataIndex: 'settlement_claims_status',},
      {  title: '己方金额', dataIndex: 'own_amount',},
      {  title: '第三方金额', dataIndex: 'thirdparty_amount',},
      {  title: '修理厂', dataIndex: 'partner_name',},
      {  title: '出厂时间', dataIndex: 'miantain_finsih_time',},
      {  title: '详细描述', dataIndex: 'detail_record',},
      {  title: '备注', dataIndex: 'comment',},
    ];
    //违章记录
    const ViolationRecord = [
      {  title: '车牌号', dataIndex: 'license_plate_no',},
      {  title: '违章时间', dataIndex: 'violation_time',},
      {  title: '违章地点', dataIndex: 'violation_address',},
      {  title: '详细内容', dataIndex: 'content',},
      {  title: '罚款金额', dataIndex: 'price',},
      {  title: '违章扣分', dataIndex: 'score',},
      {  title: '状态', dataIndex: 'status',},
    ];
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
    };
    return (
      <div>
        <Card title={<div>退押金记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 退租车辆、退押金 )</span></div>}>
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
                {...formItemLayout} label="退押金日期">
                {getFieldDecorator('refund_time', config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="退押金方式"
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
              <FormItem {...formItemLayout} label="退押金总金额">
                {getFieldDecorator('deposit_refund_amount', {
                  rules: [{required: true, message: '请输入退押金总金额',}],
                })(
                  <Input placeholder="请输入退押金总金额" />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout}
                label="押金退还状态"
              >
                {getFieldDecorator('deposit_refund_status', {
                  rules: [
                    { required: true, message: '请选择押金退还状态!' },
                  ],
                })(
                  <Select placeholder="请选择押金退还状态">
                    <Option value="0">已退清</Option>
                    <Option value="1">未退清</Option>
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
                <Button className={styles.formButton} onClick = {()=>this.addRefundDepositSubmit()} type="primary">确认增加</Button>
              </FormItem>
              <FormItem {...formItemLayout} label="预计需退押金各项统计：" style={{marginTop:'30px'}}>
                <FormItem {...formMoneyLayout} label="维修费用："  style={{width:'50%',display:'inline-block'}}>
                  <text>￥ {this.state. maintain_amount}</text>
                </FormItem>
                <FormItem {...formMoneyLayout} label="保养费用："  style={{width:'50%',display:'inline-block'}}>
                  <text>￥ {this.state.keep_amount}</text>
                </FormItem>
                <FormItem {...formMoneyLayout} label="出险费用："  style={{width:'50%',display:'inline-block'}}>
                  <text>￥ {this.state.accident_amount}</text>
                </FormItem>
                <FormItem {...formMoneyLayout} label="年检费用："  style={{width:'50%',display:'inline-block'}}>
                  <text>￥ {this.state.annual_amount}</text>
                </FormItem>
                <FormItem {...formMoneyLayout} label="违章费用："  style={{width:'50%',display:'inline-block'}}>
                  <text>￥ {this.state.violation_amount}</text>
                </FormItem>
                <FormItem {...formMoneyLayout} label="总计费用："  style={{width:'50%',display:'inline-block'}}>
                  <text style={{color:'#f50'}}>￥ {this.state.total_amount}</text>
                </FormItem>
              </FormItem>
              <FormItem {...formItemLayout} label="预计退押金金额：">
                <text style={{color:'#f50'}}>￥ {this.state.need_deposit}</text>
              </FormItem>
            </div>
          </Form>
        </Card>
        <Card title="维修记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={MaintenanceRecord} dataSource={this.state.MaintenanceRecordData}/>
        </Card>
        <Card title="保养记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={KeepRecord} dataSource={this.state.KeepRecordData}/>
        </Card>
        <Card title="出险记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={AccidentRecord} dataSource={this.state.AccidentRecordData}/>
        </Card>
        <Card title="年检记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={SurveryRecord} dataSource={this.state.SurveryRecordData}/>
        </Card>
        <Card title="违章记录" style={{marginTop:24}}>
          <Table scroll={{x: 600}} columns={ViolationRecord} dataSource={this.state.ViolationRecordData}/>
        </Card>
      </div>
    );
  }
}
const AddRefundDeposit = Form.create()(addRefundDeposit);

export default AddRefundDeposit;
