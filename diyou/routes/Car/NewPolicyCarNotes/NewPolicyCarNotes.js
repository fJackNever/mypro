import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,DatePicker, Card,Select,message, Button,AutoComplete,Icon,notification,Upload,Modal} from 'antd';

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
class newPolicyCarNotes extends PureComponent {
  state = {
    insuranceFile:[],
    commercialFile:[],
    ButtonLoading:false,
    ADDNewRoecord:1,
    licensePlateNodisabled:false,
    CarModel:''
  }
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}

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
        ADDNewRoecord:0,
        licensePlateNodisabled: true,
      })
      this.GetRentReocrd(window.location.href.split('entity_id=')[1])
    }else{
      var toDay  = new Date();
      this.props.form.setFields({
        insurance_policy_start_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        insurance_policy_end_time: {value: moment((new Date(toDay).getFullYear()+1) + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        commercial_insurance_policy_start_time: {value: moment(new Date(toDay).getFullYear() + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
        commercial_insurance_policy_end_time: {value: moment((new Date(toDay).getFullYear()+1) + '-' + (new Date(toDay).getMonth() + 1) + '-' + new Date(toDay).getDate())},
      })
    }
  }

  //获取保单记录详情
  GetRentReocrd = (target) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id",target);
    request('/api/web/vehicle/getPolicyInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          id:data.data.data.id,
        })
        if(data.data.data.insurance_policy_image_url){
          var insuranceFile =  [{
            uid: 1,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.insurance_policy_image_url,
          }];
        }else{
          var insuranceFile =  [];
        }
        if(data.data.data.commercial_insurance_policy_image_url){
          var commercialFile =  [{
            uid: 1,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.commercial_insurance_policy_image_url,
          }];
        }else{
          var commercialFile =  [];
        }
        this.setState({insuranceFile,commercialFile})
        this.props.form.setFields({
          license_plate_no:{value:data.data.data.license_plate_no},
          insurance_policy_no:{value:data.data.data.insurance_policy_no},
          commercial_insurance_policy_no:{value:data.data.data.commercial_insurance_policy_no},
          insurance_policy_start_time:{value:moment(data.data.data.insurance_policy_start_time)},
          insurance_policy_end_time:{value:moment(data.data.data.insurance_policy_end_time)},
          commercial_insurance_policy_start_time:{value:moment(data.data.data.commercial_insurance_policy_start_time)},
          commercial_insurance_policy_end_time:{value:moment(data.data.data.commercial_insurance_policy_end_time)},
          insurance_company_name:{value:data.data.data.insurance_company_name},
          insurance_org_code:{value:data.data.data.insurance_org_code},
          insurance_company:{value:data.data.data.insurance_company},
          commercial_company_name:{value:data.data.data.commercial_company_name},
          commercial_org_code:{value:data.data.data.commercial_org_code},
          commercial_company:{value:data.data.data.commercial_company},
          comment:{value:data.data.data.comment},
        })
      }
    }).catch(()=>{})
  }
  //新增租车记录
  AddRentRecordSubmit = ()=>{
    this.setState({
      ButtonLoading:true
    })
    this.props.form.validateFields((err, values) => {
      if(!err){
        let ARRFormData = new FormData();
        ARRFormData.append('key','diuber2017');
        ARRFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        ARRFormData.append('license_plate_no',values.license_plate_no);
        ARRFormData.append('insurance_policy_no',values.insurance_policy_no);
        ARRFormData.append('insurance_policy_start_time',new Date(values.insurance_policy_start_time._d).getFullYear()+'-'+(new Date(values.insurance_policy_start_time._d).getMonth()+1)+'-'+new Date(values.insurance_policy_start_time._d).getDate());
        ARRFormData.append('insurance_policy_end_time',new Date(values.insurance_policy_end_time._d).getFullYear()+'-'+(new Date(values.insurance_policy_end_time._d).getMonth()+1)+'-'+new Date(values.insurance_policy_end_time._d).getDate());
        ARRFormData.append('commercial_insurance_policy_no',values.commercial_insurance_policy_no);
        ARRFormData.append('commercial_insurance_policy_start_time',new Date(values.commercial_insurance_policy_start_time._d).getFullYear()+'-'+(new Date(values.commercial_insurance_policy_start_time._d).getMonth()+1)+'-'+new Date(values.commercial_insurance_policy_start_time._d).getDate());
        ARRFormData.append('commercial_insurance_policy_end_time',new Date(values.commercial_insurance_policy_end_time._d).getFullYear()+'-'+(new Date(values.commercial_insurance_policy_end_time._d).getMonth()+1)+'-'+new Date(values.commercial_insurance_policy_end_time._d).getDate());
        if(values.insurance_company_name){
          ARRFormData.append('insurance_company_name',values.insurance_company_name);
        }
        if(values.insurance_org_code){
          ARRFormData.append('insurance_org_code',values.insurance_org_code);
        }
        if(values.insurance_company){
          ARRFormData.append('insurance_company',values.insurance_company);
        }
        if(values.commercial_company_name){
          ARRFormData.append('commercial_company_name',values.commercial_company_name);
        }
        if(values.commercial_org_code){
          ARRFormData.append('commercial_org_code',values.commercial_org_code);
        }
        if(values.commercial_company){
          ARRFormData.append('commercial_company',values.commercial_company);
        }
        if(values.comment){
          ARRFormData.append('comment',values.comment);
        }

        if(this.state.ADDNewRoecord==1){
          if(this.state.insuranceFile!=''){
            ARRFormData.append('insurance_policy_image',this.state.insuranceFile[0].thumbUrl.split('base64,')[1]);
          }
          if(this.state.commercialFile!=''){
            ARRFormData.append('commercial_insurance_policy_image',this.state.commercialFile[0].thumbUrl.split('base64,')[1]);
          }
          request('/api/web/vehicle/addPolicy',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增保单记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=15&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          ARRFormData.append('id',this.state.id);
          if(this.state.insuranceFile!=''){
            if(this.state.insuranceFile[0].name!="xsz.png"){
              ARRFormData.append('insurance_policy_image',this.state.insuranceFile[0].thumbUrl.split('base64,')[1]);
            }
          }
          if(this.state.commercialFile!=''){
            if(this.state.commercialFile[0].name!="xsz.png"){
              ARRFormData.append('commercial_insurance_policy_image',this.state.commercialFile[0].thumbUrl.split('base64,')[1]);
            }
          }
          request('/api/web/vehicle/editPolicy',{
            method:'POST',
            body:ARRFormData,
            credentials: 'include',
          }).then((data)=> {
            this.setState({
              ButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改保单记录成功');
              this.props.history.push('/Car/CarManager/ShowCar?type=15&Car_id='+data.data.data.vehicle_id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
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


  searchRecordList = (target) =>{
    let CarReocrdFormData = new FormData();
    CarReocrdFormData.append('key','diuber2017');
    CarReocrdFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    CarReocrdFormData.append("vehicle_id", target);
    request('/api/web/vehicle/getValidataRecord',{
      method:'POST',
      body:CarReocrdFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        checkCarData:data.data.data.rows
      })
    }).catch(()=>{})
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:CarReocrdFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        RentCarData:data.data.data.rows
      })
    }).catch(()=>{})
    let ViolationFormData = new FormData();
    ViolationFormData.append('key','diuber2017');
    ViolationFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    ViolationFormData.append("license_plate_no", target);
    request('/api/web/vehicle/getViolationRecord',{
      method:'POST',
      body:ViolationFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        ViolationCarData:data.data.data.rows
      })
    }).catch(()=>{})
  }
  searchCustomer = (e)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", e.target.value);
    GFHFormData.append("limit", 10000);
    request('/api/web/customer/getCustomer',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.data.total==1){
        this.setState({
          customerTel : data.data.data.rows[0].telephone,
          customerIDNum : data.data.data.rows[0].id_number,
        })
      }else{
        this.setState({
          customerTel : '',
          customerIDNum : '',
        })
      }
    }).catch(()=>{})
  }
  searchCustomerID = (id) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", id);
    request('/api/web/customer/getCutsomerInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          customerTel : data.data.data.telephone,
          customerIDNum : data.data.data.id_number,
        })
      }else{
        this.setState({
          customerTel : '',
          customerIDNum : '',
        })
      }
    }).catch(()=>{})
  }

  //图片
  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  UploadinsuranceFile = (info) =>{
    this.setState({
      insuranceFile:info.fileList
    })
  }
  UploadcommercialFile = (info) =>{
    this.setState({
      commercialFile:info.fileList
    })
  }


  //交强险开始日期改变结束日期
  ChangeInsuranceStart = (dates,dateStrings)=>{
    this.props.form.setFields({
      insurance_policy_end_time: {value: moment((new Date(dates._d).getFullYear() + 1) + '-' + (new Date(dates._d).getMonth() + 1) + '-' + new Date(dates._d).getDate())},
    })
  }
  //商业险开始日期改变结束日期
  ChangeCommercialStart = (dates,dateStrings)=>{
    this.props.form.setFields({
      commercial_insurance_policy_end_time: {value: moment((new Date(dates._d).getFullYear() + 1) + '-' + (new Date(dates._d).getMonth() + 1) + '-' + new Date(dates._d).getDate())},
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
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择照片</div>
      </div>
    );
    return (
      <div>
        <Card style={{marginBottom:24}}>
          <Form className={styles.form} style={{dispay:'flex',flexFlow:'row'}}>
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="交强险保单照片">
                {getFieldDecorator('insurance_policy_image', {
                  rules: [{required: false, message: '请输入车牌号',}],
                })(
                  <Upload
                    action=""
                    fileList={this.state.insuranceFile}
                    listType="picture-card"
                    onPreview={this.handlePreview}
                    onChange={this.UploadinsuranceFile}
                  >
                    {this.state.insuranceFile.length >= 1 ? null : uploadButton}
                  </Upload>
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="商业险保单照片">
                {getFieldDecorator('commercial_insurance_policy_image', {
                  rules: [{required: false, message: '请输入车牌号',}],
                })(
                  <Upload
                    action=""
                    fileList={this.state.commercialFile}
                    listType="picture-card"
                    onPreview={this.handlePreview}
                    onChange={this.UploadcommercialFile}
                  >
                    {this.state.commercialFile.length >= 1 ? null : uploadButton}
                  </Upload>
                )}
              </FormItem>
            </div>
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
          </Form>
        </Card>
        <Card style={{marginBottom:24}}>
          <Form className={styles.form} >
            <div className={styles.formDiv}>
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
              <FormItem
                {...formItemLayout}
                label="交强险保单号"
              >
                {getFieldDecorator('insurance_policy_no', {
                  rules: [
                    { required: false, message: '请输入交强险保单号!' },
                  ],
                })(
                  <Input placeholder="请输入交强险保单号"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="交强险开始日期">
                {getFieldDecorator('insurance_policy_start_time',config)(
                  <DatePicker onChange={this.ChangeInsuranceStart}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="交强险结束日期">
                {getFieldDecorator('insurance_policy_end_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="交强险被保险公司名称"
              >
                {getFieldDecorator('insurance_company_name', {
                  rules: [
                    { required: false, message: '请输入交强险被保险公司名称!' },
                  ],
                })(
                  <Input placeholder="请输入交强险被保险公司名称"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="交强险组织机构代码"
              >
                {getFieldDecorator('insurance_org_code', {
                  rules: [
                    { required: false, message: '请输入交强险组织机构代码!' },
                  ],
                })(
                  <Input placeholder="请输入交强险组织机构代码"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="交强险保险公司"
              >
                {getFieldDecorator('insurance_company', {
                  rules: [
                    { required: false, message: '请输入交强险保险公司!' },
                  ],
                })(
                  <Input placeholder="请输入交强险保险公司"/>
                )}
              </FormItem>
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout}
                label="商业险保单号"
              >
                {getFieldDecorator('commercial_insurance_policy_no', {
                  rules: [
                    { required: false, message: '请输入商业险保单号!' },
                  ],
                })(
                  <Input placeholder="请输入商业险保单号"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="商业险开始日期">
                {getFieldDecorator('commercial_insurance_policy_start_time',config)(
                  <DatePicker onChange={this.ChangeCommercialStart}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout} label="商业险结束日期">
                {getFieldDecorator('commercial_insurance_policy_end_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="商业险被保险公司名称"
              >
                {getFieldDecorator('commercial_company_name', {
                  rules: [
                    { required: false, message: '请输入商业险被保险公司名称!' },
                  ],
                })(
                  <Input placeholder="请输入商业险被保险公司名称"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="商业险组织机构代码"
              >
                {getFieldDecorator('commercial_org_code', {
                  rules: [
                    { required: false, message: '请输入商业险组织机构代码!' },
                  ],
                })(
                  <Input placeholder="请输入商业险组织机构代码"/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="商业险保险公司"
              >
                {getFieldDecorator('commercial_company', {
                  rules: [
                    { required: false, message: '请输入商业险保险公司!' },
                  ],
                })(
                  <Input placeholder="请输入商业险保险公司"/>
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
                {
                  this.state.ADDNewRoecord==1 &&
                  <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddRentRecordSubmit} type="primary">确认增加</Button>
                }
                {
                  this.state.ADDNewRoecord!=1 &&
                  <Button disabled={this.state.ButtonDisabled} loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddRentRecordSubmit} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const NewPolicyCarNotes = Form.create()(newPolicyCarNotes);

export default NewPolicyCarNotes;
