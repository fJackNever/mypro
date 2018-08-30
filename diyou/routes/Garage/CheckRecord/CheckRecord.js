import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Card,Select,Tabs,notification,Button,Table,Tag,Badge,Avatar } from 'antd';
import styles from './../../Workbench/Workplace.less';
import request from "../../../utils/request";
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class checkRecord extends PureComponent {
  state = {
    tableLoading:false,
  }
  componentDidMount() {
    let partner_id = window.localStorage.getItem("partner_id");
    if(window.location.href.split('car_id=')[1]){
      this.getMaintainRecord(window.location.href.split('car_id=')[1],partner_id,'');
      this.getKeepRecord(window.location.href.split('car_id=')[1],partner_id,'');
      this.getAccidentRecord(window.location.href.split('car_id=')[1],partner_id,'');
    }
    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
  }
  //获取维修记录
  getMaintainRecord = (id,partner_id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("partner_id", partner_id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          wxCarReocrd:data.data.data.rows,
          wxCarReocrdLen:data.data.data.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取保养记录
  getKeepRecord = (id,partner_id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("partner_id", partner_id);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getKeepRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          byCarReocrd:data.data.info.rows,
          byCarReocrdLen:data.data.info.rows.length,
          tableLoading:false,
        })
      }
    }).catch(()=>{})
  }
  //获取出险记录
  getAccidentRecord = (id,partner_id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", id);
    GFHFormData.append("partner_id", partner_id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
    }).then((data)=> {
      this.setState({
        cxCarReocrd:data.data.data.rows,
        cxCarReocrdLen:data.data.data.rows.length,
        tableLoading:false,
      })
    }).catch(()=>{})
  }

  /*维修*/
  addMaintain= () =>{
    this.props.history.push('/Garage/NewMaintainCarNotes');
  }
  ShowMaintainRecord= (target) =>{
    this.props.history.push('/Garage/NewMaintainCarNotes?entity_id='+target);
  }
  /*保养*/
  addKeep= () =>{
    this.props.history.push('/Garage/NewKeepCarNotes');
  }
  ShowKeepRecord= (target) =>{
    this.props.history.push('/Garage/NewKeepCarNotes?entity_id='+target);
  }
  /*出险*/
  addAccident = ()=>{
    this.props.history.push('/Garage/NewAccidentCarNotes')
  }
  ShowAccidentRecord = (target) =>{
    this.props.history.push('/Garage/ShowAccidentCarNotes?entity_id='+target+"&Car_id="+window.location.href.split('Car_id=')[1]);
  }
  render() {
    const {wxCarReocrd,byCarReocrd,cxCarReocrd} = this.state;
    const { getFieldDecorator } = this.props.form;

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
            <Tag onClick={this.ShowAccidentRecord.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>},
    ];
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent} style={{background:'#fff',marginTop:'-37px',paddingTop:'20px'}}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}修理厂！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );

    return (
      <PageHeaderLayout
        content={pageHeaderContent}
      >
      <div>
        <Card>
          <Tabs type="card" onChange={this.tabChange}>
            <TabPane tab="维修记录" key="1">
              <Button onClick={()=>this.addMaintain()} type="primary" ghost>新增维修记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={MaintenanceColumn} dataSource={wxCarReocrd} footer={() => <p>总共 {this.state.wxCarReocrdLen} 条数据</p>}/>
            </TabPane>
            <TabPane tab="保养记录" key="2">
              <Button onClick={()=>this.addKeep()} type="primary" ghost>新增保养记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={KeepColumn} dataSource={byCarReocrd} footer={() => <p>总共 {this.state.byCarReocrdLen} 条数据</p>}/>
            </TabPane>
            <TabPane tab="出险记录" key="3">
              <Button onClick={()=>this.addAccident()} type="primary" ghost>新增出险记录</Button>
              <Table scroll={{x: 600}} loading={this.state.tableLoading} style={{marginTop:'24px'}} columns={OutDangeColumn} dataSource={cxCarReocrd} footer={() => <p>总共 {this.state.cxCarReocrdLen} 条数据</p>}/>
            </TabPane>
          </Tabs>
        </Card>
      </div>
      </PageHeaderLayout>
    );
  }
}
const CheckRecord = Form.create()(checkRecord);

export default CheckRecord;
