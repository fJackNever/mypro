import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import $ from 'jquery';
import {Form,Input,notification, Card,Select, Button,message,Alert} from 'antd';

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
class addEmployees extends PureComponent {
  state = {
    role:0,
    status:1,
    ButtonLoading:false,
    isNew:0
  }
  componentDidMount() {
    /*查看是否是显示新手教学*/
    if(window.location.href.split('is_new=')[1]){
      $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.65);'></div>");
      this.setState({
        isNew:1,
      })
    }
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
  }
  AddEmployeeSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          ButtonLoading:true
        })
        let AddFormData = new FormData();
        AddFormData.append('key','diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('name',values.name);
        AddFormData.append('telephone',values.telephone);
        AddFormData.append('password',values.password);
        AddFormData.append('status',this.state.status);
        AddFormData.append('role',this.state.role);
        request('/api/web/staff/addAction',{
          method:'POST',
          body:AddFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({
            ButtonLoading:false
          })
          if(data.data.code==1){
            message.success('成功新增员工！');
            $("#Showed").remove()
            if(window.location.href.split('is_new=')[1]){
              this.props.history.push('/Setting/Employees?is_new=2');
            }else{
              this.props.history.push('/Setting/Employees');
            }
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //选择角色
  changeRole = (value)=>{
    this.setState({
      role:value
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
      <div style={{position:'relative',zIndex:'1010',}}>
        {
          this.state.isNew!=0 &&
          <Alert
            style={{marginBottom:24}}
            message="新增第一位员工"
            description={<div style={{marginTop:'15px'}}>
              <p>目前分为多种角色进行方便的管理</p>
              <p>管理员（经理）：拥有全部权限；车管：拥有车辆管理、登记车辆记录权限；销售：拥有签约、车辆上架权限；财务：拥有记录财务收款、付款权限；驾管：拥有车辆信息、客户信息查看权限，无编辑权限；修理厂：拥有记录车辆维修、保养、出险的权限；员工账号可以登录系统（公司号+员工手机号+员工密码）</p>
            </div>}
            type="info"
          />
        }
        <Card title={<div>新增员工</div>}>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="姓名">
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入姓名',}],
                })(
                  <Input placeholder="请输入姓名" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号">
              {getFieldDecorator('telephone', {
                rules: [{required: true, message: '请输入手机号',}],
              })(
                <Input placeholder="请输入手机号" />
              )}
            </FormItem>
              <FormItem {...formItemLayout} label="密码">
                {getFieldDecorator('password', {
                  rules: [{required: true, message: '请输入密码',}],
                })(
                  <Input placeholder="请输入密码" />
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="角色"
              >
                  <Select value={this.state.role} placeholder="请选择员工角色" onChange={this.changeRole}>
                    <Option value={0}>车管</Option>
                    <Option value={1}>驾管</Option>
                    <Option value={2}>财务</Option>
                    <Option value={5}>销售</Option>
                    <Option value={3}>经理</Option>
                    <Option value={6}>保险专员</Option>
                    <Option value={4}>合作修理厂</Option>
                  </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="员工状态"
              >
                  <Select value={this.state.status} placeholder="请选择员工状态" onChange={this.changeStatus}>
                    <Option value={1}>正常</Option>
                    <Option value={0}>停用</Option>
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
const AddEmployees = Form.create()(addEmployees);

export default AddEmployees;
