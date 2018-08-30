import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select,Upload , Button,notification,message,Icon,Modal,InputNumber,AutoComplete } from 'antd';

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
class newKeepCarNotes extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    ButtonLoading:false,
    ADDNewRoecord:1,
    AddImgesList:[],
    index:1,

    balance_status:1,
    get_vehicle_status:0,
    ShowImges:[],
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3  || permision==6){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}


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
      this.getReocrdInfo(window.location.href.split('entity_id=')[1]);
    }else{
      this.setState({
        licensePlateNodisabled:false
      })
      this.props.form.setFields({
        next_keep_vkt:{value:7000},
        next_keep_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 2) + '-' + new Date(toDay).getDate())},
        this_keep_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        get_vehicle_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }

  //获取保养记录详情
  getReocrdInfo = (target) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id",target);
    request('/api/web/vehicle/getKeepInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      var imageUrls = data.data.data.addition_image_urls;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      };
      const ShowImges = imageUrls.map((item)=>{
        var fileList = [{
          uid: 1,
          name: 'tupian.png',
          status: 'done',
          url: item.iamge_url,
        }];
        return <Form>
          <FormItem {...formItemLayout} label="车辆保养照片">
            <div style={{width:'112px',height:'112px',overflow:'hidden'}}>
              <Upload
                fileList={fileList}
                className={styles.imgBorder}
                listType="picture-card"
                onPreview={()=>this.handlePreview(fileList[0])}
              >
              </Upload>
              <Modal visible={this.state.previewVisible} footer={null} onCancel={()=>this.handleCancel()}>
                <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
              </Modal>
            </div>
          </FormItem>
          <FormItem  {...formItemLayout} label="车辆保养描述">
            <TextArea value={item.detail_comment} placeholder="如需记入车辆保养描述，请输入车辆保养描述"  rows={4} />
          </FormItem>
        </Form>
      })
      this.setState({
        ShowImges:ShowImges,
        id:data.data.data.id,
        balance_status:data.data.data.balance_status,
        get_vehicle_status:data.data.data.get_vehicle_status,
      })
      this.props.form.setFields({
        license_plate_no: {value: data.data.data.license_plate_no},
        customer_name: {value: data.data.data.customer_name},
        partner_name: {value: data.data.data.partner_name},
        this_keep_time: {value: moment(data.data.data.this_keep_time)},
        next_keep_time: {value: moment(data.data.data.next_keep_time)},
        get_vehicle_time: {value: moment(data.data.data.get_vehicle_time)},
        next_keep_vkt: {value: data.data.data.next_keep_vkt},
        amount: {value: data.data.data.amount},
        last_vkt: {value: data.data.data.last_vkt},
        comment: {value: data.data.data.comment},
      })
    }).catch(()=>{})
  }


  //新增借车记录
  AddBorrowReocrdSubmit = () =>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          ButtonLoading:true
        })
        if(this.state.ADDNewRoecord==1){
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
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('license_plate_no',values.license_plate_no);
          AddCarData.append('customer_name',values.customer_name);
          AddCarData.append('partner_name',values.partner_name);
          AddCarData.append('amount', values.amount);
          AddCarData.append('last_vkt', values.last_vkt);
          AddCarData.append('this_keep_time',new Date(values.this_keep_time._d).getFullYear()+'-'+(new Date(values.this_keep_time._d).getMonth()+1)+'-'+new Date(values.this_keep_time._d).getDate());
          if(values.next_keep_time){
            AddCarData.append('next_keep_time',new Date(values.next_keep_time._d).getFullYear()+'-'+(new Date(values.next_keep_time._d).getMonth()+1)+'-'+new Date(values.next_keep_time._d).getDate());
          }
          if(values.next_keep_vkt){
            AddCarData.append('next_keep_vkt', values.next_keep_vkt);
          }
          AddCarData.append('balance_status',this.state.balance_status);
          AddCarData.append('get_vehicle_status',this.state.get_vehicle_status);
          if(values.comment){
            AddCarData.append('comment',values.comment);
          }
          if(values.get_vehicle_time){
            AddCarData.append('get_vehicle_time',new Date(values.get_vehicle_time._d).getFullYear()+'-'+(new Date(values.get_vehicle_time._d).getMonth()+1)+'-'+new Date(values.get_vehicle_time._d).getDate());
          }
          if(addimgfromDataUrl.length>0){
            AddCarData.append('vehicle_damage_img',JSON.stringify(addimgfromDataUrl));
          }
          if(addimgfromData.length>0){
            AddCarData.append('detail_comment',JSON.stringify(addimgfromData));
          }
          request('/api/web/vehicle/addKeep',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增保养记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=12&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
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
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('id',this.state.id);
          AddCarData.append('customer_name',values.customer_name);
          AddCarData.append('partner_name',values.partner_name);
          AddCarData.append('amount', values.amount);
          AddCarData.append('last_vkt', values.last_vkt);
          AddCarData.append('this_keep_time',new Date(values.this_keep_time._d).getFullYear()+'-'+(new Date(values.this_keep_time._d).getMonth()+1)+'-'+new Date(values.this_keep_time._d).getDate());
          if(values.next_keep_time){
            AddCarData.append('next_keep_time',new Date(values.next_keep_time._d).getFullYear()+'-'+(new Date(values.next_keep_time._d).getMonth()+1)+'-'+new Date(values.next_keep_time._d).getDate());
          }
          if(values.next_keep_vkt){
            AddCarData.append('next_keep_vkt', values.next_keep_vkt);
          }
          AddCarData.append('balance_status',this.state.balance_status);
          AddCarData.append('get_vehicle_status',this.state.get_vehicle_status);
          if(values.comment){
            AddCarData.append('comment',values.comment);
          }
          if(values.get_vehicle_time){
            AddCarData.append('get_vehicle_time',new Date(values.get_vehicle_time._d).getFullYear()+'-'+(new Date(values.get_vehicle_time._d).getMonth()+1)+'-'+new Date(values.get_vehicle_time._d).getDate());
          }
          if(addimgfromDataUrl.length>0){
            AddCarData.append('vehicle_damage_img',JSON.stringify(addimgfromDataUrl));
          }
          if(addimgfromData.length>0){
            AddCarData.append('detail_comment',JSON.stringify(addimgfromData));
          }
          request('/api/web/vehicle/editKeep',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改保养记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=12&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }
  //选择验车类型
  changeBalanceStatus = (e)=>{
    this.setState({
      balance_status:e
    })
  }
  changeVehicleStatus = (e)=>{
    this.setState({
      get_vehicle_status:e
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

        let CarModel = ''

        data.data.data.rows.map(item => {
          if(item.license_plate_no === value){
            CarModel =  item.vehicle_template;
          }else{
            CarModel = ''
          }
        })

        this.setState({carName})
      }
    }).catch(()=>{})
  }
  ThinkRenNotes = (value)=>{
    console.log(value)
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search",value);
    request('/api/web/vehicle/thinkRentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        if(data.data.data && data.data.data.length > 0){
          this.props.form.setFields({
            customer_name: {value: data.data.data[0].customer_name},
          })
        }

      }
    })


    let CSFormData = new FormData();
    CSFormData.append('key','diuber2017');
    CSFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CSFormData.append("search",value)
    CSFormData.append("limit",9999);
    request('/api/web/vehicle/thinkVehicleLicensePlateNo',{
      method:'POST',
      body:CSFormData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code === 1){
        const CarModel = data.data.data.rows.map(item => {
          return item.vehicle_template
        })
        this.setState({CarModel})

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
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择图片</div>
      </div>
    );
    const AddImges = this.state.AddImgesList.map((item)=>{
      return <div id={item}>
        <FormItem {...formItemLayout} label="车辆保养照片">
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
        <FormItem {...formItemLayout} label="车辆保养描述">
          {getFieldDecorator(`detail_comment${item}`, {
            rules: [{required: false, message: '请输入车辆保养描述',}],
          })(
            <TextArea placeholder="如需记入车辆保养描述，请输入车辆保养描述"  rows={4} />
          )}
        </FormItem>
      </div>;
    })
    return (
      <div>
        <Card title={<div>保养记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 注意：只有使用嘀友提供的GPS设备才能够在下次保养公里数提醒！没有使用嘀友提供的GPS设备只能够在下次保养日期提醒！ )</span></div>}  style={{marginBottom:24}}>
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="车牌号">
                {getFieldDecorator('license_plate_no', {
                  rules: [{required: true, message: '请输入车牌号',}],
                })(
                  <AutoComplete onSelect={this.ThinkRenNotes} disabled={this.state.licensePlateNodisabled} dataSource={this.state.carName} onSearch={this.CarNumberSearch} placeholder="请输入车牌号"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="品牌车型">
                <Input value={this.state.CarModel} disabled={true} placeholder="品牌车型会自动联想" />
              </FormItem>
              <FormItem {...formItemLayout} label="客户姓名">
                {getFieldDecorator('customer_name', {
                  rules: [{required: true, message: '请输入客户姓名',}],
                })(
                  <AutoComplete dataSource={this.state.CustomerName} onSearch={this.CustomerNameSearch} placeholder="请输入客户姓名"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="修理厂名称">
                {getFieldDecorator('partner_name', {
                  rules: [{required: true, message: '请输入修理厂名称',}],
                })(
                  <AutoComplete dataSource={this.state.ParterName} onSearch={this.ParterNameSearch} placeholder="请输入修理厂名称"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="进厂时间">
                {getFieldDecorator('this_keep_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="保养金额(元)">
                {getFieldDecorator('amount', {
                  rules: [{required: true, message: '请输入保养金额!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="进厂公里数">
                {getFieldDecorator('last_vkt', {
                  rules: [{required: true, message: '请输入进厂公里数!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="下次保养日期">
                {getFieldDecorator('next_keep_time',config)(
                  <DatePicker />
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout} label="出厂日期">
                {getFieldDecorator('get_vehicle_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="下次保养公里数">
                {getFieldDecorator('next_keep_vkt', {
                  rules: [{required: false, message: '请输入下次保养公里数!',}],
                })(
                  <InputNumber min={1}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="结算状态"
              >
                <Select placeholder="请选择结算状态" value={this.state.balance_status} onChange={this.changeBalanceStatus}>
                  <Option value={1}>未结算</Option>
                  <Option value={2}>已结算</Option>
                  <Option value={3}>已确认</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="提车状态"
              >
                <Select placeholder="请选择提车状态" value={this.state.get_vehicle_status} onChange={this.changeVehicleStatus}>
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
                {
                  this.state.ADDNewRoecord == 1 &&
                  <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddBorrowReocrdSubmit} type="primary">确认增加</Button>
                }
                {
                  this.state.ADDNewRoecord == 0 &&
                  <Button disabled={this.state.ButtonDisabled}  loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddBorrowReocrdSubmit} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
        <Card style={{marginBottom:24}} title="车辆保养信息">
          <Form className={styles.form} >
            <div className={styles.formDiv}>
              {
                this.state.ADDNewRoecord != 1 &&
                this.state.ShowImges
              }
              {AddImges}
              <Button disabled={this.state.ButtonDisabled} onClick={this.addImgaeListClick} style={{display: 'block', margin: '0px auto'}} type="primary">新增车辆保养信息</Button>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const NewKeepCarNotes = Form.create()(newKeepCarNotes);

export default NewKeepCarNotes;
