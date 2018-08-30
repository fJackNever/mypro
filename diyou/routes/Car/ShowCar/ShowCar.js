import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Map, Marker } from 'react-amap';
import { Link } from 'dva/router';
import {Form,Input,DatePicker,Tabs,Alert, Card,Button, Upload,Table,Tag,AutoComplete,Modal,Icon,notification,message,Badge,Popconfirm,Tooltip } from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";
import utils from "../../../utils/utils";

const FormItem = Form.Item;
const { Meta } = Card;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class showCar extends PureComponent {
  constructor() {
    super();
    this.mapPlugins = ['ToolBar'];
    this.mapCenter = {longitude: 121.4628270000, latitude: 31.2361380000};
  }
  state = {
    showAlert:0,
    deleteLoading:false,
    DeleteButtonLoading:false,
    UpdateButtonLoading:false,
    showuploadButton:true,
    ShowCarKey:0,
    CardReocrdLoading:false,
    chooseTarget:'20',
    XSZImgList:[],
    DeleteImgList:[],
    previewImage: '',
    previewVisible: false,
    FJImgList : [],
    tableLoading:false,
    showIsMap:false,

    upLoadingLoading:true,
    upLoadingSuccess:true,
    upLoading:true,

    panes:[],
    panesKey:[]
}
  componentDidMount() {
    //限制除了车管和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}
    this.getCarInfoInter();
    if(window.location.href.split('type=')[1]){
      if(window.location.href.split('type=')[1].split('Car_id=')[0]){
        var type = window.location.href.split('type=')[1].split('&Car_id=')[0];
        console.log(type)
        switch(type){
          case '9': this.getVehicleBorrowRecord(window.location.href.split('Car_id=')[1],'');break;
          case '11': this.getMaintainRecord(window.location.href.split('Car_id=')[1],'');break;
          case '3': this.getRentRecord(window.location.href.split('Car_id=')[1],'');break;
          case '12': this.getKeepRecord(window.location.href.split('Car_id=')[1],'');break;
          case '13': this.getAccidentRecord(window.location.href.split('Car_id=')[1],'');break;
          case '14': this.getSurveryRecord(window.location.href.split('Car_id=')[1],'');break;
          case '15': this.getPolicyRecord(window.location.href.split('Car_id=')[1],'');break;
          case '16': this.getViolationRecord('');break;
        }
      }
    }
  }
  //获取车辆具体信息
  getCarInfoInter= ()=>{
    if(window.location.href.split('Car_id=')[1]){
      var ShowCarData = new FormData();
      ShowCarData.append('key','diuber2017');
      ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
      ShowCarData.append('id',window.location.href.split('Car_id=')[1]);
    }else{
      var ShowCarData = new FormData();
      ShowCarData.append('key','diuber2017');
      ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    }
    request('/api/web/vehicle/getVehicleInfo',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        if(data.data.data.type==2){
          var DeviceData = new FormData();
          DeviceData.append('key','diuber2017');
          DeviceData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
          DeviceData.append('device',data.data.data.gps.device_id);
          request('/api/diuber/gps/updateGpsSimple',{
            method:'POST',
            body:DeviceData,
            credentials:'include',
          }).then((data)=>{})
        }
        this.setState({
          lng:data.data.data.gps.lng,
          lat:data.data.data.gps.lat,
          device_info_new:data.data.data.gps.device_info_new,
          distance:data.data.data.gps.distance,
          next_keep_mile:data.data.data.next_keep_mile,
          travel_range:data.data.data.travel_range
        })
        if(data.data.data.travel_license){
          var travelLicenseImg =  [{
            uid: 1,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.travel_license,
          }];
        }else{
          var travelLicenseImg =  [];
          this.setState({
            showuploadButton:false
          })
        }
        console.log(data.data.data.vehicle_templatevehicle_template)
        this.setState({
          travel_license_oss:travelLicenseImg,
          licensePlateNo:data.data.data.license_plate_no,
          carModel:data.data.data.vehicle_template,
          vehicle_template:data.data.data.vehicle_templatevehicle_template,
          body_color:data.data.data.body_color,
        });
        if(data.data.data.addition_img && data.data.data.addition_oss){
          var FjImgData = JSON.parse(data.data.data.addition_img);
          var FJImgIdData = data.data.data.addition_oss.split('|');
          var FjImgDataList=[];
          for(var key in FjImgData){
            FjImgDataList.push({
              uid: key,
              name: 'tupian.png',
              status: 'done',
              url: FjImgData[key],
            })
          }
          this.setState({
            FJImgList:FjImgDataList,
            FJImgIdData:FJImgIdData,
          })
        }

        this.props.form.setFields({
          license_plate_no: {value: data.data.data.license_plate_no,},
          vehicle_template:{value: data.data.data.vehicle_template,},
          body_color:{value: data.data.data.body_color,},
          belong_company:{value: data.data.data.belong_company,},
          frame_number:{value:data.data.data.frame_number,},
          engine_number:{value: data.data.data.engine_number,},
          create_time:{value: moment(data.data.data.create_time),},
          file_no:{value: data.data.data.file_no,},
          imei:{value: data.data.data.imei,},
          actual_owner:{value: data.data.data.actual_owner,},
          actual_owner_tel:{value: data.data.data.actual_owner_tel,},
          responsible_vehicle_admin:{value: data.data.data.responsible_vehicle_admin,},
          responsible_drive_admin:{value: data.data.data.responsible_drive_admin,},
          comment:{value:data.data.data.comment,},
        })
        var BodyColor = [{id:'A',name:'白色'},{id:'B',name:'灰色'},{id:'C',name:'黄色'},{id:'D',name:'粉色'},{id:'E',name:'红色'},
          {id:'F',name:'紫色'},{id:'G',name:'绿色'},{id:'H',name:'蓝色'},{id:'I',name:'棕色'},{id:'J',name:'黑色'},{id:'Z',name:'其他颜色'}];
        var CarBodyColor  = BodyColor.map((item)=>{
          return <Option key={item.id}>{item.name}</Option>
        })
        this.setState({CarBodyColor })

      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
    let getCarRecord = new FormData();
    getCarRecord.append('key','diuber2017');
    getCarRecord.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    getCarRecord.append('vehicle_id',window.location.href.split('Car_id=')[1]);
    request('/api/web/vehicle/getTodayInfo',{
      method:'POST',
      body:getCarRecord,
      credentials:'include',
    }).then((data)=> {
      if(data.data.data.accident.settlement_claims_status==0){this.setState({AccidentStatus:'处理中'})}else{this.setState({AccidentStatus:'已完成'})}
      if(data.data.data.validata.status==0){this.setState({ValidataStatus:'有车损'})}else{this.setState({ValidataStatus:'无车损'})}
      if(data.data.data.borrow!=''){this.setState({BorrowStatus:1,})}else{this.setState({BorrowStatus:0,})}
      if(data.data.data.otherRefund!=''){this.setState({otherRefundStatus:1,})}else{this.setState({otherRefundStatus:0,})}
      if(data.data.data.collectionRecord!=''){this.setState({collectionRecordStatus:1,})}else{this.setState({collectionRecordStatus:0,})}
      if(data.data.data.validata!=''){this.setState({ValidatasStatus:1,})}else{this.setState({ValidatasStatus:0,})}
      if(data.data.data.sign!=''){this.setState({SignStatus:1,})}else{this.setState({SignStatus:0,})}
      if(data.data.data.rent!=''){this.setState({RentStatus:1,})}else{this.setState({RentStatus:0,})}
      if(data.data.data.refund!=''){this.setState({RefundStatus:1,})}else{this.setState({RefundStatus:0,})}
      if(data.data.data.depositRefund!=''){this.setState({DepositRefundStatus:1,})}else{this.setState({DepositRefundStatus:0,})}
      if(data.data.data.contractDeposit!=''){this.setState({ContractDepositStatus:1,})}else{this.setState({ContractDepositStatus:0,})}
      if(data.data.data.extension!=''){this.setState({ExtensionStatus:1,})}else{this.setState({ExtensionStatus:0,})}
      if(data.data.data.maintain!=''){this.setState({MaintainStatus:1,})}else{this.setState({MaintainStatus:0,})}
      if(data.data.data.keep!=''){this.setState({KeepStatus:1,})}else{this.setState({KeepStatus:0,})}
      if(data.data.data.accident!=''){this.setState({AccidentsStatus:1,})}else{this.setState({AccidentsStatus:0,})}
      if(data.data.data.annualSurvery!=''){this.setState({AnnualSurveryStatus:1,})}else{this.setState({AnnualSurveryStatus:0,})}
      if(data.data.data.insurancePolicy!=''){this.setState({InsurancePolicyStatus:1,})}else{this.setState({InsurancePolicyStatus:0,})}
      if(data.data.data.violation!=''){this.setState({ViolationStatus:1,})}else{this.setState({ViolationStatus:0,})}
      this.setState({
        otherRefundCustomer:data.data.data.otherRefund.customer,
        otherRefundTime:data.data.data.otherRefund.time,
        collectionRecordCustomer:data.data.data.collectionRecord.customer,
        collectionRecordTime:data.data.data.collectionRecord.time,
        BorrowPartner:data.data.data.borrow.partner,
        BorrowTime:data.data.data.borrow.time,
        ValidataTime:data.data.data.validata.time,
        SignCustomer:data.data.data.sign.customer,
        SignTime:data.data.data.sign.time,
        RentCustomer:data.data.data.rent.customer,
        RentTime:data.data.data.rent.time,
        RefundCustomer:data.data.data.refund.customer,
        RefundTime:data.data.data.refund.time,
        DepositRefundCustomer:data.data.data.depositRefund.customer,
        DepositRefundTime:data.data.data.depositRefund.time,
        ContractDepositCustomer:data.data.data.contractDeposit.customer,
        ContractDepositTime:data.data.data.contractDeposit.time,
        ExtensionCustomer:data.data.data.extension.customer,
        ExtensionTime:data.data.data.extension.time,
        MaintainGps:data.data.data.maintain.customer,
        MaintainTime:data.data.data.maintain.time,
        AccidentTime:data.data.data.accident.time,
        AnnualSurveryTime:data.data.data.annualSurvery.time,
        AnnualSurveryAmount:data.data.data.annualSurvery.amount,
        KeepGps:data.data.data.keep.gps_distance,
        KeepTime:data.data.data.keep.time,
        InsurancePolicyTime:data.data.data.insurancePolicy.time,
        InsurancePolicyCommercialTime:data.data.data.insurancePolicy.commercial_time,
        ViolationContent:data.data.data.violation.content,
        ViolationTime:data.data.data.violation.time,
      })
    }).catch(()=>{})
    let getCarType = new FormData();
    getCarType.append('key','diuber2017');
    getCarType.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    getCarType.append('limit',1000);
    request('/api/web/vehicle/getTemplate',{
      method:'POST',
      body:getCarType,
      credentials:'include',
    }).then((data)=> {
      var templateList  = data.data.data.rows.map((item)=>{
        return <Option key={item.id}>{item.brand+'-'+item.model}</Option>
      })
      this.setState({templateList })
    }).catch(()=>{})

    let getStaff = new FormData();
    getStaff.append('key','diuber2017');
    getStaff.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    getStaff.append('role',0);
    getStaff.append('status',1);
    getStaff.append('limit',1000);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:getStaff,
      credentials:'include',
    }).then((data)=>{
      var cheguan = data.data.data.rows.map((item)=>{
        return <Option key={item.name}>{item.name}</Option>
      })
      this.setState({cheguan})
    }).catch(()=>{})
    let getStaffs = new FormData();
    getStaffs.append('key','diuber2017');
    getStaffs.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    getStaffs.append('role',1);
    getStaffs.append('status',1);
    getStaff.append('limit',1000);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:getStaffs,
      credentials:'include',
    }).then((data)=>{
      var jiaguan = data.data.data.rows.map((item)=>{
        return <Option key={item.name}>{item.name}</Option>
      })
      this.setState({jiaguan})
    }).catch(()=>{})
  }
  //刷新违章
  checkWiezhang = ()=>{
    this.getCheckReocrdInter();
  }
  getCheckReocrdInter = ()=>{
    this.setState({showAlert:1})
    let AddCarData = new FormData();
    AddCarData.append('key','diuber2017');
    AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddCarData.append('vehicle_id',window.location.href.split('Car_id=')[1]);
    request('/api/web/vehicle_violation/getViolation',{
      method:'POST',
      body:AddCarData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({showAlert:0})
      if(data.data.code==1){
        this.getViolationRecord('');
        openNotificationWithIcon('success', '嘀友刷新违章成功提醒', '成功刷新违章！');
      }else{
        if(data.data.code==20152){
          openNotificationWithIcon('error', '嘀友刷新违章失败提醒',data.data.data);
        }else{
          openNotificationWithIcon('error', '嘀友刷新违章失败提醒',data.data.msg);
        }
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
  //选择查看记录
  chooseList = (target)=>{
    this.setState({
      chooseTarget:target,
      tableLoading:true,
    })
    if(target==7){
      this.getVehicleBorrowRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==2){
      this.getSignRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==11){
      this.getAccidentRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==1){
      this.getValidataRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==3){
      this.getRentRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==4){
      this.getrefundrecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==5){
      this.getContractDeposit(window.location.href.split('Car_id=')[1],'');
    }else if(target==6){
      this.getContract(window.location.href.split('Car_id=')[1],'');
    }else if(target==8){
      this.getExtensionRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==9){
      this.getMaintainRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==10){
      this.getKeepRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==12){
      this.getSurveryRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==13){
      this.getPolicyRecord(window.location.href.split('Car_id=')[1],'');
    }else if(target==14){
      this.getViolationRecord('');
    }else if(target==15){
      this.getOtherRefundInter(window.location.href.split('Car_id=')[1]);
    }else if(target==16){
      this.getCollectionRecordInter(window.location.href.split('Car_id=')[1]);
    }
  }
  //预览照片
  handleCancel = () => this.setState({ previewVisible: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //操作车辆附加照片
  FJImgChange = (info)=>{
    this.setState({
      FJImgList:info.fileList
    })
  }
  FJImgRemove = (info)=> {
    if(info.name=="tupian.png"){
      this.state.DeleteImgList.push(info.uid);
      this.setState({
        DeleteImgList:this.state.DeleteImgList
      })
    }
  }
  ImgChange = (info)=>{
    this.setState({
      travel_license_oss:info.fileList,
      showuploadButton:true,
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
            })
            this.props.form.setFields({
              actual_owner: {value: data.data.data.actual_owner,},
              engine_number: {value: data.data.data.engine_number,},
              frame_number: {value: data.data.data.frame_number,},
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
  ImgRemove = ()=> {
    this.setState({
      showuploadButton:false,
      travel_license_oss:[],
      upLoadingLoading:true,
      upLoadingSuccess:true,
      upLoading:true,
      UploadTravelLicenseText:'',
    })
  }
  //删除车辆
  DeleteCar =()=>{
    confirm({
      title: '嘀友提醒',
      content: '是否删除该车辆和所有相关记录？删除后将不能恢复！请确认是否删除！',
      onOk() {
        var ShowCarData = new FormData();
        ShowCarData.append('key','diuber2017');
        ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        ShowCarData.append('id',window.location.href.split('Car_id=')[1]);
        request('/api/web/vehicle/delaction',{
          method:'POST',
          body:ShowCarData,
          credentials:'include',
        }).then((data)=>{
          if(data.data.code==1){
            message.success('成功删除车辆！');
            window.location.href="#/Car/CarManager";
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      },
      onCancel() {},
    });
  }

  //修改车辆信息
  UpdateCarInfo = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          UpdateButtonLoading:true
        })
        let AddCarData = new FormData();
        AddCarData.append('key','diuber2017');
        AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarData.append('id',window.location.href.split('Car_id=')[1]);
        AddCarData.append('license_plate_no',values.license_plate_no);
        if(this.state.travel_license_oss!='') {
          if(this.state.travel_license_oss[0].name!="xsz.png"){
            AddCarData.append('travel_license_img',this.state.travel_license_oss[0].thumbUrl.split('base64,')[1]);
          }
        }
        if(this.state.FJImgList){
          var FJImgId = [];
          var BaseFJImgId = [];
          for(var i =0;i<this.state.FJImgList.length;i++){
            if(this.state.FJImgList[i].name=="tupian.png"){
              FJImgId.push(this.state.FJImgList[i].uid)
            }else{
              BaseFJImgId.push(this.state.FJImgList[i].thumbUrl.split('base64,')[1])
            }
          }
          AddCarData.append('addition_oss_del_arr',this.state.DeleteImgList);
          AddCarData.append('vehicle_addition_img_arr',BaseFJImgId);
        }
        if(/^[0-9]+.?[0-9]*$/.test(values.vehicle_template)){
          AddCarData.append('vehicle_template',values.vehicle_template);
        }
        if(values.body_color!=this.state.body_color){
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
        request('/api/web/vehicle/editVehicle',{
          method:'POST',
          body:AddCarData,
          credentials:'include',
        }).then((data)=>{
          this.setState({
            UpdateButtonLoading:false
          })
          if(data.data.code==1){
            message.success('修改成功！')
            //this.props.history.push("/Car/CarManager");
            //window.location.href="/#/Car/CarManager"
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })

  }
  //删除车辆记录
  DeleteRecord = (target)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id", target);
    request('/api/web/vehicle/delrecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        message.success('成功删除记录！');
        this.setState({
          tableLoading:true
        })
        if(this.state.chooseTarget==7){
          this.getVehicleBorrowRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==2){
          this.getSignRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==11){
          this.getAccidentRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==1){
          this.getValidataRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==3){
          this.getRentRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==4){
          this.getrefundrecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==5){
          this.getContractDeposit(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==6){
          this.getContract(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==8){
          this.getExtensionRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==9){
          this.getMaintainRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==10){
          this.getKeepRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==12){
          this.getSurveryRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==13){
          this.getPolicyRecord(window.location.href.split('Car_id=')[1],'');
        }else if(this.state.chooseTarget==14){
          this.getViolationRecord('');
        }
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }

  //获取收款记录列表
  getOtherRefundInter = (id)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 9999);
    request('/api/web/finance/getOtherRefund',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'15')){
          this.state.panesKey.push('15')
          //收款记录
          const OtherColumns = [
            { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
            { title: '付款方式', dataIndex: 'collection_type', key: 'collection_type',
              render: (text,record) =>
                <span>
                  {record.collection_type==0 && <span>微信</span>}
                  {record.collection_type==1 && <span>支付宝</span>}
                  {record.collection_type==2 && <span>银行卡</span>}
                  {record.collection_type==3 && <span>现金</span>}
                  {record.collection_type==4 && <span>其他</span>}
                  {record.collection_type==5 && <span>混合</span>}
                </span>
            },
            { title: '名称', dataIndex: 'collection_name', key: 'collection_name',},
            { title: '收款时间', dataIndex: 'refund_time', key: 'refund_time',  },
            { title: '微信收款金额', dataIndex: 'weixin_amount', key: 'weixin_amount',  },
            { title: '支付宝收款金额', dataIndex: 'ali_amount', key: 'ali_amount',},
            { title: '银行卡收款金额', dataIndex: 'card_amount', key: 'card_amount',},
            { title: '现金收款金额', dataIndex: 'cash_amount', key: 'cash_amount',},
            { title: '其他收款金额', dataIndex: 'other_amount', key: 'other_amount',},
            { title: '收款总金额', dataIndex: 'amount', key: 'amount',},
            { title: '备注', dataIndex: 'comment', key: 'comment',},
          ]
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={OtherColumns} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '收款记录', content: content, key: '15' },)
          this.setState({chooseTarget:'15'})
        }else{
          this.setState({chooseTarget:'15'})
        }
      }
    }).catch(()=>{})
  }
  //获取付款记录列表
  getCollectionRecordInter = (id)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 9999);
    request('/api/web/finance/getCollectionRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'16')){
          this.state.panesKey.push('16')
          //付款记录
          const PaymentColumns =[
            { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',width:100},
            { title: '付款方式', dataIndex: 'collection_type', key: 'collection_type',
              render: (text,record) =>
                <span>
                  {record.collection_type==1 && <span>微信</span>}
                  {record.collection_type==2 && <span>支付宝</span>}
                  {record.collection_type==3 && <span>银行卡</span>}
                  {record.collection_type==4 && <span>现金</span>}
                  {record.collection_type==5 && <span>其他</span>}
                  {record.collection_type==0 && <span>混合</span>}
                </span>},
            { title: '名称', dataIndex: 'collection_name', key: 'collection_name',},
            { title: '支付时间', dataIndex: 'expend_time', key: 'expend_time',  },
            { title: '微信付款金额', dataIndex: 'weixin_amount', key: 'weixin_amount',  },
            { title: '支付宝付款金额', dataIndex: 'ali_amount', key: 'ali_amount',},
            { title: '银行卡付款金额', dataIndex: 'card_amount', key: 'card_amount',},
            { title: '现金付款金额', dataIndex: 'cash_amount', key: 'cash_amount',},
            { title: '其他付款金额', dataIndex: 'other_amount', key: 'other_amount',},
            { title: '支付总金额', dataIndex: 'pay_amount', key: 'pay_amount',},
            { title: '备注', dataIndex: 'comment', key: 'comment',},
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={PaymentColumns} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '付款记录', content: content, key: '16' },)
          this.setState({chooseTarget:'16'})
        }else{
          this.setState({chooseTarget:'16'})
        }
      }
    }).catch(()=>{})
  }
  //获取借车记录
  getVehicleBorrowRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getBorrowRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data,
          ShowCarReocrdLen:data.data.data.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'7')){
          this.state.panesKey.push('7')
          //借车记录
          const BorrowRecordColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '合作伙伴名称',dataIndex: 'partner_name', key: 'partner_name',},
            { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
            { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
            { title: '租金',dataIndex: 'month_amount', key: 'month_amount',},
            { title: '押金',dataIndex: 'deposit', key: 'deposit',},
            { title: '下次交租金日期',dataIndex: 'next_refund_time', key: 'next_refund_time',},
            { title: '借车状态',dataIndex: 'borrow_vehicle_status', key: 'borrow_vehicle_status',
              render: (text,record) =>
                <div>
                  {record.borrow_vehicle_status==0 &&
                  <span style={{color:'#f50'}}>已退车</span>
                  }
                  {record.borrow_vehicle_status==1 &&
                  <span>正常借车</span>
                  }
                </div>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowBorrowRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>},
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addBorrow()} type="primary" ghost>新增借车记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={BorrowRecordColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '借车记录', content: content, key: '7' },)
          this.setState({chooseTarget:'7'})
        }else{
          this.setState({chooseTarget:'7'})
        }
      }
    }).catch(()=>{})
  }
  addBorrow = () =>{
    this.props.history.push('/Car/CarManager/NewBorrowCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowBorrowRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewBorrowCarNotes?entity_id='+target);
  }
  //获取签约记录
  getSignRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getSignRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'2')){
          this.state.panesKey.push('2')
          //签约记录
          const SignColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '手机号',dataIndex: 'telephone', key: 'telephone',},
            { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
            { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
            { title: '租金',dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
            { title: '押金',dataIndex: 'deposit', key: 'deposit',},
            { title: '签约日期',dataIndex: 'sign_date', key: 'sign_date',},
            { title: '签约状态',dataIndex: 'sign_status', key: 'sign_status',
              render: (text,record) =>
                <span>
            {record.sign_status==0 && <span>未签</span>}
                  {record.sign_status==1 && <span>已签</span>}
                  {record.sign_status==2 && <span>作废</span>}
          </span>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowSignRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addSign()} type="primary" ghost>新增签约记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={SignColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '签约记录', content: content, key: '2' },)
          this.setState({chooseTarget:'2'})
        }else{
          this.setState({chooseTarget:'2'})
        }
      }
    }).catch(()=>{})
  }
  addSign = () =>{
    this.props.history.push('/Car/CarManager/NewSignCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowSignRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewSignCarNotes?entity_id='+target);
  }
  //获取租车记录
  getRentRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'3')){
          this.state.panesKey.push('3')
          //租车记录
          const RentColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '手机号',dataIndex: 'telephone', key: 'telephone',},
            { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
            { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
            { title: '租金',dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
            { title: '押金',dataIndex: 'deposit', key: 'deposit',},
            { title: '租车类型',dataIndex: 'type', key: 'type',
              render: (text,record) =>
                <span>
                  {record.type==1 && <span>月租</span>}
                  {record.type==2 && <span>日租</span>}
                  {record.type==3 && <span>以租代购</span>}
          </span>
            },
            { title: '租车状态',dataIndex: 'rent_vehicle_status', key: 'rent_vehicle_status',
              render: (text,record) =>
                <span>
                  {record.rent_vehicle_status==0  && <span style={{color:'#3498DB'}}>已退车</span>}
                  {record.rent_vehicle_status==1 && <span>
                    {record.relet_status==0 &&<span>正常租车</span>}
                    {record.relet_status==1 &&<span style={{color:'#E57939'}}>续租</span>}
                    </span>}
          </span>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowRentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addRent(2)} type="primary" ghost>新增租车记录</Button>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addRent(1)} style={{marginLeft:'24px'}} type="primary" ghost>新增续租记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={RentColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '租车记录', content: content, key: '3' },)
          this.setState({chooseTarget:'3'})
        }else{
          this.setState({chooseTarget:'3'})
        }
      }
    }).catch(()=>{})
  }
  addRent = (target) =>{
    this.props.history.push('/Car/CarManager/NewCarNotes?IsRenewal='+target+'&license_plate_no='+this.state.licensePlateNo);
  }
  ShowRentRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewCarNotes?entity_id='+target);
  }
  //获取交租金记录
  getrefundrecord= (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/finance/getrefundrecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'4')){
          this.state.panesKey.push('4')
          //交租金记录
          const PayRentColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '交租金时间',dataIndex: 'refund_time', key: 'refund_time',},
            { title: '金额',dataIndex: 'amount', key: 'amount',},
            { title: '渠道',dataIndex: 'refund_type', key: 'refund_type',
              render: (text,record) =>
                <span>
                  {record.refund_type==0 && <span>微信</span>}
                  {record.refund_type==1 && <span>支付宝</span>}
                  {record.refund_type==2 && <span>银行</span>}
                  {record.refund_type==3 && <span>现金</span>}
                  {record.refund_type==5 && <span>混合</span>}
                  {record.refund_type==4 && <span>其他</span>}
                </span>
            },
            { title: '下次交租金日期',dataIndex: 'next_refund_time', key: 'next_refund_time',},
            { title: '交租金状态',dataIndex: 'refund_status', key: 'refund_status',
              render: (text,record) =>
                <span>
                  {record.refund_status==0 && <span>未还清</span>}
                  {record.refund_status==1 && <span>正常还款</span>}
                </span>
            },
            { title: '备注',dataIndex: 'comment', key: 'comment',},
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={PayRentColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '交租金记录', content: content, key: '4' },)
          this.setState({chooseTarget:'4'})
        }else{
          this.setState({chooseTarget:'4'})
        }
      }
    }).catch(()=>{})
  }
  //获取退押金记录
  getContractDeposit= (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/finance/getDepositRefundRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'5')){
          this.state.panesKey.push('5')
          //退押金记录
          const BackDepositColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '退款时间',dataIndex: 'deposit_refund_time', key: 'deposit_refund_time',},
            { title: '金额',dataIndex: 'deposit_refund_amount', key: 'deposit_refund_amount',},
            { title: '渠道',dataIndex: 'deposit_refund_type', key: 'deposit_refund_type',
              render: (text,record) =>
                <span>
                  {record.deposit_refund_type==0 && <span>微信</span>}
                  {record.deposit_refund_type==1 && <span>支付宝</span>}
                  {record.deposit_refund_type==2 && <span>银行</span>}
                  {record.deposit_refund_type==3 && <span>现金</span>}
                  {record.deposit_refund_type==5 && <span>混合</span>}
                  {record.deposit_refund_type==4 && <span>其他</span>}
                </span>
            },
            { title: '退押金状态',dataIndex: 'deposit_refund_status', key: 'deposit_refund_status',
              render: (text,record) =>
                <span>
                  {record.deposit_refund_status==0 && <span style={{color:'#f50'}}>未支付</span>}
                  {record.deposit_refund_status==1 && <span>已支付</span>}
                </span>
            },
            { title: '备注',dataIndex: 'comment', key: 'comment',},
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={BackDepositColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '退押金记录', content: content, key: '5' },)
          this.setState({chooseTarget:'5'})
        }else{
          this.setState({chooseTarget:'5'})
        }
      }
    }).catch(()=>{})
  }
  //获取签约收款记录
  getContract= (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("recode_type", 1);
    GFHFormData.append("limit", 1000);
    request('/api/web/finance/getContractDeposit',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'6')){
          this.state.panesKey.push('6')
          //签约收款记录
          const ContractPaymentColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '支付时间',dataIndex: 'pay_time', key: 'pay_time',},
            { title: '首月租金',dataIndex: 'first_amount', key: 'first_amount',},
            { title: '支付金额',dataIndex: 'deposit', key: 'deposit',},
            { title: '管理费',dataIndex: 'manager_amount', key: 'manager_amount',},
            { title: '支付状态',dataIndex: 'status', key: 'status',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={ContractPaymentColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '签约收款记录', content: content, key: '6' },)
          this.setState({chooseTarget:'6'})
        }else{
          this.setState({chooseTarget:'6'})
        }
      }
    }).catch(()=>{})
  }
  //获取延期记录
  getExtensionRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getExtensionRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'8')){
          this.state.panesKey.push('8')
          //延期记录
          const DelayColumn = [
            { title: '操作时间',dataIndex: 'create_time', key: 'create_time',},
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled ? <Tag className={styles.TagBtn}>删除</Tag> :
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this, record.entity_id)} okText="删除"
                                cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange">删除</Tag>
                    </Popconfirm>
                  }
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addExtension()} type="primary" ghost>新增延期记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={DelayColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '延期记录', content: content, key: '8' },)
          this.setState({chooseTarget:'8'})
        }else{
          this.setState({chooseTarget:'8'})
        }
      }
    }).catch(()=>{})
  }
  addExtension = () =>{
    this.props.history.push('/Car/CarManager/NewExtensionCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  //获取维修记录
  getMaintainRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'9')){
          this.state.panesKey.push('9')
          //维修记录
          const MaintenanceColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '进厂时间',dataIndex: 'maintain_time', key: 'maintain_time',},
            { title: '维修总金额',dataIndex: 'total_amount', key: 'total_amount',},
            { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
            { title: '维修状态',dataIndex: 'maintain_status', key: 'maintain_status',
              render: (text,record) =>
                <span>
            {record.maintain_status==0 && <span>维修中</span>}
                  {record.maintain_status==1 && <span>已修好</span>}
          </span>
            },
            { title: '出厂时间',dataIndex: 'maintain_finish_time', key: 'maintain_finish_time',},
            { title: '维修天数',dataIndex: 'use_days', key: 'use_days',},
            { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
            { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
              render: (text,record) =>
                <span>
            {record.get_vehicle_status==0 && <span>未提车</span>}
                  {record.get_vehicle_status==1 && <span>已提车</span>}
          </span>},
            { title: '维修内容',dataIndex: 'content', key: 'content',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowMaintainRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addMaintain()} type="primary" ghost>新增维修记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={MaintenanceColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '维修记录', content: content, key: '9' },)
          this.setState({chooseTarget:'9'})
        }else{
          this.setState({chooseTarget:'9'})
        }
      }
    }).catch(()=>{})
  }
  addMaintain= () =>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowMaintainRecord= (target) =>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes?entity_id='+target);
  }
  //获取保养记录
  getKeepRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getKeepRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.info.rows,
          ShowCarReocrdLen:data.data.info.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'10')){
          this.state.panesKey.push('10')
          //保养记录
          const KeepColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
            { title: '金额',dataIndex: 'amount', key: 'amount',},
            { title: '进厂公里数',dataIndex: 'last_vkt', key: 'last_vkt',},
            { title: '进厂时间',dataIndex: 'this_keep_time', key: 'this_keep_time',},
            { title: '下次保养公里数',dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
            { title: '出厂时间',dataIndex: 'get_vehicle_time', key: 'get_vehicle_time',},
            { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
              render: (text,record) =>
                <span>
            {record.get_vehicle_status==0 && <span>未提车</span>}
                  {record.get_vehicle_status==1 && <span>已提车</span>}
          </span>
            },
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowKeepRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addKeep()} type="primary" ghost>新增保养记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={KeepColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '保养记录', content: content, key: '10' },)
          this.setState({chooseTarget:'10'})
        }else{
          this.setState({chooseTarget:'10'})
        }
      }
    }).catch(()=>{})
  }
  addKeep= () =>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowKeepRecord= (target) =>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes?entity_id='+target);
  }
  //获取年检记录列表
  getSurveryRecord= (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getSurveryRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'12')){
          this.state.panesKey.push('12')
          //年检记录
          const ASColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '年检日期',dataIndex: 'annual_survey_time', key: 'annual_survey_time',},
            { title: '年检处理人',dataIndex: 'annual_survey_manager', key: 'annual_survey_manager',},
            { title: '金额',dataIndex: 'amount', key: 'amount',},
            { title: '下次年检日期',dataIndex: 'next_annual_survery_time', key: 'next_annual_survery_time',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowSurvery.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addSurvery()} type="primary" ghost>新增年检记录</Button>
              <Table  scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={ASColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '年检记录', content: content, key: '12' },)
          this.setState({chooseTarget:'12'})
        }else{
          this.setState({chooseTarget:'12'})
        }
      }
    }).catch(()=>{})
  }
  addSurvery = () =>{
    this.props.history.push('/Car/CarManager/NewSurveryCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowSurvery = (target) =>{
    this.props.history.push('/Car/CarManager/NewSurveryCarNotes?entity_id='+target);
  }
  //获取保单记录列表
  getPolicyRecord= (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getPolicyRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'13')){
          this.state.panesKey.push('13')
          //保单记录
          const InsuranceColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '交强险开始日期',dataIndex: 'insurance_policy_start_time', key: 'insurance_policy_start_time',},
            { title: '交强险结束日期',dataIndex: 'insurance_policy_end_time', key: 'insurance_policy_end_time',},
            { title: '商业险开始日期',dataIndex: 'commercial_insurance_policy_start_time', key: 'commercial_insurance_policy_start_time',},
            { title: '商业险结束日期',dataIndex: 'commercial_insurance_policy_end_time', key: 'commercial_insurance_policy_end_time',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowPolicy.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addPolicy()} type="primary" ghost>新增保单记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading}  style={{marginTop:'24px'}} columns={InsuranceColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '保单记录', content: content, key: '13' },)
          this.setState({chooseTarget:'13'})
        }else{
          this.setState({chooseTarget:'13'})
        }
      }
    }).catch(()=>{})
  }
  addPolicy = () =>{
    this.props.history.push('/Car/CarManager/NewPolicyCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowPolicy = (target) =>{
    this.props.history.push('/Car/CarManager/NewPolicyCarNotes?entity_id='+target);
  }
  //获取违章记录列表
  getViolationRecord= (search)=>{
    this.getHandViolationInter('');
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", window.location.href.split('Car_id=')[1]);
    GFHFormData.append("limit", 9999);
    request('/api/web/vehicle_violation/getViolationRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'14')){
          this.state.panesKey.push('14')
          //违章记录
          const IllegalColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '违章时间',dataIndex: 'violation_time', key: 'violation_time',},
            { title: '违章地点',dataIndex: 'violation_address', key: 'violation_address',},
            { title: '详细内容',dataIndex: 'content', key: 'content',},
            { title: '违章金额',dataIndex: 'price', key: 'price',},
            { title: '违章扣分',dataIndex: 'score', key: 'score',},
            { title: '状态',dataIndex: 'status', key: 'status',
              render: (text,record) =>
                <div>
                  {record.status==0 &&
                  <span style={{color:'#f50'}}>未处理</span>
                  }
                  {record.status==1 &&
                  <span>已完成</span>
                  }
                </div>
            },
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button onClick={this.checkWiezhang} disabled={this.state.ButtonDisabled} type="primary" ghost>刷新违章</Button><span style={{marginLeft:'24px'}}>(七位车牌只能查广东、浙江，江苏三地)</span>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={IllegalColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '违章记录', content: content, key: '14' },)
          this.setState({chooseTarget:'14'})
        }else{
          this.setState({chooseTarget:'14'})
        }
      }else{

      }
    }).catch(()=>{})
  }
  //有手动违章车辆列表数据接口
  getHandViolationInter = (search) =>{
    this.setState({violatLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id",window.location.href.split('Car_id=')[1]);
    GFHFormData.append("limit", 9999);
    request('/api/web/vehicle_violation/getHandViolation',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({ violatLoading:false})
      if (data.data.code === 1) {
        this.setState({
          violatRecord:data.data.data.rows,
          violatRecordLen:data.data.data.rows.length,
          violatLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  //手动添加违章
  AddIllegalLink = ()=>{
    this.props.history.push('/Car/CarManager/AddIllegal?license_plate_no='+this.state.licensePlateNo);
  }
  //查看手动查违章的详细信息
  ShowIllegal = (target)=>{
    this.props.history.push('/Car/CarManager/AddIllegal?entity_id='+target);
  }
  //删除手动查违章
  DeleteIllegal = (target)=>{
    this.setState({violatLoading:true})
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("entity_id", target);
    request('/api/web/vehicle/delrecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1) {
        this.getHandViolationInter('')
        message.success('删除成功！')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //获取验车记录
  addValidata = () =>{
    this.props.history.push('/Car/CarManager/NewCheckCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  getValidataRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getValidataRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'1')){
          this.state.panesKey.push('1')
          //验车记录
          const CheckRecordColumn = [
            { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '保单复印件', dataIndex: 'is_insurance', key: 'is_insurance',
              render: (text,record) =>
                <span>
            {record.is_insurance==1 && <span>有</span>}
                  {record.is_insurance==0 && <span style={{color:'#f50'}}>无</span>}
          </span>
            },
            { title: '行驶证', dataIndex: 'is_travel', key: 'is_travel',
              render: (text,record) =>
                <span>
            {record.is_travel==1 && <span>有</span>}
                  {record.is_travel==0 && <span style={{color:'#f50'}}>无</span>}
          </span>
            },
            { title: '营运证', dataIndex: 'is_operate', key: 'is_operate',
              render: (text,record) =>
                <span>
            {record.is_operate==1 && <span>有</span>}
                  {record.is_operate==0 && <span style={{color:'#f00'}}>无</span>}
          </span>
            },
            { title: '公里数', dataIndex: 'even_number', key: 'even_number',},
            { title: '验车状态', dataIndex: 'status', key: 'status',
              render: (text,record) =>
                <span>
            {record.status==1 && <span>无车损</span>}
                  {record.status==0 && <span style={{color:'#f00'}}>有车损</span>}
          </span>
            },
            { title: '完成时间', dataIndex: 'validata_time', key: 'validata_time',
              render: (text,record) =>
                <span>{record.validata_date} {record.validata_time}</span>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowValidataRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addValidata()} type="primary" ghost>新增验车记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={CheckRecordColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '验车记录', content: content, key: '1' },)
          this.setState({chooseTarget:'1'})
        }else{
          this.setState({chooseTarget:'1'})
        }
      }
    }).catch(()=>{})
  }
  ShowValidataRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewCheckCarNotes?entity_id='+target);
  }
  //获取出险记录
  getAccidentRecord = (id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
        if(!this.isInArray(this.state.panesKey,'11')){
          this.state.panesKey.push('11')
          //出险记录
          const OutDangeColumn = [
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '事故地点',dataIndex: 'address', key: 'address',},
            { title: '出险时间',dataIndex: 'accident_time', key: 'accident_time',},
            { title: '责任方',dataIndex: 'responsible_party', key: 'responsible_party',},
            { title: '理赔状态',dataIndex: 'settlement_claims_status', key: 'settlement_claims_status',
              render: (text,record) =>
                <div>
                  {record.settlement_claims_status==0 &&
                  <Badge status="processing" text="处理中" />
                  }
                  {record.settlement_claims_status==1 &&
                  <span>已完成</span>
                  }
                </div>
            },
            { title: '己方金额',dataIndex: 'own_amount', key: 'own_amount',},
            { title: '第三方金额',dataIndex: 'thirdparty_amount', key: 'thirdparty_amount',},
            { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
            { title: '出厂时间',dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
            { title: '维修状态',dataIndex: 'maintian_status', key: 'maintian_status',
              render: (text,record) =>
                <div>
                  {record.maintian_status==0 &&
                  <Badge status="processing" text="维修中" />
                  }
                  {record.maintian_status==1 &&
                  <span>已修好</span>
                  }
                </div>
            },
            { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
              render: (text,record) =>
                <div>
                  {record.get_vehicle_status==0 &&
                  <Badge status="processing" text="未提车" />
                  }
                  {record.get_vehicle_status==1 &&
                  <span>已提车</span>
                  }
                </div>},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
                      <Tag className={styles.TagBtn} color="orange" >删除</Tag>
                    </Popconfirm>}
                  <Tag onClick={this.ShowAccidentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>},
          ];
          var content = (
            <div style={{margin: '3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addAccident()} type="primary" ghost>新增出险记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={OutDangeColumn} dataSource={this.state.ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '出险记录', content: content, key: '11' },)
          this.setState({chooseTarget:'11'})
        }else{
          this.setState({chooseTarget:'11'})
        }
      }
    }).catch(()=>{})
  }
  addAccident = ()=>{
    this.props.history.push('/Car/CarManager/NewAccidentCarNotes?license_plate_no='+this.state.licensePlateNo);
  }
  ShowAccidentRecord = (target) =>{
    this.props.history.push('/Car/CarManager/ShowAccidentCarNotes?entity_id='+target+"&Car_id="+window.location.href.split('Car_id=')[1]);
  }

  //选择地址坐标
  showMap = ()=>{
    this.setState({
      showIsMap:true
    })
  }
  handleMapOk = () => {
    this.setState({
      showIsMap: false,
    });
  }
  handleMapCancel = () => {
    this.setState({
      showIsMap: false,
    });
  }



  //p按段是否数组中有该元素
  isInArray=(arr,value)=>{
    for(var i = 0; i < arr.length; i++){
      if(value === arr[i]){
        return true;
      }
    }
    return false;
  }
  //从数组中删除某元素
  removeByValue=(arr, val)=> {
    for(var i=0; i<arr.length; i++) {
      if(arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  }
  //删除Tabs标签页
  onEdit = (targetKey, action)=>{
    if(action=='remove'){
      this.removeByValue(this.state.panesKey, targetKey);
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      this.setState({ panes, chooseTarget:'20' });
    }
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
    const { CompanyList,otherRefundStatus,collectionRecordStatus,otherRefundCustomer,otherRefundTime,collectionRecordCustomer,collectionRecordTime,ShowCarReocrd,BorrowPartner,BorrowTime,ViolationContent,ValidatasStatus,SignStatus,RentStatus,RefundStatus,DepositRefundStatus,ContractDepositStatus,BorrowStatus,ExtensionStatus,MaintainStatus,KeepStatus,AccidentStatus,AnnualSurveryStatus,InsurancePolicyStatus,ViolationStatus,ViolationTime,KeepGps,InsurancePolicyCommercialTime,InsurancePolicyTime,KeepTime,AnnualSurveryAmount,AnnualSurveryTime,AccidentsStatus,AccidentTime,ExtensionCustomer,MaintainGps,ExtensionTime,MaintainTime,ContractDepositCustomer,ContractDepositTime,ValidataStatus,ValidataTime,SignCustomer,SignTime,RentCustomer,RentTime,RefundCustomer,RefundTime,DepositRefundCustomer,DepositRefundTime} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const styleDiv = {
      width:'200px',
      padding:'5px',
    };
    const styleB = {
      background:'#fff',
      color: '#000',
      fontSize:'14px',
      padding: '5px'
    };
    const config = {
      rules: [{ type: 'object', required: false, message: '请选择具体时间!' }],
    };
    //借车记录
    const BorrowRecordColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '合作伙伴名称',dataIndex: 'partner_name', key: 'partner_name',},
      { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金',dataIndex: 'month_amount', key: 'month_amount',},
      { title: '押金',dataIndex: 'deposit', key: 'deposit',},
      { title: '下次交租金日期',dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '借车状态',dataIndex: 'borrow_vehicle_status', key: 'borrow_vehicle_status',
        render: (text,record) =>
          <div>
            {record.borrow_vehicle_status==0 &&
            <span style={{color:'#f50'}}>已退车</span>
            }
            {record.borrow_vehicle_status==1 &&
            <span>正常借车</span>
            }
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowBorrowRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>},
    ];
    //验车记录
    const CheckRecordColumn = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '保单复印件', dataIndex: 'is_insurance', key: 'is_insurance',
        render: (text,record) =>
          <span>
            {record.is_insurance==1 && <span>有</span>}
            {record.is_insurance==0 && <span style={{color:'#f50'}}>无</span>}
          </span>
      },
      { title: '行驶证', dataIndex: 'is_travel', key: 'is_travel',
        render: (text,record) =>
          <span>
            {record.is_travel==1 && <span>有</span>}
            {record.is_travel==0 && <span style={{color:'#f50'}}>无</span>}
          </span>
      },
      { title: '营运证', dataIndex: 'is_operate', key: 'is_operate',
        render: (text,record) =>
          <span>
            {record.is_operate==1 && <span>有</span>}
            {record.is_operate==0 && <span style={{color:'#f00'}}>无</span>}
          </span>
      },
      { title: '公里数', dataIndex: 'even_number', key: 'even_number',},
      { title: '验车状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <span>
            {record.status==1 && <span>无车损</span>}
            {record.status==0 && <span style={{color:'#f00'}}>有车损</span>}
          </span>
      },
      { title: '完成时间', dataIndex: 'validata_time', key: 'validata_time',
        render: (text,record) =>
          <span>{record.validata_date}{record.validata_time}</span>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowValidataRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //签约记录
    const SignColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号',dataIndex: 'telephone', key: 'telephone',},
      { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金',dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金',dataIndex: 'deposit', key: 'deposit',},
      { title: '签约日期',dataIndex: 'sign_date', key: 'sign_date',},
      { title: '签约状态',dataIndex: 'sign_status', key: 'sign_status',
        render: (text,record) =>
          <span>
            {record.sign_status==0 && <span>未签</span>}
            {record.sign_status==1 && <span>已签</span>}
            {record.sign_status==2 && <span>作废</span>}
          </span>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowSignRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //租车记录
    const RentColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '手机号',dataIndex: 'telephone', key: 'telephone',},
      { title: '合同开始日期',dataIndex: 'contract_start_time', key: 'contract_start_time',},
      { title: '合同结束日期',dataIndex: 'contract_end_time', key: 'contract_end_time',},
      { title: '租金',dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金',dataIndex: 'deposit', key: 'deposit',},
      { title: '租车类型',dataIndex: 'type', key: 'type',
        render: (text,record) =>
          <span>
            {record.type==1 && <span>月租</span>}
            {record.type==2 && <span>日租</span>}
            {record.type==3 && <span>以租代购</span>}
          </span>
      },
      { title: '租车状态',dataIndex: 'rent_vehicle_status', key: 'rent_vehicle_status',
        render: (text,record) =>
          <span>
            {record.rent_vehicle_status==0 && <span>已退车</span>}
            {record.rent_vehicle_status==1 && <span>正常租车</span>}
          </span>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowRentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //交租金记录
    const PayRentColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '交租金时间',dataIndex: 'refund_time', key: 'refund_time',},
      { title: '金额',dataIndex: 'refund_amount', key: 'refund_amount',},
      { title: '渠道',dataIndex: 'refund_type_all', key: 'refund_type_all',},
      { title: '下次交租金日期',dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '交租金状态',dataIndex: 'refund_status', key: 'refund_status',
        render: (text,record) =>
          <span>
            {record.refund_status==0 && <span>未还清</span>}
            {record.refund_status==1 && <span>正常还款</span>}
          </span>
      },
      { title: '备注',dataIndex: 'comment', key: 'comment',},
    ];
    //退押金记录
    const BackDepositColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '退款时间',dataIndex: 'deposit_refund_time', key: 'deposit_refund_time',},
      { title: '金额',dataIndex: 'deposit_refund_amount', key: 'deposit_refund_amount',},
      { title: '渠道',dataIndex: 'deposit_refund_type_all', key: 'deposit_refund_type_all',},
      { title: '退押金状态',dataIndex: 'deposit_refund_status', key: 'deposit_refund_status',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
    ];
    //签约收款记录
    const ContractPaymentColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '支付时间',dataIndex: 'pay_time', key: 'pay_time',},
      { title: '首月租金',dataIndex: 'first_amount', key: 'first_amount',},
      { title: '支付金额',dataIndex: 'deposit', key: 'deposit',},
      { title: '管理费',dataIndex: 'manager_amount', key: 'manager_amount',},
      { title: '支付状态',dataIndex: 'status', key: 'status',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
    ];
    //延期记录
    const DelayColumn = [
      { title: '操作时间',dataIndex: 'create_time', key: 'create_time',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled ? <Tag className={styles.TagBtn}>删除</Tag> :
              <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this, record.entity_id)} okText="删除"
                          cancelText="取消">
                <Tag className={styles.TagBtn} color="orange">删除</Tag>
              </Popconfirm>
            }
          </div>
        ,
      },
    ];
    const MaintenanceColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '进厂时间',dataIndex: 'maintain_time', key: 'maintain_time',},
      { title: '维修总金额',dataIndex: 'total_amount', key: 'total_amount',},
      { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
      { title: '维修状态',dataIndex: 'maintain_status', key: 'maintain_status',
        render: (text,record) =>
          <span>
            {record.maintain_status==0 && <span>维修中</span>}
            {record.maintain_status==1 && <span>已修好</span>}
          </span>
      },
      { title: '出厂时间',dataIndex: 'maintain_finish_time', key: 'maintain_finish_time',},
      { title: '维修天数',dataIndex: 'use_days', key: 'use_days',},
      { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
      { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
        render: (text,record) =>
          <span>
            {record.get_vehicle_status==0 && <span>未提车</span>}
            {record.get_vehicle_status==1 && <span>已提车</span>}
          </span>},
      { title: '维修内容',dataIndex: 'content', key: 'content',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowMaintainRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //保养记录
    const KeepColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
      { title: '金额',dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数',dataIndex: 'last_vkt', key: 'last_vkt',},
      { title: '进厂时间',dataIndex: 'this_keep_time', key: 'this_keep_time',},
      { title: '下次保养公里数',dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
      { title: '出厂时间',dataIndex: 'get_vehicle_time', key: 'get_vehicle_time',},
      { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
        render: (text,record) =>
          <span>
            {record.get_vehicle_status==0 && <span>未提车</span>}
            {record.get_vehicle_status==1 && <span>已提车</span>}
          </span>
      },
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowKeepRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //出险记录
    const OutDangeColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '事故地点',dataIndex: 'address', key: 'address',},
      { title: '出险时间',dataIndex: 'accident_time', key: 'accident_time',},
      { title: '责任方',dataIndex: 'responsible_party', key: 'responsible_party',},
      { title: '理赔状态',dataIndex: 'settlement_claims_status', key: 'settlement_claims_status',
        render: (text,record) =>
          <div>
            {record.settlement_claims_status==0 &&
            <Badge status="processing" text="处理中" />
            }
            {record.settlement_claims_status==1 &&
            <span>已完成</span>
            }
          </div>
      },
      { title: '己方金额',dataIndex: 'own_amount', key: 'own_amount',},
      { title: '第三方金额',dataIndex: 'thirdparty_amount', key: 'thirdparty_amount',},
      { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
      { title: '出厂时间',dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
      { title: '维修状态',dataIndex: 'maintian_status', key: 'maintian_status',
        render: (text,record) =>
          <div>
            {record.maintian_status==0 &&
            <Badge status="processing" text="维修中" />
            }
            {record.maintian_status==1 &&
            <span>已修好</span>
            }
          </div>
      },
      { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
        render: (text,record) =>
          <div>
            {record.get_vehicle_status==0 &&
            <Badge status="default" text="未提车" />
            }
            {record.get_vehicle_status==1 &&
            <Badge status="success" text="未提车" />
            }
          </div>},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowAccidentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>},
    ];
    //年检记录
    const ASColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '年检日期',dataIndex: 'annual_survey_time', key: 'annual_survey_time',},
      { title: '年检处理人',dataIndex: 'annual_survey_manager', key: 'annual_survey_manager',},
      { title: '金额',dataIndex: 'amount', key: 'amount',},
      { title: '下次年检日期',dataIndex: 'next_annual_survery_time', key: 'next_annual_survery_time',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowSurvery.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
      },
    ];
    //保单记录
    const InsuranceColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '交强险开始日期',dataIndex: 'insurance_policy_start_time', key: 'insurance_policy_start_time',},
      { title: '交强险结束日期',dataIndex: 'insurance_policy_end_time', key: 'insurance_policy_end_time',},
      { title: '商业险开始日期',dataIndex: 'commercial_insurance_policy_start_time', key: 'commercial_insurance_policy_start_time',},
      { title: '商业险结束日期',dataIndex: 'commercial_insurance_policy_end_time', key: 'commercial_insurance_policy_end_time',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
            <Popconfirm title="确定删除该记录?" onConfirm={this.DeleteRecord.bind(this,record.entity_id)} okText="删除" cancelText="取消">
              <Tag className={styles.TagBtn} color="orange" >删除</Tag>
            </Popconfirm>}
            <Tag onClick={this.ShowPolicy.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
      },
    ];
    //违章记录
    const IllegalColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '违章时间',dataIndex: 'violation_time', key: 'violation_time',},
      { title: '违章地点',dataIndex: 'violation_address', key: 'violation_address',},
      { title: '详细内容',dataIndex: 'content', key: 'content',},
      { title: '违章金额',dataIndex: 'price', key: 'price',},
      { title: '违章扣分',dataIndex: 'score', key: 'score',},
      { title: '状态',dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 &&
            <span style={{color:'#f50'}}>未处理</span>
            }
            {record.status==1 &&
            <span>已完成</span>
            }
          </div>
      },
    ];
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择图片</div>
      </div>
    );
    const notice = [
      {id:'1',title:'最新验车',href:'/#/Car/CarManager/NewCheckCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'验车状态：'+ValidataStatus,updatedAt:ValidataTime,status:ValidatasStatus},
      {id:'2',title:'最新签约',href:'/#/Car/CarManager/NewSignCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'客户姓名：'+SignCustomer,updatedAt:SignTime,status:SignStatus},
      {id:'3',title:'最新租车',href:'/#/Car/CarManager/NewCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'客户姓名：'+RentCustomer,updatedAt:RentTime,status:RentStatus},
      {id:'4',title:'最新交租金',href:'',description:'客户姓名：'+RefundCustomer,updatedAt:RefundTime,status:RefundStatus},
      {id:'5',title:'最新退押金',href:'',description:'客户姓名：'+DepositRefundCustomer,updatedAt:DepositRefundTime,status:DepositRefundStatus},
      {id:'15',title:'最新收款',href:'',description:'客户姓名：'+otherRefundCustomer,updatedAt:otherRefundTime,status:otherRefundStatus},
      {id:'16',title:'最新付款',href:'',description:'客户姓名：'+collectionRecordCustomer,updatedAt:collectionRecordTime,status:collectionRecordStatus},
      {id:'6',title:'最新签约收款',href:'',description:'客户姓名：'+ContractDepositCustomer,updatedAt:ContractDepositTime,status:ContractDepositStatus},
      {id:'7',title:'最新借车',href:'/#/Car/CarManager/NewBorrowCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'合作公司：'+BorrowPartner,updatedAt:BorrowTime,status:BorrowStatus},
      {id:'8',title:'最新延期',href:'/#/Car/CarManager/NewExtensionCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'客户姓名：'+ExtensionCustomer,updatedAt:ExtensionTime,status:ExtensionStatus},
      {id:'9',title:'最新维修',href:'/#/Car/CarManager/NewMaintainCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'客户姓名：'+MaintainGps,updatedAt:MaintainTime,status:MaintainStatus},
      {id:'10',title:'最新保养',href:'/#/Car/CarManager/NewKeepCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'进厂公里数：'+KeepGps,updatedAt:KeepTime,status:KeepStatus},
      {id:'11',title:'最新出险',href:'/#/Car/CarManager/NewAccidentCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'理赔状态：'+AccidentStatus,updatedAt:AccidentTime,status:AccidentsStatus},
      {id:'12',title:'最新年检',href:'/#/Car/CarManager/NewSurveryCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'年检日期：'+AnnualSurveryTime,updatedAt:'年检金额：'+AnnualSurveryAmount,status:AnnualSurveryStatus},
      {id:'13',title:'最新保单',href:'/#/Car/CarManager/NewPolicyCarNotes?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'交强险结束日期：'+InsurancePolicyTime,updatedAt:'商业险结束日期：'+InsurancePolicyCommercialTime,status:InsurancePolicyStatus},
      {id:'14',title:'最新违章',href:'/#/Car/CarManager/AddIllegal?license_plate_no='+this.state.licensePlateNo+'&vehicle_template='+this.state.carModel,description:'违章内容：'+ViolationContent,updatedAt:ViolationTime,status:ViolationStatus},
    ];
    //手动查违章
    const IllegalCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '违章时间', dataIndex: 'violation_time', key: 'violation_time',},
      { title: '违章地点', dataIndex: 'violation_address', key: 'violation_address',},
      { title: '违章金额', dataIndex: 'price', key: 'price',},
      { title: '违章扣分', dataIndex: 'score', key: 'score',},
      { title: '违章状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 &&
            <span style={{color:'#f50'}}>未处理</span>
            }
            {record.status==1 &&
            <span>已处理</span>
            }
          </div>
      },
      { title: '违章内容', dataIndex: 'content', key: 'content',width:200},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag loading={this.state.deleteLoading} onClick={this.DeleteIllegal.bind(this,record.entity_id)} className={styles.TagBtn} color="magenta" >删除</Tag>
            <Tag onClick={this.ShowIllegal.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    const events = {
      created: (instance) => { },
      click: (e) => {
        if(e.type=='click'){
          const lng = utils.gaoDeToGAODE(e.lnglat.lng,e.lnglat.lat).bd_lng;
          const lat = utils.gaoDeToGAODE(e.lnglat.lng,e.lnglat.lat).bd_lat;
          this.setState({
            lng:lng,
            lat:lat
          })
        }
      }
    }
    return (
      <div>
        <Card
          className={styles.projectList}
          style={{ marginBottom: 24 }}
          title="车辆记录"
          bordered={false}
          loading={this.state.CardReocrdLoading}
          bodyStyle={{ padding: 0 }}
          extra={<div>{this.state.lng && <Button loading={this.state.backcarLoading} onClick={this.showMap} type="primary">车辆位置记录</Button>}</div>}
        >
          {notice.map(item => (
            <Card.Grid className={styles.projectGrid} key={item.id} onClick={this.chooseList.bind(this,item.id)}>
              <Card bodyStyle={{ padding: 0 }} bordered={false}  >
                <Card.Meta
                  onClick={this.chooseList.bind(this,item.id)}
                  title={
                    <div style={{display:'flex',flexFlow:'row'}}>
                      <span style={{flex:'1',fontSize:'15px',display:'inline-block',color:'rgba(0,0,0,0.45)'}}>{item.title}</span>
                      {item.href?<Tooltip title="新增记录"><Icon onClick={()=>{window.location.href=item.href}} style={{color:'#008dff',fontSize:'20px',}} type="plus-square-o" /></Tooltip>:null}
                    </div>}
                  description={
                    <div>
                      {
                        item.status==1 &&
                        <div>
                          <div style={{padding:'5px 0px'}}><Ellipsis style={{color:'#333',overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}} >{item.description}</Ellipsis></div>
                          <div style={{padding:'5px 0px'}}><Ellipsis style={{color:'#333',overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}} >{item.updatedAt}</Ellipsis></div>
                        </div>
                      }
                      {
                        item.status==0 &&
                        <div>
                          <div style={{padding:'5px 0px'}}><Ellipsis length={17} style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}}>暂无记录</Ellipsis></div>
                          <div style={{padding:'5px 0px'}}><Ellipsis length={17} style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}}>等待录入新记录...</Ellipsis></div>
                        </div>
                      }
                    </div>
                  }
                />
              </Card>
            </Card.Grid>
          ))}
        </Card>
        {this.state.showAlert==1 && <Alert style={{marginBottom:24}} message="正在进行违章查询，请稍后..." iconType="loading" showIcon />}
        <Card>
          <Tabs hideAdd={true} type="editable-card" defaultActiveKey={100} activeKey={this.state.chooseTarget} onChange={this.chooseList}  onEdit={this.onEdit}>
            <TabPane tab="车辆具体信息" key="20" closable={false}>
             <div style={{margin:'3% auto'}}>
               <Form className={styles.form} >
                 <div className={styles.formDiv}>
                   <FormItem {...formItemLayout} label="车牌号">
                     {getFieldDecorator('license_plate_no', {
                       rules: [{required: true, message: '请输入车牌号',}],
                     })(
                       <Input disabled={true} placeholder="请输入车牌号" />
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
                       <AutoComplete dataSource={this.state.templateList} placeholder="请选择品牌车型" />
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
                       <AutoComplete dataSource={this.state.CarBodyColor} placeholder="请选择车身颜色"  />
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
                       <AutoComplete dataSource={this.state.cheguan} placeholder="请选择负责车管" />
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
                       <AutoComplete dataSource={this.state.jiaguan} placeholder="请选择负责驾管" />
                     )}
                   </FormItem>
                   <FormItem
                     {...formItemLayout}
                     label="行驶证照片"
                   >
                     {getFieldDecorator('travel_license_img', {
                       rules: [
                         { required: false, message: '请选择上传行驶证照片!' },
                       ],
                     })(
                       <div style={{display:'flex',flexFlow:'column'}}>
                       <Upload
                       className={styles.imgBorder}
                       listType="picture-card"
                       fileList={this.state.travel_license_oss}
                       onPreview={this.handlePreview}
                       onChange={this.ImgChange}
                       onRemove ={this.ImgRemove}
                       >
                         {this.state.showuploadButton ? null : uploadButton}
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
                     label="车辆附加照片"
                   >
                     {getFieldDecorator('upload', {
                       rules: [
                         { required: false, message: '请选择上传车辆附加照片!' },
                       ],
                     })(
                       <Upload
                         listType="picture-card"
                         fileList={this.state.FJImgList}
                         onPreview={this.handlePreview}
                         onChange={this.FJImgChange}
                         onRemove ={this.FJImgRemove}
                       >
                         {this.state.FJImgList.length >= 12 ? null : uploadButton}
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
                     <div className={styles.TagBtnDiv}>
                      <Button disabled={this.state.ButtonDisabled} loading={this.state.UpdateButtonLoading} className={styles.formButton} onClick={this.UpdateCarInfo} type="primary">确认修改</Button>
                      <Button disabled={this.state.ButtonDisabled} loading={this.state.DeleteButtonLoading} style={{marginLeft:'15px'}}  className={styles.formButton} onClick={this.DeleteCar} type="danger" ghost>删除</Button>
                     </div>
                   </FormItem>
                 </div>
               </Form>
             </div>
            </TabPane>
            {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPane>)}
        </Tabs>
        </Card>
        {
          this.state.chooseTarget=='14' &&
          <Card style={{marginTop:24}} title={<div>手动新增违章记录（不参与系统违章统计）</div>} bordered={false}  extra={<Button onClick={this.AddIllegalLink} type="primary" ghost>手动新增违章记录</Button>}>
            <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={IllegalCar}
                   loading={this.state.violatLoading} dataSource={this.state.violatRecord}
                   footer={() => <p>总共 {this.state.violatRecordLen} 条数据</p>}/>
          </Card>
        }
        <Modal
          title="车辆位置记录"
          visible={this.state.showIsMap}
          onOk={this.handleMapOk}
          onCancel={this.handleMapCancel}
        >
          <div style={{paddingBottom:'24px'}}>
            <div style={{width:'100%',display:'flex',flexFlow:'row'}}>
              <FormItem style={{marginBottom:'0px',flex:'1'}}>
                <text style={{color:'rgba(0,0,0,0.85)'}}>GPS定位状态 :</text>
                {this.state.device_info_new==0 && <span style={{marginLeft:'5px',color:'#1890ff',fontWeight:'bolder',fontSize:'18px',}}>正常</span>}
                {this.state.device_info_new==1 && <span style={{marginLeft:'5px',color:'#000',fontWeight:'bolder',fontSize:'18px',}}>设备未上线</span>}
                {this.state.device_info_new==2 && <span style={{marginLeft:'5px',color:'#f60',fontWeight:'bolder',fontSize:'18px',}}>设备已过期</span>}
                {this.state.device_info_new==3 && <span style={{marginLeft:'5px',color:'#aaa',fontWeight:'bolder',fontSize:'18px',}}>设备离线</span>}
                {this.state.device_info_new==4 && <span style={{marginLeft:'5px',color:'#1890ff',fontWeight:'bolder',fontSize:'18px',}}>设备正常</span>}
              </FormItem>
              <FormItem style={{marginBottom:'0px',flex:'1'}}><text style={{color:'rgba(0,0,0,0.85)'}}>GPS公里数 :</text>
                {this.state.distance ?
                  <text style={{fontWeight: 'bolder', marginLeft: '5px', fontSize: '18px', color: '#1890ff'}}>{this.state.distance}</text>:
                  <text style={{fontWeight: 'bolder', marginLeft: '5px', fontSize: '18px', color: '#1890ff'}}>— </text>
                }
                公里</FormItem>
            </div>
            <div style={{width:'100%',display:'flex',flexFlow:'row'}}>
            <FormItem style={{marginBottom:'0px',flex:'1'}}><text style={{color:'rgba(0,0,0,0.85)'}}>当前公里数 :</text><text style={{marginLeft:'5px',fontWeight:'bolder',fontSize:'18px',color:'#1890ff'}}>{this.state.travel_range}</text> 公里</FormItem>
            <FormItem style={{marginBottom:'0px',flex:'1'}}><text style={{color:'rgba(0,0,0,0.85)'}}>距离下次保养还剩 :</text>
              {this.state.next_keep_mile ?
                <text style={{marginLeft: '5px', fontWeight: 'bolder', fontSize: '18px', color: '#1890ff'}}>{this.state.next_keep_mile}</text> :
                <text style={{fontWeight: 'bolder', marginLeft: '5px', fontSize: '18px', color: '#1890ff'}}>— </text>
              }
              公里</FormItem>
            </div>
          </div>
          <div style={{width: '100%', height: '400px'}}>
            <Map  plugins={this.mapPlugins}
                  center={this.mapCenter}
                  zoom={6}>
              <Marker position={{longitude: this.state.lng, latitude: this.state.lat }} >
                {this.state.device_info_new==0  && <div style={styleDiv}>
                  <div><span style={styleB}>{this.state.licensePlateNo}[ 正常 ]</span></div>
                  <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
                </div>}
                {this.state.device_info_new==1  && <div style={styleDiv}>
                  <div><span style={styleB}>{this.state.licensePlateNo}[ 未上线 ]</span></div>
                  <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
                </div>}
                {this.state.device_info_new==2  && <div style={styleDiv}>
                  <div><span style={styleB}>{this.state.licensePlateNo}[ 已过期 ]</span></div>
                  <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152810784710093144"/></div>
                </div>}
                {this.state.device_info_new==3  && <div style={styleDiv}>
                  <div><span style={styleB}>{this.state.licensePlateNo}[ 离线 ]</span></div>
                  <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845061029452048"/></div>
                </div>}
                {this.state.device_info_new==4  && <div style={styleDiv}>
                  <div><span style={styleB}>{this.state.licensePlateNo}[ 静止 ]</span></div>
                  <div style={{marginTop:'5px'}}><img style={{width:'60px',height:'auto'}} src="http://diuber-guanche.oss-cn-shanghai.aliyuncs.com/IMG152845061080752696"/></div>
                </div>}
              </Marker>
            </Map>
          </div>
        </Modal>
      </div>
    );
  }
}
const ShowCar = Form.create()(showCar);

export default ShowCar;
