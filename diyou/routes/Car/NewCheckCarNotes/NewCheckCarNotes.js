import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker,TimePicker,AutoComplete, Card,Select,Upload , Button,notification,message,Icon,Modal } from 'antd';

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
class newCheckCarNotes extends PureComponent {
  state = {
    licensePlateNodisabled:false,
    ButtonLoading:false,
    ADDNewRoecord:1,
    CheckCarType:1,
    is_insurance:1,
    is_travel:1,
    is_operate:1,
    status:1,
    AddImgesList:[],
    index:1,
    ShowImges:[],
    CarModel:''
  }
  componentDidMount() {
    var toDay  = new Date();
    this.getCheckMan();

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
      this.getCheckInfoInter();
    }else{
      this.setState({
        licensePlateNodisabled:false,
        validata_time: new Date(toDay).getHours() + ':' + new Date(toDay).getMinutes() + ':' + new Date(toDay).getSeconds(),
      })
      this.props.form.setFields({
        validata_date: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }
  //获取验车信息
  getCheckInfoInter = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id", window.location.href.split('entity_id=')[1]);
    request('/api/web/vehicle/getValidataInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        var imageUrls = data.data.data.addition_image_urls;
        for(var i = 1;i<=imageUrls.length;i++){
          this.state.AddImgesList.push(i)
        }
        const formItemLayout = {
          labelCol: { span: 6 },
          wrapperCol: { span: 14 },
        };
        var ShowImges  = imageUrls.map((item)=>{
          var fileList = [{
            uid: 1,
            name: 'tupian.png',
            status: 'done',
            url: item.iamge_url,
          }];
          return  <Form>
            <FormItem {...formItemLayout} label="车辆出险照片">
              <div style={{width:'112px',height:'112px',overflow:'hidden'}}>
                <Upload
                  fileList={fileList}
                  className={styles.imgBorder}
                  listType="picture-card"
                  onPreview={()=>this.handlePreview(fileList[0])}
                >
                </Upload>
              </div>
            </FormItem>
            <FormItem  {...formItemLayout} label="车辆出险描述">
              <TextArea value={item.detail_comment} placeholder="如需记入车辆出险描述，请输入车辆出险描述"  rows={4} />
            </FormItem>
          </Form>
        })
        this.setState({ShowImges})
        this.SearchFormCheck(data.data.data.validata_per);
        this.setState({
          is_insurance:data.data.data.is_insurance,
          is_travel:data.data.data.is_travel,
          is_operate:data.data.data.is_operate,
          status:data.data.data.status,
          CheckCarType:data.data.data.type,
          validata_time:data.data.data.validata_time,
        })
        this.props.form.setFields({
          license_plate_no: {value: data.data.data.license_plate_no},
          validata_date: {value: moment(data.data.data.validata_date)},
          even_number: {value: data.data.data.even_number},
          comment: {value: data.data.data.comment},
        })
      }
    }).catch(()=>{})
  }
  getCheckMan = ()=>{
    let CarManFormData = new FormData();
    CarManFormData.append('key','diuber2017');
    CarManFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CarManFormData.append('status',1);
    CarManFormData.append('role',0);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:CarManFormData,
      credentials: 'include',
    }).then((data)=> {
      var jiaguanList = data.data.data.rows.map((item) => {
        return <Option key={item.telephone}>{item.name}(车管)</Option>;
      });
      this.setState({jiaguanList})
    }).catch(()=>{})
    let CarFormData = new FormData();
    CarFormData.append('key','diuber2017');
    CarFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CarFormData.append('status',1);
    CarFormData.append('role',1);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:CarFormData,
      credentials: 'include',
    }).then((data)=> {
      var cheguanList = data.data.data.rows.map((item) => {
        return <Option key={item.telephone}>{item.name}(驾管)</Option>;
      });
      this.setState({cheguanList})
    }).catch(()=>{})
  }
  SearchFormCheck = (search) =>{
    let SearchFormData = new FormData();
    SearchFormData.append('key','diuber2017');
    SearchFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SearchFormData.append("search",search);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:SearchFormData,
      credentials: 'include',
    }).then((data)=> {
      this.props.form.setFields({
          name:{value:data.data.data.rows[0].name}
      })
    }).catch(()=>{})
  }


  //新增借车记录
  AddBorrowReocrdSubmit = () =>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ButtonLoading:true})
          var addimgfromData = [];
          var addimgfromDataUrl =[];
          for(var i=1;i<this.state.AddImgesList.length+1;i++){
            if($(`#vehicle_damage_img${i} img`)[0]){
              addimgfromDataUrl.push($(`#vehicle_damage_img${i} img`)[0].src.split('base64,')[1]);
            }else{}
            if($(`#detail_comment${i}`).html()){
              addimgfromData.push($(`#detail_comment${i}`).html());
            }else{}
          }

          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('license_plate_no',values.license_plate_no);
          AddCarData.append('is_insurance',this.state.is_insurance);
          AddCarData.append('is_travel',this.state.is_travel);
          AddCarData.append('is_operate',this.state.is_operate);
          AddCarData.append('validata_time',this.state.validata_time);
          AddCarData.append('validata_date',new Date(values.validata_date._d).getFullYear()+'-'+(new Date(values.validata_date._d).getMonth()+1)+'-'+new Date(values.validata_date._d).getDate());
          AddCarData.append('even_number',values.even_number);
          AddCarData.append('status',this.state.status);
          AddCarData.append('validata_per',values.validata_per);
          AddCarData.append('type',this.state.CheckCarType);

          if(values.comment){
            AddCarData.append('comment',values.comment);
          }
          if(addimgfromDataUrl.length>0){
            AddCarData.append('vehicle_damage_img',JSON.stringify(addimgfromDataUrl));
          }
          if(addimgfromData.length>0){
            AddCarData.append('detail_comment',JSON.stringify(addimgfromData));
          }
          request('/api/web/vehicle/addValidata',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增验车记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?Car_id='+data.data.data.vehicle_id);
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})

      }
    })
  }
  //选择验车类型
  changeCheckCarType = (e)=>{
    this.setState({
      CheckCarType:e
    })
  }
  changeIsinsurance = (e)=>{
    this.setState({
      is_insurance:e
    })
  }
  changeIstravel = (e)=>{
    this.setState({
      is_travel:e
    })
  }
  changeIsoperate = (e)=>{
    this.setState({
      is_operate:e
    })
  }
  changeStatus= (e)=>{
    this.setState({
      status:e
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
  //选择验车时间
  changeValidateTime = (time)=>{
    this.setState({
      validata_time:time,
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
      <div>
        <Card title={<div>验车记录<span style={{color:'#f50',fontSize:'14px',marginLeft:'24px'}}>( 记录车况信息 )</span></div>} style={{marginBottom:24}}>
          <Form className={styles.form}>
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
                label="验车类型"
              >
                <Select value={this.state.CheckCarType} onChange={this.changeCheckCarType} placeholder="请选择验车类型">
                  <Option value={1}>发车</Option>
                  <Option value={2}>退车</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="保单复印件"
              >
                <Select value={this.state.is_insurance} onChange={this.changeIsinsurance} placeholder="请选择是否有保单复印件">
                  <Option value={1}>有</Option>
                  <Option value={0}>无</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="行驶证"
              >
                <Select value={this.state.is_travel} onChange={this.changeIstravel} placeholder="请选择是否有行驶证">
                  <Option value={1}>有</Option>
                  <Option value={0}>无</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="营运证（硬卡）"
              >
                <Select value={this.state.is_operate} onChange={this.changeIsoperate} placeholder="请选择是否有营运证">
                  <Option value={1}>有</Option>
                  <Option value={0}>无</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="车损状态"
              >
                <Select value={this.state.status} onChange={this.changeStatus} placeholder="请选择是否有车损状态">
                  <Option value={0}>有车损</Option>
                  <Option value={1}>无车损</Option>
                </Select>
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout} label="验车完成日期">
                {getFieldDecorator('validata_date',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="验车完成时间">
                  <TimePicker value={moment(this.state.validata_time, 'HH:mm:ss')} onChange={this.changeValidateTime}/>
              </FormItem>
              <FormItem {...formItemLayout} label="公里数">
                {getFieldDecorator('even_number', {
                  rules: [{required: true, message: '请输入公里数',}],
                })(
                  <Input placeholder="请输入公里数" />
                )}
              </FormItem>
              {
                this.state.ADDNewRoecord == 1 &&
                <FormItem
                  {...formItemLayout}
                  label="验车人"
                >
                  {getFieldDecorator('validata_per', {
                    rules: [{required: true, message: '请选择验车人',}],
                  })(
                    <Select placeholder="请选择验车人">
                      {this.state.jiaguanList}
                      {this.state.cheguanList}
                    </Select>
                  )}
                </FormItem>
              }
              {
                this.state.ADDNewRoecord == 0 &&
                <FormItem {...formItemLayout} label="验车人">
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: '请输入验车人',}],
                  })(
                    <Input placeholder="请输入验车人" />
                  )}
                </FormItem>
              }
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
              </FormItem>
            </div>
          </Form>
        </Card>
        {this.state.status==0 &&
          <Card style={{marginBottom:24}} title="车辆损伤信息">
            <Form className={styles.form} >
              <div className={styles.formDiv}>
                {
                  this.state.ADDNewRoecord == 1 &&
                  <div>
                    {AddImges}
                    <Button onClick={this.addImgaeListClick} style={{display: 'block', margin: '0px auto'}} type="primary">新增车辆损伤信息</Button>
                  </div>
                }
                {
                  this.state.ADDNewRoecord != 1 &&
                  <div>
                    {this.state.ShowImges}
                  </div>
                }
              </div>
            </Form>
          </Card>
        }
      </div>
    );
  }
}
const NewCheckCarNotes = Form.create()(newCheckCarNotes);

export default NewCheckCarNotes;
