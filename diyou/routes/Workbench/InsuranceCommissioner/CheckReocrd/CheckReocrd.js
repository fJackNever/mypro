import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Card,Select,notification,Button,Table,Tag, } from 'antd';
import styles from './../../../Workbench/Workplace.less';
import request from "../../../../utils/request";

const FormItem = Form.Item;
const Option = Select.Option;

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
      this.getPolicyRecord(window.location.href.split('car_id=')[1],'');
    }
    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
  }
  getPolicyRecord = (vehicle_id,search)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("vehicle_id", vehicle_id);
    GFHFormData.append("limit", 9999);
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
      }
    }).catch(()=>{})
  }
  addPolicy = () =>{
    this.props.history.push('/workbench/InsuranceCommissioner/NewPolicyCarNotes');
  }
  ShowPolicy = (target) =>{
    this.props.history.push('/workbench/InsuranceCommissioner/NewPolicyCarNotes?entity_id='+target);
  }
  render() {
    const {ShowCarReocrd ,} = this.state;
    const { getFieldDecorator } = this.props.form;


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
            <Tag onClick={this.ShowPolicy.bind(this,record.entity_id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
      },
    ];
    return (
      <div>
        <div>
          <Card>
            <Button disabled={this.state.ButtonDisabled} onClick={()=>this.addPolicy()} type="primary" ghost>新增保单记录</Button>
            <Table scroll={{x: 600}} loading={this.state.tableLoading}  style={{marginTop:'24px'}} columns={InsuranceColumn} dataSource={ShowCarReocrd} footer={() => <p>总共 {this.state.ShowCarReocrdLen} 条数据</p>}/>
          </Card>
        </div>
      </div>
    );
  }
}
const CheckRecord = Form.create()(checkRecord);

export default CheckRecord;
