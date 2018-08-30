import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Icon, Input, Button, Checkbox, notification,Tabs,Select, Row, Col, Popover, Progress, } from 'antd';
import styles from './Login.less';
import request from '../../utils/request';
import $ from 'jquery';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const InputGroup = Input.Group;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  poor: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};
class login extends Component {
  state = {
    Tabskey:'1',
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    submitLoading:false,

  }
  componentDidMount=()=>{
    window.dragShow = 0;
    this.props.form.setFields({
      password:{value:''}
    })
    let company_id = window.localStorage.getItem("company_id");
    let telphone_num = window.localStorage.getItem("telphone_num");
    let password_num = window.localStorage.getItem("password_num");
    if(company_id){this.props.form.setFields({company_id:{value:company_id}})}
    if(telphone_num){this.props.form.setFields({telphone_num:{value:telphone_num}})}
    if(password_num){this.props.form.setFields({password_num:{value:password_num}})}
    clearInterval(this.interval);
    let formData = new FormData();
      formData.append('key', 'diuber2017');
      formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      request('/api/web/login/logoutaction',{
        method:'POST',
        body:formData,
        credentials: 'include',
      }).then((data)=>{
      }).catch(()=>{})
  }
  onTabChange = (type) => {
    this.setState({ type });
  }

  handleSubmit = (e) => {
    if($('#sliperBg').html()=='验证成功'){
      this.props.form.validateFields((err, values) => {
        window.localStorage.setItem("company_id",values.company_id)
        window.localStorage.setItem("telphone_num",values.telphone_num)
        if(values.telphone_num==null){
          openNotificationWithIcon('warning','登录失败提醒','手机号不能为空')
        }else if(values.company_id==null){
          openNotificationWithIcon('warning','登录失败提醒','公司号不能为空')
        }else if(values.password_num==null){
          openNotificationWithIcon('warning','登录失败提醒','密码不能为空')
        }
        if(values.company_id!=null && values.telphone_num!=null && values.password_num!=null){
          this.setState({loading:true})
          let formData = new FormData();
          formData.append('key', 'diuber2017');
          formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          formData.append("admin_no", values.telphone_num);
          formData.append("entity_id", values.company_id);
          formData.append("password", values.password_num);
          request('/api/web/login/loginaction',{
            method:'POST',
            body:formData,
            credentials: 'include',
          }).then((data)=>{
            this.setState({
              loading:false
            })
            console.log(data)
            if(data.data.code==1){
              window.localStorage.setItem("EmployeesName",data.data.data.info.name);
              window.localStorage.setItem("companyId",data.data.data.info.company_id);
              window.localStorage.setItem("company_name",data.data.data.info.company_name);
              window.localStorage.setItem("partner_id",data.data.data.info.partner_id);
              window.localStorage.setItem("permision",data.data.data.permision);
              if(data.data.data.com_type==1){
                window.localStorage.setItem("com_type",'免费版');
                if(data.data.data.permision==0){
                  window.location.href="http://gc2.diuber.com/diuber/index/admin.html";
                }else if(data.data.data.permision==1){
                  this.props.history.push('/workbench/workplace');
                }else if(data.data.data.permision==3){
                  this.props.history.push('/Car/workplace');
                }else if(data.data.data.permision==4){
                  this.props.history.push('/Driller/workplace');
                }else if(data.data.data.permision==5){
                  this.props.history.push('/Money/workplace');
                }else if(data.data.data.permision==6){
                  this.props.history.push('/Garage/workplace');
                }else if(data.data.data.permision==7){
                  this.props.history.push('/Sale/workplace');
                }else if(data.data.data.permision==8){
                  this.props.history.push('/workbench/InsuranceCommissioner');
                }
              }else if(data.data.data.com_type==2){
                window.localStorage.setItem("com_type",'智享版');
                if(data.data.data.permision==0){
                  window.location.href="http://gc2.diuber.com/diuber/index/admin.html";
                }else if(data.data.data.permision==1){
                  this.props.history.push('/workbench/workplace');
                }else if(data.data.data.permision==3){
                  this.props.history.push('/Car/workplace');
                }else if(data.data.data.permision==4){
                  this.props.history.push('/Driller/workplace');
                }else if(data.data.data.permision==5){
                  this.props.history.push('/Money/workplace');
                }else if(data.data.data.permision==6){
                  this.props.history.push('/Garage/workplace');
                }else if(data.data.data.permision==7){
                  this.props.history.push('/Sale/workplace');
                }else if(data.data.data.permision==8){
                  this.props.history.push('/workbench/InsuranceCommissioner');
                }
              }else if(data.data.data.com_type==3){
                window.localStorage.setItem("com_type",'营销版');
                this.props.history.push('/Sale/workplace');
              }else if(data.data.data.com_type==4){
                window.localStorage.setItem("com_type",'定制版');
              }
            }else{
              openNotificationWithIcon('error','登录失败提醒',data.data.msg)
            }
          }).catch(()=>{})
        }
      })
    }else{
      openNotificationWithIcon('warning','登录失败提醒','请滑动验证滑块！')
    }
  }
  //拖拉
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


  //注册模块
  onGetCaptcha = () => {
    if($("input[name=admin_no]").val()){
      this.setState({count:'59'})
      let formData = new FormData();
      formData.append("key",'diuber2017' );
      formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      formData.append("admin_no", $("input[name=admin_no]").val());
      formData.append("entity_id", $("input[name=entity_id]").val());
      request('/api/web/login/sendmessageaction',{
        method:'POST',
        body:formData,
      }).then((data)=>{
        if(data.data.code==1){
          let count = 59;
          this.setState({ count });
          this.interval = setInterval(() => {
            count -= 1;
            this.setState({ count });
            if (count === 0) {
              clearInterval(this.interval);
            }
          }, 1000);
        }else {
          this.setState({count:0})
          openNotificationWithIcon('error', '短信发送失败提醒', data.data.data.info)
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('error', '短信发送失败提醒', '请先输入注册手机号！')
    }
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  AddUserSubmit = (e) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({submitLoading:true})
        let formData = new FormData();
        formData.append("key",'diuber2017' );
        formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        formData.append("admin_no", values.admin_no);
        formData.append("entity_id", values.entity_id);
        formData.append("company_name", values.company_name);
        formData.append("password", values.password);
        formData.append("code", values.code);
        request('/api/web/login/registeraction',{
          method:'POST',
          body:formData,
        }).then((data)=>{
          this.setState({submitLoading:false})
          if(data.data.code==1){
            openNotificationWithIcon('success', '嘀友注册成功提醒', '恭喜您成为嘀友管车新用户，请点击登录进行体验！')
          }else{
            openNotificationWithIcon('error', '嘀友注册失败提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    });
  };
  //验证公司名称
  checkEntityId = (rule, value, callback) => {
    if (!value) {
      callback('error');
    }else{
      if(!(/^[0-9a-zA_Z]+$/.test(value)) || value.length < 5 ){
        callback('error');
      }else{
        let formData = new FormData();
        formData.append("key",'diuber2017' );
        formData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        formData.append("entity_id", value);
        request('/api/web/login/checkentityid',{
          method:'POST',
          body:formData,
        }).then((data)=>{
          if(data.data.code==1){
            callback();
          }else{
            callback('error');
          }
        }).catch(()=>{})
      }
    }
  }
  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  changePrefix = (value) => {
    this.setState({
      prefix: value,
    });
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  //选择登陆或者注册
  changeTabs = (value)=>{
    this.setState({Tabskey:value})
    if(value=='1'){
      this.setState({visible:false})
    }
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const { count, prefix } = this.state;
    return (
      <div className={styles.main}>
        <Tabs id="loginTabs" activeKey={this.state.Tabskey} onChange={this.changeTabs}>
          <TabPane tab="账号登录" key={1}>
            <Form className="login-form">
              <FormItem>
                {getFieldDecorator('company_id',)(
                  <Input style={{height:'45px'}} prefix={<Icon type="laptop" style={{color: 'rgba(0,0,0,1)'}}/>} placeholder="请输入公司号"/>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('telphone_num', )(
                  <Input style={{height:'45px'}} prefix={<Icon type="tablet" style={{color: 'rgba(0,0,0,1)'}}/>} placeholder="请输入手机号" pattern="^1[345678][0-9]{9}$"/>
                )}
              </FormItem>
              <FormItem style={{margin:'10px 0px'}}>
                {getFieldDecorator('password_num',)(
                  <Input style={{height:'45px'}} prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,1)'}}/>} type="password"
                         placeholder="请输入密码"/>
                )}
              </FormItem>
              <FormItem style={{margin:'10px 0px'}}>
                  <div id="sliperDiv" className={styles.sliperDiv}>
                    <p id="sliperText" className={styles.sliperText} style={{lineHeight:'45px'}}>拖动滑块验证</p>
                    <div id="sliperBg" className={styles.sliperBg} style={{lineHeight:'45px'}}></div>
                    <p id="sliper" onMouseDown={this.dragSliper} className={styles.sliperP} style={{lineHeight:'45px'}}><Icon style={{width:'45px',height:'45px'}} type="double-right" /></p>
                  </div>
              </FormItem>
              <div style={{display:'flex',flexFlow:'row'}}>
                <FormItem style={{flex:'1',textAlign:'left'}}>
                  <Link to="/user/forgetEntityId">忘记公司号？</Link>
                <Link to="/user/forgetPwd">忘记密码？</Link>
                </FormItem>
              </div>
              <Button onClick={()=>this.handleSubmit()}  loading={this.state.loading}  style={{width:'100%',height:'38px',lineHeight:'38px',marginBottom:'10px',marginTop:'-15px'}} type="primary" className="login-form-button">
                登 录
              </Button>
            </Form>
          </TabPane>
          <TabPane tab="立即注册" key={2}>
              <Form>
                <FormItem hasFeedback>
                  {getFieldDecorator('entity_id',{
                    rules: [
                      {
                        required: true,
                        pattern: /^(?=.{6,16})(?=.*[a-z])(?=.*[0-9])[0-9a-z]*$/,
                        message: '公司号格式错误！',
                        validator: this.checkEntityId,
                      },
                    ],
                  })(
                    <Input name="entity_id" size="large" placeholder="请设置公司号（5-30位数字或大小写字母）" />
                  )}
                </FormItem>
                <p style={{fontSize:'12px',color:'#f60',marginTop:'-20px',}}>公司号为唯一登录编号，不可修改，请用户妥善保存！</p>
                <FormItem>
                  {getFieldDecorator('company_name', {
                    rules: [
                      {
                        required: true,
                        message: '请输入公司名称！',
                      },
                    ],
                  })(<Input size="large" placeholder="请输入公司名称" />)}
                </FormItem>
                <FormItem help={this.state.help}>
                  <Popover
                    content={
                      <div style={{ padding: '4px 0' }}>
                        {passwordStatusMap[this.getPasswordStatus()]}
                        {this.renderPasswordProgress()}
                        <div style={{ marginTop: 10 }}>
                          请至少输入 6 个字符。请不要使用容易被猜到的密码。
                        </div>
                      </div>
                    }
                    overlayStyle={{ width: 240 }}
                    placement="right"
                    visible={this.state.visible}
                  >
                    {getFieldDecorator('password', {
                      rules: [
                        {
                          required: true,
                          validator: this.checkPassword,
                        },
                      ],
                    })(
                      <Input
                        size="large"
                        type="password"
                        placeholder="至少6位密码，区分大小写"
                      />
                    )}
                  </Popover>
                </FormItem>
                <FormItem>
                  {getFieldDecorator('admin_no', {
                    rules: [
                      {
                        required: true,
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
                      })(<Input size="large" placeholder="验证码" />)}
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
                    loading={this.state.submitLoading}
                    size="large"
                    type="primary"
                    style={{width:'100%'}}
                    onClick={this.AddUserSubmit}
                  >
                    注册
                  </Button>
                </FormItem>
              </Form>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
const Login = Form.create()(login);

export default Login;
