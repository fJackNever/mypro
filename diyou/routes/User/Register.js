import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import $ from 'jquery';
import { Form, Input, Button, Select, Row, Col, Popover, Progress,notification } from 'antd';
import styles from './Register.less';
import request from '../../utils/request';

const FormItem = Form.Item;
const { Option } = Select;
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

class register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    submitLoading:false,
  };
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
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
       openNotificationWithIcon('error', '短信发送失败提醒', data.data.info)
     }
    }).catch(()=>{})
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
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
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
            this.props.history.push('/user/login');
          }else{
            openNotificationWithIcon('error', '嘀友提醒', data.data.msg);
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

  render() {
    const {getFieldDecorator} = this.props.form;
    const { count, prefix } = this.state;
    return (
      <div className={styles.main}>
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
              className={styles.submit}
              type="primary"
              onClick={this.AddUserSubmit}
            >
              注册
            </Button>
            <Link className={styles.login}>
              使用已有账户登录
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
const Register = Form.create()(register);

export default Register;
