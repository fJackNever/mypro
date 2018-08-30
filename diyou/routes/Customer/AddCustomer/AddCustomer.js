import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input, Card,Select,Radio,Button, Upload, Icon,Modal,message,notification} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class addCustomer extends PureComponent {
  state = {
    showIDCardButton:false,
    showDriverButton:false,
    type:1,
    UpdateButtonLoading:false,
    upLoadingLoading:true,
    upLoadingSuccess:true,
    upLoading:true,
  }
  componentDidMount() {

  }
  //预览照片
  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //上传照片
  DriverChange = (info)=>{
    this.setState({
      showDriverButton:true,
      driving_license_img:info.fileList
    })
  }
  DriverImgRemove = ()=> {
    this.setState({
      showDriverButton:false,
      driving_license_img:[]
    })
  }
  IDCardImgRemove = ()=> {
    this.setState({
      showIDCardButton:false,
      id_card_img:[],
      upLoadingLoading:true,
      upLoadingSuccess:true,
      upLoading:true,
      UploadTravelLicenseText:'',
    })
    this.props.form.setFields({
      name: {value: ''},
      home_address: {value: ''},
      id_number: {value: ''},
    })
  }
  //识别身份证照片
  IDCardChange = (info)=>{
    this.setState({
      showIDCardButton:true,
      id_card_img:info.fileList
    })
    if(info.file.status ==='uploading'){
      this.setState({
        UploadTravelLicenseText:'正在上传...',
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
      this.setState({
        UploadTravelLicenseText: '正在识别...',
      })
      if(info.fileList[info.fileList.length-1]){
        let fromData = new FormData();
        fromData.append('key','diuber2017');
        fromData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        fromData.append("file", info.fileList[info.fileList.length-1].thumbUrl.split('base64,')[1]);
        request('/api/web/customer/idcradfx',{
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
            })
            this.props.form.setFields({
              name:{value:data.data.data.name},
              home_address:{value:data.data.data.address},
              id_number:{value:data.data.data.id_no},
            })
          }else{
            this.setState({
              upLoadingLoading:true,
              upLoadingSuccess:true,
              upLoading:false,
              UploadTravelLicenseText:'识别失败！',
            })
          }
        }).catch(()=>{})
      }
    }
  }
  //选择是个人还是公司
  ChangeType = (value)=>{
    this.setState({
      type:value
    })
  }
  //新增客户
  AddCustomerSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          UpdateButtonLoading:true
        })
        if(this.state.type==1){
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('name',values.name);
          if(values.telephone){AddCarData.append('telephone',values.telephone);}
          if(values.id_number){AddCarData.append('id_number',values.id_number);}
          if(values.emergency_contact_telephone){AddCarData.append('emergency_contact_telephone',values.emergency_contact_telephone);}
          if(values.home_address){AddCarData.append('home_address',values.home_address);}
          if(values.emergency_contact){AddCarData.append('emergency_contact',values.emergency_contact);}
          if(values.comment){AddCarData.append('comment',values.comment);}
          if(values.sex){AddCarData.append('sex',values.sex);}
          if(this.state.id_card_img) {
            AddCarData.append('id_card_img',this.state.id_card_img[0].thumbUrl.split('base64,')[1]);
          }
          if(this.state.driving_license_img) {
            AddCarData.append('driving_license_img',this.state.driving_license_img[0].thumbUrl.split('base64,')[1]);
          }
          request('/api/web/customer/addPersonalCustomer',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增个人客户成功！')
              this.props.history.push("/Customer");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('name',values.name);
          if(values.telephone){AddCarData.append('telephone',values.telephone);}
          if(values.id_number){AddCarData.append('id_number',values.id_number);}
          if(values.emergency_contact_telephone){AddCarData.append('emergency_contact_telephone',values.emergency_contact_telephone);}
          if(values.home_address){AddCarData.append('home_address',values.home_address);}
          if(values.emergency_contact){AddCarData.append('emergency_contact',values.emergency_contact);}
          if(values.comment){AddCarData.append('comment',values.comment);}
          if(values.sex){AddCarData.append('sex',values.sex);}
          if(this.state.id_card_img) {
            AddCarData.append('id_card_img',this.state.id_card_img[0].thumbUrl.split('base64,')[1]);
          }
          if(this.state.driving_license_img) {
            AddCarData.append('business_license_img',this.state.driving_license_img[0].thumbUrl.split('base64,')[1]);
          }
          request('/api/web/customer/addCompanyCustomer',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增公司客户成功！')
              this.props.history.push("/Customer");
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
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择照片</div>
      </div>
    );
    return (
      <div>
        <Card style={{marginBottom:24}}>
            <Form className={styles.form}>
              <FormItem
                style={{width:'50%'}}

                {...formItemLayout}
                label="客户类型"
              >
                <Select value={this.state.type} onChange={this.ChangeType} placeholder="请选择客户类型">
                  <Option value={1}>个人</Option>
                  <Option value={2}>公司</Option>
                </Select>
              </FormItem>
            </Form>
        </Card>
        <Card>
          <Form  className={styles.form} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label={<span>{this.state.type==1?<span>姓名</span>:<span>公司名称</span>}</span>}>
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入姓名',}],
                })(
                  <Input placeholder="请输入姓名" />
                )}
              </FormItem>
              {
                this.state.type==1 &&
                <div>
                  <FormItem
                    {...formItemLayout}
                    label="性别"
                  >
                    {getFieldDecorator('sex', {
                      rules: [
                        { required: false, message: '请选择性别!' },
                      ],
                    })(
                      <RadioGroup>
                        <Radio value={1}>男</Radio>
                        <Radio value={2}>女</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="手机号">
                    {getFieldDecorator('telephone', {
                      rules: [{required: false, message: '请输入手机号',}],
                    })(
                      <Input placeholder="请输入手机号" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="身份证号">
                    {getFieldDecorator('id_number', {
                      rules: [{required: false, message: '请输入身份证号',}],
                    })(
                      <Input placeholder="请输入身份证号" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="家庭住址">
                    {getFieldDecorator('home_address', {
                      rules: [{required: false, message: '请输入家庭住址',}],
                    })(
                      <Input placeholder="请输入家庭住址" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="紧急联系人姓名">
                    {getFieldDecorator('emergency_contact', {
                      rules: [{required: false, message: '请输入紧急联系人姓名',}],
                    })(
                      <Input placeholder="请输入紧急联系人姓名" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="紧急联系人手机号">
                    {getFieldDecorator('emergency_contact_telephone', {
                      rules: [{required: false, message: '请输入紧急联系人手机号',}],
                    })(
                      <Input placeholder="请输入紧急联系人手机号" />
                    )}
                  </FormItem>
                </div>
              }
              {
                this.state.type==2 &&
                <div>
                  <FormItem
                    {...formItemLayout} label="公司地址">
                    {getFieldDecorator('home_address', {
                      rules: [{required: false, message: '请输入公司地址',}],
                    })(
                      <Input placeholder="请输入公司地址" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout} label="联系人姓名">
                    {getFieldDecorator('emergency_contact', {
                      rules: [{required: false, message: '请输入联系人姓名',}],
                    })(
                      <Input placeholder="请输入联系人姓名" />
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="联系人性别"
                  >
                    {getFieldDecorator('sex', {
                      rules: [
                        { required: false, message: '请选择联系人性别!' },
                      ],
                    })(
                      <RadioGroup>
                        <Radio value={1}>男</Radio>
                        <Radio value={2}>女</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="联系人手机号">
                    {getFieldDecorator('telephone', {
                      rules: [{required: false, message: '请输入联系人手机号',}],
                    })(
                      <Input placeholder="请输入联系人手机号" />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="联系人身份证号">
                    {getFieldDecorator('id_number', {
                      rules: [{required: false, message: '请输入联系人身份证号',}],
                    })(
                      <Input placeholder="请输入联系人身份证号" />
                    )}
                  </FormItem>
                </div>
              }
            </div>
            <div className={styles.formDiv}>
              <FormItem
                {...formItemLayout}
                label="身份证照片"
              >
                {getFieldDecorator('id_card_img', {
                  rules: [
                    { required: false, message: '请选择身份证照片!' },
                  ],
                })(
                  <div style={{display:'flex',flexFlow:'column'}}>
                    <Upload
                      className={styles.imgBorder}
                      listType="picture-card"
                      fileList={this.state.id_card_img}
                      onPreview={this.handlePreview}
                      onChange={this.IDCardChange}
                      onRemove ={this.IDCardImgRemove}
                    >
                      {this.state.showIDCardButton ? null : uploadButton}
                    </Upload>
                    <span>
                      <Icon hidden={this.state.upLoadingLoading} type="loading" style={{color:'#1890ff',marginRight:'10px'}}/>
                      <Icon hidden={this.state.upLoadingSuccess} type="check-circle" style={{color:'#48c23d',marginRight:'10px'}}/>
                      <Icon hidden={this.state.upLoading} type="close-circle-o" style={{color:'#f00',marginRight:'10px'}}/>
                      {this.state.UploadTravelLicenseText}
                    </span>
                    <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                      <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                    </Modal>
                  </div>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<span>{this.state.type==1?<span>驾驶证照片</span>:<span>营业执照照片</span>}</span>}>
                {getFieldDecorator('driving_license_img', {
                  rules: [
                    { required: false, message: '请选择驾驶证照片!' },
                  ],
                })(
                  <div>
                    <Upload
                      className={styles.imgBorder}
                      listType="picture-card"
                      fileList={this.state.driving_license_img}
                      onPreview={this.handlePreview}
                      onChange={this.DriverChange}
                      onRemove ={this.DriverImgRemove}
                    >
                      {this.state.showDriverButton ? null : uploadButton}
                    </Upload>
                    <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                      <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                    </Modal>
                  </div>
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
                <Button className={styles.formButton}  loading={this.state.UpdateButtonLoading} onClick={this.AddCustomerSubmit} type="primary">确认增加</Button>
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const AddCustomer = Form.create()(addCustomer);

export default AddCustomer;
