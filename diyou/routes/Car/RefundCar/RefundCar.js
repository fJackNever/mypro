import React, { PureComponent } from 'react';
import { connect } from 'dva';
import StandardFormRow from 'components/StandardFormRow';
import { Link } from 'dva/router';
import {Form,Input,Tabs,Row,Col, Card,Button, Upload,Table,Tag,AutoComplete,Modal,Icon,notification,message,Badge  } from 'antd';
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
class refundCar extends PureComponent {
  state = {
    FJImgList:[],
    showuploadButton:false,
    tableLoading:false,
    backcarLoading:false,

    dataSource:[],
    showSearch:1,
    showCarInfo:1,
  }
  componentDidMount(){
    if(window.location.href.split('Car_id=')[1]) {
      this.setState({
        carId:window.location.href.split('Car_id=')[1].split('&rent_id=')[0]
      })
      this.getCarInfo(window.location.href.split('rent_id=')[1]);
    }else{
      this.setState({
        showSearch:2,
        showCarInfo:2,
      })
    }
  }
  //获取车辆具体信息
  getCarInfo = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('rent_id',target);
    request('/api/web/vehicle/gettuicheinfo',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        if(data.data.data.vehicle.travel_license_oss_path){
          const travel_license = [{
            uid: 10,
            name: 'tupian.png',
            status: 'done',
            url: data.data.data.vehicle.travel_license_oss_path,
          }]
          this.setState({
            travel_license_oss:travel_license,
            showuploadButton:true
          })
        }
        this.props.form.setFields({
          travel_range:{value:data.data.data.vehicle.travel_range}
        })
        this.setState({
          customerId:data.data.data.customerId,
          license_plate_no:data.data.data.vehicle.license_plate_no,
          accident:data.data.data.accident,
          violation:data.data.data.violation,
          maintain:data.data.data.maintain,
          deposit:data.data.data.deposit,
          refund:data.data.data.refund,
          rent:data.data.data.rent,
          vehicle_template:data.data.data.vehicle.template,
          body_color:data.data.data.vehicle.body_color,
          belong_company:data.data.data.vehicle.belong_company,
          frame_number:data.data.data.vehicle.frame_number,
          engine_number:data.data.data.vehicle.engine_number,
          create_time:data.data.data.vehicle.create_time,
          file_no:data.data.data.vehicle.file_no,
          imei:data.data.data.vehicle.imei,
          actual_owner:data.data.data.vehicle.actual_owner,
          actual_owner_tel:data.data.data.vehicle.actual_owner_tel,
          responsible_vehicle_admin:data.data.data.vehicle.responsible_vehicle_admin,
          responsible_drive_admin:data.data.data.vehicle.responsible_drive_admin,
          comment:data.data.data.vehicle.comment,
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //退车操作
  refundvehicleSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({backcarLoading:true})
        var ShowCarData = new FormData();
        ShowCarData.append('key','diuber2017');
        ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        ShowCarData.append('vehicle_id',this.state.carId);
        ShowCarData.append('customer_id',this.state.customerId);
        if(values.travel_range){ShowCarData.append('travel_range',values.travel_range);}
          request('/api/web/vehicle/tuiche',{
            method:'POST',
            body:ShowCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({backcarLoading:false})
            if(data.data.code==1){
              openNotificationWithIcon('success', '嘀友提醒', '成功退车');
              this.props.history.push("/Car/CarManager?CarType=4");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
      }
    })
  }
  //获取借车记录
  getBorrowRecordInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('limit',9999);
    request('/api/web/vehicle/getBorrowRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data,
          ShowCarReocrdLen:data.data.data.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取租车记录
  getRentRecord = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('limit',9999);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取交租金记录
  getrefundrecord = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('limit',9999);
    request('/api/web/finance/getrefundrecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      console.log(data)
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取退押金记录
  getContractDeposit = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('recode_type',3);
    ShowCarData.append('limit',9999);
    request('/api/web/contract_deposit/getContractDeposit',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取维修记录
  getMaintainRecord = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('limit',9999);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取出险记录
  getAccidentRecord = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('vehicle_id',target);
    ShowCarData.append('limit',9999);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          ShowCarReocrd:data.data.data.rows,
          ShowCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取违章记录
  getViolationRecord= ()=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("license_plate_no", this.state.license_plate_no);
    GFHFormData.append("limit", 9999);
    request('/api/web/vehicle/getViolationRecord',{
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
      }
    }).catch(()=>{})
  }
  changeTabs = (key)=>{
    this.setState({
      tableLoading:true
    })
    if(key==1){
      this.getBorrowRecordInter(this.state.carId)
    }else if(key==2){
      this.getRentRecord(this.state.carId)
    }else if(key==3){
      this.getrefundrecord(this.state.carId)
    }else if(key==4){
      this.getContractDeposit(this.state.carId)
    }else if(key==5){
      this.getMaintainRecord(this.state.carId)
    }else if(key==6){
      this.getAccidentRecord(this.state.carId)
    }else if(key==7){
      this.getViolationRecord(this.state.carId)
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

  //查询车辆
  changeSelect = (value)=>{
    this.setState({
      CheckValue:value,
    })
  }
  InputChange = (value)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('search',value);
    request('/api/web/vehicle/thinkRentRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        var dataSource  = data.data.data.map((item)=>{
          return <Option key={item.id}>{item.license_plate_no+' => '+item.customer_name}</Option>
        })
        this.setState({dataSource })
      }
    }).catch(()=>{})
  }
  SearchSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var ShowCarData = new FormData();
        ShowCarData.append('key','diuber2017');
        ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        ShowCarData.append('rent_id',values.license_plate_no);
        request('/api/web/vehicle/gettuicheinfo',{
          method:'POST',
          body:ShowCarData,
          credentials:'include',
        }).then((data)=>{
          if(data.data.code==1){
            this.setState({
              showCarInfo:1,
            })
            if(data.data.data.vehicle.travel_license_oss_path){
              const travel_license = [{
                uid: 10,
                name: 'tupian.png',
                status: 'done',
                url: data.data.data.vehicle.travel_license_oss_path,
              }]
              this.setState({
                travel_license_oss:travel_license,
                showuploadButton:true
              })
            }
            this.props.form.setFields({
              travel_range:{value:data.data.data.vehicle.travel_range}
            })
            this.setState({
              customerId:data.data.data.customerId,
              carId:data.data.data.vehicle.id,
              license_plate_no:data.data.data.vehicle.license_plate_no,
              accident:data.data.data.accident,
              violation:data.data.data.violation,
              maintain:data.data.data.maintain,
              deposit:data.data.data.deposit,
              refund:data.data.data.refund,
              rent:data.data.data.rent,
              vehicle_template:data.data.data.vehicle.template,
              body_color:data.data.data.vehicle.body_color,
              belong_company:data.data.data.vehicle.belong_company,
              frame_number:data.data.data.vehicle.frame_number,
              engine_number:data.data.data.vehicle.engine_number,
              create_time:data.data.data.vehicle.create_time,
              file_no:data.data.data.vehicle.file_no,
              imei:data.data.data.vehicle.imei,
              actual_owner:data.data.data.vehicle.actual_owner,
              actual_owner_tel:data.data.data.vehicle.actual_owner_tel,
              responsible_vehicle_admin:data.data.data.vehicle.responsible_vehicle_admin,
              responsible_drive_admin:data.data.data.vehicle.responsible_drive_admin,
              comment:data.data.data.vehicle.comment,
            })
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  render() {
    const { ShowCarReocrd} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const config = {
      rules: [{ type: 'object', required: false, message: '请选择具体时间!' }],
    };
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
    ];
    //交租金记录
    const PayRentColumn = [
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '交租金时间',dataIndex: 'refund_time', key: 'refund_time',},
      { title: '金额',dataIndex: 'amount', key: 'amount',},
      { title: '下次交租金日期',dataIndex: 'next_refund_time', key: 'next_refund_time',},
      { title: '交租金状态',dataIndex: 'refund_status', key: 'refund_status',
        render: (text,record) =>
          <span>
            {record.refund_status==0 && <span style={{color:'#f50'}}>未还清</span>}
            {record.refund_status==1 && <span>正常交租金</span>}
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
            {record.maintain_status==0 &&  <Badge status="processing" text="维修中" />}
            {record.maintain_status==1 &&  <Badge status="success" text="已修好"/>}
          </span>
      },
      { title: '出厂时间',dataIndex: 'maintain_finish_time', key: 'maintain_finish_time',},
      { title: '维修天数',dataIndex: 'use_days', key: 'use_days',},
      { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
      { title: '提车状态',dataIndex: 'get_vehicle_status', key: 'get_vehicle_status',
        render: (text,record) =>
          <span>
            {record.get_vehicle_status==0 && <Badge status="default" text="未提车"/>}
            {record.get_vehicle_status==1 && <Badge status="success" text="已提车"/>}
          </span>},
      { title: '维修内容',dataIndex: 'content', key: 'content',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
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
    return (
      <div>
        {
          this.state.showSearch!=1 &&
          <Card bordered={false} style={{marginBottom:24,}}>
            <StandardFormRow title="退车车辆" last >
              <Row>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <FormItem  {...formItemLayout} >
                    {getFieldDecorator('license_plate_no', {
                      rules: [
                        { required: false, message: '请输入车牌号!' },
                      ],
                    })(
                      <AutoComplete style={{width:'100%'}} onChange={this.InputChange} dataSource={this.state.dataSource} onSelect={this.changeSelect} placeholder="请输入车牌号"/>
                    )}
                  </FormItem>
                </Col>
                <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                  <Button loading={this.state.confirmLoading} onClick={this.SearchSubmit} type="primary">快速查询</Button>
                </Col>
              </Row>
            </StandardFormRow>
          </Card>
        }
        {
          this.state.showCarInfo == 1 &&
          <div>
            <Card title="退车明细"  extra={<Button loading={this.state.backcarLoading} onClick={this.refundvehicleSubmit} type="primary">确认退车</Button>}>
              <div className={styles.Flex3}>
                <div>
                  <FormItem {...formItemLayout} label="租车状态">
                    {this.state.rent==0? <Tag className={styles.TagBtn} color="volcano">未租车</Tag>:<Tag className={styles.TagBtn} color="green">正常租车</Tag>}
                  </FormItem>
                  <FormItem {...formItemLayout} label="里程数">
                      {getFieldDecorator('travel_range', {
                        rules: [
                          { required: false, message: '请输入车牌号!' },
                        ],
                      })(
                      <Input />
                      )}
                  </FormItem>
                </div>
                <div>
                  <FormItem {...formItemLayout} label="交租金状态">
                    {this.state.refund==0? <Tag className={styles.TagBtn} color="green">已还清</Tag>:<Tag color="volcano" className={styles.TagBtn} >未还清</Tag>}
                  </FormItem>
                  <FormItem {...formItemLayout} label="维修状态">
                    {this.state.maintain==0? <Tag className={styles.TagBtn} color="green">无</Tag>:<Tag color="volcano" className={styles.TagBtn} >有</Tag>}
                  </FormItem>
                </div>
                <div>
                  <FormItem {...formItemLayout} label="出险状态">
                    {this.state.accident==0? <Tag className={styles.TagBtn} color="green">无</Tag>:<Tag color="volcano" className={styles.TagBtn} >有</Tag>}
                  </FormItem>
                  <FormItem {...formItemLayout} label="违章状态">
                    {this.state.violation==0? <Tag className={styles.TagBtn} color="green">无</Tag>:<Tag color="volcano" className={styles.TagBtn} >有</Tag>}
                  </FormItem>
                </div>
              </div>
            </Card>
            <Card style={{marginTop:24}}>
              <Tabs type="card" defaultActiveKey={20} onChange={this.changeTabs}>
                <TabPane tab="车辆具体信息" key={20}>
                  <div style={{margin:'3% auto'}} className={styles.Flex3}>
                    <div className={styles.formDiv}>
                      <FormItem {...formItemLayout} label="车牌号">
                        <p>{this.state.license_plate_no}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="负责车管">
                        <p>{this.state.responsible_vehicle_admin}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="车架号">
                        <p>{this.state.frame_number}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="实际车主">
                        <p>{this.state.actual_owner}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="备注">
                        <p>{this.state.comment}</p>
                      </FormItem>
                    </div>
                    <div className={styles.formDiv}>
                      <FormItem {...formItemLayout} label="品牌车型">
                        <p>{this.state.vehicle_template}</p>
                      </FormItem>
                      <FormItem
                        {...formItemLayout}
                        label="负责驾管"
                      >
                        <p>{this.state.responsible_drive_admin}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="发动机号">
                        <p>{this.state.engine_number}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="实际车主电话">
                        <p>{this.state.actual_owner_tel}</p>
                      </FormItem>
                    </div>
                    <div className={styles.formDiv}>
                      <FormItem
                        {...formItemLayout}
                        label="车身颜色"
                      >
                        <p>{this.state.body_color}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="所属公司">
                        <p>{this.state.belong_company}</p>
                      </FormItem>
                      <FormItem {...formItemLayout} label="注册日期">
                        <p>{this.state.create_time}</p>
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
                          <div>
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
                            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                              <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                            </Modal>
                          </div>
                        )}
                      </FormItem>
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="租车记录" key="2">
                  <div style={{margin:'3% auto'}}>
                    <Table scroll={{x: 600}} bordered={true} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={RentColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
                  </div>
                </TabPane>
                <TabPane tab="交租金记录" key="3">
                  <div style={{margin: '3% auto'}}>
                    <Table scroll={{x: 600}} bordered={true} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={PayRentColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
                  </div>
                </TabPane>
                <TabPane tab="维修记录" key="5">
                  <div style={{margin: '3% auto'}}>
                    <Table scroll={{x: 600}} bordered={true} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={MaintenanceColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
                  </div>
                </TabPane>
                <TabPane tab="出险记录" key="6">
                  <div style={{margin: '3% auto'}}>
                    <Table scroll={{x: 600}} bordered={true} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={OutDangeColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
                  </div>
                </TabPane>
                <TabPane tab="违章记录" key="7">
                  <div style={{margin: '3% auto'}}>
                    <Table scroll={{x: 600}} bordered={true} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={IllegalColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </div>
        }
      </div>
    );
  }
}
const RefundCar = Form.create()(refundCar);

export default RefundCar;
