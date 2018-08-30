import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,message,notification,Tabs,} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class addBroken extends PureComponent {
  state = {
    ButtonLoading:false,
  }
  componentDidMount() {

  }
  //新增黑名单
  AddPartnerSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({ ButtonLoading:true,})
        let  AddContractData= new FormData();
        AddContractData.append('key','diuber2017');
        AddContractData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        AddContractData.append('name',values.name);
        AddContractData.append('idno',values.idno);
        AddContractData.append('comment',values.comment);
        request('/api/web/admin_setting/addBlackList',{
          method:'POST',
          body:AddContractData,
          credentials:'include',
        }).then((data)=>{
          this.setState({ ButtonLoading:false,})
          if(data.data.code==1){
            message.success('新增黑名单成功 ！');
            this.props.history.push('/BrokenQuery/workplace')
          }else if(data.data.code==90001){
            this.props.history.push('/user/login');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div>
        <Card>
          <Form className={styles.SimpleForm} >
                <div className={styles.formDiv}>
                  <FormItem {...formItemLayout} label="姓名">
                    {getFieldDecorator('name', {
                      rules: [{required: true, message: '请输入增加黑名单记录的姓名',}],
                    })(
                      <Input placeholder="请输入增加黑名单记录的姓名" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="身份证号">
                    {getFieldDecorator('idno', {
                      rules: [{required: true, message: '请输入增加黑名单记录的身份证号',}],
                    })(
                      <Input placeholder="请输入增加黑名单记录的身份证号" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="描述">
                    {getFieldDecorator('comment', {
                      rules: [{required: true, message: '请输入描述',}],
                    })(
                      <TextArea rows={4}  maxlength="200" placeholder="请输入增加黑名单记录的具体描述，不能超过200个字符"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                     <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddPartnerSubmit} type="primary">确认新增</Button>
                  </FormItem>
                </div>
              </Form>
        </Card>
      </div>
    );
  }
}
const AddBroken = Form.create()(addBroken);

export default AddBroken;
