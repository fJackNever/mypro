import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form,Input,DatePicker,Checkbox, Card, Row, Col, Select, InputNumber, notification,AutoComplete, Button,message} from 'antd';

import styles from './../NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const plainOptions = ['Apple', 'Pear', 'Orange'];
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class Workplaces extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    ButtonLoading:false,
    ADDNewRoecord:1,
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
        first_amount: {value:0},
        month_amount: {value:0},
        last_amount: {value:0},
        stage: {value:0},
        margin: {value:0},
        manage_amouont: {value:0},
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
        const plainOptions = [];
        if(data.data.data.rows[0].is_insurance){
          plainOptions.push('is_insurance')
        }
        if(data.data.data.rows[0].is_board){
          plainOptions.push('is_board')
        }
        if(data.data.data.rows[0].is_old){
          plainOptions.push('is_old')
        }
        if(data.data.data.rows[0].is_service){
          plainOptions.push('is_service')
        }
        this.props.form.setFields({
          RadioGroup: {value:plainOptions},
          show_template:{value: data.data.data.rows[0].template},
          first_amount:{value: data.data.data.rows[0].first_amount},
          month_amount:{value: data.data.data.rows[0].month_amount},
          stage:{value: data.data.data.rows[0].stage},
          last_amount:{value: data.data.data.rows[0].last_amount},
          margin:{value: data.data.data.rows[0].margin},
          manage_amouont:{value: data.data.data.rows[0].manage_amouont},
          mileage:{value: data.data.data.rows[0].mileage},
          register_date: {value: moment(data.data.data.rows[0].register_date)},
          get_vehicle_date: {value: moment(data.data.data.rows[0].get_vehicle_date)},
          inventory : {value: data.data.data.rows[0].inventory},
          other_amount: {value:data.data.data.rows[0].other_amount},
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
  //新增卖车
  AddSaleVehicle = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          ButtonLoading: true
        })
        let AddMonthRentData = new FormData();
        AddMonthRentData.append('key', 'diuber2017');
        AddMonthRentData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddMonthRentData.append('first_amount', values.first_amount);
        AddMonthRentData.append('month_amount', values.month_amount);
        AddMonthRentData.append('last_amount', values.last_amount);
        AddMonthRentData.append('stage', values.stage);
        AddMonthRentData.append('margin', values.margin);
        AddMonthRentData.append('manage_amouont', values.manage_amouont);
        if(values.mileage){AddMonthRentData.append('mileage',values.mileage);}
        AddMonthRentData.append('register_date',new Date(values.register_date._d).getFullYear()+'-'+(new Date(values.register_date._d).getMonth()+1)+'-'+new Date(values.register_date._d).getDate());
        AddMonthRentData.append('get_vehicle_date',new Date(values.get_vehicle_date._d).getFullYear()+'-'+(new Date(values.get_vehicle_date._d).getMonth()+1)+'-'+new Date(values.get_vehicle_date._d).getDate());
        if(values.other_amount){AddMonthRentData.append('other_amount',values.other_amount);}
        if(values.inventory){AddMonthRentData.append('inventory',values.inventory);}
        var is_insurance = 0;
        var is_board = 0;
        var is_old = 0;
        var is_service = 0;
        if(values.RadioGroup){
          for(var i = 0;i<=values.RadioGroup.length;i++){
            if(values.RadioGroup[i]=='is_insurance'){is_insurance=1;}
            if(values.RadioGroup[i]=='is_board'){is_board=1;}
            if(values.RadioGroup[i]=='is_old'){is_old=1;}
            if(values.RadioGroup[i]=='is_service'){is_service=1;}
          }
        }
        AddMonthRentData.append('is_insurance',is_insurance);
        AddMonthRentData.append('is_board',is_board);
        AddMonthRentData.append('is_old',is_old);
        AddMonthRentData.append('is_service',is_service);
        if(this.state.ADDNewRoecord==1){
          AddMonthRentData.append('show_template', values.show_template);
          request('/api/web/show/addSaleVehicle',{
            method:'POST',
            body:AddMonthRentData,
            credentials:'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增上架卖车车辆成功');
              this.props.history.push('/Sale/SaleManager?ListTitle=3');
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          if(values.show_template!=this.state.template){
            AddMonthRentData.append('show_template',values.show_template);
          }
          AddMonthRentData.append('id',this.state.id);
          request('/api/web/show/editVehicle',{
            method:'POST',
            body:AddMonthRentData,
            credentials:'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改上架卖车车辆成功');
              if(this.state.IsShow==0){
                this.props.history.push('/Sale/SaleManager?ListTitle=4');
              }else{
                this.props.history.push('/Sale/SaleManager?ListTitle=3');
              }
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
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
            <span style={{color:'red'}}> 如果没有找到上架品牌车型，请点击这里联系客服！</span>
          </Card>
          <Card title={<div>上架售车记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 新增小程序上架售车车辆 )</span></div>} >
            <Form className={styles.form}>
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
                <FormItem {...formItemLayout} label="首付（元）">
                  {getFieldDecorator('first_amount', {
                    rules: [{required: true, message: '请输入首付',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="月供（全款填0）">
                  {getFieldDecorator('month_amount', {
                    rules: [{required: true, message: '请输入月供',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="分期（全款填0）">
                  {getFieldDecorator('stage', {
                    rules: [{required: true, message: '请输入分期',}],
                  })(
                    <InputNumber min={0}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="尾款（全款填0）">
                  {getFieldDecorator('last_amount', {
                    rules: [{required: true, message: '请输入尾款',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="保证金（元）">
                  {getFieldDecorator('margin', {
                    rules: [{required: true, message: '请输入保证金',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="管理费（元）">
                  {getFieldDecorator('manage_amouont', {
                    rules: [{required: true, message: '请输入管理费',}],
                  })(
                    <InputNumber min={0} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="行驶里程（公里）">
                  {getFieldDecorator('mileage', {
                    rules: [{required: false, message: '请输入行驶里程',}],
                  })(
                    <Input placeholder="请输入行驶里程" />
                  )}
                </FormItem>
              </div>
              <div className={styles.formDiv}>
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
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_board">是否包上牌</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_service">是否营运车</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_old">是否二手车</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="上架车辆数">
                  {getFieldDecorator('inventory', {
                    rules: [{required: false, message: '请输入上架车辆数',}],
                  })(
                    <InputNumber min={0} />
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
                  <Button  loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddSaleVehicle} type="primary">确认增加</Button>
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
