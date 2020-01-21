import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { notification, Checkbox, Alert, Icon, Tabs, Form, Input, Button, Row, Col } from 'antd';
import styles from './Login.less';
import $ from 'jquery'
import { loginAction,logoutEnd } from  'utils/api'

const TabPane = Tabs.TabPane;

const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class login extends Component {
  state = {
    loading:false
  };

  handlebbb = () =>{

  }

  componentDidMount(){
    let formData = new FormData();
    formData.append('key', 'diuber2017');
    formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    logoutEnd(formData).then((data)=>{}).catch(error => {})
  }

  handleaaa = () =>{
    
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if($('#sliperBg').html() === '验证成功'){
      this.props.form.validateFields((err, values) => {
        this.setState({loading:true})
        let formData = new FormData();
        formData.append('key', 'diuber2017');
        formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        formData.append("entity_id",values.companyId);
        formData.append("admin_no",values.telphoneNum);
        formData.append("password",values.password);
        loginAction(formData).then(data => {
          this.setState({
            loading:false
          })
          if(data.data.code === 1){

          }else{
            openNotificationWithIcon('error','登录失败提醒',data.data.msg)
          }
        })
      });
    }else{
      openNotificationWithIcon('error','登录失败提醒','请滑动验证滑块！')
    }

  }

  //滑动条
  dragSliper = (event)=>{
    var event = event || window.event;
    if(event.clientX<$("#sliperDiv").offset().left+45){
      document.onmousemove=function(event){
        var event = event || window.event;
        var step = event.clientX - $("#sliperDiv").offset().left;
        var lastStep = $("#sliperDiv").width()-45;
        if(step>=0){
          if(step>=lastStep){
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
            $('#sliper').css('left', lastStep);
            $('#sliperBg').css('width', '100%');
            $('#sliperText').css('display','none');
            $('#sliperBg').html('验证成功');
          }else{
            $('#sliper').css('left', step);
            $('#sliperBg').css('width', step);
          }
        }
      }
      document.onmouseup=function(event){
        var event = event || window.event;
        var step  = event.clientX - $("#sliperDiv").offset().left;
        var lastStep = $("#sliperDiv").width()-45;
        if(step < lastStep-20){ //鼠标松开时，如果没有达到最大距离位置，滑块就返回初始位置
          $('#sliper').css('left', 0);
          $('#sliperBg').css('width', '0px');
        }else{
          $('#sliper').css('left', lastStep);
          $('#sliperBg').css('width', '100%');
        }
        document.onmousemove=null;
        document.onmouseup=null;
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.main}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="账号登陆" key={1}>
              <Form className="login-form">
                  <FormItem>
                    {getFieldDecorator('companyId', {
                      rules: [{ required: true, message: '公司号不能为空' }],
                    })(
                      <Input size="large" prefix={<Icon type="laptop" style={{ color: 'rgba(0,0,0,1)' }} />} placeholder="请输入公司号" />
                    )}
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator('telphoneNum', {
                      rules: [{ required: true, message: '手机号不能为空' }],
                    })(
                      <Input size="large" prefix={<Icon type="tablet" style={{ color: 'rgba(0,0,0,1)' }} />} placeholder="请输入手机号" />
                    )}
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator('password', {
                      rules: [{ required: true, message: '密码不能为空' }],
                    })(
                      <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,1)' }} />} type="password" placeholder="请输入密码" />
                    )}
                  </FormItem>
                  <FormItem style={{margin:'10px 0px'}}>
                    <div id="sliperDiv" className={styles.sliperDiv}>
                      <p id="sliperText" className={styles.sliperText} style={{lineHeight:'45px'}}>拖动滑块验证</p>
                      <div id="sliperBg" className={styles.sliperBg} style={{lineHeight:'45px'}}></div>
                      <p id="sliper" onMouseDown={this.dragSliper} className={styles.sliperP} style={{lineHeight:'45px'}}><Icon style={{width:'45px',height:'45px'}} type="double-right" /></p>
                    </div>
                  </FormItem>
                  <FormItem>
                    <Link to="/user/forgetEntityId">忘记公司号?</Link>&nbsp;
                    <Link to="/user/forgetPwd">忘记密码?</Link>
                  </FormItem>
                  <Button type="primary" onClick={this.handleSubmit} loading={this.state.loading} htmlType="submit" className={styles.loginBtn}>登陆</Button>
              </Form>
            </TabPane>
            <TabPane tab="立即注册" key={2}>
              <Form className="login-form">
                <FormItem>
                  {getFieldDecorator('companyName', {
                    rules: [{ required: true, message: '请输入公司名称' }],
                  })(
                    <Input size="large" placeholder="请输入公司名称" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('rCompanyId', {
                    rules: [{ required: true, message: '请设置公司号' }],
                  })(
                    <Input size="large" placeholder="请设置公司号（建议使用公司简称拼音）" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('rTelphoneNum', {
                    rules: [{ required: true, message: '请输入手机号' }],
                  })(
                    <Input size="large" placeholder="请输入手机号" />
                  )}
                </FormItem>
                <FormItem>
                  <Row gutter={8}>
                    <Col span={16}>
                      {getFieldDecorator('authCode', {
                        rules: [{ required: true, message: '请输入验证码' }],
                      })(
                        <Input size="large" placeholder="请输入验证码" />
                      )}
                    </Col>
                    <Col span={8}>
                      <Button size="large">获取验证码</Button>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem>
                  {getFieldDecorator('rPassword', {
                    rules: [{ required: true, message: '请输入密码' }],
                  })(
                    <Input size="large" placeholder="请输入密码" />
                  )}
                </FormItem>
                <Button type="primary" htmlType="submit" className={styles.loginBtn}>注册</Button>
              </Form>
            </TabPane>
          </Tabs>
      </div>
    );
  }
}

const LoginPage = Form.create()(login);

export default LoginPage;
