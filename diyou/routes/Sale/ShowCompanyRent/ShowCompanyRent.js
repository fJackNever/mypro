import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,notification, Card,Select, Button,DatePicker,message } from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class showCompanyRent extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    role:0,
    status:1,
    ButtonLoading:false
  }
  componentDidMount() {
    if(window.location.href.split('OrderId=')[1]) {
      this.setState({
        licensePlateNodisabled:true,
      })
      this.getCompanyInfo(window.location.href.split('OrderId=')[1]);
    }

  }
  //获取公司求租信息
  getCompanyInfo = (target)=>{
    let AddFormData = new FormData();
    AddFormData.append('key','diuber2017');
    AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData.append('id',target);
    request('/api/web/show/getCompanyWantRent',{
      method:'POST',
      body:AddFormData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          id:data.data.data.rows[0].id,
          status:data.data.data.rows[0].status
        })
        this.props.form.setFields({
          name: {value: data.data.data.rows[0].name},
          telephone: {value: data.data.data.rows[0].telephone},
          telephone: {value: data.data.data.rows[0].telephone},
          template: {value: data.data.data.rows[0].template},
          hope_time: {value: moment(data.data.data.rows[0].hope_time)},
        })
      }
    }).catch(()=>{})
  }
  AddEmployeeSubmit = ()=>{
    this.setState({
      ButtonLoading:true
    })
    this.props.form.validateFields((err, values) => {
      if(!err){
        let AddFormData = new FormData();
        AddFormData.append('key','diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('id',this.state.id);
        AddFormData.append('status',this.state.status);
        request('/api/web/show/changeWantRentStatus',{
          method:'POST',
          body:AddFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({
            ButtonLoading:false
          })
          if(data.data.code==1){
            message.success('修改公司求租记录成功');
            this.props.history.push('/Sale/SaleManager?ListTitle=7');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //选择状态
  changeStatus = (value)=>{
    this.setState({
      status:value
    })
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
        <Card>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="姓名">
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入姓名',}],
                })(
                  <Input placeholder="请输入姓名"  disabled={this.state.licensePlateNodisabled}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号">
                {getFieldDecorator('telephone', {
                  rules: [{required: true, message: '请输入手机号',}],
                })(
                  <Input placeholder="请输入手机号"  disabled={this.state.licensePlateNodisabled}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="品牌车型">
                {getFieldDecorator('template', {
                  rules: [{required: true, message: '请输入品牌车型',}],
                })(
                  <Input placeholder="请输入品牌车型"  disabled={this.state.licensePlateNodisabled}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="希望时间">
                {getFieldDecorator('hope_time', config)(
                  <DatePicker  disabled={this.state.licensePlateNodisabled}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="处理状态"
              >
                <Select value={this.state.status} placeholder="请选择处理状态" onChange={this.changeStatus}>
                  <Option value={0}>未处理</Option>
                  <Option value={1}>已处理</Option>
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                <Button loading={this.state.ButtonLoading} className={styles.formButton}  onClick={this.AddEmployeeSubmit} type="primary">确认增加</Button>
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const ShowCompanyRent = Form.create()(showCompanyRent);

export default ShowCompanyRent;
