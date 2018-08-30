import React, { PureComponent } from 'react';
import $ from 'jquery';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select, AutoComplete ,InputNumber,message, Icon, Button,Upload,Modal,notification ,Avatar } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class newBorrowCarNotes extends PureComponent {
  state = {
    UpdateButtonLoading:false,
    licensePlateNodisabled:false,
    accidentImg:[],
    showuploadButton:false,
    index:1,
    AddImgesList:[],
    AddAccidentImgesList:[],


    maintian_status:0,
    balance_status:1,
    get_vehicle_status:0,
    settlement_claims_status:0,
  }
  componentDidMount() {
    var toDay  = new Date();
    if(window.location.href.split('license_plate_no=')[1]){
      this.props.form.setFields({
        license_plate_no: {value:decodeURI(window.location.href.split('license_plate_no=')[1])}
      })
    }
    if(window.location.href.split('entity_id=')[1]){
      this.setState({
        licensePlateNodisabled:true,
      })
    }else{
      this.setState({
        licensePlateNodisabled:false
      })
      this.props.form.setFields({
        accident_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        in_maintain_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        miantain_finsih_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }


  AddAccidentSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          UpdateButtonLoading:true
        })
        var addimgfromData = [];
        var addimgfromDataUrl =[];
        for(var i=1;i<this.state.AddImgesList.length+1;i++){
          if($(`#vehicle_damage_img${i} img`)[0]){
            addimgfromDataUrl.push($(`#vehicle_damage_img${i} img`)[0].src.split('base64,')[1]);
          }else{
          }
          if($(`#detail_comment${i}`).html()){
            addimgfromData.push($(`#detail_comment${i}`).html());
          }else{
          }
        }

        let AddAccidentFormData = new FormData();
        AddAccidentFormData.append('key','diuber2017');
        AddAccidentFormData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        AddAccidentFormData.append('license_plate_no',values.license_plate_no);
        AddAccidentFormData.append('customer_name',values.customer_name);
        AddAccidentFormData.append('partner_name',values.partner_name);
        AddAccidentFormData.append('accident_time',new Date(values.accident_time._d).getFullYear()+'-'+(new Date(values.accident_time._d).getMonth()+1)+'-'+new Date(values.accident_time._d).getDate());
        AddAccidentFormData.append('settlement_claims_status',this.state.settlement_claims_status);
        AddAccidentFormData.append('balance_status',this.state.balance_status);

        if(values.responsible_party){
          AddAccidentFormData.append('responsible_party',values.responsible_party);
        }
        if(values.thirdparty_amount) {
          AddAccidentFormData.append('thirdparty_amount', values.thirdparty_amount);
        }
        if(values.own_amount) {
          AddAccidentFormData.append('own_amount', values.own_amount);
        }
        if(values.detail_record) {
          AddAccidentFormData.append('detail_record', values.detail_record);
        }
        if(values.comment) {
          AddAccidentFormData.append('comment', values.comment);
        }
        if(values.address) {
          AddAccidentFormData.append('address', values.address);
        }
        if(addimgfromDataUrl.length>0){
          AddAccidentFormData.append('vehicle_damage_img',JSON.stringify(addimgfromDataUrl));
        }
        if(addimgfromData.length>0){
          AddAccidentFormData.append('detail_comment',JSON.stringify(addimgfromData));
        }
        if(values.in_maintain_time){
          AddAccidentFormData.append('in_maintain_time',new Date(values.in_maintain_time._d).getFullYear()+'-'+(new Date(values.in_maintain_time._d).getMonth()+1)+'-'+new Date(values.in_maintain_time._d).getDate());
        }
        if(values.miantain_finsih_time){
          AddAccidentFormData.append('miantain_finsih_time',new Date(values.miantain_finsih_time._d).getFullYear()+'-'+(new Date(values.miantain_finsih_time._d).getMonth()+1)+'-'+new Date(values.miantain_finsih_time._d).getDate());
        }
        if(values.maintian_content) {
          AddAccidentFormData.append('maintian_content', values.maintian_content);
        }
        AddAccidentFormData.append('maintian_status',this.state.maintian_status);
        AddAccidentFormData.append('get_vehicle_status',this.state.get_vehicle_status);
        request('/api/web/vehicle/addAccident',{
          method:'POST',
          body:AddAccidentFormData,
          credentials:'include',
        }).then((data)=>{
          this.setState({
            UpdateButtonLoading:false
          })
          if(data.data.code==1){
            message.success('新增出险记录成功！')
            this.props.history.push("/Garage/workplace");
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch((data)=>{})
      }
    })
  }
  //预览照片
  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  ImgChange = (info)=>{
    this.setState({
      accidentImg:info.fileList
    })
  }
  ImgRemove = ()=> {
    this.setState({
      showuploadButton:false,
      accidentImg:[]
    })
  }

  //点击新增图片描述
  addImgaeListClick = ()=>{
    this.state.AddImgesList.push(this.state.index);
    this.setState({
      index:this.state.index+1,
      AddImgesList:this.state.AddImgesList,
    })
  }
  //查看客户的信息
  searchCustomer = (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", value);
    GFHFormData.append("limit", 10000);
    request('/api/web/customer/getCustomer',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.data.total==1){
        this.setState({
          customerTel : data.data.data.rows[0].telephone,
        })
      }else{
        this.setState({
          customerTel : '',
        })
      }
    }).catch(()=>{})
  }
  //更改理赔状态
  changeClaimsStatus = (value) =>{
    this.setState({
      settlement_claims_status:value
    })
  }
  //更改结算状态
  changeBalanceStatus = (value) =>{
    this.setState({
      balance_status:value
    })
  }
  //更改提车状态
  changeVehicleStatus = (value) =>{
    this.setState({
      get_vehicle_status:value
    })
  }
  //更改维修状态
  changeMaintianStatus= (value) =>{
    this.setState({
      maintian_status:value
    })
  }

  //联想修理厂名称
  ParterNameSearch = (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("partner_type",0);
    GFHFormData.append("search",value);
    request('/api/web/partner/thinkPartnerName',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const partname = data.data.data.rows.map((item)=>{
          return <Option value={item.name}>{item.name}</Option>
        })
        this.setState({
          ParterName:partname
        })
      }
    }).catch(()=>{})
  }
  //联想客户
  CustomerNameSearch =  (value)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    GFHFormData.append("limit",9999);
    request('/api/web/customer/thinkCustomerName',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const CustomerName = data.data.data.rows.map((item)=>{
          return <Option value={item.name}>{item.name}</Option>
        })
        this.setState({CustomerName})
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
    request('/api/web/vehicle/thinkVehicleLicensePlateNo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const carName = data.data.data.rows.map((item)=>{
          return <Option value={item.license_plate_no}>{item.license_plate_no}</Option>
        })
        this.setState({carName})
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
    const config2 = {
      rules: [{ type: 'object', required: false, message: '请选择具体时间!' }],
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const AddImges = this.state.AddImgesList.map((item)=>{
      return <div id={item}>
        <FormItem {...formItemLayout} label="车辆出险照片">
          {getFieldDecorator(`vehicle_damage_img${item}`, {
            rules: [{required: false, message: '请输入备注',}],
          })(
            <div style={{width:'112px',height:'112px',overflow:'hidden'}}>
              <Upload
                className={styles.imgBorder}
                listType="picture-card"
                onPreview={this.handlePreview}
                onChange={this.ImgChange}
                onRemove ={this.ImgRemove}
              >
                {this.state.showuploadButton ? null : uploadButton}
              </Upload>
              <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
              </Modal>
            </div>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="车辆出险描述">
          {getFieldDecorator(`detail_comment${item}`, {
            rules: [{required: false, message: '请输入车辆出险描述',}],
          })(
            <TextArea placeholder="如需记入车辆出险描述，请输入车辆出险描述"  rows={4} />
          )}
        </FormItem>
      </div>;
    })
    return (
      <PageHeaderLayout>
        <Card style={{marginBottom:24}}>
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete disabled={this.state.licensePlateNodisabled} dataSource={this.state.carName} onSearch={this.CarNumberSearch} placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="客户姓名"
              >
                {getFieldDecorator('customer_name', {
                  rules: [
                    { required: false, message: '请输入客户姓名!' },
                  ],
                })(
                  <AutoComplete dataSource={this.state.CustomerName} onSearch={this.CustomerNameSearch} onChange={this.searchCustomer} placeholder="请输入客户姓名"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="客户联系方式">
                <Input value={this.state.customerTel} disabled={true} placeholder="客户联系方式会自动联想" />
              </FormItem>
              <FormItem
                {...formItemLayout} label="事故地点">
                {getFieldDecorator('address', {
                  rules: [{required: false, message: '请输入事故地点!',}],
                })(
                  <Input placeholder="请输入事故地点"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="出险时间">
                {getFieldDecorator('accident_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="责任方">
                {getFieldDecorator('responsible_party', {
                  rules: [{required: false, message: '请输入责任方!',}],
                })(
                  <Input placeholder="请输入责任方"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="理赔状态"
              >
                <Select value={this.state.settlement_claims_status} onChange={this.changeClaimsStatus} placeholder="请选择理赔状态">
                  <Option value={0}>处理中</Option>
                  <Option value={1}>已完成</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout} label="己方金额(元)">
                {getFieldDecorator('own_amount', {
                  rules: [{required: false, message: '请输入己方金额!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="第三方金额(元)">
                {getFieldDecorator('thirdparty_amount', {
                  rules: [{required: false, message: '请输入第三方金额!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="详细描述">
                {getFieldDecorator('detail_record', {
                  rules: [{required: false, message: '请输入详细描述',}],
                })(
                  <TextArea placeholder="请输入详细描述"  rows={4} />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout} label="进厂时间">
                {getFieldDecorator('in_maintain_time',config2)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="修理厂">
                {getFieldDecorator('partner_name', {
                  rules: [{required: true, message: '请输入修理厂!',}],
                })(
                  <AutoComplete dataSource={this.state.ParterName} onSearch={this.ParterNameSearch} placeholder="请输入修理厂名称"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="维修内容">
                {getFieldDecorator('maintian_content', {
                  rules: [{required: false, message: '请输入维修内容',}],
                })(
                  <TextArea placeholder="请输入维修内容"  rows={4} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="维修状态"
              >
                <Select value={this.state.maintian_status} onChange={this.changeMaintianStatus} placeholder="请选择维修状态">
                  <Option value={0}>维修中</Option>
                  <Option value={1}>已修好</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout} label="出厂日期">
                {getFieldDecorator('miantain_finsih_time',config2)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="结算状态"
              >
                <Select value={this.state.balance_status}  onChange={this.changeBalanceStatus} placeholder="请选择结算状态">
                  <Option value={1}>未结算</Option>
                  <Option value={2}>已结算</Option>
                  <Option value={3}>已确认</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="提车状态"
              >
                <Select value={this.state.get_vehicle_status} onChange={this.changeVehicleStatus} placeholder="请选择提车状态">
                  <Option value={0}>未提车</Option>
                  <Option value={1}>已提车</Option>
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入备注',}],
                })(
                  <TextArea placeholder="如需备注，请输入备注信息"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                <Button loading={this.state.UpdateButtonLoading} className={styles.formButton} onClick={this.AddAccidentSubmit} type="primary">确认增加</Button>
              </FormItem>
            </div>
          </Form>
        </Card>
        <Card style={{marginBottom:24}} title="车辆出险照片以及描述">
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              {AddImges}
              <Button onClick={this.addImgaeListClick} style={{display:'block',margin:'0px auto'}} type="primary">新增车辆出险信息</Button>
            </div>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
const NewBorrowCarNotes = Form.create()(newBorrowCarNotes);

export default NewBorrowCarNotes;
