import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import request from './../../utils/request';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Avatar,Card,notification,Row,Col,Input,Button,Table,Popconfirm,Tag,Badge} from 'antd';
import { ChartCard,Radar, Pie,yuan,Field } from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './../Workbench/Workplace.less';
import CheckRecord from "./CheckRecord/CheckRecord";
import NewAccidentCarNotes from './NewAccidentCarNotes/NewAccidentCarNotes';
import NewMaintainCarNotes from './NewMaintainCarNotes/NewMaintainCarNotes';
import NewKeepCarNotes from './NewKeepCarNotes/NewKeepCarNotes';

const FormItem = Form.Item;
const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class garage extends PureComponent {
  state = {
    ListTitle:'全部车辆',
    CarLoading:true,
  }
  componentDidMount() {
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    let partner_id = window.localStorage.getItem("partner_id");
    this.setState({partner_id:partner_id})
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
    request('/api/web/vehicle/xiulichang',{
      method:'POST',
      body:getHostFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if (data.data.code == 1) {
        this.setState({
          baoyang:data.data.data.baoyang,
          chuxian:data.data.data.chuxian,
          tiche:data.data.data.tiche,
          total:data.data.data.total,
          weixiu:data.data.data.weixiu,
        })
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  componentWillUnmount = ()=>{
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  //跳转新增签约页面
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      CarLoading:true,
      search:''
    })
    if(e=='全部车辆'){
      this.getAllCarInter('');
    }else if(e=='维修车辆'){
      this.WxCarInter('',this.state.partner_id);
    }else if(e=='出险车辆'){
      this.getAccidentRecordInter('',this.state.partner_id);
    }else if(e=='待提车辆'){
      this.getFactoryTicheInter('');
    }else if(e=='需保养车辆'){
      this.KeepCarInter('');
    }
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
      signal:this.state.signal,
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
  //维修车辆列表数据接口
  WxCarInter = (search,partner_id) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("status", 0);
    GFHFormData.append("partner_id", partner_id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getMaintainRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
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
    }).catch((e)=>{
    })
  }
//需保养车辆列表数据接口
  KeepCarInter = (search) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getVehicleBaoyang',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
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
    }).catch((e)=>{
    })
  }
  //提车车辆列表数据接口
  getFactoryTicheInter = (search) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getFactoryTiche',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
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
    }).catch((e)=>{
    })
  }
  //获取出险记录列表数据接口
  getAccidentRecordInter= (search,partner_id) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("partner_id", partner_id);
    GFHFormData.append("limit", 1000);
    request('/api/web/vehicle/getAccidentRecord',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code === 1) {
        this.setState({
          CarRecord:data.data.data.rows,
          CarRecordLen:data.data.data.rows.length,
          CarLoading:false,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //查看车辆相关记录
  ShowDepositListItem = (target)=>{
    this.props.history.push("/Garage/CheckRecord?car_id="+target);
  }
  //快捷查询
  SearchSubmit =()=>{
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          search:$("input[name='search']").val(),
          CarLoading:true,
        })
        if(this.state.ListTitle=='全部车辆'){
          this.getAllCarInter($("input[name='search']").val());
        }else if(this.state.ListTitle=='维修车辆'){
          this.WxCarInter($("input[name='search']").val(),this.state.partner_id);
        }else if(this.state.ListTitle=='出险车辆'){
          this.getAccidentRecordInter($("input[name='search']").val(),this.state.partner_id);
        }else if(this.state.ListTitle=='待提车辆'){
          this.getFactoryTicheInter($("input[name='search']").val());
        }else if(this.state.ListTitle=='需保养车辆'){
          this.KeepCarInter($("input[name='search']").val());
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
    const {baoyang,chuxian,total,tiche,weixiu,} = this.state;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent} style={{background:'#fff',paddingTop:'20px'}}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}修理厂！</div>
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
        <div className={styles.statItem} onClick={()=>this.chooseList('维修车辆')}>
          <p>维修车辆</p>
          <p>{weixiu}</p>
        </div>
        <div className={styles.statItem} onClick={()=>this.chooseList('出险车辆')}>
          <p>出险车辆</p>
          <p>{chuxian}</p>
        </div>
        <div className={styles.statItem} onClick={()=>this.chooseList('待提车辆')}>
          <p>待提车辆</p>
          <p>{tiche}</p>
        </div>
        <div className={styles.statItem} onClick={()=>this.chooseList('需保养车辆')}>
          <p>需保养车辆</p>
          <p>{baoyang}</p>
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
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="blue" >查看相关记录</Tag>
          </div>
        ,
      },
    ];
    //维修车辆
    const MaintenanceCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '进厂时间', dataIndex: 'maintain_time', key: 'maintain_time',  },
      { title: '维修总金额', dataIndex: 'amount', key: 'amount',  },
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '状态', dataIndex: 'maintain_status', key: 'maintain_status',
        render:(text,record) =>
          <div>
            {
              record.maintain_status==0 && <Badge status="processing" text='维修中'/>
            }
          </div>

      },
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="blue" >查看相关记录</Tag>
          </div>
        ,
      },
    ];
    const KeepCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '品牌车型', dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',  },
      { title: '修理厂名称', dataIndex: 'factory_name', key: 'factory_name',  },
      { title: '修理金额', dataIndex: 'amount', key: 'amount',},
      { title: '进厂公里数', dataIndex: 'last_vkt', key: 'last_vkt',},
      { title: '下次保养公里数', dataIndex: 'next_keep_rent_vkt', key: 'next_keep_rent_vkt',},
      { title: '下次保养剩余日期', dataIndex: 'next_keep_rent_days', key: 'next_keep_rent_days',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="blue" >查看相关记录</Tag>
          </div>
        ,
      },
    ];
    const OutCar = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no'},
      { title: '客户姓名', dataIndex: 'customer_name', key: 'customer_name',},
      { title: '事故地点', dataIndex: 'accident_address', key: 'accident_address',  },
      { title: '出险时间', dataIndex: 'accident_time', key: 'accident_time',  },
      { title: '己方金额', dataIndex: 'own_amount', key: 'own_amount',},
      { title: '第三方金额', dataIndex: 'thirdparty_amount', key: 'thirdparty_amount',},
      { title: '修理厂', dataIndex: 'partner_name', key: 'partner_name',},
      { title: '出厂时间', dataIndex: 'miantain_finsih_time', key: 'miantain_finsih_time',},
      { title: '责任方', dataIndex: 'responsible_party', key: 'responsible_party',},
      { title: '详细描述', dataIndex: 'detail_record', key: 'detail_record',},
      {
        title: '操作',
        key: 'operation',
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowDepositListItem.bind(this,record.vehicle_id)} className={styles.TagBtn} color="blue" >查看相关记录</Tag>
          </div>
        ,
      },
    ];
    const DTcolumns = [
      { title: '车牌号', dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '品牌车型',  dataIndex: 'vehicle_template', key: 'vehicle_template',},
      { title: '所属公司', dataIndex: 'belong_company', key: 'belong_company',},
      { title: '实际车主', dataIndex: 'actual_owner', key: 'actual_owner',},
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
          <Tag onClick={this.ShowDepositListItem.bind(this,record.id)} className={styles.TagBtn} color="blue">查看相关记录</Tag>
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
            <Route exact path="/Garage/workplace" component={
              () => <div>
                <div style={{marginTop: 24}}>
                  <Card bordered={false}>
                    <StandardFormRow  title="快速新增记录入口">
                      <Button type='primary' onClick={()=>{window.location.href="/#/Garage/NewMaintainCarNotes"}}>新增维修记录</Button>
                      <Button type='primary' style={{marginLeft:24}} onClick={()=>{window.location.href="/#/Garage/NewKeepCarNotes"}}>新增保养记录</Button>
                      <Button type='primary' style={{marginLeft:24}} onClick={()=>{window.location.href="/#/Garage/NewAccidentCarNotes"}}>新增出险记录</Button>
                    </StandardFormRow>
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
                <div style={{marginTop: 24}}>
                  <Card bordered={false} title={this.state.ListTitle}>
                    {
                      this.state.ListTitle == '全部车辆' &&
                      <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={columns}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '维修车辆' &&
                      <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={MaintenanceCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '需保养车辆' &&
                      <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={KeepCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '出险车辆' &&
                      <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={OutCar}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle === '待提车辆' &&
                      <Table rowKey="id" bordered={true} scroll={{x: 600}} columns={DTcolumns}
                             loading={this.state.CarLoading} dataSource={this.state.CarRecord}
                             footer={() => <p>总共 {this.state.CarRecordLen} 条数据</p>}/>
                    }
                  </Card>
                </div>
              </div>
            }/>
            <Route path="/Garage/CheckRecord" component={CheckRecord}/>
            <Route path="/Garage/NewKeepCarNotes" component={NewKeepCarNotes}/>
            <Route path="/Garage/NewMaintainCarNotes" component={NewMaintainCarNotes}/>
            <Route path="/Garage/NewAccidentCarNotes" component={NewAccidentCarNotes}/>

          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}
const Garage = Form.create()(garage);

export default Garage;
