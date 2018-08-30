import React, { PureComponent } from 'react';
import moment from 'moment';
import utils from '../../utils/utils';
import { connect } from 'dva';
import { Link } from 'dva/router';
import StandardFormRow from 'components/StandardFormRow';
import {Popover,Tag,Modal,DatePicker,Tabs,Form,Input,Table,Checkbox, Card, Row, Col, Select,Radio, Button, Upload, Icon,notification,message,Model} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './../Sale/Sale.less';
import request from "../../utils/request";
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const plainOptions = [];
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class importExport extends PureComponent {
  state = {
    showError:0,
    showInput:true,
    outputLoading:false,
    ImportTitle:'导入车辆信息',
    ListType:0,
    QuickerStartTime:'',
    QuickerEndTime:'',
    templateList:[],
    itemCheck:[],
    ImportLoading:false,
    //车辆信息
    carfile:[],
    CarImgs:[],
    //年检
    zuchefile:[],
    //年检
    nianjianfile:[],
    //保单
    BDFile:[],
    CarBDImgs:[],
    //客户
    CarCSImgs:[],
    CSFile:[],
  }
  componentDidMount() {
    const TodayTime = new Date();
    this.setState({
      QuickerStartTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()-1)+'-'+utils.UpdateDate(TodayTime.getDate()),
      QuickerEndTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()),
    })
  }
  //选择时间
  DateChange=(date,dateString)=>{
    if(dateString[0]){
      this.setState({
        QuickerStartTime:dateString[0],
        QuickerEndTime:dateString[1],
      })
    }else{
      const TodayTime = new Date();
      this.setState({
        QuickerStartTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()-1)+'-'+utils.UpdateDate(TodayTime.getDate()),
        QuickerEndTime:TodayTime.getFullYear()+'-'+utils.UpdateDate(TodayTime.getMonth()+1)+'-'+utils.UpdateDate(TodayTime.getDate()),
      })
    }
  }
  //选择导出页面
  ChangeOutput = ()=>{
      this.setState({showInput:false})
  }
  //选择要导出的记录
  changeListType = (value)=>{
    this.props.form.setFields({
      RadioGroup:{value:''}
    })
    this.setState({ListType:value})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("table", value);
    request('/api/web/export/getTable',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        const templateDataList = data.data.data;
        const itemCheck = [];
        const templateList = [];

        for(var key in templateDataList){
          itemCheck.push(key);
          templateList.push(<Col className={styles.RowCol} xl={6} lg={12} md={12} sm={24} xs={24}><Checkbox value={key}>{templateDataList[key]}</Checkbox></Col>)
        }
        this.setState({templateList,itemCheck})
      }else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //切换导入表格card
  ChangeImport = (e) =>{
    this.setState({
      ImportTitle:e,
      showInput:true,
      showError:0,
    })
  }
  //上传车辆表格
  changeCarInfoContract = (info)=>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    if(fileList[0].name.split('.')[1]=='xlsx'){
      this.setState({
        carfile:fileList
      })
    }else{
      this.setState({
        carfile:[]
      })
      openNotificationWithIcon('warning', '嘀友提醒', '上传的文件必须是EXCEL表格文件！');
    }
  }
  //上传车辆图片
  changeCarImgContract = (info)=>{
    this.setState({
      CarImgs:info.fileList
    })
    if(info.file.status ==='done'){}
  }
  //上传年检表格
  changeVAEContract = (info)=>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    if(fileList[0].name.split('.')[1]=='xlsx'){
      this.setState({
        nianjianfile:fileList
      })
    }else{
      this.setState({
        nianjianfile:[]
      })
      openNotificationWithIcon('warning', '嘀友提醒', '上传的文件必须是EXCEL表格文件！');
    }
  }
  //上传租车表格
  changezuche = (info) =>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    if(fileList[0].name.split('.')[1]=='xlsx'){
      this.setState({
        zuchefile:fileList
      })
    }else{
      this.setState({
        zuchefile:[]
      })
      openNotificationWithIcon('warning', '嘀友提醒', '上传的文件必须是EXCEL表格文件！');
    }
  }
  //上传保单表格
  changeBDContract = (info)=>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    if(fileList[0].name.split('.')[1]=='xlsx'){
      this.setState({
        BDFile:fileList
      })
    }else{
      this.setState({
        BDFile:[]
      })
      openNotificationWithIcon('warning', '嘀友提醒', '上传的文件必须是EXCEL表格文件！');
    }
  }
  //上传保单图片
  changeCarBD = (info)=>{
    this.setState({
      CarBDImgs:info.fileList
    })
    if(info.file.status ==='done'){}
  }
  //上传客户表格
  changeCSContract= (info)=>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    if(fileList[0].name.split('.')[1]=='xlsx'){
      this.setState({
        CSFile:fileList
      })
    }else{
      this.setState({
        CSFile:[]
      })
      openNotificationWithIcon('warning', '嘀友提醒', '上传的文件必须是EXCEL表格文件！');
    }
  }
  //上传客户信息图片
  changeCarCS = (info)=>{
    this.setState({
      CarCSImgs:info.fileList
    })
    if(info.file.status ==='done'){}
  }

  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //车辆具体信息多选
  CheckedOption = (checkedList) => {
    console.log(checkedList)
    this.setState({
      checkedList,
    });
  }
  //全选
  CheckedSelect = ()=>{
    console.log()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values.RadioGroup)
      }
    })
    this.props.form.setFields({
      RadioGroup:{value:this.state.itemCheck},
    })
  }
  //导出
  OutputSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if(this.state.ListType!=0){
          console.log(values.RadioGroup)
          if(values.RadioGroup){
            this.setState({outputLoading:true})
            let GFHFormData = new FormData();
            GFHFormData.append('key','diuber2017');
            GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
            GFHFormData.append('table',this.state.ListType);
            GFHFormData.append('startTime',this.state.QuickerStartTime);
            GFHFormData.append('endTime',this.state.QuickerEndTime);
            GFHFormData.append('keyRows',values.RadioGroup);
            request('/api/web/export/exportExcel',{
              method:'POST',
              body:GFHFormData,
              credentials: 'include',
            }).then((data)=> {
              this.setState({outputLoading:false})
              console.log(data)
              if(data.data.code==1){
                window.open(data.data.data.path)
              }else{
                openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
              }
            }).catch(()=>{})
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', '请选择要导出的字段名！');
          }
        }else{
          openNotificationWithIcon('warning', '嘀友提醒', '请选择要导出的记录！');
        }
      }
    })
  }
  //导入
  ImportFileSubmit = ()=>{
    if(this.state.ImportTitle==='导入车辆信息'){
        this.ImportCarInfoInter();
    }else if(this.state.ImportTitle==='导入租车记录'){
      this.readRentExcelInter();
    }else if(this.state.ImportTitle==='导入年检记录'){
      this.readAnnualExcelInter();
    }else if(this.state.ImportTitle==='导入保单记录'){
      this.readInsuranceExcelInter();
    }else if(this.state.ImportTitle==='导入客户信息'){
      this.readCustomerExcelInter();
    }
  }
  //导入车辆信息
  ImportCarInfoInter = ()=>{
    var imgString = '';
    for(var i =0;i<this.state.CarImgs.length;i++){
      if(imgString){
        imgString = imgString + ',"'+this.state.CarImgs[i].name + '":"'+this.state.CarImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }else{
        imgString = '"'+this.state.CarImgs[i].name + '":"'+this.state.CarImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }
    }
    imgString = '{' + imgString + '}';
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    if(this.state.carfile[0]){
      this.setState({  ImportLoading:true,})
      GFHFormData.append("vehicle_excel", this.state.carfile[0].originFileObj);
      if(imgString){ GFHFormData.append("drive_images", imgString);}
      request('/api/web/export/readVehicleExcel',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        console.log(data)
        this.setState({  ImportLoading:false,})
        if(data.data.code==1){
          openNotificationWithIcon('success', '嘀友提醒', data.data.data.info)
        }else{
          this.setState({
            showError:1,
            errorList:data.data.data.info,
            errorListLen:data.data.data.info.length,
          })
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请选择EXCEL表格文件！');
    }
  }
  //导入租车记录
  readRentExcelInter = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    if(this.state.zuchefile[0]){
      this.setState({  ImportLoading:true,})
      GFHFormData.append("vehicle_rent_excel", this.state.zuchefile[0].originFileObj);
      request('/api/web/export/readRentExcel',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        console.log(data)
        this.setState({  ImportLoading:false,})
        if(data.data.code==1){
          openNotificationWithIcon('success', '嘀友提醒', data.data.data.info)
        }else{
          this.setState({
            showError:1,
            errorList:data.data.data.info,
            errorListLen:data.data.data.info.length,
          })
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请选择EXCEL表格文件！');
    }
  }
  //导入年检记录
  readAnnualExcelInter = ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    if(this.state.nianjianfile[0]){
      this.setState({  ImportLoading:true,})
      GFHFormData.append("vehicle_annual_excel", this.state.nianjianfile[0].originFileObj);
      request('/api/web/export/readAnnualExcel',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        console.log(data)
        this.setState({  ImportLoading:false,})
        if(data.data.code==1){
          openNotificationWithIcon('success', '嘀友提醒', data.data.data.info)
        }else{
          this.setState({
            showError:1,
            errorList:data.data.data.info,
            errorListLen:data.data.data.info.length,
          })
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请选择EXCEL表格文件！');
    }
  }
  //导入保单记录
  readInsuranceExcelInter = ()=>{
    var imgString = '';
    for(var i =0;i<this.state.CarBDImgs.length;i++){
      if(imgString){
        imgString = imgString + ',"'+this.state.CarBDImgs[i].name + '":"'+this.state.CarBDImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }else{
        imgString = '"'+this.state.CarBDImgs[i].name + '":"'+this.state.CarBDImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }
    }
    imgString = '{' + imgString + '}';
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    if(this.state.BDFile[0]){
      this.setState({  ImportLoading:true,})
      GFHFormData.append("vehicle_insuerance_excel", this.state.BDFile[0].originFileObj);
      if(imgString){ GFHFormData.append("vehicle_insuerance_images", imgString);}
      request('/api/web/export/readInsuranceExcel',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        console.log(data)
        this.setState({  ImportLoading:false,})
        if(data.data.code==1){
          openNotificationWithIcon('success', '嘀友提醒', data.data.data.info)
        }else{
          this.setState({
            showError:1,
            errorList:data.data.data.info,
            errorListLen:data.data.data.info.length,
          })
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请选择EXCEL表格文件！');
    }
  }
  //导入客户记录
  readCustomerExcelInter = ()=>{
    var imgString = '';
    for(var i =0;i<this.state.CarCSImgs.length;i++){
      if(imgString){
        imgString = imgString + ',"'+this.state.CarCSImgs[i].name + '":"'+this.state.CarCSImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }else{
        imgString = '"'+this.state.CarCSImgs[i].name + '":"'+this.state.CarCSImgs[i].thumbUrl.split('base64,')[1]+ '"';
      }
    }
    imgString = '{' + imgString + '}';
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    if(this.state.CSFile[0]){
      this.setState({  ImportLoading:true,})
      GFHFormData.append("customer_excel", this.state.CSFile[0].originFileObj);
      if(imgString){ GFHFormData.append("customer_images", imgString);}
      request('/api/web/export/readCustomerExcel',{
        method:'POST',
        body:GFHFormData,
        credentials: 'include',
      }).then((data)=> {
        console.log(data)
        this.setState({  ImportLoading:false,})
        if(data.data.code==1){
          openNotificationWithIcon('success', '嘀友提醒', data.data.data.info)
        }else{
          this.setState({
            showError:1,
            errorList:data.data.data.info,
            errorListLen:data.data.data.info.length,
          })
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch(()=>{})
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', '请选择EXCEL表格文件！');
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 24 },
      },
    };
    const exportList = [
      { key:'exportList00',value:0,title:'请选择导出的记录'},
      { key:'exportList01',value:1,title:'车管 => 租车记录'},
      { key:'exportList02',value:2,title:'车管 => 出险记录'},
      { key:'exportList03',value:3,title:'车管 => 年检记录'},
      { key:'exportList04',value:8,title:'车管 => 保养记录'},
      { key:'exportList05',value:9,title:'车管 => 维修记录'},
      { key:'exportList06',value:10,title:'车管 => 违章记录'},
      { key:'exportList07',value:15,title:'财务 => 付款记录'},
      { key:'exportList08',value:12,title:'财务 => 退押金记录'},
      { key:'exportList09',value:4,title:'财务 => 租金收款记录'},
      { key:'exportList10',value:5,title:'财务 => 签约收款记录'},
      { key:'exportList11',value:6,title:'财务 => 其它收款记录'},
    ];
    const props = {
      name: 'file',
      action: '',
      headers: {
        authorization: 'authorization-text',
      },
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择照片</div>
      </div>
    );
    const errorColumn = [
      { title: '错误所在行数',  dataIndex: 'line', key: 'line',width:180},
      { title: '错误提示', dataIndex: 'error', key: 'error',},
    ];
    return (
      <PageHeaderLayout>
        <div style={{marginTop:24}}>
          <Card style={{marginBottom:24}}>
            <StandardFormRow title="快速导入导出入口" grid last>
              <Button onClick={()=>this.ChangeImport('导入车辆信息')} type="primary" className={styles.QuickButton}>导入车辆信息</Button>
              <Button onClick={()=>this.ChangeImport('导入租车记录')} type="primary" className={styles.QuickButton}>导入租车记录</Button>
              <Button onClick={()=>this.ChangeImport('导入年检记录')} type="primary" className={styles.QuickButton}>导入年检记录</Button>
              <Button onClick={()=>this.ChangeImport('导入保单记录')} type="primary" className={styles.QuickButton}>导入保单记录</Button>
              <Button onClick={()=>this.ChangeImport('导入客户信息')} type="primary" className={styles.QuickButton}>导入客户信息</Button>
              <Button onClick={()=>this.ChangeOutput()} type="danger" ghost className={styles.QuickButton}>导出记录</Button>
            </StandardFormRow>
          </Card>
          {
            this.state.showInput?
            <Card title={this.state.ImportTitle} style={{marginTop:24}}  extra={<Button loading={this.state.ImportLoading} onClick={this.ImportFileSubmit} type="danger" ghost>导入</Button>}>
              {
                this.state.ImportTitle==='导入车辆信息'&&
                <div>
                  <div className={styles.ImportDiv}><p>1、请下载标准EXCEL模板</p><Button type="primary" ghost onClick={()=> window.location.href="https://gc.diuber.com/public/diuber/vehicle_template.xlsx"}>下载Excel模板</Button></div>
                  <div className={styles.ImportDiv}><p>2、在EXCEL模板中修改信息：请严格按照表格输入，不能有空格、乱码、重复等错误信息；EXCEL中的图片名称与被上传文件夹中的图片名称保持一致。</p></div>
                  <div className={styles.ImportDiv}><p>3、导入修改好的EXCEL表格<text style={{color:'#888',fontWeight: 'normal'}}> （ 重复数据将会自动删除）</text></p> <Upload {...props}  fileList={this.state.carfile} onChange={this.changeCarInfoContract}><Button type="primary" ghost>选择Excel文件</Button></Upload></div>
                  <div className={styles.ImportDiv}><p>4、选择行驶证图片<text style={{color:'#888',fontWeight: 'normal'}}> （ 图片格式为jpg、jpeg、gif、bmp、png,每张图片需小于2MB,最多支持上传30张图片,图片总共不能超过20MB.）</text></p>
                    <div className="clearfix">
                      <Upload
                        multiple="true"
                        action=""
                        listType="picture-card"
                        fileList={this.state.CarImgs}
                        onPreview={this.handlePreview}
                        onChange={this.changeCarImgContract}
                      >
                        {this.state.CarImgs.length >= 30 ? null : uploadButton}
                      </Upload>
                      <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                      </Modal>
                    </div>
                  </div>
                </div>
              }
              {
                this.state.ImportTitle==='导入租车记录'&&
                <div>
                  <div className={styles.ImportDiv}><p>1、请下载标准EXCEL模板</p><Button type="primary" ghost onClick={()=> window.location.href="https://gc.diuber.com/public/diuber/vehicle_rent_template.xlsx"}>下载Excel模板</Button></div>
                  <div className={styles.ImportDiv}><p>2、在EXCEL模板中修改信息：请严格按照表格输入，不能有空格、乱码、重复等错误信息；</p></div>
                  <div className={styles.ImportDiv}><p>3、导入修改好的EXCEL表格<text style={{color:'#888',fontWeight: 'normal'}}> （ 重复数据将会自动删除）</text></p><Upload {...props}  fileList={this.state.zuchefile} onChange={this.changezuche}><Button type="primary" ghost>选择Excel文件</Button></Upload></div>
                </div>
              }
              {
                this.state.ImportTitle==='导入年检记录'&&
                <div>
                  <div className={styles.ImportDiv}><p>1、请下载标准EXCEL模板</p><Button type="primary" ghost onClick={()=> window.location.href="https://gc.diuber.com/public/diuber/vehicle_annual_template.xlsx"}>下载Excel模板</Button></div>
                  <div className={styles.ImportDiv}><p>2、在EXCEL模板中修改信息：请严格按照表格输入，不能有空格、乱码、重复等错误信息；</p></div>
                  <div className={styles.ImportDiv}><p>3、导入修改好的EXCEL表格<text style={{color:'#888',fontWeight: 'normal'}}> （ 重复数据将会自动删除）</text></p><Upload {...props}  fileList={this.state.nianjianfile} onChange={this.changeVAEContract}><Button type="primary" ghost>选择Excel文件</Button></Upload></div>
                </div>
              }
              {
                this.state.ImportTitle==='导入保单记录'&&
                <div>
                  <div className={styles.ImportDiv}><p>1、请下载标准EXCEL模板</p><Button type="primary" ghost onClick={()=> window.location.href="https://gc.diuber.com/public/diuber/vehicle_insuerance_template.xlsx"}>下载Excel模板</Button></div>
                  <div className={styles.ImportDiv}><p>2、在EXCEL模板中修改信息：请严格按照表格输入，不能有空格、乱码、重复等错误信息；</p></div>
                  <div className={styles.ImportDiv}><p>3、导入修改好的EXCEL表格<text style={{color:'#888',fontWeight: 'normal'}}> （ 重复数据将会自动删除）</text></p><Upload {...props}  fileList={this.state.BDFile} onChange={this.changeBDContract}><Button type="primary" ghost>选择Excel文件</Button></Upload></div>
                  <div className={styles.ImportDiv}><p>4、选择保单图片文件夹<text style={{color:'#888',fontWeight: 'normal'}}> （ 图片格式为jpg、jpeg、gif、bmp、png,每张图片需小于2MB,最多支持上传30张图片,图片总共不能超过20MB. ）</text></p>
                    <div className="clearfix">
                      <Upload
                        multiple="true"
                        action=""
                        listType="picture-card"
                        fileList={this.state.CarBDImgs}
                        onPreview={this.handlePreview}
                        onChange={this.changeCarBD}
                      >
                        {this.state.CarBDImgs.length >= 30 ? null : uploadButton}
                      </Upload>
                      <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                      </Modal>
                    </div>
                  </div>
                </div>
              }
              {
                this.state.ImportTitle==='导入客户信息'&&
                <div>
                  <div className={styles.ImportDiv}><p>1、请下载标准EXCEL模板</p><Button type="primary" ghost onClick={()=> window.location.href="https://gc.diuber.com/public/diuber/customer_template.xlsx"}>下载Excel模板</Button></div>
                  <div className={styles.ImportDiv}><p>2、在EXCEL模板中修改信息：请严格按照表格输入，不能有空格、乱码、重复等错误信息；</p></div>
                  <div className={styles.ImportDiv}><p>3、导入修改好的EXCEL表格<text style={{color:'#888',fontWeight: 'normal'}}> （ 重复数据将会自动删除）</text></p><Upload {...props}  fileList={this.state.CSFile} onChange={this.changeCSContract}><Button type="primary" ghost>选择Excel文件</Button></Upload></div>
                  <div className={styles.ImportDiv}><p>4、选择驾驶证以及身份证图片文件夹<text style={{color:'#888',fontWeight: 'normal'}}> （ 图片格式为jpg、jpeg、gif、bmp、png,每张图片需小于2MB,最多支持上传30张图片,图片总共不能超过20MB. ）</text></p>
                    <div className="clearfix">
                      <Upload
                        multiple="true"
                        action=""
                        listType="picture-card"
                        fileList={this.state.CarCSImgs}
                        onPreview={this.handlePreview}
                        onChange={this.changeCarCS}
                      >
                        {this.state.CarCSImgs.length >= 30 ? null : uploadButton}
                      </Upload>
                      <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                      </Modal>
                    </div>
                  </div>
                </div>
              }
            </Card>:
            <Card>
              <StandardFormRow title="快速导出入口" block>
                <Form onSubmit={this.SearchSubmit} layout="inline">
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <RangePicker value={[moment(this.state.QuickerStartTime,dateFormat), moment(this.state.QuickerEndTime,dateFormat)]} onChange={this.DateChange} className={styles.QuickFormItem}  name="date"  format={dateFormat}/>
                  </Col>
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      className={styles.QuickFormItem}
                      {...formItemLayout}
                    >
                      <Select value={this.state.ListType} onChange={this.changeListType} placeholder="请选择需要导出的列表">
                        {
                          exportList.map(item=>(
                            <Option value={item.value}>{item.title}</Option>
                          ))
                        }
                      </Select>
                    </FormItem>
                  </Col>
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      className={styles.QuickFormItem}
                      {...formItemLayout}
                    >
                      <Button onClick={this.CheckedSelect} type="primary" ghost>全选</Button>
                      <Button loading={this.state.outputLoading} style={{marginLeft:'24px'}} onClick={this.OutputSubmit} type="danger" ghost>导出</Button>
                    </FormItem>
                  </Col>
                </Form>
              </StandardFormRow>
              <StandardFormRow
                title="请选择需要导出的具体字段"
                grid
                last>
                <FormItem {...formItemLayout}>
                  {getFieldDecorator('RadioGroup')(
                    <Checkbox.Group style={{ width: '100%' }} onChange={this.CheckedOption}>
                      <Row>
                        {this.state.templateList}
                      </Row>
                    </Checkbox.Group>
                  )}
                </FormItem>
              </StandardFormRow>
            </Card>
          }
          {
            this.state.showError==1 &&
            <Card style={{marginTop:24}} title="导入信息错误提示">
              <Table scroll={{x: 600}} bordered={true} columns={errorColumn} dataSource={this.state.errorList}  footer={() => <p>总共 {this.state.errorListLen} 条数据</p>}/>
            </Card>
          }
        </div>
      </PageHeaderLayout>
    );
  }
}

const ImportExport = Form.create()(importExport);

export default ImportExport;
