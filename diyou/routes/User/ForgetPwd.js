import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import $ from 'jquery';
import { Form, Input, Button, Row, Col, Popover,notification,Divider,message} from 'antd';
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
class forgetPwd extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    is_New:0,
    updateloading:false,
    nextButton:true,
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
    if($("input[name=admin_no]").val()==''){openNotificationWithIcon('error','嘀友提醒','手机号不能为空')
    }else {
      let formData = new FormData();
      formData.append("key",'diuber2017' );
      formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      formData.append("admin_no", $("input[name=admin_no]").val());
      formData.append("entity_id", $("input[name=entity_id]").val());
      request('/api/web/login/sendforgotpassword',{
        method:'POST',
        body:formData,
      }).then((data)=>{
        if(data.data.code!=1){
          openNotificationWithIcon('error','短信发送失败提醒',data.data.data.info)
        }else if(data.data.code==1){
          let count = 59;
          this.setState({ count });
          this.interval = setInterval(() => {
            count -= 1;
            this.setState({ count });
            if (count === 0) {
              clearInterval(this.interval);
            }
          }, 1000);
        }
      })
    }
  };

  codeChange=(e)=>{
    if(e.target.value.length>=6){
      this.setState({nextButton:false,})
    }else{
      this.setState({nextButton:true,})
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {

      }
    });
  };

  //下一步
  NextStep =()=>{
    if($("input[name=admin_no]").val()==''){openNotificationWithIcon('error','嘀友提醒','手机号不能为空')
    }else if($("input[name=entity_id]").val()==''){openNotificationWithIcon('error','嘀友提醒','公司号不能为空')
    }else if($("input[name=code]").val()==''){openNotificationWithIcon('error','嘀友提醒','验证码不能为空')
    }else if($("input[name=admin_no]").val() && $("input[name=entity_id]").val()  && $("input[name=code]").val()){
      let formData = new FormData();
      formData.append("key",'diuber2017' );
      formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      formData.append("entity_id", $("input[name=entity_id]").val());
      formData.append("admin_no", $("input[name=admin_no]").val());
      formData.append("verify_key", $("input[name=code]").val());
      request('/api/web/login/verifychange',{
        method:'POST',
        body:formData,
      }).then((data)=>{
        if(data.data.code==1){
          this.setState({is_New:1,entity_id:$("input[name=entity_id]").val()})
        }else{
          openNotificationWithIcon('error','嘀友提醒',data.data.msg);
        }
      }).catch(()=>{})
    }
  }
  //修改密码
  UpdatePwd = ()=>{
    if($("input[name=new_passwd]").val()==''){openNotificationWithIcon('error','嘀友提醒','新密码不能为空')
    }else if($("input[name=sub_passwd]").val()==''){openNotificationWithIcon('error','嘀友提醒','请再次输入确认密码')
    }else if($("input[name=new_passwd]").val() != $("input[name=sub_passwd]").val()){
      openNotificationWithIcon('error','嘀友提醒','请检查俩次密码是否填写一致！')
    }else{
      this.setState({updateloading:true})
      let formData = new FormData();
      formData.append("key",'diuber2017' );
      formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      formData.append("entity_id", this.state.entity_id);
      formData.append("new_passwd", $("input[name=new_passwd]").val());
      formData.append("sub_passwd", $("input[name=sub_passwd]").val());
      request('/api/web/login/changepassword',{
        method:'POST',
        body:formData,
      }).then((data)=>{
        this.setState({updateloading:false,})
        if(data.data.code==1){
          message.success('修改密码成功');
          this.props.history.push('/user/login');
        }else{
          openNotificationWithIcon('error','嘀友提醒',data.data.msg);
        }
      })
    }
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const { count, prefix } = this.state;
    return (
      <div className={styles.main}>
        <div style={{fontSize:'20px',margin:'0px !important'}}>忘记密码</div>
        <Divider/>
        <Form onSubmit={this.handleSubmit}>
          {this.state.is_New==0 &&
            <div>
              <FormItem>
                {getFieldDecorator('entity_id')(
                  <Input name="entity_id" size="large" placeholder="公司号（5-30位数字或大小写字母）" />
                )}
              </FormItem>
              <p style={{fontSize:'12px',color:'#f60',marginTop:'-20px',}}>只有管理员可以使用此功能</p>
              <FormItem>
                {getFieldDecorator('admin_no', {
                  rules: [
                    {
                      pattern: /^1\d{10}$/,
                      message: '手机号格式错误！',
                    },
                  ],
                })(
                  <Input name="admin_no" size="large" placeholder="11位手机号"/>
                )}
              </FormItem>
              <FormItem>
                <Row gutter={8}>
                  <Col span={16}>
                    {getFieldDecorator('code', {
                      rules: [
                        {
                          required: true,
                          message: '请输入验证码！',
                        },
                      ],
                    })(<Input onChange={this.codeChange} name="code" size="large" placeholder="验证码" />)}
                  </Col>
                  <Col span={8}>
                    <Button
                      size="large"
                      disabled={count}
                      className={styles.getCaptcha}
                      onClick={this.onGetCaptcha}
                    >
                      {count ? `${count} s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem>
                <Button
                  size="large"
                  style={{width:'100%'}}
                  type="primary"
                  disabled={this.state.nextButton}
                  onClick={this.NextStep}
                >
                  下一步
                </Button>
              </FormItem>
            </div>
          }
          {this.state.is_New != 0 &&
            <div>
              <FormItem>
                {getFieldDecorator('new_passwd')(
                  <Input name="new_passwd" size="large" placeholder="新密码"/>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('sub_passwd')(
                  <Input name="sub_passwd" size="large" placeholder="新密码确认"/>
                )}
              </FormItem>
              <FormItem>
                <Button
                  size="large"
                  style={{width:'100%'}}
                  type="primary"
                  loading={this.state.updateloading}
                  onClick={this.UpdatePwd}
                >
                  修改密码
                </Button>
              </FormItem>
            </div>
          }
        </Form>
      </div>
    );
  }
}
const ForgetPwd = Form.create()(forgetPwd);

export default ForgetPwd;
