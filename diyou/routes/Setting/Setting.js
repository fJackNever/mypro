import React, { PureComponent } from 'react';
import { Map, Marker } from 'react-amap';
import utils from '../../utils/utils';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import { connect } from 'dva';
import {Popover,Tag,Modal,Tabs,Form,Input,Table,Checkbox, Pagination,Switch ,Badge, Select,Radio, Button, Upload, Icon,notification,message,Model} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Setting.less';
import request from "../../utils/request";



const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class Settings extends PureComponent {
  state = {
    address:'',
    active:'1',
    TodayTime:'2018年3月8号',
    ChangeSafeButtonLoading:false,
    is_approve:0,
    business_license_oss:[],
    img_oss:[],
    is_show:1,
    authorizer:1,
    DeployLoading:false,
    UpdateCompanyLoading:false,
    UpdateContractLoading:false,
    showIsMap:false,
    showMaptext:false,
    latlng:'',
    contractFile:[],
    TableLoading:false,
    contractLoading:false,

    pagecurrent:1,
    pageSize:10,
    comtype:1,

    district:'',
    city:'',
    province:'',
    nation:'',
    contractHidden:false
  }
  componentDidMount() {
    let com_type = window.localStorage.getItem("com_type");
    if(com_type=='营销版' || com_type=='智享版'){this.setState({comtype:3})}
    const TodayTime = new Date();
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日'
    })
    this.getSettingInter();
    this.getpersonalcenterInter();
  }
  //获取公司的配置信息
  getSettingInter = ()=>{
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/index',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        if(data.data.data.cssQcodeUrl){this.setState({cssQcodeUrl:data.data.data.cssQcodeUrl})}else{this.setState({cssQcodeUrl:''})}
        this.setState({
          district:data.data.data.company.district,
          city:data.data.data.company.city,
          province:data.data.data.company.province,
          nation:data.data.data.company.nation,
          is_approve:data.data.data.company.is_approve,
          is_show:data.data.data.company.is_show,
          auditStatus:data.data.data.auditStatus,
          audited:data.data.data.audited,
          companyId:data.data.data.company.id
        })
        if(data.data.data.company.address_coord){
          this.setState({
            showMaptext:true,
          })
        }
        if(data.data.data.company.address_lat && data.data.data.company.address_lat!='0'){
          this.setState({
            latlng:data.data.data.company.address_lng+','+data.data.data.company.address_lat,
            lat:data.data.data.company.address_lat,
            lng:data.data.data.company.address_lng,
            showmap:1,
          })
        }else{
          if(data.data.data.company.address){
            request('https://restapi.amap.com/v3/geocode/geo?key=dc3c63d866e0144a66c7458b9d77fbf3&address='+data.data.data.company.address+'&output=JSON',{
              method:'GET',
            }).then((data)=>{
              if(data.data.status=='1'){
                this.setState({
                  showMaptext:true,
                  showmap:1,
                  latlng:data.data.geocodes[0].location,
                  lng:data.data.geocodes[0].location.split(',')[0],
                  lat:data.data.geocodes[0].location.split(',')[1],
                })
                this.props.form.setFields({
                  address:{value: data.data.geocodes[0].formatted_address,},
                })
              }
            }).catch(()=>{})
          }else{
            this.setState({showmap:0})
          }
        }
        if(data.data.data.authorizer){this.setState({authorizer:1})}else{this.setState({authorizer:0})}
        if(data.data.data.company.address){ this.props.form.setFields({address:{value: data.data.data.company.address,},})}
        if(data.data.data.company.telephone){ this.props.form.setFields({telephone:{value: data.data.data.company.telephone,},})}
        if(data.data.data.company.introduce){ this.props.form.setFields({introduce:{value: data.data.data.company.introduce,},})}
        if(data.data.data.company.rent_rule){ this.props.form.setFields({rent_rule:{value: data.data.data.company.rent_rule,},})}
        if(data.data.data.company.buy_rule){ this.props.form.setFields({buy_rule:{value: data.data.data.company.buy_rule,},})}
        this.props.form.setFields({
          company_name: {value: data.data.data.company.company_name,}
        })
        if(data.data.data.company.img_oss_path){
          const img_oss = [{
            uid: 1,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.company.img_oss_path,
          }]
          this.setState({img_oss:img_oss})
        }else{this.setState({img_oss:[]})}
        if(data.data.data.company.business_license_oss_path){
          const business_license_oss = [{
            uid: 2,
            name: 'xsz.png',
            status: 'done',
            url: data.data.data.company.business_license_oss_path,
          }]
          this.setState({business_license_oss:business_license_oss})
        }else{this.setState({business_license_oss:[]})}
      }else if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
    this.getHetong();
  }
  //获得公司、员工、版本等信息
  getpersonalcenterInter = ()=>{
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/personalcenter',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          isbanben:data.data.data.company_type,
          is_notice:data.data.data.company.is_notice,
          auto_send_rent_amount: data.data.data.company.auto_send_rent_amount,
          auto_send_rent_voice:data.data.data.company.auto_send_rent_voice,
          auto_check_violation:data.data.data.company.auto_check_violation,
        })
      }else{
        openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
      }
    }).catch(()=>{})
  }
  getHetong = ()=>{
    this.setState({ contractLoading:true,})
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getcontract',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=>{
      this.setState({contractLoading:false,})
      if(data.data.code==1){
        if(data.data.data.contract_records){
          this.setState({
            contractData :data.data.data.contract_records,
            contractDataLen :data.data.data.contract_records.length,
          })
        }
        if(data.data.data.company.bank_account){
          this.props.form.setFields({
            bank_account: {value: data.data.data.company.bank_account,},
          })
        }else{
          this.props.form.setFields({
            bank_account: {value: 0,},
          })
        }
        if(data.data.data.company.deposit_bank){
          this.props.form.setFields({
            deposit_bank: {value: data.data.data.company.deposit_bank,},
          })
        }else{
          this.props.form.setFields({
            deposit_bank: {value: 0,},
          })
        }
      }
    }).catch(()=>{})
  }
  SettingChoose = (value)=>{
    this.setState({
      active:value,
    })
    if(value=='4'){
      this.getdaynotesInter(10,0)
    }else{
      this.getSettingInter();
    }
  }
  //获取管理日志
  getdaynotesInter = (limit,offset)=>{
    this.setState({TableLoading:true,})
    let TBformData = new FormData();
    TBformData.append("key",'diuber2017' );
    TBformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    TBformData.append('limit',limit);
    TBformData.append('offset',offset);
    request('/api/web/admin_setting/getuseraction',{
      method:'POST',
      body:TBformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          TableRecord:data.data.data.rows,
          TableRecordLen:data.data.data.total,
          TableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //修改密码
  ChangeSafeSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if(values.old_passwd && values.new_passwd && values.sub_passwd){
          this.setState({ChangeSafeButtonLoading: true})
          let PCformData = new FormData();
          PCformData.append("key",'diuber2017' );
          PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          PCformData.append("old_passwd",values.old_passwd);
          PCformData.append("new_passwd",values.new_passwd);
          PCformData.append("sub_passwd",values.sub_passwd);
          request('/api/web/admin_setting/changepdw',{
            method:'POST',
            body:PCformData,
            credentials: 'include',
          }).then((data)=>{
            this.setState({ChangeSafeButtonLoading: false});
            if(data.data.code==1){
              message.success('成功更改密码！');
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', msg);
            }
          }).catch(()=>{})
        }else{
          openNotificationWithIcon('warning', '嘀友提醒', '请检查是否填写完毕');
        }
      }
    })
  }
  //设置是否开启自动发送提醒（集合）
  SetAutoSendbtSubmit = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let SubmitformData = new FormData();
        SubmitformData.append("key",'diuber2017' );
        SubmitformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        if(values.is_notice==true){SubmitformData.append("is_notice",1);}
        if(values.is_notice==false){SubmitformData.append("is_notice",0);}

        if(values.auto_send_rent_amount==true){SubmitformData.append("auto_send_rent_amount",1);}
        if(values.auto_send_rent_amount==false){SubmitformData.append("auto_send_rent_amount",0);}

        if(values.auto_send_rent_voice==true){SubmitformData.append("auto_send_rent_voice",1);}
        if(values.auto_send_rent_voice==false){SubmitformData.append("auto_send_rent_voice",0);}

        if(values.auto_check_violation==true){SubmitformData.append("auto_check_violation",1);}
        if(values.auto_check_violation==false){SubmitformData.append("auto_check_violation",0);}
        request('/api/web/admin_setting/setautosendbt',{
          method:'POST',
          body:SubmitformData,
          credentials: 'include',
        }).then((data)=>{
          if(data.data.code==1){
            message.success('成功更改提醒设置！');
          }else{
            openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
          }
        }).catch(()=>{})

      }
    });
  }
  //更改公司信息
  UpdateCompanySubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({UpdateCompanyLoading:true})
        let PCformData = new FormData();
        PCformData.append("key",'diuber2017' );
        PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        PCformData.append("id",this.state.companyId);
        PCformData.append("company_name",values.company_name);
        if(values.address){PCformData.append("address",values.address);}
        if(values.telephone){PCformData.append("telephone",values.telephone);}
        if(values.introduce){PCformData.append("introduce",values.introduce);}
        if(values.rent_rule){PCformData.append("rent_rule",values.rent_rule);}
        if(values.buy_rule){PCformData.append("buy_rule",values.buy_rule);}
        if(this.state.latlng){
          PCformData.append("address_coord",this.state.latlng);}
        PCformData.append("is_show",this.state.is_show);
        if(this.state.img_oss!='') {
          if(this.state.img_oss[0].name!="xsz.png"){
            PCformData.append('img_oss',this.state.img_oss[0].thumbUrl.split('base64,')[1]);
          }
        }
        if(this.state.business_license_oss!='') {
          if(this.state.business_license_oss[0].name!="xsz.png"){
            PCformData.append('business_license_oss',this.state.business_license_oss[0].thumbUrl.split('base64,')[1]);
          }
        }
        PCformData.append("district",this.state.district);
        PCformData.append("city",this.state.city);
        PCformData.append("province",this.state.province);
        PCformData.append("nation",this.state.nation);
        request('/api/web/admin_setting/editcompany',{
          method:'POST',
          body:PCformData,
          credentials: 'include',
        }).then((data)=>{
          this.setState({UpdateCompanyLoading:false})
          if(data.data.code==1){
            openNotificationWithIcon('success', '嘀友提醒', '成功修改公司信息 ！');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //更新公司合同模块
  contractFileSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({UpdateContractLoading: true})
        let PCformData = new FormData();
        PCformData.append("key",'diuber2017' );
        PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        if(values.bank_account){ PCformData.append("bank_account",values.bank_account);}
        if(values.deposit_bank){ PCformData.append("deposit_bank",values.deposit_bank);}
        if(this.state.contractFile[0]){PCformData.append("contract_word",this.state.contractFile[0].originFileObj);}
        request('/api/web/admin_setting/editcompanycontract',{
          method:'POST',
          body:PCformData,
          credentials: 'include',
        }).then((data)=>{
          this.setState({UpdateContractLoading: false})
          if(data.data.code==1){
            this.getHetong();
            openNotificationWithIcon('success', '嘀友提醒', '成功修改租车合同配置！');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //更改是否部署代码
  ToDeploy = ()=>{
    this.setState({DeployLoading:true,})
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/diuber/wx_third_plat/commitCode',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data==1){
        let PCformData = new FormData();
        PCformData.append("key",'diuber2017' );
        PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        request('/api/diuber/wx_third_plat/modifyDomain',{
          method:'POST',
          body:PCformData,
          credentials: 'include',
        }).then((res)=>{
          this.setState({DeployLoading:false,})
          if(res.data==1){
            openNotificationWithIcon('success', '嘀友提醒', '成功部署代码，可以扫一扫体验小程序！');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', '部署代码失败,请重新部署！');
          }
        })
      }else{
        this.setState({DeployLoading:false,})
        openNotificationWithIcon('warning', '嘀友提醒', '部署代码失败,请重新部署！');
      }
    }).catch(()=>{})
  }
  //小程序审核
  ToAudit = ()=>{
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/diuber/wx_third_plat/submitAudit',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data==1){
        openNotificationWithIcon('success', '嘀友提醒', '成功提交审核，请等待腾讯审核！');
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', '审核已提交，请等待腾讯审核！');
      }
    }).catch(()=>{})
  }
  //更改小程序是否上架
  changeShow = (value)=>{
    this.setState({
      is_show:value
    })
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
    if(this.state.lng && this.state.lat){
      this.setState({
        showMaptext:true, showmap:1,
        latlng:this.state.lng+','+this.state.lat
      })
      request('https://restapi.amap.com/v3/geocode/regeo?key=dc3c63d866e0144a66c7458b9d77fbf3&location='+this.state.lng+','+this.state.lat,{
        method:'GET',
      }).then((data)=>{
        if(data.data.status=='1'){
          this.setState({
            district:data.data.regeocode.addressComponent.district,
            city:data.data.regeocode.addressComponent.city,
            province:data.data.regeocode.addressComponent.province,
            nation:data.data.regeocode.addressComponent.country,
          })
          this.props.form.setFields({
            address:{value: data.data.regeocode.formatted_address,},
          })
        }
      }).catch(()=>{})
    }
  }
  handleMapCancel = (e) => {
    this.setState({
      showIsMap: false,
    });
  }
  //上传合同
  changeContract = (info)=>{
    var fileList = info.fileList;
    fileList = fileList.slice(-1);
    this.setState({
       contractFile:fileList
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
  BusinessImgChange = (info)=>{
    this.setState({
      business_license_oss:info.fileList,
    })
    if(info.file.status ==='uploading'){
      this.setState({
        UploadTravelLicenseText1:'333',
        business_license_oss:info.fileList,
      })
    }
    if(info.file.status ==='removed'){
      this.setState({
        UploadTravelLicenseText1:'111',
        business_license_oss:info.fileList,
      })
    }
    if(info.file.status ==='error') {
      this.setState({
        UploadTravelLicenseText1: '222',
        business_license_oss: info.fileList,
      })
    }
  }
  BusinessImgRemove = ()=> {
    this.setState({
      travel_license_oss:[]
    })
  }
  ComapnyImgChange = (info)=>{
    this.setState({
      img_oss:info.fileList,
      UploadTravelLicenseText:'111'
    })
    if(info.file.status ==='uploading'){
      this.setState({
        UploadTravelLicenseText:'333',
        img_oss:info.fileList,
      })
    }
    if(info.file.status ==='removed'){
      this.setState({
        UploadTravelLicenseText:'111',
        img_oss:info.fileList,
      })
    }
    if(info.file.status ==='error'){
      this.setState({
        UploadTravelLicenseText:'222',
        img_oss:info.fileList,
      })
    }
  }
  ComapnyImgRemove = ()=> {
    this.setState({
      img_oss:[]
    })
  }
  //启用
  openIt = (target)=>{
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    PCformData.append("id",target);
    PCformData.append("status",1);
    request('/api/web/admin_setting/setContractStatus',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code == 1) {
        message.success('成功启用！');
        this.getHetong();
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //禁用
  closeIt = (target)=>{
    let PCformData = new FormData();
    PCformData.append("key",'diuber2017' );
    PCformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    PCformData.append("id",target);
    PCformData.append("status",0);
    request('/api/web/admin_setting/setContractStatus',{
      method:'POST',
      body:PCformData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code == 1) {
        message.success('成功禁用！');
        this.getHetong();
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }


  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    this.getdaynotesInter(pageSize,(current-1)*pageSize);
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    this.getdaynotesInter(pageSize,(current-1)*pageSize);
  }
  //上传合同
  showContractModel = ()=>{
    this.setState({contractHidden:true})
  }
  handleContractOk = ()=>{
    this.setState({
      contractHidden:false
    })
  }
  handleContractCancel = ()=>{
    this.setState({
      contractHidden:false
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
    const formItemLayout1 = {
      labelCol: { span: 15 },
      wrapperCol: { span: 5 },
    };
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择照片</div>
      </div>
    );
    const content = (
      <div>
        <img style={{width:'150px',height:'150px'}} src={this.state.cssQcodeUrl}></img>
      </div>
    );
    const events = {
      created: (instance) => {
        this.setState({
          lng:this.state.lng,
          lat:this.state.lat,
        })
      },
      click: (e) => {
        if(e.type=='click'){
          this.setState({
            lng:e.lnglat.lng,
            lat:e.lnglat.lat,
          })
        }
      }
    }
    const props = {
      name: 'file',
      action: '',
      headers: {
        authorization: 'authorization-text',
      },
    };
    const TableColumns = [
      { title: '操作时间', dataIndex: 'create_time', key: 'create_time',},
      { title: '操作员工',dataIndex: 'action_name', key: 'action_name',},
      { title: '操作内容', dataIndex: 'action', key: 'action', },
      { title: '详情', dataIndex: 'comment', key: 'comment', },
    ]
    const contractcolumns = [
      { title: '合同名称', dataIndex: 'read_name', key: 'read_name',},
      { title: '合同类型',dataIndex: 'type', key: 'type',
        render: (text,record) => <div>租车合同</div>
      },
      { title: '合同状态', dataIndex: 'status', key: 'status',
        render: (text,record) => <div>
          {record.status==0 && <span>删除</span>}
          {record.status==1 &&  <Badge status="processing" text="审核中" />}
          {record.status==2 && <span>已审核</span>}
        </div>
      },
      { title: '启用状态', dataIndex: 'use_status', key: 'use_status',
        render: (text,record) => <div>
          {record.use_status==0 && <span style={{color:'#999'}}>禁用</span>}
          {record.use_status==1 && <span style={{color:'#52c41a'}}>启用</span>}
        </div>},
      { title: '创建时间', dataIndex: 'create_time', key: 'create_time', },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div>
            <Tag style={{height:'32px',lineHeight:'32px',padding:'0px 15px'}} onClick={this.closeIt.bind(this,record.id)} color="magenta">禁用</Tag>
            <Tag style={{height:'32px',lineHeight:'32px',padding:'0px 15px',marginLeft:'10px'}} onClick={this.openIt.bind(this,record.id)} color="green" >启用</Tag>
          </div>
        ,
      },
    ];
    const editorProps = {
      height: '100%',
      extendControls:[
        {type:'button'}
      ],
      contentFormat: 'html',
      initialContent: '请输入合同内容...',
      onChange: this.SubmitHtmlChange,
    }
    return (
       <PageHeaderLayout>
               <div style={{background: '#fff', padding: 24}}>
                 <Tabs type="card" activeKey={this.state.active} onChange={this.SettingChoose}>
                   <TabPane tab="公司信息配置" key={1}>
                     <Form className={styles.form} style={{marginTop: '3%'}}>
                       <div className={styles.formDiv}>
                         <FormItem
                           {...formItemLayout}
                           label="公司名称"
                         >
                           {getFieldDecorator('company_name', {
                             rules: [
                               {required: true, message: '请输入公司名称!'},
                             ],
                           })(
                             <Input placeholder="请输入公司名称"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="公司具体地址"
                         >
                           <div style={{display: 'flex', flexFlow: 'row'}}>
                             {getFieldDecorator('address', {
                               rules: [
                                 {required: false, message: '请输入公司具体地址!'},
                               ],
                             })(
                               <Input placeholder="请输入公司具体地址"/>
                             )}

                             <Button onClick={this.showMap} style={{marginLeft: '15px'}} type="primary"
                                     ghost>选择位置</Button>
                             <Modal
                               title="选择公司地址坐标"
                               visible={this.state.showIsMap}
                               onOk={this.handleMapOk}
                               onCancel={this.handleMapCancel}
                             >
                               <p>您目前选择的经纬度是：{this.state.lng},{this.state.lat}</p>
                               <div style={{width: '100%', height: '400px'}} >
                                 {
                                   this.state.showmap?
                                     <Map events={events}   center= {{longitude: this.state.lng, latitude: this.state.lat}} zoom={11}>
                                       <Marker style={{border:'1px solid red'}} position={{longitude: this.state.lng, latitude: this.state.lat }}></Marker>
                                     </Map>
                                     :
                                     <Map events={events}  zoom={6}></Map>
                                 }
                               </div>
                             </Modal>
                           </div>
                         </FormItem>
                         {
                           this.state.showMaptext &&
                           <FormItem
                             {...formItemLayout}
                             label="公司的经纬度"
                           >
                             <Input placeholder="请选择公司的经纬度" readonly="readonly" value={this.state.latlng}/>
                           </FormItem>
                         }
                         <FormItem
                           {...formItemLayout}
                           label="公司车辆预订联系电话"
                         >
                           {getFieldDecorator('telephone', {
                             rules: [
                               {required: false, message: '请输入公司车辆预订联系电话!'},
                             ],
                           })(
                             <Input placeholder="请输入公司车辆预订联系电话"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="公司介绍"
                         >
                           {getFieldDecorator('introduce', {
                             rules: [
                               {required: false, message: '请输入公司介绍!'},
                             ],
                           })(
                             <TextArea placeholder="请输入公司介绍" rows={6}/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="租车须知"
                         >
                           {getFieldDecorator('rent_rule', {
                             rules: [
                               {required: false, message: '请输入公司租车须知!'},
                             ],
                           })(
                             <TextArea placeholder="请输入公司租车须知" rows={6}/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="购买须知"
                         >
                           {getFieldDecorator('buy_rule', {
                             rules: [
                               {required: false, message: '请输入购买须知!'},
                             ],
                           })(
                             <TextArea placeholder="请输入购买须知" rows={6}/>
                           )}
                         </FormItem>
                       </div>
                       <div className={styles.formDiv}>
                         <FormItem
                           {...formItemLayout}
                           label="上架公司照片"
                         >
                           {getFieldDecorator('img_oss', {
                             rules: [
                               {required: false, message: '请选择上传上架公司照片!'},
                             ],
                           })(
                             <div>
                               <Upload
                                 className={styles.imgBorder}
                                 listType="picture-card"
                                 fileList={this.state.img_oss}
                                 onPreview={this.handlePreview}
                                 onChange={this.ComapnyImgChange}
                                 onRemove={this.ComapnyImgRemove}
                               >
                                 {this.state.img_oss.length ? null : uploadButton}
                               </Upload>
                               <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                                 <img alt="example" style={{width: '100%'}} src={this.state.previewImage}/>
                               </Modal>
                             </div>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="公司营业执照"
                         >
                           {getFieldDecorator('business_license_oss', {
                             rules: [
                               {required: false, message: '请选择上传公司营业执照!'},
                             ],
                           })(
                             <div>
                               <Upload
                                 className={styles.imgBorder}
                                 listType="picture-card"
                                 fileList={this.state.business_license_oss}
                                 onPreview={this.handlePreview}
                                 onChange={this.BusinessImgChange}
                                 onRemove={this.BusinessImgRemove}
                               >
                                 {this.state.business_license_oss.length ? null : uploadButton}
                               </Upload>
                             </div>
                           )}
                         </FormItem>
                         {this.state.comtype==3 &&
                           <div>
                             <FormItem
                               {...formItemLayout}
                               label="公司上架认证状态"
                             >
                               {this.state.is_approve == 0 &&
                               <Tag color="#f50">未认证</Tag>
                               }
                               {this.state.is_approve == 1 &&
                               <Tag color="#87d068">已认证</Tag>
                               }
                             </FormItem>
                             {
                               this.state.authorizer == 0 &&
                               <FormItem
                                 {...formItemLayout}
                                 label="自有企业微信小程序配置"
                               >
                                 <Button type="primary" style={{marginRight: '15px'}}
                                         onClick={() => window.location.href = "https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=wxbcd48d032ae7ae4a&pre_auth_code=preauthcode@@@MbnERbcqw84VxU4qrR40WsRkhpwBE6T8G5ea5TmEBOW1O6yQ50ibo9d_v7ET-nLF&redirect_uri=https://gc.diuber.com/diuber/wx_third_plat/getAuthCode"}>已有微信小程序，绑定自有微信小程序</Button>
                                 <Tag onClick={() => window.open("https://mp.weixin.qq.com/", "_target")}
                                      color="blue">暂无企业微信小程序，点击申请</Tag>
                               </FormItem>
                             }
                             {
                               this.state.authorizer == 1 &&
                               <FormItem
                                 {...formItemLayout}
                                 label="自有企业微信小程序配置"
                               >
                                 <div>
                                   {this.state.auditStatus != 0 &&
                                   <Button loading={this.state.DeployLoading} onClick={this.ToDeploy} type="primary"
                                           style={{marginRight: '15px'}}>部署小程序代码</Button>
                                   }
                                   {
                                     this.state.cssQcodeUrl != '' &&
                                     <Popover placement="right" title={<div style={{textAlign: 'center'}}>微信扫描二维码</div>}
                                              content={content} trigger="click">
                                       <Button type="primary" style={{marginRight: '15px'}}>查看小程序二维码</Button>
                                     </Popover>
                                   }
                                 </div>
                                 <Tag onClick={() => window.open("https://mp.weixin.qq.com/", "_target")}
                                      color="blue">暂无企业微信小程序，点击申请</Tag>
                               </FormItem>
                             }
                             {
                               this.state.authorizer == 1 &&
                               <div>
                                 {this.state.auditStatus != 0 &&
                                 <div>
                                   {
                                     this.state.audited == 0 &&
                                     <FormItem
                                       {...formItemLayout}
                                       label="自有企业微信小程序审核"
                                     >
                                       <Button onClick={this.ToAudit} type="primary"
                                               style={{marginRight: '15px'}}>审核小程序</Button>
                                     </FormItem>
                                   }
                                 </div>
                                 }
                               </div>
                             }
                             {
                               this.state.audited != 0 &&
                               <FormItem
                                 {...formItemLayout}
                                 label="小程序审核状态"
                               >
                                 {
                                   this.state.auditStatus == 0 &&
                                   <Tag color="#87d068">审核通过，去微信小程序后台下载小程序二维码吧</Tag>
                                 }
                                 {
                                   this.state.auditStatus == 1 &&
                                   <Tag color="#f50">审核失败!</Tag>
                                 }
                                 {
                                   this.state.auditStatus == 2 &&
                                   <Tag color="blue">审核中，请耐心等待腾讯审核</Tag>
                                 }
                               </FormItem>
                             }
                             <FormItem
                               {...formItemLayout}
                               label="是否上架嘀友租车小程序"
                             >
                               <Select value={this.state.is_show} onChange={this.changeShow} placeholder="请选择是否在嘀友租车小程序上架">
                                 <Option value={1}>上架</Option>
                                 <Option value={0}>不上架</Option>
                               </Select>
                             </FormItem>
                           </div>}
                         <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                           <Button loading={this.state.UpdateCompanyLoading} className={styles.formButton}
                                   onClick={this.UpdateCompanySubmit} type="primary">确认修改</Button>
                         </FormItem>
                       </div>
                     </Form>
                   </TabPane>
                   {
                     this.state.isbanben=='智享版' &&
                     <TabPane tab="功能设置" key={5}>
                       <Form style={{marginTop:20}}>
                         <FormItem
                           {...formItemLayout1}
                           className={styles.PCformItem}
                           label="是否开启自动发送催缴租金短信功能："
                         >
                           {getFieldDecorator('auto_send_rent_amount')(
                             <Switch checkedChildren="已启动" unCheckedChildren="已停止" defaultChecked={this.state.auto_send_rent_amount}/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout1}
                           className={styles.PCformItem}
                           label="是否开启自动发送催缴租金语音功能："
                         >
                           {getFieldDecorator('auto_send_rent_voice')(
                             <Switch checkedChildren="已启动" unCheckedChildren="已停止" defaultChecked={this.state.auto_send_rent_voice}/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout1}
                           className={styles.PCformItem}
                           label="是否开启自动批量查违章功能："
                         >
                           {getFieldDecorator('auto_check_violation')(
                             <Switch checkedChildren="已启动" unCheckedChildren="已停止" defaultChecked={this.state.auto_check_violation}/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout1}
                           className={styles.PCformItem}
                           label="是否开启自动把合同即将到期的车辆上架到小程序上："
                         >
                           <Switch checkedChildren="已启动" unCheckedChildren="已停止"  defaultChecked={true}/>
                         </FormItem>
                         <FormItem
                           {...formItemLayout1}
                           className={styles.PCformItem}
                           label="是否开启自动推送日报功能："
                         >
                           {getFieldDecorator('is_notice')(
                             <Switch checkedChildren="已启动" unCheckedChildren="已停止" defaultChecked={this.state.is_notice}/>
                           )}
                         </FormItem>
                         <FormItem className={styles.PCformButton}>
                           <Button  onClick={this.SetAutoSendbtSubmit}  type="primary" ghost>确认修改</Button>
                         </FormItem>
                       </Form>
                     </TabPane>
                   }
                   <TabPane tab="密码设置" key={2}>
                     <Form className={styles.SimpleForm} style={{marginTop: '3%'}}>
                       <div className={styles.formDiv}>
                         <FormItem
                           {...formItemLayout}
                           label="原密码"
                         >
                           {getFieldDecorator('old_passwd', {
                             rules: [
                               {required: false, message: '请输入原密码!'},
                             ],
                           })(
                             <Input placeholder="请输入原密码"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="新密码"
                         >
                           {getFieldDecorator('new_passwd', {
                             rules: [
                               {required: false, message: '请输入新密码!'},
                             ],
                           })(
                             <Input placeholder="请输入新密码"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="新密码确认"
                         >
                           {getFieldDecorator('sub_passwd', {
                             rules: [
                               {required: false, message: '请再一次输入新密码!'},
                             ],
                           })(
                             <Input placeholder="请再一次输入新密码"/>
                           )}
                         </FormItem>
                         <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                           <Button loading={this.state.ChangeSafeButtonLoading} className={styles.formButton}
                                   onClick={this.ChangeSafeSubmit} type="primary">确认修改</Button>
                         </FormItem>
                       </div>
                     </Form>
                   </TabPane>
                   <TabPane tab="租车合同配置" key={3}>
                     <Form className={styles.form} style={{marginTop: '3%'}}>
                       <div className={styles.formDiv}>
                         <FormItem
                           {...formItemLayout}
                           label="开户银行"
                         >
                           {getFieldDecorator('deposit_bank', {
                             rules: [
                               {required: false, message: '请输入开户银行!'},
                             ],
                           })(
                             <Input placeholder="请输入开户银行"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="银行账号"
                         >
                           {getFieldDecorator('bank_account', {
                             rules: [
                               {required: false, message: '请输入银行账号!'},
                             ],
                           })(
                             <Input placeholder="请输入银行账号"/>
                           )}
                         </FormItem>
                         <FormItem
                           {...formItemLayout}
                           label="上传租车合同"
                         >
                           {getFieldDecorator('contract_word', {
                             rules: [
                               {required: false, message: '请选择上传租车合同!'},
                             ],
                           })(
                             <div>
                               <Button onClick={this.showContractModel}><Icon type="upload"/> 上传租车合同（word）</Button>
                               <Modal
                                 width="90vw"
                                 title="编辑合同"
                                 visible={this.state.contractHidden}
                                 onOk={this.handleContractOk}
                                 onCancel={this.handleContractCancel}
                                 bodyStyle={{height:'70vh'}}
                               >
                                 <BraftEditor {...editorProps}/>
                               </Modal>
                             </div>
                           )}
                         </FormItem>
                         <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                           <Button loading={this.state.UpdateContractLoading} className={styles.formButton}
                                   onClick={this.contractFileSubmit} type="primary">确认修改</Button>
                         </FormItem>
                         <Table style={{marginTop: 48}} rowKey="id" bordered={true} scroll={{x: 600}}
                                columns={contractcolumns} loading={this.state.contractLoading}
                                dataSource={this.state.contractData}
                                footer={() => <p>总共 {this.state.contractDataLen} 条数据</p>}/>
                       </div>
                     </Form>
                   </TabPane>
                   <TabPane tab="管理日志" key={4}>
                     <Table scroll={{x: 600}} pagination={false}  loading={this.state.TableLoading} bordered={true} dataSource={this.state.TableRecord}
                            columns={TableColumns} footer={() => <p>总共 {this.state.TableRecordLen} 条数据</p>}/>
                     <Pagination style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.TableRecordLen} />
                   </TabPane>
                 </Tabs>
               </div>
      </PageHeaderLayout>
    );
  }
}
const Setting = Form.create()(Settings);

export default Setting;
