import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker,Checkbox, Card, Row, Col, Select,Button, AutoComplete,message,notification } from 'antd';

import styles from './NewRentalCar.less';
import request from "../../../utils/request";

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
const plainOptions = [];
class Workplaces extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    UpType:1,
    ButtonLoading:false,
    ADDNewRoecord:1,
    CarModel:''
  }
  componentDidMount() {
    this.getTemplate();
    if(window.location.href.split('SaleId=')[1]) {
      this.setState({
        ADDNewRoecord:0,
      })
      this.ShowRentalCarInfo(window.location.href.split('SaleId=')[1]);
    }else{
      var toDay  = new Date();
      this.props.form.setFields({
        register_date: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        get_vehicle_date: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }
  //获取信息
  ShowRentalCarInfo = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", target);
    request('/api/web/show/getShowVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          IsShow :data.data.data.rows[0].is_show,
          template:data.data.data.rows[0].template,
          id:data.data.data.rows[0].id,
          licensePlateNodisabled:true,
          UpType: data.data.data.rows[0].type,
        })
        if(data.data.data.rows[0].type==1){
          this.props.form.setFields({
            shortestMonth_term: {value: data.data.data.rows[0].shortest_term},
          })
        }else{
          this.props.form.setFields({
            shortestDay_term: {value: data.data.data.rows[0].shortest_term},
          })
        }
        const plainOptions = [];
        if(data.data.data.rows[0].is_insurance){
          plainOptions.push('is_insurance')
        }
        if(data.data.data.rows[0].is_maintain){
          plainOptions.push('is_maintain')
        }
        if(data.data.data.rows[0].is_keep){
          plainOptions.push('is_keep')
        }
        if(data.data.data.rows[0].is_service){
          plainOptions.push('is_service')
        }
        if(data.data.data.rows[0].is_new){
          plainOptions.push('is_new')
        }
        if(data.data.data.rows[0].is_rent_buy){
          plainOptions.push('is_rent_buy')
        };
        this.props.form.setFields({
          license_plate_no: {value: data.data.data.rows[0].license_plate_no},
          rent_amount: {value: data.data.data.rows[0].rent_amount},
          deposit: {value: data.data.data.rows[0].deposit},
          register_date: {value: moment(data.data.data.rows[0].register_date)},
          mileage: {value: data.data.data.rows[0].mileage},
          get_vehicle_date: {value: moment(data.data.data.rows[0].get_vehicle_date)},
          show_template: {value: data.data.data.rows[0].template},
          keep_cycle: {value: data.data.data.rows[0].keep_cycle},
          inventory: {value: data.data.data.rows[0].inventory},
          RadioGroup: {value:plainOptions},
          other_amount: {value: data.data.data.rows[0].other_amount},
        })
      }
    }).catch(()=>{})
  }
  //获取所有的品牌车型
  getTemplate= ()=>{
     let getCarType = new FormData();
     getCarType.append('key','diuber2017');
     getCarType.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
     request('/api/web/show/getShowTemplate',{
       method:'POST',
       body:getCarType,
       credentials:'include',
     }).then((data)=> {
       if(data.data.code==1){
         var templateList  = data.data.data.map((item)=>{
           return <Option key={item.id}>{item.brand+'-'+item.model}</Option>
         })
         this.setState({templateList })
       }
     }).catch(()=>{})
   }
  //车辆具体信息多选
  onChange = (checkedList) => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    });
  }
  //车牌号联想
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
      if(data.data.code==1){
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
      }
    }).catch(()=>{})
  }


  //更改上架类型
  ChangeUpType = (value) =>{
    this.setState({
      UpType:value
    })
  }
  // 新增车辆上架租车记录
  AddMonthRentVehicle = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          ButtonLoading:true
        })
        let AddMonthRentData = new FormData();
        AddMonthRentData.append('key','diuber2017');
        AddMonthRentData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddMonthRentData.append('license_plate_no',values.license_plate_no);
        AddMonthRentData.append('rent_amount',values.rent_amount);
        AddMonthRentData.append('deposit',values.deposit);
        AddMonthRentData.append('register_date',new Date(values.register_date._d).getFullYear()+'-'+(new Date(values.register_date._d).getMonth()+1)+'-'+new Date(values.register_date._d).getDate());
        AddMonthRentData.append('get_vehicle_date',new Date(values.get_vehicle_date._d).getFullYear()+'-'+(new Date(values.get_vehicle_date._d).getMonth()+1)+'-'+new Date(values.get_vehicle_date._d).getDate());
        if(values.mileage){AddMonthRentData.append('mileage',values.mileage);}
        if(values.keep_cycle){AddMonthRentData.append('keep_cycle',values.keep_cycle);}
        if(values.other_amount){AddMonthRentData.append('other_amount',values.other_amount);}
        if(values.inventory){AddMonthRentData.append('inventory',values.inventory);}
        var is_insurance = 0;
        var is_maintain = 0;
        var is_keep = 0;
        var is_service = 0;
        var is_new = 0;
        var is_rent_buy = 0;
        if(values.RadioGroup){
          for(var i = 0;i<=values.RadioGroup.length;i++){
            if(values.RadioGroup[i]=='is_insurance'){is_insurance=1;}
            if(values.RadioGroup[i]=='is_maintain'){is_maintain=1;}
            if(values.RadioGroup[i]=='is_keep'){is_keep=1;}
            if(values.RadioGroup[i]=='is_new'){is_new=1;}
            if(values.RadioGroup[i]=='is_service'){is_service=1;}
            if(values.RadioGroup[i]=='is_rent_buy'){is_rent_buy=1;}
          }
        }
        AddMonthRentData.append('is_insurance',is_insurance);
        AddMonthRentData.append('is_maintain',is_maintain);
        AddMonthRentData.append('is_keep',is_keep);
        AddMonthRentData.append('is_new',is_new);
        AddMonthRentData.append('is_service',is_service);
        AddMonthRentData.append('is_rent_buy',is_rent_buy);
        if(this.state.ADDNewRoecord==1){
          AddMonthRentData.append('show_template',values.show_template);
          if(this.state.UpType==1){
            if(values.shortestMonth_term){AddMonthRentData.append('shortest_term',values.shortestMonth_term);}
            request('/api/web/show/addMonthRentVehicle',{
              method:'POST',
              body:AddMonthRentData,
              credentials:'include',
            }).then((data)=> {
              this.setState({
                ButtonLoading:false
              })
              if(data.data.code==1){
                message.success('新增上架车辆记录成功');
                this.props.history.push('/Sale/SaleManager?ListTitle=1');
              }else{
                openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
              }
            }).catch((data)=>{
            })
          }else{
            if(values.shortestDay_term){AddMonthRentData.append('shortest_term',values.shortestDay_term);}
            request('/api/web/show/addDailyRentVehicle',{
              method:'POST',
              body:AddMonthRentData,
              credentials:'include',
            }).then((data)=> {
              this.setState({
                ButtonLoading:false
              })
              if(data.data.code==1){
                message.success('新增上架车辆记录成功');
                this.props.history.push('/Sale/SaleManager?ListTitle=1');
              }else{
                openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
              }
            }).catch((data)=>{
            })
          }
        }else{
          if(values.show_template!=this.state.template){
            AddMonthRentData.append('show_template',values.show_template);
          }
          AddMonthRentData.append('id',this.state.id);
          if(this.state.UpType==1){
            if(values.shortestMonth_term){AddMonthRentData.append('shortest_term',values.shortestMonth_term);}
            request('/api/web/show/editVehicle',{
              method:'POST',
              body:AddMonthRentData,
              credentials:'include',
            }).then((data)=> {
              this.setState({
                ButtonLoading:false
              })
              if(data.data.code==1){
                message.success('修改上架车辆记录成功');
                if(this.state.IsShow==0){
                  this.props.history.push('/Sale/SaleManager?ListTitle=2');
                }else{
                  this.props.history.push('/Sale/SaleManager?ListTitle=1');
                }
              }else{
                openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
              }
            }).catch((data)=>{
            })
          }else{
            if(values.shortestDay_term){AddMonthRentData.append('shortest_term',values.shortestDay_term);}
            request('/api/web/show/editVehicle',{
              method:'POST',
              body:AddMonthRentData,
              credentials:'include',
            }).then((data)=> {
              this.setState({
                ButtonLoading:false
              })
              if(data.data.code==1){
                message.success('修改上架车辆记录成功');
                if(this.state.IsShow==0){
                  this.props.history.push('/Sale/SaleManager?ListTitle=2');
                }else{
                  this.props.history.push('/Sale/SaleManager?ListTitle=1');
                }
              }else{
                openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
              }
            }).catch((data)=>{
            })
          }
        }

      }
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
        <div style={{margin:24}}>
          <Card style={{marginBottom:24}}>
            <a style={{color:'red'}} href="javascript:_MEIQIA('showPanel')"> 如果没有找到上架品牌车型，请点击这里联系客服！</a>
          </Card>
          <Card title={<div>上架租车记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 新增小程序上架租车车辆 )</span></div>} >
            <Form className={styles.form}>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout}
                  label="上架类型"
                >
                  <Select value={this.state.UpType} onChange={this.ChangeUpType} placeholder="请选择车辆上架类型" disabled={this.state.licensePlateNodisabled}>
                    <Option value={1}>月租</Option>
                    <Option value={2}>日租</Option>
                  </Select>
                </FormItem>
                <FormItem {...formItemLayout} label="车牌号">
                  {getFieldDecorator('license_plate_no', {
                    rules: [{required: true, message: '请输入车牌号',}],
                  })(
                    <AutoComplete placeholder="请输入车牌号" onChange={this.searchCarNo} dataSource={this.state.CarList} disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="品牌车型">
                  <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
                </FormItem>
                <FormItem {...formItemLayout} label="租金（元）">
                  {getFieldDecorator('rent_amount', {
                    rules: [{required: true, message: '请输入租金',}],
                  })(
                    <Input placeholder="请输入租金" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="押金（元）">
                  {getFieldDecorator('deposit', {
                    rules: [{required: true, message: '请输入押金',}],
                  })(
                    <Input placeholder="请输入押金" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="行驶里程（公里）">
                  {getFieldDecorator('mileage', {
                    rules: [{required: false, message: '请输入行驶里程',}],
                  })(
                    <Input placeholder="请输入行驶里程" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="注册日期">
                  {getFieldDecorator('register_date', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="提车日期">
                  {getFieldDecorator('get_vehicle_date', config)(
                    <DatePicker />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="车辆信息"
                >
                  {getFieldDecorator('RadioGroup')(
                    <Checkbox.Group style={{ width: '100%' ,marginTop:'8px'}} onChange={this.onChange}>
                      <Row>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_insurance">是否包保险</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_maintain">是否包维修</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_keep">是否包保养</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_service">是否营运车</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_rent_buy">是否以租代购</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_new">是否新车</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </FormItem>
              </div>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout}
                  label="品牌车型"
                >
                  {getFieldDecorator('show_template', {
                    rules: [
                      { required: true, message: '请选择车辆品牌车型!' },
                    ],
                  })(
                    <AutoComplete dataSource={this.state.templateList} placeholder="请选择车辆品牌车型"/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="保养周期（公里）">
                  {getFieldDecorator('keep_cycle', {
                    rules: [{required: false, message: '请输入保养周期（公里）',}],
                  })(
                    <Input placeholder="请输入保养周期（公里）" />
                  )}
                </FormItem>
                {
                  this.state.UpType==1 &&
                  <FormItem {...formItemLayout} label="最短租期（月）">
                    {getFieldDecorator('shortestMonth_term', {
                      rules: [{required: true, message: '请输入最短租期（月）',}],
                    })(
                      <Input placeholder="请输入最短租期（月）" />
                    )}
                  </FormItem>
                }
                {
                  this.state.UpType!=1 &&
                  <FormItem {...formItemLayout} label="最短租期（天）">
                    {getFieldDecorator('shortestDay_term', {
                      rules: [{required: true, message: '请输入最短租期（天）',}],
                    })(
                      <Input placeholder="请输入最短租期（天）" />
                    )}
                  </FormItem>
                }
                <FormItem {...formItemLayout} label="上架车辆数">
                  {getFieldDecorator('inventory', {
                    rules: [{required: false, message: '请输入上架车辆数',}],
                  })(
                    <Input placeholder="请输入上架车辆数" />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="其他信息">
                  {getFieldDecorator('other_amount', {
                    rules: [{required: false, message: '请输入其他信息',}],
                  })(
                    <TextArea placeholder="请输入其他收费项目，或者项目亮点，不要输入电话号码"  rows={4} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                  {
                    this.state.ADDNewRoecord==1?
                    <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddMonthRentVehicle} type="primary">确认增加</Button> :
                      <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddMonthRentVehicle} type="primary">确认修改</Button>
                  }
                </FormItem>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}
const Workplace = Form.create()(Workplaces);

export default Workplace;
