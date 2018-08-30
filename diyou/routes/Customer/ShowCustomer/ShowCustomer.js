import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form,Input,Radio,Tabs, Card,Select,Button, Upload, Icon,Table,Tag,Modal,notification,message,Badge,Tooltip } from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from './../../Sale/NewRentalCar/NewRentalCar.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;


const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class showCustomer extends PureComponent {
  state = {
    ShowCarKey:0,
    previewVisible: false,
    previewImage: '',
    CardReocrdLoading:false,
    chooseTarget:'20',
    AllhomeAva:'http://img1.3lian.com/2015/a1/95/d/105.jpg',

    visible:false,
    nameTitle:'姓名',
    addressTitle:'家庭地址',
    driving_license_img:[],
    id_card_img:[],

    upLoadingLoading:true,
    upLoadingSuccess:true,
    upLoading:true,

    panes:[],
    panesKey:[]
  }
  componentDidMount() {
    //限制除了车管、销售和管理员，其他只能看
    let permision = window.localStorage.getItem("permision");
    if(permision==1 || permision==3 || permision==7){this.setState({ButtonDisabled:false})}else{this.setState({ButtonDisabled:true})}

    if(window.location.href.split('customerId=')[1]){
      this.getCutsomerInter(window.location.href.split('customerId=')[1].split('&')[0]);
      this.getTodayInfo(window.location.href.split('customerId=')[1].split('&')[0]);
    }
    if(window.location.href.split('customerType=')[1]){
      this.changeTypeList(window.location.href.split('customerType=')[1])
    }
  }
  //更新显示的tag值
  changeTypeList = (target)=>{
    if(target=='20'){
      this.setState({
        chooseTarget:target
      })
    }
    if(target==1){
      this.getSignRecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==2){
      this.getRentRecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==3){
      this.getrefundrecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==4){
      this.getBackDepositInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==5){
      this.getQYSKInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==6){
      this.getMaintainRecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==7){
      this.getExtensionRecord(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==8){
      this.getKeepRecord(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==9){
      this.getAccidentRecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==10){
      this.getCustomerContactInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==11){
      this.getOtherRefundInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }else if(target==12){
      this.getCollectionRecordInter(window.location.href.split('customerId=')[1].split('&')[0]);
    }
  }
  //获取收款记录列表
  getOtherRefundInter = (id)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("collection_type", 1);
    GFHFormData.append("collection_id", id);
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
    GFHFormData.append("collection_type", 1);
    GFHFormData.append("collection_id", id);
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
  //获取签约记录列表
  getSignRecordInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getSignRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'1')){
          this.state.panesKey.push('1');
          //签约记录
          var SignRecordColumn = [
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
            {record.sign_status==0 && <span style={{color:'#1890ff'}}>未签约</span>}
                  {record.sign_status==1 && <span>已签约</span>}
                  {record.sign_status==2 && <span style={{color:'#FBB503'}}>作废</span>}
          </span>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
                    <Tag onClick={this.DeleteRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="orange" >删除</Tag>}
                  <Tag onClick={this.ShowSignRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={SignRecordColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '签约记录', content: content, key: '1' },)
          this.setState({chooseTarget:'1'})
        }else{
          this.setState({chooseTarget:'1'})
        }
      }
    }).catch(()=>{})
  }
  ShowSignRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewSignCarNotes?entity_id='+target);
  }
  //获取租车记录列表
  addRent = (target) =>{
    this.props.history.push('/Car/CarManager/NewCarNotes?IsRenewal='+target);
  }
  getRentRecordInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getRentRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'2')){
          this.state.panesKey.push('2')
          //租车记录
          const RentColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '品牌车型',dataIndex: 'vehicle_template', key: 'vehicle_template',},
            { title: '所属公司',dataIndex: 'belong_company', key: 'belong_company',},
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
                  <Tag onClick={this.ShowRentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addRent(2)} type="primary" ghost>新增租车记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={RentColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '租车记录', content: content, key: '2' },)
          this.setState({chooseTarget:'2'})
        }else{
          this.setState({chooseTarget:'2'})
        }
      }
    }).catch(()=>{})
  }
  ShowRentRecord = (target)=>{
    this.props.history.push('/Car/CarManager/NewCarNotes?entity_id='+target);
  }
  //获取交租金记录列表
  getrefundrecordInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/finance/getrefundrecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'3')){
          this.state.panesKey.push('3')
          //交租金记录
          const PayRentColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowrefundRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={PayRentColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '交租金记录', content: content, key: '3' },)
          this.setState({chooseTarget:'3'})
        }else{
          this.setState({chooseTarget:'3'})
        }
      }
    }).catch(()=>{})
  }
  ShowrefundRecord = (target)=>{
    this.props.history.push('/Money/MoneyManager/ShowRent?entity_id='+target);
  }
  //获取退押金记录列表
  getBackDepositInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/finance/getDepositRefundRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'4')){
          this.state.panesKey.push('4')
          //退押金记录
          const BackDepositColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
                </span>},
            { title: '退押金状态',dataIndex: 'deposit_refund_status', key: 'deposit_refund_status',
              render: (text,record) =>
                <span>
                  {record.deposit_refund_status==0 && <span style={{color:'#f50'}}>未支付</span>}
                  {record.deposit_refund_status==1 && <span>已支付</span>}
                </span> },
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowBackDepositRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={BackDepositColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '退押金记录', content: content, key: '4' },)
          this.setState({chooseTarget:'4'})
        }else{
          this.setState({chooseTarget:'4'})
        }
      }
    }).catch(()=>{})
  }
  ShowBackDepositRecord = (target)=>{
    this.props.history.push('/Money/MoneyManager/ShowDeposit?entity_id='+target);
  }
  //获取签约收款记录列表
  getQYSKInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    ShowCarData.append("recode_type", 1);
    request('/api/web/finance/getContractDeposit',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'5')){
          this.state.panesKey.push('5')
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
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowQYSK.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={ContractPaymentColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '签约收款记录', content: content, key: '5' },)
          this.setState({chooseTarget:'5'})
        }else{
          this.setState({chooseTarget:'5'})
        }
      }
    }).catch(()=>{})
  }
  ShowQYSK = (target)=>{
    this.props.history.push('/Money/MoneyManager/ShowContract?entity_id='+target);
  }
  //获取维修记录列表
  getMaintainRecordInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'6')){
          this.state.panesKey.push('6')
          //维修记录
          const MaintenanceColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowMaintainRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addMaintain()} type="primary" ghost>新增维修记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={MaintenanceColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '维修记录', content: content, key: '6' },)
          this.setState({chooseTarget:'6'})
        }else{
          this.setState({chooseTarget:'6'})
        }
      }
    }).catch(()=>{})
  }
  addMaintain= () =>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes');
  }
  ShowMaintainRecord= (target) =>{
    this.props.history.push('/Car/CarManager/NewMaintainCarNotes?entity_id='+target);
  }
  //获取延期记录列表
  getExtensionRecord = (target)=>{
    let ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getExtensionRecord',{
      method:'POST',
      body:ShowCarData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'7')){
          this.state.panesKey.push('7')
          //延期记录
          const DelayColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
            { title: '操作时间',dataIndex: 'create_time', key: 'create_time',},
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addExtension()} type="primary" ghost>新增延期记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={DelayColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '延期记录', content: content, key: '7' },)
          this.setState({chooseTarget:'7'})
        }else{
          this.setState({chooseTarget:'7'})
        }
      }
    }).catch(()=>{})
  }
  addExtension = () =>{
    this.props.history.push('/Car/CarManager/NewExtensionCarNotes');
  }
  //获取保养记录列表
  addKeep= () =>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes');
  }
  ShowKeepRecord= (target) =>{
    this.props.history.push('/Car/CarManager/NewKeepCarNotes?entity_id='+target);
  }
  getKeepRecord = (target)=>{
    let ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getKeepRecord',{
      method:'POST',
      body:ShowCarData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.info.rows,
          CustomerRecordLen:data.data.info.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'8')){
          this.state.panesKey.push('8')
          //保养记录
          const KeepColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
            { title: '金额',dataIndex: 'amount', key: 'amount',},
            { title: '进厂公里数',dataIndex: 'last_vkt', key: 'last_vkt',},
            { title: '进厂时间',dataIndex: 'this_keep_time', key: 'this_keep_time',},
            { title: '下次保养公里数',dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowKeepRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>
              ,
            },
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addKeep()} type="primary" ghost>新增保养记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={KeepColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '保养记录', content: content, key: '8' },)
          this.setState({chooseTarget:'8'})
        }else{
          this.setState({chooseTarget:'8'})
        }
      }
    }).catch(()=>{})
  }
  //获取出险记录列表
  getAccidentRecordInter = (target)=>{
    let ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:ShowCarData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'9')){
          this.state.panesKey.push('9')
          //出险记录
          const OutDangeColumn = [
            { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
            { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
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
            { title: '备注',dataIndex: 'comment', key: 'comment',},
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowAccidentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>},
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addAccident()} type="primary" ghost>新增出险记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={OutDangeColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '出险记录', content: content, key: '9' },)
          this.setState({chooseTarget:'9'})
        }else{
          this.setState({chooseTarget:'9'})
        }
      }
    }).catch(()=>{})
  }
  addAccident = ()=>{
    this.props.history.push('/Car/CarManager/NewAccidentCarNotes')
  }
  ShowAccidentRecord = (target) =>{
    this.props.history.push('/Car/CarManager/ShowAccidentCarNotes?entity_id='+target+"&Car_id="+window.location.href.split('Car_id=')[1]);
  }
  //获取客户交流列表
  getCustomerContactInter = (target)=>{
    let ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    ShowCarData.append("limit", 10000);
    request('/api/web/customer/getCustomerContactLists',{
      method:'POST',
      body:ShowCarData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          CustomerRecord:data.data.data.rows,
          CustomerRecordLen:data.data.data.rows.length,
        })
        if(!this.isInArray(this.state.panesKey,'10')){
          this.state.panesKey.push('10')
          //客户交流记录
          const khjlColumn = [
            { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
            { title: '交流时间',dataIndex: 'contact_time', key: 'contact_time',},
            { title: '交流照片数',dataIndex: 'pic', key: 'pic',},
            { title: '是否有交流内容',dataIndex: 'is_comment', key: 'is_comment',
              render: (text,record) =>
                <div>
                  {record.is_comment==0 &&
                  <span>无</span>
                  }
                  {record.is_comment==1 &&
                  <span>有</span>
                  }
                </div>
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render: (text,record) =>
                <div className={styles.TagBtnDiv}>
                  <Tag onClick={this.ShowKHJL.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
                </div>},
          ];
          var content = (
            <div style={{margin:'3% auto'}}>
              <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addKHJL()} type="primary" ghost>新增客户交流记录</Button>
              <Table scroll={{x: 600}} style={{marginTop:'24px'}} columns={khjlColumn} dataSource={this.state.CustomerRecord} footer={() => <p>总共 {this.state.CustomerRecordLen} 条数据</p>}/>
            </div>
          )
          this.state.panes.push({ title: '客户交流', content: content, key: '10' },)
          this.setState({chooseTarget:'10'})
        }else{
          this.setState({chooseTarget:'10'})
        }
      }
    }).catch(()=>{})
  }
  addKHJL = ()=>{
    this.props.history.push('/Customer/AddCustomerRecord')
  }
  ShowKHJL = (target)=>{
    this.props.history.push('/Customer/AddCustomerRecord?CustomerRecordId='+target)
  }
  //获取客户最新信息
  getTodayInfo = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('customer_id',target);
    request('/api/web/customer/getTodayInfo',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        if(data.data.data.maintain.status==0){this.setState({maintainstatus:'修理中'})}else{this.setState({maintainstatus:'已修好'})}
        if(data.data.data.accident.settlement_claims_status==0){this.setState({accidentstatus:'处理中'})}else{this.setState({accidentstatus:'已完成'})}
        if(data.data.data.otherRefund!=''){this.setState({otherRefundStatus:1,})}else{this.setState({otherRefundStatus:0,})}
        if(data.data.data.collectionRecord!=''){this.setState({collectionRecordStatus:1,})}else{this.setState({collectionRecordStatus:0,})}
        if(data.data.data.sign==''){this.setState({signStatus:0})}else{this.setState({signStatus:1})}
        if(data.data.data.rent==''){this.setState({rentStatus:0})}else{this.setState({rentStatus:1})}
        if(data.data.data.refund==''){this.setState({refundStatus:0})}else{this.setState({refundStatus:1})}
        if(data.data.data.depositRefund==''){this.setState({depositRefundStatus:0})}else{this.setState({depositRefundStatus:1})}
        if(data.data.data.contractDeposit==''){this.setState({contractDepositStatus:0})}else{this.setState({contractDepositStatus:1})}
        if(data.data.data.maintain==''){this.setState({maintainStatus:0})}else{this.setState({maintainStatus:1})}
        if(data.data.data.extension==''){this.setState({extensionStatus:0})}else{this.setState({extensionStatus:1})}
        if(data.data.data.keep==''){this.setState({keepStatus:0})}else{this.setState({keepStatus:1})}
        if(data.data.data.accident==''){this.setState({accidentStatus:0})}else{this.setState({accidentStatus:1})}
        if(data.data.data.customerContact==''){this.setState({customerContactStatus:0})}else{this.setState({customerContactStatus:1})}
        this.setState({
          otherRefundCustomer:data.data.data.otherRefund.amount,
          otherRefundTime:data.data.data.otherRefund.time,
          collectionRecordCustomer:data.data.data.collectionRecord.amount,
          collectionRecordTime:data.data.data.collectionRecord.time,
          SignContractStartTime:data.data.data.sign.contract_start_time,
          SignContractEndTime:data.data.data.sign.contract_end_time,
          RentContractStartTime:data.data.data.rent.contract_start_time,
          RentContractEndTime:data.data.data.rent.contract_end_time,
          refundTime:data.data.data.refund.time,
          refundAmount:data.data.data.refund.amount,
          depositRefundtime:data.data.data.depositRefund.time,
          depositRefundamount:data.data.data.depositRefund.amount,
          contractDeposittime:data.data.data.contractDeposit.time,
          contractDepositamount:data.data.data.contractDeposit.amount,
          maintaintime:data.data.data.maintain.time,
          extensiontime:data.data.data.extension.time,
          extensiondays:data.data.data.extension.days,
          keeptime:data.data.data.keep.time,
          keepgps_distance:data.data.data.keep.gps_distance,
          accidenttime:data.data.data.accident.time,
          customerContacttime:data.data.data.customerContact.time,
          customerContactcomment:data.data.data.customerContact.comment,
        })
      }
    }).catch(()=>{})
  }
  //获取客户详细信息
  getCutsomerInter = (target)=>{
    var ShowCarData = new FormData();
    ShowCarData.append('key','diuber2017');
    ShowCarData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    ShowCarData.append('id',target);
    request('/api/web/customer/getCutsomerInfo',{
      method:'POST',
      body:ShowCarData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          id:data.data.data.id,
          type:data.data.data.type
        })
        if(data.data.data.type==1){
          if(data.data.data.id_card){
            var id_card_img =  [{
              uid: 1,
              name: 'xsz.png',
              status: 'done',
              url: data.data.data.id_card,
            }];
            this.setState({id_card_img})
          }
          if(data.data.data.driving_license){
            var driving_license_img =  [{
              uid: 2,
              name: 'xsz.png',
              status: 'done',
              url: data.data.data.driving_license,
            }];
            this.setState({driving_license_img})
          }
          this.props.form.setFields({
            sex: {value: data.data.data.sex,},
            telephone: {value: data.data.data.telephone,},
            id_number: {value: data.data.data.id_number,},
            home_address: {value: data.data.data.home_address,},
            emergency_contact: {value: data.data.data.emergency_contact,},
            emergency_contact_telephone: {value: data.data.data.emergency_contact_telephone,},
          })
        }else{
          if(data.data.data.id_card){
            var id_card_img =  [{
              uid: 1,
              name: 'xsz.png',
              status: 'done',
              url: data.data.data.id_card,
            }];
            this.setState({id_card_img})
          }
          if(data.data.data.business_license){
            var driving_license_img =  [{
              uid: 2,
              name: 'xsz.png',
              status: 'done',
              url: data.data.data.business_license,
            }];
            this.setState({driving_license_img})
          }
          this.props.form.setFields({
            sex: {value: data.data.data.sex,},
            telephone: {value: data.data.data.telephone,},
            id_number: {value: data.data.data.id_number,},
            home_address: {value: data.data.data.home_address,},
            emergency_contact: {value: data.data.data.emergency_contact,},
          })
        }
        this.props.form.setFields({
          comment:{value:data.data.data.comment},
          name:{value:data.data.data.name},
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //选择客户类型（个人或者公司）
  changeType = (value)=>{
    this.setState({
      type:value
    })
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
    })
    if(target==1){
      this.getSignRecordInter(this.state.id);
    }else if(target==2){
      this.getRentRecordInter(this.state.id);
    }else if(target==3){
      this.getrefundrecordInter(this.state.id);
    }else if(target==4){
      this.getBackDepositInter(this.state.id);
    }else if(target==5){
      this.getQYSKInter(this.state.id);
    }else if(target==6){
      this.getMaintainRecordInter(this.state.id);
    }else if(target==7){
      this.getExtensionRecord(this.state.id);
    }else if(target==8){
      this.getKeepRecord(this.state.id);
    }else if(target==9){
      this.getAccidentRecordInter(this.state.id);
    }else if(target==10){
      this.getCustomerContactInter(this.state.id);
    }else if(target==11){
      this.getOtherRefundInter(this.state.id);
    }else if(target==12){
      this.getCollectionRecordInter(this.state.id);
    }
  }
  //上传图片
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
  }
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

  //修改客户信息
  UpdateCustomerSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          UpdateButtonLoading:true
        })
        if(this.state.type==1){
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('id',this.state.id);
          AddCarData.append('name',values.name);
          if(values.telephone){AddCarData.append('telephone',values.telephone)}else{AddCarData.append('telephone','')};
          if(values.id_number){AddCarData.append('id_number',values.id_number)}else{AddCarData.append('id_number','')};
          if(values.emergency_contact_telephone){AddCarData.append('emergency_contact_telephone',values.emergency_contact_telephone)}else{AddCarData.append('emergency_contact_telephone','')};;
          if(values.home_address){AddCarData.append('home_address',values.home_address)}else{AddCarData.append('home_address','')};;
          if(values.emergency_contact){AddCarData.append('emergency_contact',values.emergency_contact)}else{AddCarData.append('emergency_contact','')};;
          if(values.comment){AddCarData.append('comment',values.comment)}else{AddCarData.append('comment','')};;
          if(values.sex){AddCarData.append('sex',values.sex)}else{AddCarData.append('sex','')};;
          if(this.state.id_card_img!='') {
            if(this.state.id_card_img[0].name!="xsz.png"){
              AddCarData.append('id_card_img',this.state.id_card_img[0].thumbUrl.split('base64,')[1]);
            }
          }else{
            AddCarData.append('id_card_img','');
          }
          if(this.state.driving_license_img!='') {
            if(this.state.driving_license_img[0].name!="xsz.png"){
              AddCarData.append('driving_license_img',this.state.driving_license_img[0].thumbUrl.split('base64,')[1]);
            }
          }else{
            AddCarData.append('driving_license_img','');
          }
          request('/api/web/customer/editCustomer',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改个人客户成功！')
              this.getCutsomerInter(this.state.id)
              //this.props.history.push("/Customer");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }else{
          let AddCarData = new FormData();
          AddCarData.append('key','diuber2017');
          AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
          AddCarData.append('id',this.state.id);
          AddCarData.append('name',values.name);
          if(values.telephone){AddCarData.append('telephone',values.telephone);}else{AddCarData.append('telephone','');}
          if(values.id_number){AddCarData.append('id_number',values.id_number);}else{AddCarData.append('id_number','');}
          if(values.emergency_contact_telephone){AddCarData.append('emergency_contact_telephone',values.emergency_contact_telephone);}else{AddCarData.append('emergency_contact_telephone','');}
          if(values.home_address){AddCarData.append('home_address',values.home_address);}else{AddCarData.append('home_address','');}
          if(values.emergency_contact){AddCarData.append('emergency_contact',values.emergency_contact);}else{AddCarData.append('emergency_contact','');}
          if(values.comment){AddCarData.append('comment',values.comment);}else{AddCarData.append('comment','');}
          if(values.sex){AddCarData.append('sex',values.sex);}else{AddCarData.append('sex','');}
          if(this.state.id_card_img!='') {
            if(this.state.id_card_img[0].name!="xsz.png") {
              AddCarData.append('id_card_img', this.state.id_card_img[0].thumbUrl.split('base64,')[1]);
            }
          }else{AddCarData.append('id_card_img','');}
          if(this.state.driving_license_img!='') {
            if(this.state.driving_license_img[0].name!="xsz.png") {
              AddCarData.append('business_license_img', this.state.driving_license_img[0].thumbUrl.split('base64,')[1]);
            }
          }else{AddCarData.append('business_license_img','');}
          request('/api/web/customer/editCustomer',{
            method:'POST',
            body:AddCarData,
            credentials:'include',
          }).then((data)=>{
            this.setState({
              UpdateButtonLoading:false
            })
            if(data.data.code==1){
              message.success('修改公司客户成功！')
              this.getCutsomerInter(this.state.id)
              //this.props.history.push("/Customer");
            }else{
              openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
            }
          }).catch(()=>{})
        }
      }
    })
  }
  //删除客户
  DeleteCustomer =()=>{
    confirm({
      title: '嘀友提醒',
      content: '是否删除该客户和所有相关记录？删除后将不能恢复！请确认是否删除？',
      onOk() {
        let GFHFormData = new FormData();
        GFHFormData.append('key','diuber2017');
        GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        GFHFormData.append('id',window.location.href.split('customerId=')[1].split('&')[0]);
        request('/api/web/customer/delCustomer',{
          method:'POST',
          body:GFHFormData,
          credentials: 'include',
        }).then((data)=> {
          if(data.data.code==1){
            message.success('成功删除该客户！');
            window.location.href="#/Customer";
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      },
      onCancel() {
      },
    });
  }
  //删除记录
  DeleteRecord = ()=>{

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
  render() {
    const {otherRefundStatus,collectionRecordStatus,otherRefundCustomer,otherRefundTime,collectionRecordCustomer,collectionRecordTime,signStatus,rentStatus,refundStatus,depositRefundStatus,contractDepositStatus,maintainStatus,extensionStatus,keepStatus,accidentStatus,customerContactStatus,customerContacttime,customerContactcomment,accidenttime,accidentstatus,keeptime,keepgps_distance,extensiontime,extensiondays,maintaintime,maintainstatus,SignContractStartTime,SignContractEndTime,RentContractStartTime,RentContractEndTime,refundTime,refundAmount,depositRefundtime,depositRefundamount,contractDeposittime,contractDepositamount} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const config = {
      rules: [{ type: 'object', required: true, message: '请选择具体时间!' }],
    };
    //借车记录
    const BorrowRecordColumn = [
      { title: '车牌号',dataIndex: 'age', key: 'age',},
      { title: '合作伙伴名称',dataIndex: 'age', key: 'age',},
      { title: '合同开始日期',dataIndex: 'age', key: 'age',},
      { title: '合同结束日期',dataIndex: 'age', key: 'age',},
      { title: '租金',dataIndex: 'age', key: 'age',},
      { title: '押金',dataIndex: 'age', key: 'age',},
      { title: '下次交租金日期',dataIndex: 'age', key: 'age',},
      { title: '借车状态',dataIndex: 'age', key: 'age',},
      { title: '操作',dataIndex: 'age', key: 'age',},
    ];
    //签约记录
    const SignRecordColumn = [
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
            {record.sign_status==0 && <span style={{color:'#1890ff'}}>未签约</span>}
            {record.sign_status==1 && <span>已签约</span>}
            {record.sign_status==2 && <span style={{color:'#FBB503'}}>作废</span>}
          </span>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {this.state.ButtonDisabled?<Tag className={styles.TagBtn} >删除</Tag>:
              <Tag onClick={this.DeleteRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="orange" >删除</Tag>}
            <Tag onClick={this.ShowSignRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //租车记录
    const RentColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
            <Tag onClick={this.ShowRentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //交租金记录
    const PayRentColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowrefundRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //退押金记录
    const BackDepositColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '退款时间',dataIndex: 'deposit_refund_time', key: 'deposit_refund_time',},
      { title: '金额',dataIndex: 'deposit_refund_amount', key: 'deposit_refund_amount',},
      { title: '渠道',dataIndex: 'deposit_refund_type_all', key: 'deposit_refund_type_all',},
      { title: '退押金状态',dataIndex: 'deposit_refund_status', key: 'deposit_refund_status',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowBackDepositRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
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
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowQYSK.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //维修记录
    const MaintenanceColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
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
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowMaintainRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //延期记录
    const DelayColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
      { title: '操作时间',dataIndex: 'create_time', key: 'create_time',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '延期天数',dataIndex: 'extension_days', key: 'extension_days',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
    ];
    //保养记录
    const KeepColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '修理厂',dataIndex: 'partner_name', key: 'partner_name',},
      { title: '金额',dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数',dataIndex: 'last_vkt', key: 'last_vkt',},
      { title: '进厂时间',dataIndex: 'this_keep_time', key: 'this_keep_time',},
      { title: '下次保养公里数',dataIndex: 'next_keep_vkt', key: 'next_keep_vkt',},
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowKeepRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
        ,
      },
    ];
    //出险记录
    const OutDangeColumn = [
      { title: '记录编号',dataIndex: 'entity_id', key: 'entity_id',},
      { title: '车牌号',dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
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
      { title: '备注',dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowAccidentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>},
    ];
    //客户交流记录
    const khjlColumn = [
      { title: '客户姓名',dataIndex: 'customer_name', key: 'customer_name',},
      { title: '交流时间',dataIndex: 'contact_time', key: 'contact_time',},
      { title: '交流照片数',dataIndex: 'pic', key: 'pic',},
      { title: '是否有交流内容',dataIndex: 'is_comment', key: 'is_comment',
        render: (text,record) =>
          <div>
            {record.is_comment==0 &&
            <span>无</span>
            }
            {record.is_comment==1 &&
            <span>有</span>
            }
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowKHJL.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>},
    ];
    const notice = [
      {id:'1',title:'最新签约',href:'',description01:'合同开始日期：'+SignContractStartTime,description02:'合同结束日期：'+SignContractEndTime,status:signStatus	},
      {id:'2',title:'最新租车',href:'/#/Car/CarManager/NewCarNotes?IsRenewal=2',description01:'合同开始日期：'+RentContractStartTime,description02:'合同结束日期：'+RentContractEndTime,status:rentStatus	},
      {id:'3',title:'最新交租金',href:'',description01:'交租金时间：'+refundTime,description02:'金额：'+refundAmount,status:refundStatus	},
      {id:'4',title:'最新退押金',href:'',description01:'退押金时间：'+depositRefundtime,description02:'金额：'+depositRefundamount,status:depositRefundStatus	},
      {id:'11',title:'最新收款',href:'',description02:'收款金额：'+otherRefundCustomer,description01:'收款时间：'+otherRefundTime,status:otherRefundStatus},
      {id:'12',title:'最新付款',href:'',description02:'收款金额：'+collectionRecordCustomer,description01:'收款时间：'+collectionRecordTime,status:collectionRecordStatus},
      {id:'5',title:'最新签约收款',href:'',description01:'支付时间：'+contractDeposittime,description02:'金额：'+contractDepositamount,status:contractDepositStatus	},
      {id:'6',title:'最新维修',href:'/#/Car/CarManager/NewMaintainCarNotes',description01:'进厂时间：'+maintaintime,description02:'状态：'+maintainstatus,status:maintainStatus	},
      {id:'7',title:'最新延期',href:'/#/Car/CarManager/NewExtensionCarNotes',description01:'操作时间：'+extensiontime,description02:'天数：'+extensiondays,status:extensionStatus	},
      {id:'8',title:'最新保养',href:'/#/Car/CarManager/NewKeepCarNotes',description01:'进厂公里数：'+keepgps_distance,description02:'进厂时间：'+keeptime,status:keepStatus	},
      {id:'9',title:'最新出险',href:'/#/Car/CarManager/NewAccidentCarNotes',description01:'理赔状态：'+accidentstatus,description02:'出险时间：'+accidenttime,status:accidentStatus	},
      {id:'10',title:'最新客户交流',href:'/#/Customer/AddCustomerRecord',description01:'交流时间：'+customerContacttime,description02:'交流内容：'+customerContactcomment,status:customerContactStatus	},
    ];
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传照片</div>
      </div>
    );
    return (
      <div>
        <Card
          className={styles.projectList2}
          style={{ marginBottom: 24 }}
          title="客户记录"
          bordered={false}
          loading={this.state.CardReocrdLoading}
          bodyStyle={{ padding: 0 }}
        >
          {notice.map(item => (
            <Card.Grid className={styles.projectGrid} key={item.id} style={{paddingBottom:'5px'}} onClick={this.chooseList.bind(this,item.id)}>
              <Card bodyStyle={{ padding: 0 }} bordered={false}  onClick={this.chooseList.bind(this,item.id)}>
                <Card.Meta
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
                          <div style={{padding:'5px 0px'}}><Ellipsis style={{color:'#333',overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}}>{item.description01}</Ellipsis></div>
                          <div style={{padding:'5px 0px'}}><Ellipsis style={{color:'#333',overflow:'hidden', textOverflow:'ellipsis', whiteSpace: 'nowrap'}}>{item.description02}</Ellipsis></div>
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

        <Card>
          <Tabs hideAdd={true} type="editable-card" defaultActiveKey={100} activeKey={this.state.chooseTarget} onChange={this.chooseList}    onEdit={this.onEdit}>
            <TabPane tab="客户具体信息" key="20" closable={false}>
              <div style={{margin:'3% auto'}}>
                <Form onSubmit={this.handleSubmit}  className={styles.form} >
                  <div className={styles.formDiv}>
                    <FormItem
                      {...formItemLayout}
                      label="客户类型"
                    >
                      <Select value={this.state.type} onChange={this.changeType} placeholder="请选择客户类型" disabled={true}>
                        <Option value={1}>个人</Option>
                        <Option value={2}>公司</Option>
                      </Select>
                    </FormItem>
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
                            {this.state.id_card_img.length>0 ? null : uploadButton}
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
                            {this.state.driving_license_img.length>0 ? null : uploadButton}
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
                      <div className={styles.TagBtnDiv}>
                        <Button disabled={this.state.ButtonDisabled} className={styles.formButton}  loading={this.state.UpdateButtonLoading} onClick={this.UpdateCustomerSubmit} type="primary">确认修改</Button>
                        <Button disabled={this.state.ButtonDisabled} className={styles.formButton} style={{marginLeft:'15px'}} onClick={this.DeleteCustomer} type="danger" ghost>删除</Button>
                      </div>
                    </FormItem>
                  </div>
                </Form>
              </div>
            </TabPane>
            {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPane>)}
          </Tabs>
        </Card>
      </div>
    );
  }
}
const ShowCustomer = Form.create()(showCustomer);

export default ShowCustomer;
