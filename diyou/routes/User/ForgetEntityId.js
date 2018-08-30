import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import $ from 'jquery';
import { Form, Input, Button, Row, Col, Popover,notification,Divider } from 'antd';
import styles from './Register.less';
import request from '../../utils/request';

const FormItem = Form.Item;
const InputGroup = Input.Group;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class forgetEntityId extends Component {
  state = {
    is_show:0,
    checkLoading:false,
  };

  //查询公司号
  checkEntityId = ()=>{
    this.setState({ is_show:0,})
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({checkLoading: true})
        let AddCarData = new FormData();
        AddCarData.append('key','diuber2017');
        AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarData.append('telephone',values.telephone);
        AddCarData.append('password',values.password);
        request('/api/web/login/getcompanyentityid',{
          method:'POST',
          body:AddCarData,
          credentials:'include',
        }).then((data)=>{
          this.setState({checkLoading: false})
          if(data.data.code==1){
            this.setState({
              is_show:1,
              entity_id:data.data.data.entity_id,
            })
          }else{
            openNotificationWithIcon('warning','嘀友提醒',data.data.data.msg)
          }
        })
      }
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className={styles.main}>
        <div style={{fontSize:'20px',margin:'0px !important'}}>忘记公司号</div>
        <Divider/>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('telephone',{
              rules: [
                {
                  required: true,
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ],
            })(
              <Input size="large" placeholder="请输入手机号" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password',{
              rules: [
                {
                  required: true,
                  message: '请输入密码！',
                },
              ],
            })(
              <Input size="large" placeholder="请输入密码" />
            )}
          </FormItem>
          {this.state.is_show!=0 &&
          <FormItem  label="公司号是">
            <span>{this.state.entity_id}</span>
          </FormItem>
          }
          <FormItem>
            <Button size="large" type="primary" style={{width:'100%'}} loading={this.state.checkLoading} onClick={this.checkEntityId}>查询公司号</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
const ForgetEntityId = Form.create()(forgetEntityId);

export default ForgetEntityId;
