import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import request from '../../../utils/request';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Avatar,Card,notification,Row,Col,Input,Button,Tag,Table} from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './../Workplace.less';

import CheckReocrd from "./CheckReocrd/CheckReocrd";
import NewPolicyCarNotes from "./NewPolicyCarNotes/NewPolicyCarNotes";

const FormItem = Form.Item;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class Workplace extends PureComponent {
  state = {
    ListTitle:'全部车辆',
    CarLoading:true,
  }
  componentDidMount() {

    this.getAllCarInter('');
    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
    let getHostFormData = new FormData();
    getHostFormData.append('key','diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/vehicle/baoxian',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code == 1) {
        this.setState({
          total:data.data.data.total,
          xubao:data.data.data.xubao,
        })
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.info);
      }
    }).catch(()=>{})
  }
  //获取全部车辆列表
  getAllCarInter = (search)=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key','diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append("search", search);
    getHostFormData.append("limit", 10000);
    request('/api/web/vehicle/getVehicle',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.rows.length,
          CarLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  //需续保
  getVehicleXubao = (search)=>{
    let getHostFormData = new FormData();
    getHostFormData.append('key','diuber2017');
    getHostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    getHostFormData.append("search", search);
    getHostFormData.append("limit", 10000);
    request('/api/web/vehicle/getVehicleXubao',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
    }).then((data)=> {
      if (data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.rows.length,
          CarLoading:false
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{})
  }
  //跳转新增签约页面
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      search:'',
    })
    if(e=='全部车辆'){
      this.getAllCarInter('');
    }else{
      this.getVehicleXubao('');
    }
  }
  //查看车辆相关记录
  ShowDepositListItem = (target)=>{
    this.props.history.push("/workbench/InsuranceCommissioner/CheckReocrd?car_id="+target);
  }
  //快捷查询
  SearchSubmit =()=>{
    this.props.form.validateFields((err, values) => {
      if(!err) {
        this.setState({
          search: $("input[name='search']").val(),
          CarLoading: true,
        })
        if (this.state.ListTitle == '全部车辆') {
          this.getAllCarInter($("input[name='search']").val());
        } else {
          this.getVehicleXubao($("input[name='search']").val());
        }
      }
    })
  }
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
    }else{
    }
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const { total,xubao,} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent} style={{background:'#fff',marginTop:'-37px',paddingTop:'20px'}}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}保险专员！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent} style={{background:'#fff',marginTop:'-37px',paddingTop:'20px'}}>
        <div className={styles.statItem} onClick={()=>this.chooseList('全部车辆')}>
          <p>全部车辆</p>
          <p>{total}</p>
        </div>
        <div className={styles.statItem} onClick={()=>this.chooseList('需续保车辆')}>
          <p>需续保车辆</p>
          <p>{xubao}</p>
        </div>
      </div>
    );
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    //全部车辆
    const columns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',  },
      { title: '车身颜色', dataIndex: 'body_color', key: 'body_color',},
      { title: '车架号', dataIndex: 'frame_number', key: 'frame_number',},
      { title: '发动机号', dataIndex: 'engine_number', key: 'engine_number',},
      { title: '负责车管', dataIndex: 'responsible_vehicle_admin', key: 'responsible_vehicle_admin',},
      { title: '负责驾管', dataIndex: 'responsible_drive_admin', key: 'responsible_drive_admin',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="blue" >查看保单记录</Tag>
          </div>
        ,
      },
    ];
    const RenewalCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '交强险到期日期', dataIndex: 'insurance_policy_end_time', key: 'insurance_policy_end_time',  },
      { title: '商业险到期日期', dataIndex: 'commercial_insurance_policy_end_time', key: 'commercial_insurance_policy_end_time',},
      { title: '交强险剩余天数', dataIndex: 'insurance_policy_remaining_days', key: 'insurance_policy_remaining_days',},
      { title: '商业险剩余天数', dataIndex: 'commercial_insurance_policy_remaining_days', key: 'commercial_insurance_policy_remaining_days',},
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="blue">查看保单记录</Tag>
          </div>
        ,
      },
    ];
    return (
      <Router>
      <PageHeaderLayout
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Switch>
          <Route exact path="/workbench/InsuranceCommissioner" component={
            () =><div>
            <div style={{marginTop:24}}>
          <Card bordered={false}>
            <StandardFormRow
              title="快速查询"
              grid
              last
            >
              <Form layout="inline">
                <Row>
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <Input style={{width: '80%'}} name="search" onChange={this.SearchInput} placeholder="输入关键字"
                           defaultValue={this.state.search}/>
                  </Col>
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      className={styles.QuickFormItem}
                      {...formItemLayout}
                    >
                      <Button onClick={this.SearchSubmit} type="primary">搜索</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </StandardFormRow>
          </Card>
        </div>
        <div style={{marginTop:24}}>
          <Card bordered={false} title={this.state.ListTitle}>
            {
              this.state.ListTitle == '全部车辆' &&
              <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={columns}
                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
            }
            {
              this.state.ListTitle === '需续保车辆' &&
              <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={RenewalCar}
                     loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                     footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
            }
          </Card>
        </div>
              </div>}/>
          <Route path="/workbench/InsuranceCommissioner/CheckReocrd" component={CheckReocrd}/>
          <Route path="/workbench/InsuranceCommissioner/NewPolicyCarNotes" component={NewPolicyCarNotes}/>
        </Switch>
      </PageHeaderLayout>
      </Router>
    );
  }
}
const WorkPlace = Form.create()(Workplace);

export default WorkPlace;
