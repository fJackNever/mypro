import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,AutoComplete,notification,InputNumber,message,DatePicker} from 'antd';

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
class newSurveryCarNotes extends PureComponent {
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
    CarModel:''
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}


    var toDay  = new Date();

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
    if(window.location.href.split('entity_id=')[1]) {
      this.setState({
        licensePlateNodisabled: true,
        ADDNewRoecord: 0,
      })
      this.getSurveryRecordInfo(window.location.href.split('entity_id=')[1]);
    }else{
      this.setState({
        licensePlateNodisabled:false,
      })
      this.props.form.setFields({
        annual_survey_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        next_annual_survery_time: {value: moment((new Date(toDay).getFullYear()+1) + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }
  //获取年检记录
  getSurveryRecordInfo = (target)=>{
    let ARRFormData = new FormData();
    ARRFormData.append('key','diuber2017');
    ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    ARRFormData.append('entity_id',target);
    request('/api/web/vehicle/getSurveryInfo',{
      method:'POST',
      body:ARRFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          id:data.data.data.id
        })
        this.props.form.setFields({
          next_annual_survery_time: {value: moment(data.data.data.next_annual_survery_time)},
          annual_survey_time: {value: moment(data.data.data.annual_survey_time)},
          amount:{value:data.data.data.amount},
          license_plate_no:{value:data.data.data.license_plate_no},
          annual_survey_manager:{value:data.data.data.annual_survey_manager},
          comment:{value:data.data.data.comment},
        })
      }
    }).catch(()=>{})
  }
  //新增年检记录
  AddExtensionSubmit = ()=>{
    this.setState({
      ButtonLoading:true
    })
    this.props.form.validateFields((err, values) => {
      if(!err){
        if(this.state.ADDNewRoecord==1){
          let ARRFormData = new FormData();
          ARRFormData.append('key','diuber2017');
          ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          ARRFormData.append('license_plate_no',values.license_plate_no);
          ARRFormData.append('annual_survey_time',new Date(values.annual_survey_time._d).getFullYear()+'-'+(new Date(values.annual_survey_time._d).getMonth()+1)+'-'+new Date(values.annual_survey_time._d).getDate());
          ARRFormData.append('annual_survey_manager',values.annual_survey_manager);
          ARRFormData.append('next_annual_survery_time',new Date(values.next_annual_survery_time._d).getFullYear()+'-'+(new Date(values.next_annual_survery_time._d).getMonth()+1)+'-'+new Date(values.next_annual_survery_time._d).getDate());
          if(values.comment){
            ARRFormData.append('comment',values.comment);
          }
          ARRFormData.append('amount',values.amount);
          request('/api/web/vehicle/addSurvery',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增年检记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=14&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          let ARRFormData = new FormData();
          ARRFormData.append('key','diuber2017');
          ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          ARRFormData.append('id',this.state.id);
          ARRFormData.append('annual_survey_time',new Date(values.annual_survey_time._d).getFullYear()+'-'+(new Date(values.annual_survey_time._d).getMonth()+1)+'-'+new Date(values.annual_survey_time._d).getDate());
          ARRFormData.append('annual_survey_manager',values.annual_survey_manager);
          ARRFormData.append('next_annual_survery_time',new Date(values.next_annual_survery_time._d).getFullYear()+'-'+(new Date(values.next_annual_survery_time._d).getMonth()+1)+'-'+new Date(values.next_annual_survery_time._d).getDate());
          if(values.comment){
            ARRFormData.append('comment',values.comment);
          }
          ARRFormData.append('amount',values.amount);
          request('/api/web/vehicle/editSurvery',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改年检记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=14&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }

  //联想车牌号
  CarNumberSearch =  (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    GFHFormData.append("limit",9999);
    request('/api/web/vehicle/thinkVehicleLicensePlateNo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const carName = data.data.data.rows.map((item)=>{
          return <Option value={item.license_plate_no}>{item.license_plate_no}</Option>
        })

        let CarModel = ''

        data.data.data.rows.map(item => {
          if(item.license_plate_no === value){
            CarModel =  item.vehicle_template;
          }else{
            CarModel = ''
          }
        })

        this.setState({carName,CarModel})
      }
    }).catch(()=>{})
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
        <Card title={<div>年检记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 记录年检信息 )</span></div>} style={{marginBottom:24}}>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete disabled={this.state.licensePlateNodisabled} dataSource={this.state.carName} onChange={this.CarNumberSearch} placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="品牌车型">
                <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="年检处理人"
              >
                {getFieldDecorator('annual_survey_manager', {
                  rules: [
                    { required: true, message: '请输入年检处理人!' },
                  ],
                })(
                  <Input placeholder="请输入年检处理人" onChange={this.searchCustomer}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="年检日期">
                {getFieldDecorator('annual_survey_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="年检金额">
                {getFieldDecorator('amount', {
                  rules: [{required: true, message: '请输入年检金额',}],
                })(
                  <InputNumber min={0}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="下次年检日期">
                {getFieldDecorator('next_annual_survery_time',config)(
                  <DatePicker />
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
                <Button disabled={this.state.ButtonDisabled} loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddExtensionSubmit} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const NewSurveryCarNotes = Form.create()(newSurveryCarNotes);

export default NewSurveryCarNotes;
