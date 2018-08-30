import React, { PureComponent } from 'react';
import { connect } from 'dva';
import StandardFormRow from 'components/StandardFormRow';
import { Link } from 'dva/router';
import {Form,Input,Row,Col,Tabs, Card,Button, Upload,AutoComplete,Icon,notification,message  } from 'antd';
import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class underCar extends PureComponent {
  state = {
    FJImgList:[],
    showuploadButton:false,
    tableLoading:false,
    backcarLoading:false,

    showSearch:1,
    confirmLoading:false,
    showCard:2,
  }
  componentDidMount(){

  }
  //下架操作
  refundvehicleSubmit = ()=>{
    this.setState({backcarLoading:true})
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('id',this.state.chanceCarnum);
    ShowCarData.append('is_show',0);
    request('/api/web/show/editVehicle',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      this.setState({backcarLoading:false})
      if(data.data.code==1){
        openNotificationWithIcon('success', '嘀友提醒', '成功下架该车辆');
        this.props.history.push("/Sale/SaleManager");

      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }

  //联想车牌号
  CarNumberSearch =  (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    GFHFormData.append("limit",9999);
    request('/api/web/show/putaway',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        var carName = data.data.data.map((item)=>{
          return <Option value={item.show_vehicle_id+';'+item.vehicle_id}>{item.license_plate_no}</Option>
        })
        this.setState({carName:carName})
      }
    }).catch(()=>{})
  }
  chanceCar = (value)=>{
    this.setState({
      chanceCarnum:value.split(';')[0]
    })
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", value.split(';')[0]);
    GFHFormData.append("limit", 9999);
    request('/api/web/show/getShowVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          showCard:1,
          license_plate_no:data.data.data.rows[0].license_plate_no,
          deposit:data.data.data.rows[0].deposit,
          rent_amount:data.data.data.rows[0].rent_amount,
          mileage:data.data.data.rows[0].mileage,
          register_date:data.data.data.rows[0].register_date,
          get_vehicle_date:data.data.data.rows[0].get_vehicle_date,
          is_insurance:data.data.data.rows[0].is_insurance,
          is_keep:data.data.data.rows[0].is_keep,
          is_maintain:data.data.data.rows[0].is_maintain,
          is_service:data.data.data.rows[0].is_service,
          template:data.data.data.rows[0].template,
          keep_cycle:data.data.data.rows[0].keep_cycle,
          shortest_term:data.data.data.rows[0].shortest_term,
          is_show:data.data.data.rows[0].is_show,
          other_amount:data.data.data.rows[0].other_amount,
        })
      }
    }).catch(()=>{})
  }
  quickerCar = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", this.state.chanceCarnum);
    GFHFormData.append("limit", 9999);
    request('/api/web/show/getShowVehicle',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          showCard:1,
          license_plate_no:data.data.data.rows[0].license_plate_no,
          deposit:data.data.data.rows[0].deposit,
          rent_amount:data.data.data.rows[0].rent_amount,
          mileage:data.data.data.rows[0].mileage,
          register_date:data.data.data.rows[0].register_date,
          get_vehicle_date:data.data.data.rows[0].get_vehicle_date,
          is_insurance:data.data.data.rows[0].is_insurance,
          is_keep:data.data.data.rows[0].is_keep,
          is_maintain:data.data.data.rows[0].is_maintain,
          is_service:data.data.data.rows[0].is_service,
          template:data.data.data.rows[0].template,
          keep_cycle:data.data.data.rows[0].keep_cycle,
          shortest_term:data.data.data.rows[0].shortest_term,
          is_show:data.data.data.rows[0].is_show,
          other_amount:data.data.data.rows[0].other_amount,
        })
      }
    }).catch(()=>{})
  }
  render() {
    const { ShowCarReocrd} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 10 },
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div>
          <Card bordered={false} style={{marginBottom:24,}}>
            <StandardFormRow title="请输入需要下架的车牌号" last >
              <Row>
                <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                  <FormItem  {...formItemLayout} >
                    {getFieldDecorator('license_plate_no', {
                      rules: [
                        { required: false, message: '请输入车牌号!' },
                      ],
                    })(
                      <AutoComplete dataSource={this.state.carName} onSelect={this.chanceCar} onSearch={this.CarNumberSearch} placeholder="请输入车牌号"/>
                    )}
                  </FormItem>
                </Col>
                <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                  <Button loading={this.state.confirmLoading} onClick={this.quickerCar} type="primary">快速查询</Button>
                </Col>
              </Row>
            </StandardFormRow>
          </Card>
        {
          this.state.showCard==1 &&
          <div>
            <Card title="上架车辆明细" extra={<Button loading={this.state.backcarLoading} onClick={this.refundvehicleSubmit} type="primary">下架</Button>} style={{marginBottom:24}}>
                <div style={{margin:'3% auto'}} className={styles.Flex3}>
                  <div className={styles.formDiv}>
                    <FormItem {...formItemLayout} label="车牌号">
                      <p>{this.state.license_plate_no}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="行驶里程">
                      <p>{this.state.mileage}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="是否包保险">
                      {this.state.is_insurance==1 && <p style={{color:'green'}}>是</p>}
                      {this.state.is_insurance!=1 && <p style={{color:'#f50'}}>否</p>}
                    </FormItem>
                    <FormItem {...formItemLayout} label="是否运营">
                      {this.state.is_service==1 && <p style={{color:'green'}}>是</p>}
                      {this.state.is_service!=1 && <p style={{color:'#f50'}}>否</p>}
                    </FormItem>
                    <FormItem {...formItemLayout} label="最短租期（月）">
                      <p>{this.state.shortest_term}</p>
                    </FormItem>
                  </div>
                  <div className={styles.formDiv}>
                    <FormItem {...formItemLayout} label="租金">
                      <p>{this.state.rent_amount}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="注册时间">
                      <p>{this.state.register_date}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="是否包维修">
                      {this.state.is_maintain==1 && <p style={{color:'green'}}>是</p>}
                      {this.state.is_maintain!=1 && <p style={{color:'#f50'}}>否</p>}
                    </FormItem>
                    <FormItem {...formItemLayout} label="品牌车型">
                      <p>{this.state.template}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="是否上架">
                      {this.state.is_show==1 && <p style={{color:'green'}}>是</p>}
                      {this.state.is_show!=1 && <p style={{color:'#f50'}}>否</p>}
                    </FormItem>
                  </div>
                  <div className={styles.formDiv}>
                    <FormItem {...formItemLayout} label="押金">
                      <p>{this.state.deposit}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="提车日期">
                      <p>{this.state.get_vehicle_date}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="是否包保养">
                      {this.state.is_keep==1 && <p style={{color:'green'}}>是</p>}
                      {this.state.is_keep!=1 && <p style={{color:'#f50'}}>否</p>}
                    </FormItem>
                    <FormItem {...formItemLayout} label="保养周期（公里）">
                      <p>{this.state.keep_cycle}</p>
                    </FormItem>
                    <FormItem {...formItemLayout} label="其他收费项目">
                      <p>{this.state.other_amount}</p>
                    </FormItem>
                  </div>
                </div>
            </Card>
          </div>
        }
      </div>
    );
  }
}
const UnderCar = Form.create()(underCar);

export default UnderCar;
