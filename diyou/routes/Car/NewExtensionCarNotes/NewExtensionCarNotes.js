import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,AutoComplete,notification,InputNumber,message} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class newExtensionCarNotes extends PureComponent {
  state = {
    type:1,
    sign_status:0,
    customerIDNum:'',
    customerTel:'',
    checkCarData:'',
    ViolationCarData:'',
    RentCarData:'',
    ButtonLoading:false,
    ADDNewRoecord:1,
    licensePlateNodisabled:false,
  }
  componentDidMount() {

    const getQueryString = (name) => {

      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = this.props.location.search.substr(1).match(reg);
      console.log(r)
      if(r!=null)
        return decodeURIComponent(r[2]);
      return null;
    }

    if(getQueryString('license_plate_no')){
      this.props.form.setFields({
        license_plate_no: {value:getQueryString('license_plate_no')}
      })

      const CarModel = getQueryString('vehicle_template')

      this.setState({CarModel})

    }
  }
  //新增延期记录
  AddExtensionSubmit = ()=>{
    this.setState({
      ButtonLoading:true
    })
    this.props.form.validateFields((err, values) => {
      if(!err){
        let ARRFormData = new FormData();
        ARRFormData.append('key','diuber2017');
        ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        ARRFormData.append('license_plate_no',values.license_plate_no);
        ARRFormData.append('customer_name',values.customer_name);
        ARRFormData.append('extension_days',values.extension_days);
        ARRFormData.append('comment',values.comment);
        request('/api/web/vehicle/addExtension',{
          method:'POST',
          body:ARRFormData,
          credentials: 'include',
        }).then((data)=> {
          this.setState({
            ButtonLoading:false
          })
          if(data.data.code==1){
            message.success('新增延期记录成功');
            this.props.history.push('/Car/CarManager/ShowCar?Car_id='+data.data.data.vehicle_id);
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
        <Card style={{marginBottom:24}}>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete placeholder="请输入车牌号" onChange={this.searchCarNo} dataSource={this.state.CarList} disabled={this.state.licensePlateNodisabled}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="客户姓名"
              >
                {getFieldDecorator('customer_name', {
                  rules: [
                    { required: true, message: '请输入客户姓名!' },
                  ],
                })(
                  <Input placeholder="请输入客户姓名" onChange={this.searchCustomer}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="延期天数">
                {getFieldDecorator('extension_days', {
                  rules: [{required: true, message: '请输入延期天数',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入备注',}],
                })(
                  <TextArea placeholder="如需备注，请输入备注信息"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                {this.state.ADDNewRoecord==1 &&
                <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddExtensionSubmit} type="primary">确认增加</Button>
                }
                {this.state.ADDNewRoecord==0 &&
                <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddExtensionSubmit} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const NewExtensionCarNotes = Form.create()(newExtensionCarNotes);

export default NewExtensionCarNotes;
