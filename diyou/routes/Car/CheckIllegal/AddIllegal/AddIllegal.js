import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import $ from 'jquery';
import {AutoComplete,Form,Input,DatePicker,notification, InputNumber,Card,Select, Button,message,Alert} from 'antd';

import styles from './../../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class addIllegal extends PureComponent {
  state = {
    status:0,
    ButtonLoading:false,
    is_update:0,
    InputDisable:false,
  }
  componentDidMount() {
    var toDay  = new Date();
    this.props.form.setFields({
      violation_time:{value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
    })

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
    if(window.location.href.split('entity_id=')[1]){
      this.setState({is_update:1,InputDisable:true,})
      this.showIllegalInfoInter(window.location.href.split('entity_id=')[1]);
    }
  }
  //查看查违章的详细信息
  showIllegalInfoInter = (target)=>{
    let AddFormData = new FormData();
    AddFormData.append('key','diuber2017');
    AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData.append('entity_id',target);
    request('/api/web/vehicle_violation/getHandViolationInfo',{
      method:'POST',
      body:AddFormData,
      credentials:'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({status:data.data.data.status,id:data.data.data.id,vehicle_id:data.data.data.vehicle_id})
        this.props.form.setFields({
          license_plate_no: {value: data.data.data.license_plate_no,},
          violation_time: {value: moment(data.data.data.violation_time),},
          price: {value: data.data.data.price,},
          score: {value: data.data.data.score,},
          violation_address: {value: data.data.data.violation_address,},
          content: {value: data.data.data.content,},
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  AddIllegalSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          ButtonLoading:true
        })
        let AddFormData = new FormData();
        AddFormData.append('key','diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('license_plate_no',values.license_plate_no);
        AddFormData.append('violation_time',new Date(values.violation_time._d).getFullYear()+'-'+(new Date(values.violation_time._d).getMonth()+1)+'-'+new Date(values.violation_time._d).getDate());
        AddFormData.append('violation_address',values.violation_address);
        AddFormData.append('price',values.price);
        AddFormData.append('score',values.score);
        AddFormData.append('status',this.state.status);
        if(values.content){AddFormData.append('content',values.content);}
        request('/api/web/vehicle_violation/addHandViolation',{
          method:'POST',
          body:AddFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({ButtonLoading:false})
          if(data.data.code==1){
            message.success('成功新增车辆违章记录！');
            this.props.history.push('/Car/CarManager?CarType=12');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //修改手动查违章
  UpdateIllegalSubmit= ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({ButtonLoading:true})
        let AddFormData = new FormData();
        AddFormData.append('key','diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('id',this.state.id);
        AddFormData.append('violation_time',new Date(values.violation_time._d).getFullYear()+'-'+(new Date(values.violation_time._d).getMonth()+1)+'-'+new Date(values.violation_time._d).getDate());
        AddFormData.append('violation_address',values.violation_address);
        AddFormData.append('price',values.price);
        AddFormData.append('score',values.score);
        AddFormData.append('status',this.state.status);
        if(values.content){AddFormData.append('content',values.content);}
        request('/api/web/vehicle_violation/editHandViolation',{
          method:'POST',
          body:AddFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({ButtonLoading:false})
          if(data.data.code==1){
            message.success('成功修改车辆违章记录！');
            this.props.history.push('/Car/CarManager/ShowCar?Car_id='+this.state.vehicle_id);
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }

  //联想车型
  searchCarNo = (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", value);
    GFHFormData.append("limit", 10000);
    request('/api/web/vehicle/getVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      var CarList = data.data.data.rows.map((item) => {
        return <Option key={item.license_plate_no}>{item.license_plate_no}</Option>;
      });

      let CarModel = ''

      data.data.data.rows.map(item => {
        if(item.license_plate_no === value){
          CarModel =  item.vehicle_template;
        }else{
          CarModel = ''
        }
      })

      this.setState({CarList,CarModel})
      if(data.data.data.total==1){
        this.searchRecordList(data.data.data.rows[0].id)
      }
    }).catch(()=>{})
  }

  //选择违章状态
  changeStatus = (value)=>{
    this.setState({
      status:value
    })
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
        <Card>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              {/*<FormItem {...formItemLayout} label="车牌号">*/}
                {/*{getFieldDecorator('license_plate_no', {*/}
                  {/*rules: [{required: true, message: '请输入车牌号',}],*/}
                {/*})(*/}
                  {/*<Input disabled={this.state.InputDisable} placeholder="请输入车牌号" />*/}
                {/*)}*/}
              {/*</FormItem>*/}

              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete placeholder="请输入车牌号" onChange={this.searchCarNo} dataSource={this.state.CarList} disabled={this.state.InputDisable}/>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="品牌车型">
                <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
              </FormItem>
              <FormItem {...formItemLayout} label="违章日期">
                {getFieldDecorator('violation_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="违章地点">
                {getFieldDecorator('violation_address', {
                  rules: [{required: true, message: '请输入违章地点',}],
                })(
                  <Input placeholder="请输入违章地点" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="违章扣分">
                {getFieldDecorator('score', {
                  rules: [{required: true, message: '请输入违章扣分',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="违章罚款">
                {getFieldDecorator('price', {
                  rules: [{required: true, message: '请输入违章罚款',}],
                })(
                  <InputNumber min={0}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="违章状态"
              >
                <Select value={this.state.status} placeholder="请选择违章状态" onChange={this.changeStatus}>
                  <Option value={0}>未处理</Option>
                  <Option value={1}>已处理</Option>
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="违章详情">
                {getFieldDecorator('content', {
                  rules: [{required: false, message: '请输入违章详情',}],
                })(
                  <TextArea placeholder="请输入违章详情"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                {
                  this.state.is_update==0 &&
                  <Button loading={this.state.ButtonLoading} className={styles.formButton}   onClick={this.AddIllegalSubmit} type="primary">确认增加</Button>
                }
                {
                  this.state.is_update==1 &&
                  <Button loading={this.state.ButtonLoading} className={styles.formButton}   onClick={this.UpdateIllegalSubmit} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const AddIllegal = Form.create()(addIllegal);

export default AddIllegal;
