import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,notification, Card,Select, Button,message} from 'antd';

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
class updateEmployees extends PureComponent {
  state = {
    role:0,
    status:1,
    ButtonLoading:false
  }
  componentDidMount() {
    var id = window.location.href.split('EmployeeID=')[1].split('&EmployeeStatus=')[0];
    var ShowFormData = new FormData();
    ShowFormData.append('key','diuber2017');
    ShowFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowFormData.append('id',id);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:ShowFormData,
      credentials:'include',
    }).then((data)=>{
      this.props.form.setFields({
        name: {value: data.data.data.rows[0].name,},
        telephone: {value: data.data.data.rows[0].telephone,},
        password: {value: data.data.data.rows[0].password,},
      })
      this.setState({
        role:data.data.data.rows[0].role,
        status:data.data.data.rows[0].status,
      })
    }).catch(()=>{})
  }
  AddEmployeeSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({ButtonLoading:true})
        let AddFormData = new FormData();
        AddFormData.append('key','diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('id',window.location.href.split('EmployeeID=')[1].split('&EmployeeStatus=')[0]);
        AddFormData.append('name',values.name);
        AddFormData.append('telephone',values.telephone);
        AddFormData.append('password',values.password);
        AddFormData.append('status',this.state.status);
        AddFormData.append('role',this.state.role);
        request('/api/web/staff/editAction',{
          method:'POST',
          body:AddFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({ButtonLoading:false})
          if(data.data.code==1){
            message.success('成功修改员工信息！')
            this.props.history.push('/Setting/Employees');
          }else{
            openNotificationWithIcon('error', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //选择角色
  changeRole = (value)=>{
    if(this.state.role==4){
      openNotificationWithIcon('error', '嘀友提醒', '该员工身份为合作修理厂，不可更改为其他身份！');
    }else{
      this.setState({
        role:value
      })
    }
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
        <Card title={<div>员工信息</div>}>
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
                  {this.state.role!=4 &&<Option value={0}>车管</Option>}
                  {this.state.role!=4 &&<Option value={1}>驾管</Option>}
                  {this.state.role!=4 &&<Option value={2}>财务</Option>}
                  {this.state.role!=4 &&<Option value={5}>销售</Option>}
                  {this.state.role!=4 &&<Option value={3}>经理</Option>}
                  {this.state.role!=4 &&<Option value={6}>保险专员</Option>}
                  {this.state.role==4 && <Option value={4}>合作修理厂</Option>}
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
                <Button loading={this.state.ButtonLoading} className={styles.formButton}  onClick={this.AddEmployeeSubmit} type="primary">确认修改</Button>
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const UpdateEmployees = Form.create()(updateEmployees);

export default UpdateEmployees;
