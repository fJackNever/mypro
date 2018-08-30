import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,notification,Tabs,Steps,Icon,Radio,Divider,Select,InputNumber,Alert,Upload} from 'antd';
import NumberInfo from 'components/NumberInfo';
import numeral from 'numeral';
import styles from './PersonalCenter.less';
import request from "../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class renewal extends PureComponent {
  state = {
    current:0,
    payType:1,
    payFor:2,
    AllMount:7980,
    visible: true,
    paryear:1,
    payImg:[],
    ButtonLoading:false,
  }
  componentDidMount() {
    this.getPayInfoInter(2,1);
  }
  componentWillUnmount = ()=>{
    clearInterval(window.checkPayInterval);
  }
  //返回公司个人中心详情
  BackCompanyInfo = ()=>{
    this.props.history.push('/Setting/PersonalCenter');
  }

  //选择您要支付的方式
  ChangePayType = (e) => {
    this.setState({
      payType: e.target.value,
    });
  }
  //选择的套餐类型
  ChangePayFor = (value)=>{
    this.setState({
      payFor: value,
      paryear:1,
    });
    if(value==1){
      this.setState({
        AllMount:7980,
      });
      this.getPayInfoInter(value,1);
    }else{
      this.setState({
        AllMount:2980,
      });
      this.getPayInfoInter(value,1);
    }
  }
  //开通年限
  ChangeYear =(value)=>{
    this.setState({
      paryear:value
    })
    if(this.state.payFor==2){
      this.setState({
        AllMount:value*7980
      })
      this.getPayInfoInter(2,value);
    }else{
      this.setState({
        AllMount:value*2980
      })
      this.getPayInfoInter(3,value);
    }
  }

  getPayInfoInter =(amount,year)=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('combo_type',amount);
    TotalData.append('year',year);
    request('/api/diuber/pay/payCompany',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=> {
      if (data.data.code == 1) {
        this.setState({
          entity_id: data.data.data.order.entity_id
        })
        let CodeData = new FormData();
        CodeData.append('ercode', data.data.data.ercode);
        request('/api/diuber/pay/changeErCode', {
          method: 'POST',
          body: CodeData,
          credentials: 'include',
        }).then((data) => {
          if (data.data.code == 1) {
            this.setState({
              imgsrc: data.data.data.path
            })
            window.checkPayInterval = setInterval(()=>this.checkPayInter(),5000);
          } else {
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(() => {})
      }
    }).catch(() => {})
  }
  //支付查询
  checkPayInter = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('com_order_no',this.state.entity_id);
    request('/api/web/admin_setting/checkPaymentSuccess',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=> {
      if(data.data.code==1){
        clearInterval(window.checkPayInterval);
        this.setState({
          current:2
        })
      }else{

      }
    }).catch(()=>{})
  }
  //完成
  CompleteStep = ()=>{
    this.props.history.push('/Setting/PersonalCenter');
  }

  //关闭提醒
  CloseTip = () => {
    this.setState({ visible: false });
  }

  AddReocrdSubmit = ()=>{
    if($("input[name='transfer_record']").val()){
      this.setState({ButtonLoading:true,})
      let TotalData = new FormData();
      TotalData.append('key','diuber2017');
      TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
      TotalData.append('transfer_record',$("input[name='transfer_record']").val());
      TotalData.append('combo_type',this.state.payFor);
      TotalData.append('years',this.state.paryear);
      request('/api/web/admin_setting/addOfflineOrder',{
        method:'POST',
        body:TotalData,
        credentials:'include',
      }).then((data)=> {
        this.setState({ButtonLoading:false,})
        if(data.data.code==1){
          this.props.history.push('/Setting/PersonalCenter');
          openNotificationWithIcon('success', '嘀友提醒', '提交成功，请联系嘀友客服进行支付验证！');
        }else{
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请填写转账流水号！');
    }
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
          <Button onClick={this.BackCompanyInfo} icon="rollback" style={{marginBottom:'3%'}}>返回</Button>
          <div className={styles.payDiv}>
            <Steps current={this.state.current}>
              <Step title="填写转账信息"/>
              <Step title="支付完成"/>
            </Steps>
            <div style={{width:'90%',margin:'5% auto'}}>
              {
                this.state.current==0 &&
                <div>
                  <Form>
                    <FormItem {...formItemLayout} label="选择您要支付的方式">
                        <RadioGroup onChange={this.ChangePayType} value={this.state.payType}>
                          <Radio value={1}>微信扫码支付</Radio>
                          <Radio value={2}>线下转账支付</Radio>
                        </RadioGroup>
                    </FormItem>
                    {
                      this.state.payType==1 &&
                        <div>
                          <FormItem {...formItemLayout} label="套餐类型">
                            <Select defaultValue={this.state.payFor} onChange={this.ChangePayFor}>
                              <Option value={2}>智享版（7980元/年）</Option>
                              <Option value={3}>营销版（2980元/年）</Option>
                            </Select>
                          </FormItem>
                          <FormItem {...formItemLayout} label="开通时长(年)">
                            <InputNumber min={1} value={this.state.paryear} onChange={this.ChangeYear} />
                          </FormItem>
                          <FormItem {...formItemLayout} label="应付金额(元)">
                            <span>{this.state.AllMount}</span>
                          </FormItem>
                          <FormItem {...formItemLayout} label="支付二维码">
                            <div>
                              <img style={{width:'150px',height:'150px',margin:'5px',border:'1px solid #C1C1C1',borderRadius:'5px'}} src={this.state.imgsrc}/>
                            </div>
                          </FormItem>
                        </div>
                    }
                    {
                      this.state.payType==2 &&
                      <div style={{marginTop:24}}>
                        <Form className={styles.form}>
                          <div className={styles.formDiv}>
                            <FormItem {...formItemLayout} label="开户名">
                              <span>上海嘀友网络科技有限公司</span>
                            </FormItem>
                            <FormItem {...formItemLayout} label="开户银行">
                              <span>招商银行 上海张江支行</span>
                            </FormItem>
                            <FormItem {...formItemLayout} label="银行账号">
                              <span>121916702210101</span>
                            </FormItem>
                            <FormItem {...formItemLayout} label="备注">
                              <span>嘀友管车产品年费（公司名称）</span>
                            </FormItem>
                          </div>
                          <div className={styles.formDiv}>
                            <FormItem {...formItemLayout} label="流水帐号">
                                <Input name="transfer_record" placeholder="请输入流水帐号" />
                            </FormItem>
                            <FormItem {...formItemLayout} label="套餐类型">
                              <Select defaultValue={this.state.payFor} onChange={this.ChangePayFor}>
                                <Option value={2}>智享版（7980元/年）</Option>
                                <Option value={3}>营销版（2980元/年）</Option>
                              </Select>
                            </FormItem>
                            <FormItem {...formItemLayout} label="开通时长(年)">
                              <InputNumber min={1} defaultValue={1} onChange={this.ChangeYear} />
                            </FormItem>
                            <FormItem {...formItemLayout} label="应付金额(元)">
                              <span>{this.state.AllMount}</span>
                            </FormItem>
                            <FormItem className={styles.formButtonDiv}>
                              <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddReocrdSubmit} type="primary">确认增加</Button>
                            </FormItem>
                          </div>
                        </Form>
                      </div>
                    }
                  </Form>
                </div>
              }
              {
                this.state.current==2 &&
                <div style={{textAlign:'center'}}>
                  <Icon style={{color:'#52c41a',fontSize:'72px'}} type="check-circle" />
                  <h1 style={{marginTop:'24px'}}>支付成功</h1>
                  <p></p>
                </div>
              }
            </div>
            <div style={{textAlign:'center'}}>
              {
                this.state.current==2 &&
                <Button style={{marginLeft:'24px'}} onClick={this.CompleteStep}>完成</Button>
              }
            </div>
          </div>
          <Divider style={{marginTop:'5%'}}/>
          <div>
            <h3 style={{color:'rgba(0,0,0,.45)'}}>转账说明：</h3>
            <p style={{color:'rgba(0,0,0,.45)'}}>转账钱请务必核查好转账信息，信息确认无误后再行转账。</p>
          </div>

        </Card>
      </div>
    );
  }
}
const Renewal = Form.create()(renewal);

export default Renewal;
