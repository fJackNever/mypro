import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';

import {Tabs,Form,Input, Card, Row, Col,Badge,Button,notification,Table, Icon, Divider,message,Switch} from 'antd';
import request from "../../utils/request";
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './PersonalCenter.less';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { TextArea } = Input;



const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};


class Settings extends PureComponent {
  state = {

  }
  componentDidMount() {
    this.getpersonalcenterInter();
    this.getOrderInter();
    this.getUserFeeInter();
    this.getcompanyorderInter();
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
          companyCount:data.data.data.count,
          is_notice:data.data.data.company.is_notice,
          companyPayNum:data.data.data.pay_num,
          PayTotal:data.data.data.pay_total,
          PayCount:data.data.data.pay_count,
          companyUsedNum:data.data.data.used_num,
          companyRemainDay:data.data.data.remain_day,
          companyCarTotal:data.data.data.vehicle_total,
          companyCustomTotal:data.data.data.customer_total,
          companyPeopleTotal:data.data.data.staff_total,
          companyName:data.data.data.company.company_name,
          companyEndTime:data.data.data.company.service_end_time,
          companyStartTime:data.data.data.company.create_time,
          companyEntityId:data.data.data.company.entity_id,
          companyType:data.data.data.company_type,
          auto_send_rent_amount: data.data.data.company.auto_send_rent_amount,
          auto_send_rent_voice:data.data.data.company.auto_send_rent_voice,
          auto_check_violation:data.data.data.company.auto_check_violation,
        })
      }else{
        openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
      }
    }).catch(()=>{})
  }
  //获得充值订单信息
  getOrderInter = ()=>{
    let GOformData = new FormData();
    GOformData.append("key",'diuber2017' );
    GOformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getOrder',{
      method:'POST',
      body:GOformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          OrderRecordData:data.data.data.row
        })
      }else{
        openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
      }
    }).catch(()=>{})
  }
  //获得公司版本升级订单列表
  getcompanyorderInter = ()=>{
    let COformData = new FormData();
    COformData.append("key",'diuber2017' );
    COformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    COformData.append("limit",9999);
    request('/api/web/admin_setting/getcompanyorder',{
      method:'POST',
      body:COformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          CompanyOrderData:data.data.data.rows
        })
      }else{
        openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
      }
    }).catch(()=>{})
  }
  //获得使用统计列表
  getUserFeeInter = ()=>{
    let UseformData = new FormData();
    UseformData.append("key",'diuber2017' );
    UseformData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getUserFee',{
      method:'POST',
      body:UseformData,
      credentials: 'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          UseTJData:data.data.data.rows
        })
      }else{
        openNotificationWithIcon('warning','嘀友提醒',data.data.msg)
      }
    }).catch(()=>{})
  }


  SettingChoose = ()=>{

  }
  //公司版续费
  Renewal = ()=>{
    this.props.history.push('/Setting/Renewal');
  }
  //查违章充值
  AddCheckllsgal= ()=>{
    this.props.history.push('/Car/CarManager/AddCheckllsgal');
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const {companyCount,companyPayNum,companyUsedNum,PayTotal,PayCount} = this.state;
    const MentallyEnjoyRules = [
      {key:'01',type:'default',content:'免费版本所有功能 '},
      {key:'02',type:'processing',content:'限时送公司专属小程序 （原价 2980元/年） '},
      {key:'03',type:'default',content:'不限车辆、品牌车型数量 '},
      {key:'04',type:'default',content:'不限合作伙伴、员工数量 '},
      {key:'05',type:'default',content:'批量导入、导出Excel表格 '},
      {key:'06',type:'default',content:'销售管理，订单推送 '},
      {key:'07',type:'default',content:'租车信息全国推广服务 '},
      {key:'08',type:'default',content:'同城求租客户信息推送 '},
      {key:'09',type:'default',content:'第三方资料录入（修理厂）'},
      {key:'10',type:'default',content:'证件自动识别，手机验车'},
      {key:'11',type:'default',content:'违章短信推送通知'},
      {key:'12',type:'default',content:'自动催缴租金短信和电话 '},
      {key:'13',type:'default',content:'（查违章/短信按量收费）'},
      {key:'14',type:'processing',content:'30天内不满意全额退款'},
      {key:'15',type:'processing',content:'金牌讲师上门培训一次（限江浙沪，其余地区提供线上培训）'},
    ];
    const YXMentallyEnjoyRules = [
      {key:'01',type:'default',content:' 绑定公司专属小程序 '},
      {key:'02',type:'default',content:' 不限车型、车辆数 '},
      {key:'03',type:'default',content:' 销售管理，订单推送 '},
      {key:'04',type:'default',content:' 租车信息全国推广服务'},
      {key:'05',type:'default',content:' 同城求租客户信息推送'},
      {key:'06',type:'default',content:' 邀请有奖活动'},
    ];
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
      );
    const SaleTopData = [
      {key:'SaleTopData01',title:'订单金额',value: PayTotal,bordered:true},
      {key:'SaleTopData02',title:'订单次数',value: PayCount,bordered:false},
    ];
    const UseData =  [
      {key:'UseData01',title:'总次数',value:companyPayNum,bordered:true},
      {key:'UseData02',title:'剩余次数',value:companyCount,bordered:true},
      {key:'UseData03',title:'已使用次数',value:companyUsedNum,bordered:false},
    ];
    const OrderRecordcolumns = [
      {
      title: '订单编号',
      dataIndex: 'entity_id',
      key: 'entity_id',
      },{
      title: '订单标题',
      dataIndex: 'body',
      key: 'body',
      },{
      title: '订单内容',
      dataIndex: 'attach',
      key: 'attach',
      },{
      title: '充值次数',
      dataIndex: 'count',
      key: 'count',
    },{
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
    },{
      title: '支付状态',
      dataIndex: 'pay_status',
      key: 'pay_status',
    },{
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
    }];
    const CompanyOrdercolumns = [
      {
      title: '订单编号',
      dataIndex: 'entity_id',
      key: 'entity_id',
    },{
      title: '银行转帐流水号',
      dataIndex: 'transfer_record',
      key: 'transfer_record',
    },{
      title: '订单内容',
      dataIndex: 'body',
      key: 'body',
    },{
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
    },{
      title: '开通年数',
      dataIndex: 'count',
      key: 'count',
    },{
      title: '支付类型',
      dataIndex: 'type',
      key: 'type',
      render: (text,record) =>
        <div>
          {record.type==1 && <span>微信</span>}
          {record.type==2 && <span>线下</span>}
        </div>
    },{
      title: '处理状态',
      dataIndex: ' pay_status',
      key: ' pay_status',
      render: (text,record) =>
        <div>
          {
            record.type==1 &&
              <div>
                {record.pay_status==0 && <span style={{color:'#f50'}}>未支付</span>}
                {record.pay_status==1 && <span>已支付</span>}
              </div>
          }
          {
            record.type==2 &&
            <div>
              {record.pay_status==0 && <span style={{color:'#f50'}}>未处理</span>}
              {record.pay_status==1 && <span>已处理</span>}
            </div>
          }
        </div>
    },{
      title: '提交日期',
      dataIndex: 'create_time',
      key: 'create_time',
    },{
      title: '公司名称',
      dataIndex: 'company_name',
      key: 'company_name',
    }];
    const UseColumns = [
      {
        title:'使用内容',
        dataIndex:'part_info',
        key:'part_info',
      },{
        title:'使用次数',
        dataIndex:'use_count',
        key:'use_count',
      },{
        title:'使用类型',
        dataIndex:'type',
        key:'type',
        render: (text, record) => {
          return (
            <div className="editable-row-operations">
            {record.type==1 && <span style={{color:'magenta'}}>查违章</span>}
            {record.type==2 && <span style={{color:'orange'}}>查失信</span>}
            {record.type==3 && <span style={{color:'purple'}}>发送短信提醒</span>}
        </div>
        )}
      },{
        title:'使用状态',
        dataIndex:'status',
        key:'status',
        render:(text,record) =>{
        return (
          <div>
          {record.status==0 && <span style={{color:'gold'}}>未使用</span>}
          {record.status==1 && <span>已使用</span>}
          </div>
        )}
      },{
        title:'使用时间',
        dataIndex:'use_time',
        key:'use_time',
      },
    ];
    return (
        <PageHeaderLayout>
          <div style={{background:'#fff',padding:24}}>
                <Tabs type="card" defaultActiveKey="4" onChange={this.SettingChoose} style={{background:'#fff',padding:24,marginBottom:24}}>
                  <TabPane tab="智享版" key="4">
                    {
                      MentallyEnjoyRules.map(item=>(
                        <Badge className={styles.bbIntroduce} status={item.type} text={item.content} />
                      ))
                    }
                  </TabPane>
                  <TabPane tab="营销版" key="5">
                    {
                      YXMentallyEnjoyRules.map(item=>(
                        <Badge className={styles.bbIntroduce} status={item.type} text={item.content} />
                      ))
                    }
                  </TabPane>
                  <TabPane tab="其他版本介绍" key="6"></TabPane>
                </Tabs>
                <Tabs type="card" defaultActiveKey="0" onChange={this.SettingChoose}>
                  <TabPane tab="公司详情" key="0">
                   <Row>
                     <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                       <Row>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司名称：</p>
                             <p style={{}}>{this.state.companyName}</p>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>查违章剩余次数：</p>
                             <p style={{color:'#f60'}}>{this.state.companyCount} 次</p>
                             <Button onClick={this.AddCheckllsgal} type="primary" ghost>充值</Button>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司版本：</p>
                             <p style={{color:'#f60'}}>{this.state.companyType}</p>
                             {this.state.companyType=='免费版' &&
                              <Button onClick={this.Renewal} type="danger" ghost>升级</Button>
                             }
                             {this.state.companyType!='免费版' &&
                             <Button onClick={this.Renewal} type="danger" ghost>续费</Button>
                             }
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>收费版到期时间：</p>
                             <p>{this.state.companyEndTime}</p>
                             <text style={{color:'#f60'}}>( 剩余{this.state.companyRemainDay}天 )</text>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司号：</p>
                             <p>{this.state.companyEntityId}</p>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>注册时间：</p>
                             <p>{this.state.companyStartTime}</p>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司车辆：</p>
                             <p>{this.state.companyCarTotal} 辆</p>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司员工：</p>
                             <p>{this.state.companyPeopleTotal} 名</p>
                           </div>
                         </Col>
                         <Col xl={12} lg={24} md={24} sm={24} xs={24}>
                           <div className={styles.pcRowCol}>
                             <p>公司客户：</p>
                             <p>{this.state.companyCustomTotal} 名</p>
                           </div>
                         </Col>
                       </Row>
                     </Col>
                   </Row>
                  </TabPane>
                  <TabPane tab="订单记录" key="2">
                    <Row style={{margin:24}}>
                    {
                      SaleTopData.map(item => (
                      <Col className={styles.RowCol} md={12} sm={12} xs={24} style={{background:'#fff',padding:'12px 0px'}}>
                        <Info title={item.title} value={item.value} bordered={item.bordered}/>
                      </Col>
                      )
                    )}
                    </Row>
                    <Card bordered={false} title="违章点数充值订单记录表">
                      <Table  columns={OrderRecordcolumns} dataSource={this.state.OrderRecordData} scroll={{x:600}}/>
                    </Card>
                    <Card bordered={false}  style={{marginTop:24}} title="公司版本升级订单记录表">
                      <Table scroll={{x: 600}} columns={CompanyOrdercolumns} dataSource={this.state.CompanyOrderData} />
                    </Card>
                  </TabPane>
                  <TabPane tab="使用统计" key="3">
                    <Row style={{margin:24}}>
                        {
                          UseData.map(item => (
                          <Col className={styles.RowCol} md={8} sm={12} xs={24} style={{background:'#fff',padding:'12px 0px'}}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                        )}
                    </Row>
                    <Table bordered columns={UseColumns} dataSource={this.state.UseTJData} scroll={{x: 600}} />
                  </TabPane>
                </Tabs>
              </div>
        </PageHeaderLayout>
    );
  }
}
const Setting = Form.create()(Settings);

export default Setting;
