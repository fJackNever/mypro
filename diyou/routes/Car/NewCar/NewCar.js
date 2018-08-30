import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select,Modal, Button, Upload, Icon,AutoComplete,message,notification,Popover} from 'antd';
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
class Workplaces extends PureComponent {
  state = {
    UploadTravelLicenseText:'',
    upLoadingLoading:true,
    upLoadingSuccess:true,
    upLoading:true,
    fileList:[],
    ButtonLoading:false,
    isNew:0,
  }
  componentDidMount() {
    this.checkNewCompany();
    var BodyColor = [{id:'A',name:'白色'},{id:'B',name:'灰色'},{id:'C',name:'黄色'},{id:'D',name:'粉色'},{id:'E',name:'红色'},
      {id:'F',name:'紫色'},{id:'G',name:'绿色'},{id:'H',name:'蓝色'},{id:'I',name:'棕色'},{id:'J',name:'黑色'},{id:'Z',name:'其他颜色'}];
    var ColorList  = BodyColor.map((item)=>{
      return <Option key={item.id}>{item.name}</Option>
    })
    this.setState({ColorList })
    let CarManFormData = new FormData();
    CarManFormData.append('key','diuber2017');
    CarManFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CarManFormData.append('role',0);
    CarManFormData.append('status',1);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:CarManFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        var cheguanList = data.data.data.rows.map((item) => {
          return <Option key={item.name}>{item.name}</Option>;
        });
        this.setState({cheguanList})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
      }).catch((e)=>{})
    let DriverManFormData = new FormData();
    DriverManFormData.append('key','diuber2017');
    DriverManFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    DriverManFormData.append('role',1);
    DriverManFormData.append('status',1);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:DriverManFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        var jiaguanList = data.data.data.rows.map((item) => {
          return <Option key={item.name}>{item.name}</Option>;
        });
        this.setState({jiaguanList})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
    let GetTemplateData = new FormData();
    GetTemplateData.append('key','diuber2017');
    GetTemplateData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GetTemplateData.append("limit", 1000);
    request('/api/web/vehicle/getTemplate',{
      method:'POST',
      body:GetTemplateData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        var templateList = data.data.data.rows.map((item) => {
          return <Option key={item.id}>{item.brand + '-' + item.model}</Option>;
        });
        this.setState({templateList})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
  }
  /*查看是否是显示新手教学*/
  checkNewCompany = ()=> {
    if(window.location.href.split('is_new=')[1]) {
      $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
      this.setState({
        isNew: 1,
      })
    }
  }

  //车辆具体信息多选
  onChange = (checkedList) => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    });
  }
  //新增车辆
  AddCarSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ButtonLoading:true})
        let AddCarData = new FormData();
        AddCarData.append('key','diuber2017');
        AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarData.append('license_plate_no',values.license_plate_no);
        AddCarData.append('vehicle_template',values.vehicle_template);
        if(values.vehicle_addition_img) {
          var vehicle_addition_img = [];
          for(var i = 0;i<values.vehicle_addition_img.length;i++){
            vehicle_addition_img.push(values.vehicle_addition_img[i].thumbUrl.split('base64,')[1])
          }
          AddCarData.append('vehicle_addition_img_arr',(vehicle_addition_img));
        }
        if(this.state.fileList!=''){
          AddCarData.append('travel_license_img',this.state.fileList[0].thumbUrl.split('base64,')[1]);
        }else{}
        if(values.body_color){
          AddCarData.append('body_color',values.body_color);
        }
        if(values.belong_company){
          AddCarData.append('belong_company',values.belong_company);
        }
        if(values.frame_number){
          AddCarData.append('frame_number',values.frame_number);
        }
        if(values.engine_number){
          AddCarData.append('engine_number',values.engine_number);
        }
        if(values.create_time){
          AddCarData.append('create_time',new Date(values.create_time._d).getFullYear()+'-'+(new Date(values.create_time._d).getMonth()+1)+'-'+new Date(values.create_time._d).getDate())
        }
        if(values.imei){
          AddCarData.append('imei',values.imei);
        }
        if(values.file_no){
          AddCarData.append('file_no',values.file_no);
        }
        if(values.actual_owner){
          AddCarData.append('actual_owner',values.actual_owner);
        }
        if(values.actual_owner_tel){
          AddCarData.append('actual_owner_tel',values.actual_owner_tel);
        }
        if(values.responsible_drive_admin){
          AddCarData.append('responsible_drive_admin',values.responsible_drive_admin);
        }
        if(values.responsible_vehicle_admin){
          AddCarData.append('responsible_vehicle_admin',values.responsible_vehicle_admin);
        }
        if(values.comment){
          AddCarData.append('comment',values.comment);
        }
        request('/api/web/vehicle/addVehicle',{
          method:'POST',
          body:AddCarData,
          credentials:'include',
        }).then((data)=>{
          this.setState({
            ButtonLoading:false
          })
          if(data.data.code==1){
            $("#Showed").remove();
            message.success('新增车辆成功');
            if(this.state.isNew==1){
              this.props.history.push('/Car/CarManager?is_new=2');
            }else{
              this.props.history.push('/Car/CarManager');
            }
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch((e)=>{})
      }
    })
  }
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  handleCancel = () => this.setState({ previewVisible: false })
  //识别行驶证照片
  UploadTravelLicense = (info)=>{
    this.setState({
      fileList:info.fileList,
    })
    if(info.file.status ==='removed'){
      this.setState({
        UploadTravelLicenseText:'',
        upLoadingLoading:true,
        upLoadingSuccess:true,
        upLoading:true
      })
      this.props.form.setFields({
        actual_owner: {value: ''},
        engine_number: {value: ''},
        frame_number: {value: ''},
        license_plate_no: {value: ''},
        register_date: {value: ''},
      })
    }else{
      this.setState({
        UploadTravelLicenseText:'努力识别中...',
      })
    }
    if(info.file.status ==='uploading'){
      this.setState({
        upLoadingLoading:false,
        upLoadingSuccess:true,
        upLoading:true
      })
    }
    if(info.file.status ==='error'){
      this.setState({
        UploadTravelLicenseText:'上传失败！',
        upLoadingLoading:true,
        upLoadingSuccess:true,
        upLoading:false,
      })
    }
    if(info.file.status ==='done'){
      if(info.fileList[info.fileList.length-1]){
        let fromData = new FormData();
        fromData.append('key','diuber2017');
        fromData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        fromData.append("file", info.fileList[info.fileList.length-1].thumbUrl.split('base64,')[1]);
        request('/api/web/vehicle/xszcard',{
          method:'POST',
          body:fromData,
          credentials: 'include',
        }).then((data)=> {
          if(data.data.code==1){
            this.setState({
              UploadTravelLicenseText:'识别成功！',
              upLoadingLoading:true,
              upLoadingSuccess:false,
              upLoading:true,
              travel_license:info.fileList[info.fileList.length-1].thumbUrl.split('base64,')[1]
            })
            this.props.form.setFields({
              actual_owner: {value: data.data.data.actual_owner,},
              engine_number: {value: data.data.data.engine_number,},
              frame_number: {value: data.data.data.frame_number,},
              license_plate_no: {value: data.data.data.license_plate_no,},
              register_date: {value: data.data.data.register_date,},
            })
          }else{
            this.setState({
              UploadTravelLicenseText:'识别失败！',
              upLoadingLoading:true,
              upLoadingSuccess:true,
              upLoading:false,

            })
          }
        }).catch(()=>{})
      }
    }

  }
  /*上传图片*/
  normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  //合作租赁公司联想
  getCompanyInter = (value)=>{
    let GetcompanyData = new FormData();
    GetcompanyData.append('key','diuber2017');
    GetcompanyData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GetcompanyData.append("partner_type", 1);
    GetcompanyData.append("search", value);
    GetcompanyData.append("limit", 1000);
    request('/api/web/partner/getPartner',{
      method:'POST',
      body:GetcompanyData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        var CompanyList = data.data.data.rows.map((item) => {
          return <Option key={item.name}>{item.name}</Option>;
        });
        this.setState({CompanyList})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  render() {
    const { CompanyList,ColorList,jiaguanList,cheguanList,templateList,fileList,previewVisible, previewImage,  } = this.state;
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
        <div className="ant-upload-text">选择照片</div>
      </div>
    );
    return (
      <div>
        {
          this.state.isNew==0 &&
          <div>
            <Card title={<div>新增车辆</div>} style={{marginBottom:24}}>
              <div style={{width:'100%',display:'flex'}}>
                <text  style={{marginRight:'24px'}}>上传行驶证照片自动识别信息 : </text>
                <div>
                    <Upload
                      action=""
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={this.handlePreview}
                      onChange={this.UploadTravelLicense}
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                  <div style={{marginTop:'24px'}}>
                    <Icon hidden={this.state.upLoadingLoading} type="loading" style={{color:'#1890ff',marginRight:'10px'}}/>
                    <Icon hidden={this.state.upLoadingSuccess} type="check-circle" style={{color:'#48c23d',marginRight:'10px'}}/>
                    <Icon hidden={this.state.upLoading} type="close-circle-o" style={{color:'#f00',marginRight:'10px'}}/>
                    {this.state.UploadTravelLicenseText}
                  </div>
                </div>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </div>
            </Card>
            <Card>
              <Form  className={styles.form}>
                <div className={styles.formDiv}>
                  <FormItem {...formItemLayout} label="车牌号">
                    {getFieldDecorator('license_plate_no', {
                      rules: [{required: true, message: '请输入车牌号',}],
                    })(
                      <Input placeholder="请输入车牌号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="品牌车型"
                  >
                    {getFieldDecorator('vehicle_template', {
                      rules: [
                        { required: true, message: '请选择品牌车型!' },
                      ],
                    })(
                      <AutoComplete dataSource={templateList} placeholder="请选择品牌车型"/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="车身颜色"
                  >
                    {getFieldDecorator('body_color', {
                      rules: [
                        { required: false, message: '请选择车身颜色!' },
                      ],
                    })(
                      <AutoComplete dataSource={ColorList} placeholder="请选择车身颜色"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="所属公司">
                    {getFieldDecorator('belong_company', {
                      rules: [{required: false, message: '请输入所属公司',}],
                    })(
                      <AutoComplete dataSource={CompanyList} placeholder="请输入所属公司"  onSearch={this.getCompanyInter}/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="车架号">
                    {getFieldDecorator('frame_number', {
                      rules: [{required: false, message: '请输入车架号',}],
                    })(
                      <Input placeholder="请输入车架号" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="发动机号">
                    {getFieldDecorator('engine_number', {
                      rules: [{required: false, message: '请输入发动机号',}],
                    })(
                      <Input placeholder="请输入发动机号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="注册日期">
                    {getFieldDecorator('create_time', config)(
                      <DatePicker />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="档案编号">
                    {getFieldDecorator('file_no', {
                      rules: [{required: false, message: '请输入档案编号',}],
                    })(
                      <Input placeholder="请输入档案编号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="GPS设备号">
                    {getFieldDecorator('imei', {
                      rules: [{required: false, message: '请输入GPS设备号',}],
                    })(
                      <Input placeholder="请输入GPS设备号" />
                    )}
                  </FormItem>
                </div>
                <div className={styles.formDiv}>
                  <FormItem
                    {...formItemLayout} label="实际车主">
                    {getFieldDecorator('actual_owner', {
                      rules: [{required: false, message: '请输入实际车主',}],
                    })(
                      <Input placeholder="请输入实际车主" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="实际车主电话">
                    {getFieldDecorator('actual_owner_tel', {
                      rules: [{required: false, message: '请输入实际车主电话',}],
                    })(
                      <Input placeholder="请输入实际车主电话" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="负责车管"
                  >
                    {getFieldDecorator('responsible_vehicle_admin', {
                      rules: [
                        { required: false, message: '请选择负责车管!' },
                      ],
                    })(
                      <AutoComplete  dataSource={cheguanList}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="负责驾管"
                  >
                    {getFieldDecorator('responsible_drive_admin', {
                      rules: [
                        { required: false, message: '请选择负责驾管!' },
                      ],
                    })(
                      <AutoComplete dataSource={jiaguanList} />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="车辆附加照片"
                  >
                    {getFieldDecorator('vehicle_addition_img', {
                      valuePropName: 'vehicle_addition_img',
                      getValueFromEvent: this.normFile,
                      rules: [
                        { required: false, message: '请选择上传车辆附加照片!' },
                      ],
                    })(
                      <Upload listType="picture" multiple={true}>
                        <Button>
                          <Icon type="upload" /> 上传车辆附加照片
                        </Button>
                      </Upload>
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
                    <Button loading={this.state.ButtonLoading} className={styles.formButton}  onClick={()=>this.AddCarSubmit()} type="primary">确认增加</Button>
                  </FormItem>
                </div>
              </Form>
            </Card>
          </div>
        }
        {
          this.state.isNew==1 &&
          <Popover content={<div style={{padding:'12px 0px',color:'red'}}>这里可以自动识别行驶证照片哦！</div>} visible={true}>
          <div style={{position:'relative',zIndex:'1010',}}>
            <Card className={styles.UploadCard} style={{marginBottom:24}}>
              <div style={{width:'100%',display:'flex'}}>
                <text  style={{marginRight:'24px'}}>上传行驶证照片自动识别信息 : </text>
                <div>
                  <Upload
                    action=""
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.UploadTravelLicense}
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <div style={{marginTop:'24px'}}>
                    <Icon hidden={this.state.upLoadingLoading} type="loading" style={{color:'#1890ff',marginRight:'10px'}}/>
                    <Icon hidden={this.state.upLoadingSuccess} type="check-circle" style={{color:'#48c23d',marginRight:'10px'}}/>
                    <Icon hidden={this.state.upLoading} type="close-circle-o" style={{color:'#f00',marginRight:'10px'}}/>
                    {this.state.UploadTravelLicenseText}
                  </div>
                </div>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </div>
            </Card>
            <Card>
              <Form  className={styles.form}>
                <div className={styles.formDiv}>
                  <FormItem {...formItemLayout} label="车牌号">
                    {getFieldDecorator('license_plate_no', {
                      rules: [{required: true, message: '请输入车牌号',}],
                    })(
                      <Input placeholder="请输入车牌号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="品牌车型"
                  >
                    {getFieldDecorator('vehicle_template', {
                      rules: [
                        { required: true, message: '请选择品牌车型!' },
                      ],
                    })(
                      <AutoComplete dataSource={templateList} />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="车身颜色"
                  >
                    {getFieldDecorator('body_color', {
                      rules: [
                        { required: false, message: '请选择车身颜色!' },
                      ],
                    })(
                      <AutoComplete dataSource={ColorList} />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="所属公司">
                    {getFieldDecorator('belong_company', {
                      rules: [{required: false, message: '请输入所属公司',}],
                    })(
                      <Input placeholder="请输入所属公司" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="车架号">
                    {getFieldDecorator('frame_number', {
                      rules: [{required: false, message: '请输入车架号',}],
                    })(
                      <Input placeholder="请输入车架号" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="发动机号">
                    {getFieldDecorator('engine_number', {
                      rules: [{required: false, message: '请输入发动机号',}],
                    })(
                      <Input placeholder="请输入发动机号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="注册日期">
                    {getFieldDecorator('create_time', config)(
                      <DatePicker />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="档案编号">
                    {getFieldDecorator('file_no', {
                      rules: [{required: false, message: '请输入档案编号',}],
                    })(
                      <Input placeholder="请输入档案编号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="GPS设备号">
                    {getFieldDecorator('imei', {
                      rules: [{required: false, message: '请输入GPS设备号',}],
                    })(
                      <Input placeholder="请输入GPS设备号" />
                    )}
                  </FormItem>
                </div>
                <div className={styles.formDiv}>
                  <FormItem
                    {...formItemLayout} label="实际车主">
                    {getFieldDecorator('actual_owner', {
                      rules: [{required: false, message: '请输入实际车主',}],
                    })(
                      <Input placeholder="请输入实际车主" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="实际车主电话">
                    {getFieldDecorator('actual_owner_tel', {
                      rules: [{required: false, message: '请输入实际车主电话',}],
                    })(
                      <Input placeholder="请输入实际车主电话" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="负责车管"
                  >
                    {getFieldDecorator('responsible_vehicle_admin', {
                      rules: [
                        { required: false, message: '请选择负责车管!' },
                      ],
                    })(
                      <AutoComplete  dataSource={cheguanList}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="负责驾管"
                  >
                    {getFieldDecorator('responsible_drive_admin', {
                      rules: [
                        { required: false, message: '请选择负责驾管!' },
                      ],
                    })(
                      <AutoComplete dataSource={jiaguanList} />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="车辆附加照片"
                  >
                    {getFieldDecorator('vehicle_addition_img', {
                      valuePropName: 'vehicle_addition_img',
                      getValueFromEvent: this.normFile,
                      rules: [
                        { required: false, message: '请选择上传车辆附加照片!' },
                      ],
                    })(
                      <Upload listType="picture" multiple={true}>
                        <Button>
                          <Icon type="upload" /> 上传车辆附加照片
                        </Button>
                      </Upload>
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
                    <Button loading={this.state.ButtonLoading} className={styles.formButton}  onClick={()=>this.AddCarSubmit()} type="primary">确认增加</Button>
                  </FormItem>
                </div>
              </Form>
            </Card>
          </div>
          </Popover>
        }
      </div>
    );
  }
}
const Workplace = Form.create()(Workplaces);

export default Workplace;
