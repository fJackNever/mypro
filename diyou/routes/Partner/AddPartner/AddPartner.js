import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,Card,Button,message,notification,Tabs,Table,Tag,Badge,Modal} from 'antd';

import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class addPartner extends PureComponent {
  state = {
    ButtonLoading:false,
    AddNewRecord:1,
    partner_type:0,
    tableLoading:false,
    visible: false,
    confirmLoading: false,
  }
  componentDidMount() {
    if(window.location.href.split('PartnerRole=')[1]==='AddGarage'){
      this.setState({
        partnertype:'修理厂',
        partnerName:'修理厂名称',
        partnerAddress:'修理厂地址',
        partner_type:0,
      })
    }else{
      this.setState({
        partnertype:'合作租赁公司',
        partnerName:'合作租赁公司',
        partnerAddress:'合作租赁公司地址',
        partner_type:1,
      })
    }
    if(window.location.href.split('type=')[1]){
      if(window.location.href.split('type=')[1]==1){
        this.setState({activekey:'2',})
      }else if(window.location.href.split('type=')[1]==2){
        this.setState({activekey:'3',})
      }else if(window.location.href.split('type=')[1]==3){
        this.setState({activekey:'4',})
      }else if(window.location.href.split('type=')[1]==4){
        this.setState({activekey:'5',})
      }else if(window.location.href.split('type=')[1]==5){
        this.setState({activekey:'6',})
      }else if(window.location.href.split('type=')[1]==6){
        this.setState({activekey:'7',})
      }
    }else{
      this.setState({activekey:'1',})
    }
    if(window.location.href.split('PartnerID=')[1]){
      this.setState({
        AddNewRecord:2
      })
      this.getPartnerInfo(window.location.href.split('PartnerID=')[1].split('type=')[0])
    }
  }
  //查看合作伙伴详情
  getPartnerInfo = (target)=>{
    let AddFormData = new FormData();
    AddFormData.append('key', 'diuber2017');
    AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData.append('id', target);
    request('/api/web/partner/getAction', {
      method: 'POST',
      body: AddFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          id:data.data.data.id,
          partner_type:data.data.data.partner_type
        })
        if(data.data.data.partner_type==0){
          this.setState({
            partnertype:'修理厂',
            partnerName: '修理厂名称',
            partnerAddress:'修理厂地址',
          })
          this.getReocrdListInfo(data.data.data.id);
        }else{
          this.setState({
            partnertype:'合作租赁公司',
            partnerName: '合作租赁公司',
            partnerAddress:'合作租赁公司地址',
          })
          this.getComReocrdListInfo(data.data.data.id);
        }
        this.props.form.setFields({
          name: {value: data.data.data.name},
          special_plane: {value: data.data.data.special_plane},
          contact_telephone: {value: data.data.data.contact_telephone},
          address: {value: data.data.data.address},
          comment: {value: data.data.data.comment},
          contacts: {value: data.data.data.contacts},
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //新增合作伙伴
  AddPartnerSubmit = ()=> {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ButtonLoading: true})
        let AddFormData = new FormData();
        AddFormData.append('key', 'diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('name', values.name);
        AddFormData.append('address', values.address);
        AddFormData.append('contacts', values.contacts);
        AddFormData.append('contact_telephone', values.contact_telephone);
        AddFormData.append('special_plane', values.special_plane);
        if(values.comment){AddFormData.append('comment', values.comment);}
        AddFormData.append('partner_type', this.state.partner_type);
        request('/api/web/partner/addAction', {
          method: 'POST',
          body: AddFormData,
          credentials: 'include',
        }).then((data) => {
          this.setState({
            ButtonLoading: false
          })
          if(data.data.code==1){
            if(this.state.partner_type==0){
              message.success('成功新增修理厂！')
              this.props.history.push('/Setting/Partner?type=1');
            }else{
              message.success('成功新增租赁公司！')
              this.props.history.push('/Setting/Partner?type=2');
            }
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //修改合作伙伴
  updatePartnerSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
        this.setState({ButtonLoading: true})
        let AddFormData = new FormData();
        AddFormData.append('key', 'diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('name', values.name);
        AddFormData.append('address', values.address);
        AddFormData.append('contacts', values.contacts);
        AddFormData.append('contact_telephone', values.contact_telephone);
        AddFormData.append('special_plane', values.special_plane);
        if(values.comment){AddFormData.append('comment', values.comment);}
        AddFormData.append('id', this.state.id);
        request('/api/web/partner/editAction', {
          method: 'POST',
          body: AddFormData,
          credentials: 'include',
        }).then((data) => {
          this.setState({
            ButtonLoading: false
          })
          if(data.data.code==1){
            if(this.state.partner_type==0){
              message.success('成功修改修理厂！')
              this.props.history.push('/Setting/Partner?type=1');
            }else{
              message.success('成功修改租赁公司！')
              this.props.history.push('/Setting/Partner?type=2');
            }
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
    })
  }
  //获取修理厂记录的接口数据
  getReocrdListInfo = (target)=>{
    let AddFormData = new FormData();
    AddFormData.append('key', 'diuber2017');
    AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData.append('partner_id', target);
    AddFormData.append('limit', 10000);
    request('/api/web/vehicle/getMaintainRecord', {
      method: 'POST',
      body: AddFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          wxDataRecord:data.data.data.rows,
          wxDataRecordLen:data.data.data.rows.length,
        })
      }
    }).catch(()=>{})
    request('/api/web/vehicle/getKeepRecord', {
      method: 'POST',
      body: AddFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          byDataRecord:data.data.info.rows,
          byDataRecordLen:data.data.info.rows.length,
        })
      }
    }).catch(()=>{})
    request('/api/web/vehicle/getAccidentRecord', {
      method: 'POST',
      body: AddFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          cxDataRecord:data.data.data.rows,
          cxDataRecordLen:data.data.data.rows.length,
        })
      }
    }).catch(()=>{})
  }
  //获取合作公司记录的接口数据
  getComReocrdListInfo = (target)=>{
    let AddFormData = new FormData();
    AddFormData.append('key', 'diuber2017');
    AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData.append('partner_id', target);
    AddFormData.append('limit', 10000);
    request('/api/web/vehicle/getRentRecord', {
      method: 'POST',
      body: AddFormData,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          zcDataRecord:data.data.data.rows,
          zcDataRecordLen:data.data.data.rows.length,
        })
      }
    }).catch(()=>{})
    let AddFormData1 = new FormData();
    AddFormData1.append('key', 'diuber2017');
    AddFormData1.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData1.append('partner_id', target);
    AddFormData1.append('status', 1);
    AddFormData1.append('limit', 10000);
    request('/api/web/vehicle/getBorrowRecord', {
      method: 'POST',
      body: AddFormData1,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          jcDataRecord:data.data.data,
          jcDataRecordLen:data.data.data.length,
        })
      }
    }).catch(()=>{})
    let AddFormData2 = new FormData();
    AddFormData2.append('key', 'diuber2017');
    AddFormData2.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    AddFormData2.append('partner_id', target);
    AddFormData2.append('status', 0);
    AddFormData2.append('limit', 10000);
    request('/api/web/vehicle/getBorrowRecord', {
      method: 'POST',
      body: AddFormData2,
      credentials: 'include',
    }).then((data) => {
      if(data.data.code==1){
        this.setState({
          thDataRecord:data.data.data,
          thDataRecordLen:data.data.data.length,
        })
      }
    }).catch(()=>{})
  }
  //查看维修记录详情
  ShowWXRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes?entity_id='+target);
  }
  addMaintain= () =>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes');
  }
  //查看保养记录详情
  ShowBYRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes?entity_id='+target);
  }
  addKeep= () =>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes');
  }
  //查看出险记录详情
  ShowCXRecord = (target)=>{
    this.props.history.push('/Car/CarManager/ShowAccidentCarNotes?entity_id='+target);
  }
  addAccident = ()=>{
    this.props.history.push('/Car/CarManager/NewAccidentCarNotes')
  }
  //查看租车记录详情
  ShowRentRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewCarNotes?entity_id='+target);
  }
  NewCarNotes = () =>{
    this.props.history.push('/Car/CarManager/NewCarNotes');
  }
  //查看借车记录详情
  addBorrow = () =>{
    this.props.history.push('/Car/CarManager/NewBorrowCarNotes');
  }
  ShowBorrowRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewBorrowCarNotes?entity_id='+target);
  }
  //新增还车
  addBack = ()=>{
    this.props.history.push('/Car/CarManager/ShowCar?Car_id='+e)
  }
  handleOk = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          confirmLoading: true,
        })
        let AddFormData = new FormData();
        AddFormData.append('key', 'diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('search', values.license_plate_no);
        request('/api/web/vehicle/getVehicle', {
          method: 'POST',
          body: AddFormData,
          credentials: 'include',
        }).then((data) => {
          this.setState({
            confirmLoading: false,
          })
          if(data.data.code==1){
            if(data.data.data.rows[0]){
              this.props.history.push('/Car/CarManager/BackCar?Car_id='+data.data.data.rows[0].id)
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', '请检查该车辆是否已退还！');
            }
          }else{
            this.setState({
              visible: false,
            });
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  showModal= () => {
    this.setState({
      visible: true,
    });
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const WXColumns = [
      { title: '记录编号', dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name', },
      { title: '进厂时间', dataIndex: 'maintain_time', key: 'maintain_time', },
      { title: '金额', dataIndex: 'total_amount', key: 'total_amount',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name', },
      { title: '维修状态', dataIndex: 'maintain_status', key: 'maintain_status',
        render: (text,record) =>
          <span>
            {record.maintain_status==0 && <Badge status="processing" text="维修中" />}
            {record.maintain_status==1 && <span>已修好</span>}
          </span>
      },
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'xlc_operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowWXRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ]
    const BYColumns = [
      { title: '记录编号', dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name', },
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name', },
      { title: '金额', dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数', dataIndex: 'last_vkt', key: 'last_vkt', },
      { title: '进厂时间', dataIndex: 'this_keep_time', key: 'this_keep_time', },
      { title: '下次保养公里数', dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'xlc_operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowBYRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ]
    const CXColumns = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name', },
      { title: '出险时间', dataIndex: 'accident_time', key: 'accident_time', },
      { title: '责任方', dataIndex: 'responsible_party', key: 'responsible_party',},
      { title: '理赔状态', dataIndex: 'settlement_claims_status', key: 'settlement_claims_status',
        render: (text,record) =>
          <span>
            {record.settlement_claims_status==0 &&  <Badge status="processing" text="处理中" />}
            {record.settlement_claims_status==1 && <span>已完成</span>}
          </span>
      },
      { title: '己方金额', dataIndex: 'own_amount', key: 'own_amount', },
      { title: '第三方金额', dataIndex: 'thirdparty_amount', key: 'thirdparty_amount',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '出厂时间', dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
      { title: '详细描述', dataIndex: 'detail_record', key: 'detail_record',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'xlc_operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowCXRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ]
    const ZCColumns = [
      { title: '记录编号', dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name', },
      { title: '手机号', dataIndex: 'telephone', key: 'telephone', },
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time', },
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time', },
      { title: '租金', dataIndex: 'rent_month_amount', key: 'rent_month_amount',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit', },
      { title: '租车类型', dataIndex: 'type', key: 'type',
        render: (text,record) =>
          <div>
            {record.type==1 && <span style={{color:'#f50'}}  className={styles.TagBtn}> 月租 </span>}
            {record.type==2 && <span style={{color:'#87d068'}} className={styles.TagBtn}> 日租 </span>}
            {record.type==3 && <span style={{color:'#2db7f5'}}  className={styles.TagBtn}> 以租代购</span>}
          </div>
      },
      { title: '租车状态', dataIndex: 'rent_vehicle_status', key: 'rent_vehicle_status',
        render: (text,record) =>
          <span>
            {record.rent_vehicle_status==0 && <Badge status="processing" text="正常租车" />}
            {record.rent_vehicle_status==1 && <span>已退车</span>}
          </span>
      },
      {
        title: '操作',
        key: 'xlc_operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowRentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ]
    const JCColumns = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '合作伙伴名称', dataIndex: 'partner_name', key: 'partner_name', },
      { title: '合同开始日期', dataIndex: 'contract_start_time', key: 'contract_start_time', },
      { title: '合同结束日期', dataIndex: 'contract_end_time', key: 'contract_end_time', },
      { title: '租金', dataIndex: 'month_amount', key: 'month_amount',},
      { title: '押金', dataIndex: 'deposit', key: 'deposit', },
      { title: '下次交租金日期', dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '借车状态', dataIndex: 'borrow_vehicle_status', key: 'borrow_vehicle_status',
        render: (text,record) =>
          <span>
            {record.borrow_vehicle_status==0 && <Badge status="processing" text="正常借车" />}
            {record.borrow_vehicle_status==1 && <span>已退车</span>}
          </span>
      },
      {
        title: '操作',
        key: 'jc_operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowBorrowRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    return (
      <div>
        {this.state.AddNewRecord==1 &&
        <Card title={<div>新增{this.state.partnertype}</div>}>
          <Form className={styles.SimpleForm} >
            <div className={styles.formDiv}>
              <FormItem {...formItemLayout} label={this.state.partnerName}>
                {getFieldDecorator('name', {
                  rules: [{required: true, message: '请输入名称',}],
                })(
                  <Input placeholder="请输入名称" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={this.state.partnerAddress}>
                {getFieldDecorator('address', {
                  rules: [{required: true, message: '请输入地址',}],
                })(
                  <Input placeholder="请输入地址" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="联系人姓名">
                {getFieldDecorator('contacts', {
                  rules: [{required: true, message: '请输入联系人姓名',}],
                })(
                  <Input placeholder="请输入联系人姓名" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="联系人手机号">
                {getFieldDecorator('contact_telephone', {
                  rules: [{required: true, message: '请输入联系人手机号',}],
                })(
                  <Input placeholder="请输入联系人手机号" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="联系人电话">
                {getFieldDecorator('special_plane', {
                  rules: [{required: true, message: '请输入联系人电话',}],
                })(
                  <Input placeholder="请输入联系人电话" />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('comment', {
                  rules: [{required: false, message: '请输入备注',}],
                })(
                  <TextArea rows={4}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                <Button loading={this.state.ButtonLoading} className={styles.formButton} onClick={this.AddPartnerSubmit} type="primary">确认增加</Button>
              </FormItem>
            </div>
          </Form>
        </Card>}
        {this.state.AddNewRecord != 1 &&
        <Card title={<div>{this.state.partnertype}信息</div>}>
          <Tabs activeKey={this.state.activekey} onChange={(value)=>{this.setState({activekey:value})}}>
            <TabPane tab="基本信息" key="1">
              <Form className={styles.SimpleForm}>
                <div className={styles.formDiv}>
                  <FormItem {...formItemLayout} label={this.state.partnerName}>
                    {getFieldDecorator('name', {
                      rules: [{required: true, message: '请输入名称',}],
                    })(
                      <Input placeholder="请输入名称"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label={this.state.partnerAddress}>
                    {getFieldDecorator('address', {
                      rules: [{required: true, message: '请输入地址',}],
                    })(
                      <Input placeholder="请输入地址"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="联系人姓名">
                    {getFieldDecorator('contacts', {
                      rules: [{required: true, message: '请输入联系人姓名',}],
                    })(
                      <Input placeholder="请输入联系人姓名"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="联系人手机号">
                    {getFieldDecorator('contact_telephone', {
                      rules: [{required: true, message: '请输入联系人手机号',}],
                    })(
                      <Input placeholder="请输入联系人手机号"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="联系人电话">
                    {getFieldDecorator('special_plane', {
                      rules: [{required: true, message: '请输入联系人电话',}],
                    })(
                      <Input placeholder="请输入联系人电话"/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="备注">
                    {getFieldDecorator('comment', {
                      rules: [{required: false, message: '请输入备注',}],
                    })(
                      <TextArea rows={4}/>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} className={styles.formButtonDiv}>
                    <Button loading={this.state.ButtonLoading} className={styles.formButton}
                            onClick={this.updatePartnerSubmit} type="primary">确认修改</Button>
                  </FormItem>
                </div>
              </Form>
            </TabPane>
            {
              this.state.partner_type != 1 &&
              <TabPane tab="维修记录" key="2">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={() => this.addMaintain()} type="primary"
                          ghost>新增维修记录</Button>
                  <Table scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.wxDataRecord} columns={WXColumns}
                         footer={() => <p>总共 {this.state.wxDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
            {
              this.state.partner_type != 1 &&
              <TabPane tab="保养记录" key="3">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={() => this.addKeep()} type="primary" ghost>新增保养记录</Button>
                  <Table scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.byDataRecord} columns={BYColumns}
                         footer={() => <p>总共 {this.state.byDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
            {
              this.state.partner_type != 1 &&
              <TabPane tab="出险记录" key="4">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={() => this.addAccident()} type="primary"
                          ghost>新增出险记录</Button>
                  <Table scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.cxDataRecord} columns={CXColumns}
                         footer={() => <p>总共 {this.state.cxDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
            {
              this.state.partner_type == 1 &&
              <TabPane tab="租车记录" key="5">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={() => this.NewCarNotes()} type="primary"
                          ghost>新增租车记录</Button>
                  <Table scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.zcDataRecord} columns={ZCColumns}
                         footer={() => <p>总共 {this.state.zcDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
            {
              this.state.partner_type == 1 &&
              <TabPane tab="借车记录" key="6">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={() => this.addBorrow()} type="primary"
                          ghost>新增借车记录</Button>
                  <Table scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.jcDataRecord} columns={JCColumns}
                         footer={() => <p>总共 {this.state.jcDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
            {
              this.state.partner_type == 1 &&
              <TabPane tab="退出运营记录" key="7">
                {this.state.AddNewRecord != 1 &&
                <div style={{margin: 24}}>
                  <Button style={{marginBottom: 24}} onClick={this.showModal} type="primary" ghost>新增退出运营记录</Button>
                  <Modal title="新增退出运营记录"
                         visible={this.state.visible}
                         onOk={this.handleOk}
                         confirmLoading={this.state.confirmLoading}
                         onCancel={this.handleCancel}
                  >
                    <Form>
                      <FormItem {...formItemLayout} label="车牌号">
                        {getFieldDecorator('license_plate_no', {
                          rules: [{required: true, message: '请输入车牌号',}],
                        })(
                          <Input placeholder="请输入车牌号"/>
                        )}
                      </FormItem>
                    </Form>
                  </Modal>
                  <Table  scroll={{x: 600}} rowKey="id" loading={this.state.tableLoading} bordered={true}
                         dataSource={this.state.thDataRecord} columns={JCColumns}
                         footer={() => <p>总共 {this.state.thDataRecordLen} 条数据</p>}/>
                </div>
                }
              </TabPane>
            }
          </Tabs>
        </Card>
        }
      </div>
    );
  }
}
const AddPartner = Form.create()(addPartner);

export default AddPartner;
