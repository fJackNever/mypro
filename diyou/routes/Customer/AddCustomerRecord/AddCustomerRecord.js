import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import {Form,Input,DatePicker,Card,Button, Upload,Icon,message} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;

class addCustomerRecord extends PureComponent {
  state = {
    FJImgList:[],
    UpdateButtonLoading:false,
    AddNewRecord:1,
  }
  componentDidMount() {
    if(window.location.href.split('CustomerRecordId=')[1]){
      this.setState({
        AddNewRecord:0,
      })
      this.getCustomerContactInter(window.location.href.split('CustomerRecordId=')[1])
    }
  }
  //获取交流记录的详细内容
  getCustomerContactInter = (target)=>{
    let AddCarData = new FormData();
    AddCarData.append('key','diuber2017');
    AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddCarData.append('id',target);
    request('/api/web/customer/getCustomerContactLists',{
      method:'POST',
      body:AddCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.searchCustomerId(data.data.data.rows[0].customer_id);
        this.setState({
          id:data.data.data.rows[0].id
        })
        this.props.form.setFields({
          customer_name: {value: data.data.data.rows[0].customer_name,},
          contact_time: {value: moment(data.data.data.rows[0].contact_time),},
          comment: {value:data.data.data.rows[0].comment,},
        })
        const FJImgList = [];
        if(data.data.data.rows[0].img_one){
          FJImgList.push({
            uid: 1,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.rows[0].img_one,
          })
        }
        if(data.data.data.rows[0].img_two){
          FJImgList.push({
            uid: 2,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.rows[0].img_two,
          })
        }
        if(data.data.data.rows[0].img_three){
          FJImgList.push({
            uid: 2,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.rows[0].img_three,
          })
        }
        this.setState({
          FJImgList:FJImgList
        })
      }
    }).catch(()=>{})
  }
  //预览照片
  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //交流附加照片
  FJImgChange = (info)=>{
    this.setState({
      FJImgList:info.fileList
    })
  }
  FJImgRemove = (info)=> {

  }
  //新增客户交流记录
  AddCustomerReocrd = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          UpdateButtonLoading: true
        })
        let AddCarData = new FormData();
        AddCarData.append('key','diuber2017');
        AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarData.append('customer_name',values.customer_name);
        AddCarData.append('contact_time',new Date(values.contact_time._d).getFullYear()+'-'+(new Date(values.contact_time._d).getMonth()+1)+'-'+new Date(values.contact_time._d).getDate());
        if(values.comment){AddCarData.append('comment',values.comment);}
        if(this.state.FJImgList) {
          for(var i=0;i<this.state.FJImgList.length;i++){
            if(i==0){
              if(this.state.FJImgList[i].name!="xsz.png") {
                AddCarData.append('img_one_img', this.state.FJImgList[i].thumbUrl.split('base64,')[1]);
              }
            }else if(i==1){
              if(this.state.FJImgList[i].name!="xsz.png") {
                AddCarData.append('img_two_img', this.state.FJImgList[i].thumbUrl.split('base64,')[1]);
              }
            }else if(i==2){
              if(this.state.FJImgList[i].name!="xsz.png") {
                AddCarData.append('img_three_img', this.state.FJImgList[i].thumbUrl.split('base64,')[1]);
              }
            }
          }
        }
        if(this.state.AddNewRecord==1){
          request('/api/web/customer/addCustomerContact',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('新增客户交流记录成功！')
              this.props.history.push("/Customer?CustomerID=8");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          AddCarData.append('id',this.state.id);
          request('/api/web/customer/editCustomerContact',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改客户交流记录成功！')
              this.props.history.push("/Customer?CustomerID=8");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }
  //获取客户的手机号
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
        })
      }else{
        this.setState({
          customerTel : '',
        })
      }
    }).catch(()=>{})
  }
  searchCustomerId = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", target);
    request('/api/web/customer/getCutsomerInfo',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          customerTel : data.data.data.telephone,
        })
      }else{
        this.setState({
          customerTel : '',
        })
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
    return (
      <div>
        <Card>
          <Form  className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label="客户姓名">
                {getFieldDecorator('customer_name', {
                  rules: [{required: true, message: '请输入客户姓名',}],
                })(
                  <Input placeholder="请输入客户姓名" onChange={this.searchCustomer}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="客户联系方式">
                <Input value={this.state.customerTel} disabled={true} placeholder="客户联系方式会自动联想" />
              </FormItem>
              <FormItem
                {...formItemLayout} label="交流日期">
                {getFieldDecorator('contact_time',config)(
                  <DatePicker />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="客户交流图片"
              >
                {getFieldDecorator('vehicle_addition_img', {
                  rules: [
                    { required: false, message: '请选择上传客户交流图片!' },
                  ],
                })(
                  <Upload
                    listType="picture-card"
                    fileList={this.state.FJImgList}
                    onPreview={this.handlePreview}
                    onChange={this.FJImgChange}
                    onRemove ={this.FJImgRemove}
                  >
                    {this.state.FJImgList.length >= 3 ? null : uploadButton}
                  </Upload>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="交流内容">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入交流内容',}],
                })(
                  <TextArea placeholder="请输入交流内容"  rows={4} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                {
                  this.state.AddNewRecord==1?
                    <Button loading={this.state.UpdateButtonLoading} className={styles.formButton} onClick={this.AddCustomerReocrd} type="primary">确认增加</Button>
                    :
                    <Button loading={this.state.UpdateButtonLoading} className={styles.formButton} onClick={this.AddCustomerReocrd} type="primary">确认修改</Button>
                }
              </FormItem>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}
const AddCustomerRecord = Form.create()(addCustomerRecord);

export default AddCustomerRecord;
