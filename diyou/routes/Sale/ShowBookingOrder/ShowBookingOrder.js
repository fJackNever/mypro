import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form,Input,DatePicker,Checkbox, Card, Row, Col, Select, InputNumber, notification, Upload, Icon,Button,message,Modal} from 'antd';

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
class showBookingOrder extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    ButtonLoading:false,
    ADDNewRoecord:1,
    fileList:[],
    pay_status:1,
    refund_status:1,
  }
  componentDidMount() {
    if(window.location.href.split('OrderId=')[1]) {
      this.setState({
        ADDNewRoecord:0,
      })
      this.ShowRentalCarInfo(window.location.href.split('OrderId=')[1]);
    }
  }
//获取信息
  ShowRentalCarInfo = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", target);
    request('/api/web/show/getOrderInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        var fileList =  [{
          uid: 1,
          name: 'xsz.png',
          status: 'done',
          url: data.data.data.template_img_oss_path,
        }];
        this.setState({
          fileList:fileList,
          id:data.data.data.id,
          licensePlateNodisabled:true,
          pay_status:data.data.data.pay_status,
          status:data.data.data.status,
          refund_status:data.data.data.refund_status,
        })
        const plainOptions = [];
        if(data.data.data.is_insurance){
          plainOptions.push('is_insurance')
        }
        if(data.data.data.is_maintain){
          plainOptions.push('is_maintain')
        }
        if(data.data.data.is_keep){
          plainOptions.push('is_keep')
        }
        if(data.data.data.is_new){
          plainOptions.push('is_new')
        }
        if(data.data.data.is_service){
          plainOptions.push('is_service')
        }
        this.props.form.setFields({
          RadioGroup: {value:plainOptions},
          license_plate_no:{value:data.data.data.license_plate_no},
          template:{value:data.data.data.template},
          template_type:{value:data.data.data.template_type},
          order_no:{value:data.data.data.order_no},
          order_info:{value:data.data.data.order_info},
          deposit:{value:data.data.data.earnest},
          get_vehicle_time:{value:moment(data.data.data.get_vehicle_date)},
          register_date:{value:moment(data.data.data.register_date)},
          rent_amount:{value:data.data.data.rent_amount},
          rent_deposit:{value:data.data.data.deposit},
          telephone:{value:data.data.data.telephone},
          name:{value:data.data.data.user_name},
          shortest_term:{value:data.data.data.shortest_term},
          mileage:{value:data.data.data.mileage},
          keep_cycle:{value:data.data.data.keep_cycle},
        })
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
        AddMonthRentData.append('id', this.state.id);
        AddMonthRentData.append('status', this.state.status);
        request('/api/web/show/changeOrderStatus',{
          method:'POST',
          body:AddMonthRentData,
          credentials: 'include',
        }).then((data)=> {
          if(data.data.code==1){
            message.success('修改预订订单记录成功');
            this.props.history.push('/Sale/SaleManager?ListTitle=5');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //车辆照片照片
  UploadCarImg = (info)=>{
    this.setState({
      fileList:info.fileList
    })
  }
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //选择订单状态
  selectType = (value) =>{
    this.setState({
      status:value
    })
  }
  handleCancel = () => this.setState({ previewVisible: false })
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const config = {
      rules: [{ type: 'object', required: false, message: '请选择具体时间!' }],
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div>
        <div style={{margin:24}}>
          <Card className={styles.UploadCard} style={{marginBottom:24}}>
            <div style={{width:'100%',display:'flex'}}>
              <text  style={{marginRight:'24px'}}>上传行驶证照片自动识别信息 : </text>
              <div>
                <Upload
                  action=""
                  listType="picture-card"
                  fileList={this.state.fileList}
                  onPreview={this.handlePreview}
                  onChange={this.UploadCarImg}
                >
                  {this.state.fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </div>
              <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
              </Modal>
            </div>
          </Card>
          <Card>
            <Form className={styles.form}>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout}
                  label="车牌号"
                >
                  {getFieldDecorator('license_plate_no', {
                    rules: [
                      { required: false, message: '请输入车牌号!' },
                    ],
                  })(
                    <Input placeholder="请输入车牌号"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="品牌车型"
                >
                  {getFieldDecorator('template', {
                    rules: [
                      { required: false, message: '请输入品牌车型!' },
                    ],
                  })(
                    <Input placeholder="请输入品牌车型"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="车辆类型"
                >
                  {getFieldDecorator('template_type', {
                    rules: [
                      { required: false, message: '请输入车辆类型!' },
                    ],
                  })(
                    <Input placeholder="请输入车辆类型"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="用户名称"
                >
                  {getFieldDecorator('name', {
                    rules: [
                      { required: false, message: '请输入用户名称!' },
                    ],
                  })(
                    <Input placeholder="请输入用户名称"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="联系电话"
                >
                  {getFieldDecorator('telephone', {
                    rules: [
                      { required: false, message: '请输入联系电话!' },
                    ],
                  })(
                    <Input placeholder="请输入联系电话"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="订单编号"
                >
                  {getFieldDecorator('order_no', {
                    rules: [
                      { required: false, message: '请输入订单编号!' },
                    ],
                  })(
                    <Input placeholder="请输入订单编号"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="订单信息"
                >
                  {getFieldDecorator('order_info', {
                    rules: [
                      { required: false, message: '请输入订单信息!' },
                    ],
                  })(
                    <Input placeholder="请输入订单信息"  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="订单金额">
                  {getFieldDecorator('deposit', {
                    rules: [{required: false, message: '请输入订单金额',}],
                  })(
                    <InputNumber min={0}  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="租金">
                  {getFieldDecorator('rent_amount', {
                    rules: [{required: false, message: '请输入租金',}],
                  })(
                    <InputNumber min={0}  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="押金">
                  {getFieldDecorator('rent_deposit', {
                    rules: [{required: false, message: '请输入押金',}],
                  })(
                    <InputNumber min={0}  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="车辆信息"
                >
                  {getFieldDecorator('RadioGroup')(
                    <Checkbox.Group style={{ width: '100%' ,marginTop:'8px'}} onChange={this.onChange}  disabled={this.state.licensePlateNodisabled}>
                      <Row>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_insurance">是否包保险</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_maintain"> 是否包维修</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_keep">是否包保养</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_service">是否营运车</Checkbox></Col>
                        <Col className={styles.RowCol} span={12}><Checkbox value="is_new">是否新车</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </FormItem>
              </div>
              <div className={styles.formDiv}>
                <FormItem
                  {...formItemLayout} label="提车日期">
                  {getFieldDecorator('get_vehicle_time', config)(
                    <DatePicker   disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout} label="注册日期">
                  {getFieldDecorator('register_date', config)(
                    <DatePicker   disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="行驶里程（公里）">
                  {getFieldDecorator('mileage', {
                    rules: [{required: false, message: '请输入行驶里程',}],
                  })(
                    <InputNumber min={0}   disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="保养周期（公里）">
                  {getFieldDecorator('keep_cycle', {
                    rules: [{required: false, message: '请输入保养周期',}],
                  })(
                    <InputNumber min={0}   disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="最短租期（月）">
                  {getFieldDecorator('shortest_term', {
                    rules: [{required: false, message: '请输入最短租期',}],
                  })(
                    <InputNumber min={0}  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="支付状态"
                >
                  <Select value={this.state.pay_status} placeholder="请选择支付状态"  disabled={this.state.licensePlateNodisabled}>
                    <Option value={1}>未支付</Option>
                    <Option value={2}>已支付</Option>
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="订单状态"
                >
                  <Select value={this.state.status} placeholder="请选择订单状态" onChange={this.selectType}>
                    <Option value={1}>未完成</Option>
                    <Option value={2}>已完成</Option>
                    <Option value={3}>取消</Option>
                    <Option value={4}>已联系</Option>
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="退款状态"
                >
                  <Select value={this.state.refund_status} placeholder="请选择退款状态"  disabled={this.state.licensePlateNodisabled}>
                    <Option value={1}>未退款</Option>
                    <Option value={2}>已退款</Option>
                  </Select>
                </FormItem>
                <FormItem {...formItemLayout} label="其他费用信息">
                  {getFieldDecorator('other_amount', {
                    rules: [{required: false, message: '请输入其他费用信息',}],
                  })(
                    <TextArea placeholder="请输入其他收费项目，不要输入电话号码"  rows={4}  disabled={this.state.licensePlateNodisabled}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                  <Button  loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddSaleVehicle} type="primary">确认修改</Button>
                </FormItem>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}
const ShowBookingOrder = Form.create()(showBookingOrder);

export default ShowBookingOrder;
