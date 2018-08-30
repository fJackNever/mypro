import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,notification,Tabs,Steps,Icon,Radio,Divider,Row,Col,Select,InputNumber,Alert,Upload} from 'antd';
import NumberInfo from 'components/NumberInfo';
import numeral from 'numeral';
import styles from '../../Setting/PersonalCenter.less';
import request from "../../../utils/request";

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
class addCheckllsgal extends PureComponent {
  state = {
    current:0,
    imgsrc:'',
    payType:'A',
  }
  componentDidMount() {
      this.getpayImgInter(this.state.payType);
  }
  //生成支付二维码
  getpayImgInter = (type)=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('pay_type',type);
    TotalData.append('body','WZ');
    request('/api/diuber/pay/payViolation',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          entity_id:data.data.data.order.entity_id
        })
        let CodeData = new FormData();
        CodeData.append('ercode',data.data.data.ercode);
        request('/api/diuber/pay/changeErCode',{
          method:'POST',
          body:CodeData,
          credentials:'include',
        }).then((data)=> {
          if(data.data.code==1){
            this.setState({
              imgsrc:data.data.data.path
            })
          }else  if(data.data.code==90001){
            this.props.history.push('/user/login')
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
        window.checkPayInterval = setInterval(()=>this.checkPayInter(),1000);
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //支付查询
  checkPayInter = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('order_no',this.state.entity_id);
    request('/api/web/admin_setting/checkPaymentSuccess',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=> {
      if(data.data.code==1){
        clearInterval(window.checkPayInterval);
        this.setState({
          current:1
        })
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{

      }
    }).catch(()=>{})
  }

  ChangePayType = (e) => {
    this.setState({
      payType: e.target.value,
    });
    this.getpayImgInter(e.target.value)
  }
  backCheckllsgal = ()=>{
    this.props.history.push('/Car/CarManager/CheckIllegal');
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
          <div className={styles.payDiv}>
            <Steps current={this.state.current} style={{marginTop:'5%'}}>
              <Step title="选择查违章套餐"/>
              <Step title="支付完成"/>
            </Steps>
            <div style={{width:'90%',margin:'5% auto'}}>
              {
                this.state.current==0 &&
                  <div>
                    <FormItem {...formItemLayout} label="选择您要支付的套餐">
                      <RadioGroup onChange={this.ChangePayType} value={this.state.payType}>
                        <Row>
                          <Col  span={12}><Radio value="A">100次 / 15元</Radio></Col>
                          <Col  span={12}><Radio value="B">500次 / 55元</Radio></Col>
                          <Col  span={12}><Radio value="C">1000次 / 100元</Radio></Col>
                          <Col  span={12}><Radio value="D">5000次 / 450元</Radio></Col>
                        </Row>
                      </RadioGroup>
                    </FormItem>
                    <Divider />
                    <FormItem {...formItemLayout} label="扫码进行支付">
                      <div>
                        <img style={{width:'150px',height:'150px',margin:'5px',border:'1px solid #C1C1C1',borderRadius:'5px'}} src={this.state.imgsrc}/>
                      </div>
                    </FormItem>
                  </div>
              }
              {
                this.state.current==1 &&
                <div style={{textAlign:'center'}}>
                  <Icon style={{color:'#52c41a',fontSize:'72px'}} type="check-circle" />
                  <h1 style={{marginTop:'24px'}}>支付成功</h1>
                </div>
              }
            </div>
            <div style={{textAlign:'center'}}>
              {
                this.state.current==1 &&
                <Button onClick={this.backCheckllsgal}>完成</Button>
              }
            </div>
          </div>
        </Card>
      </div>
    );
  }
}
const AddCheckllsgal = Form.create()(addCheckllsgal);

export default AddCheckllsgal;
