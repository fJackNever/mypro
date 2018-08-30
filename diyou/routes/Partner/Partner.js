import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select,Row, Col, Button,Table,Tag,Pagination} from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import styles from './../Sale/Sale.less';
import AddPartner from "../Partner/AddPartner/AddPartner";
import request from "../../utils/request";

const { Option } = Select;
const FormItem = Form.Item;


class Partners extends PureComponent {
  state = {
    ListTitle:'修理厂',
    tableLoading:false,

    pagecurrent:1,
    pageSize:10
  }
  componentWillReceiveProps (){
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
    this.componentDidMount();
  }
  componentDidMount() {
    if ("AbortController" in window) {
      window.controller = new AbortController();
      this.setState({
        signal: controller.signal,
      })
    }
      if(window.location.href.split('type=')[1]){
        if(window.location.href.split('type=')[1]==1){
          this.setState({
            ListTitle:'修理厂',
            tableLoading:true,
          })
          this.getPartnerHostInfo();
          this.getPartnerInfo(0,'',this.state.pageSize,0);
        }else{
          this.setState({
            tableLoading:true,
            ListTitle:'合作租赁公司',
          })
          this.getPartnerHostInfo();
          this.getPartnerInfo(1,'',this.state.pageSize,0);
        }
      }else{
        this.setState({
          ListTitle:'修理厂',
        })
        this.getPartnerHostInfo();
        this.getPartnerInfo(0,'',this.state.pageSize,0);
      }
  }
  componentWillUnmount = ()=>{
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  //获得总数列表接口
  getPartnerHostInfo = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/partner/getPartnerHost',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        this.setState({
          repairFactoryTotal:data.data.data.repairFactoryTotal,
          lesseeCompanyTotal:data.data.data.lesseeCompanyTotal,
        })
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
  }
  //获得总数列表接口
  getPartnerInfo = (type,search,limit,offset)=>{
    this.setState({tableLoading:true})
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('partner_type',type);
    TotalData.append('search',search);
    TotalData.append('limit',limit);
    TotalData.append('offset',offset);
    request('/api/web/partner/getPartner',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false,
      })
      if(data.data.code==1){
        this.setState({
          PartnerRecord:data.data.data.rows,
          PartnerRecordLen:data.data.data.total,
        })
      }
    }).catch(()=>{})
  }
  //选择不同角色显示不同table数据
  chooseList = (e) =>{
    this.setState({
      ListTitle:e,
      tableLoading:true,
      search:'',
      pagecurrent:1,
    })
    if(e=='修理厂'){
      this.getPartnerInfo(0,'',this.state.pageSize,0);
    }else{
      this.getPartnerInfo(1,'',this.state.pageSize,0);
    }
  }
  //新增合作伙伴
  AddPartner = (e) => {
    this.props.history.push('/Setting/Partner/AddPartner?PartnerRole='+e);
  }
  //查看记录详情
  ShowUpRent = (target)=>{
    this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+target);
  }
  //新增记录
  ShowAddReocrd = (partnerid,type)=>{
    if(type==1){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }else if(type==2){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }else if(type==3){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }else if(type==4){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }else if(type==5){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }else if(type==6){
      this.props.history.push('/Setting/Partner/AddPartner?PartnerID='+partnerid+'&type='+type);
    }
  }
  //模糊查询
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
      if(this.state.ListTitle=='修理厂'){
        this.getPartnerInfo(0,'',this.state.pageSize,0);
      }else{
        this.getPartnerInfo(1,'',this.state.pageSize,0);
      }
    }else{
    }
  }
  //快捷查询
  SearchSubmit =()=>{
    this.setState({
      search:$("input[name='search']").val(),
    })
    if(this.state.ListTitle=='修理厂'){
      this.getPartnerInfo(0,$("input[name='search']").val(),this.state.pageSize,0);
    }else{
      this.getPartnerInfo(1,$("input[name='search']").val(),this.state.pageSize,0);
    }
  }

  //分页查询
  ChangeSizePage=(current, pageSize)=>{
    this.setState({pageSize:pageSize,pagecurrent:1,});
    if(this.state.ListTitle=='修理厂'){
      this.getPartnerInfo(0,'',pageSize,(current-1)*pageSize);
    }else{
      this.getPartnerInfo(1,'',pageSize,(current-1)*pageSize);
    }
  }
  ChangePage=(current, pageSize)=>{
    this.setState({pagecurrent:current,pageSize:pageSize})
    if(this.state.ListTitle=='修理厂'){
      this.getPartnerInfo(0,'',pageSize,(current-1)*pageSize);
    }else{
      this.getPartnerInfo(1,'',pageSize,(current-1)*pageSize);
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 24 },
      },
    };
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const SaleTopData = [
      {key:'SaleTopData01',title:'修理厂',value:this.state.repairFactoryTotal,bordered:true},
      {key:'SaleTopData02',title:'合作租赁公司',value:this.state.lesseeCompanyTotal,bordered:true},
    ];
    const XLCColumns = [
      { title: '修理厂名称', dataIndex: 'name', key: 'name',},
      { title: '修理厂地址',dataIndex: 'address', key: 'address',},
      { title: '联系人', dataIndex: 'contacts', key: 'contacts', },
      { title: '联系人手机号', dataIndex: 'contact_telephone', key: 'contact_telephone', },
      { title: '联系电话', dataIndex: 'special_plane', key: 'special_plane',},
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 400,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowUpRent.bind(this,record.id)} className={styles.TagBtn} color="green">查看</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,1)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看维修</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,2)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看保养</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,3)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看出险</Tag>
          </div>
        ,
      },
    ];
    const HZZLColumns = [
      { title: '租赁公司名称', dataIndex: 'name', key: 'name',},
      { title: '租赁公司地址',dataIndex: 'address', key: 'address',},
      { title: '联系人', dataIndex: 'contacts', key: 'contacts', },
      { title: '联系人手机号', dataIndex: 'contact_telephone', key: 'contact_telephone'},
      { title: '联系电话', dataIndex: 'special_plane', key: 'special_plane', },
      { title: '备注', dataIndex: 'comment', key: 'comment',},
      {
        title: '操作',
        key: 'operation',
        width: 400,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            <Tag onClick={this.ShowUpRent.bind(this,record.id)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,4)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看租车</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,5)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看借车</Tag>
            <Tag onClick={this.ShowAddReocrd.bind(this,record.id,6)} className={styles.TagBtn} color="blue" style={{marginLeft:'10px'}} >查看还车</Tag>
          </div>
        ,
      },
    ];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Setting/Partner" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={4} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button onClick={()=>this.AddPartner('AddGarage')} type="primary" className={styles.QuickButton}>新增修理厂</Button>
                      <Button onClick={()=>this.AddPartner('AddCooperative')} type="primary" className={styles.QuickButton}>新增合作租赁公司</Button>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Input style={{width:'80%'}} name="search" onChange={this.SearchInput} placeholder="输入关键字" defaultValue={this.state.search}/>
                            </FormItem>
                          </Col>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Button  onClick={this.SearchSubmit}  type="primary">搜索</Button>
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
                      this.state.ListTitle=='修理厂' &&
                      <Table scroll={{x: 600}} pagination={false} loading={this.state.tableLoading} bordered={true} dataSource={this.state.PartnerRecord} columns={XLCColumns} footer={() => <p>总共 {this.state.PartnerRecordLen} 条数据</p>}/>
                    }
                    {
                      this.state.ListTitle=='合作租赁公司' &&
                      <Table scroll={{x: 600}} pagination={false} loading={this.state.tableLoading} bordered={true} dataSource={this.state.PartnerRecord} columns={HZZLColumns} footer={() => <p>总共 {this.state.PartnerRecordLen} 条数据</p>}/>
                    }
                    <Pagination hideOnSinglePage={true} style={{marginTop:'24px'}} showSizeChanger showQuickJumper onShowSizeChange={this.ChangeSizePage} onChange={this.ChangePage} pageSize={this.state.pageSize} current={this.state.pagecurrent} total={this.state.PartnerRecordLen} />
                  </Card>
                </div>
              </div>
            }/>
            <Route path="/Setting/Partner/AddPartner" component={AddPartner}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const Partner = Form.create()(Partners);

export default Partner;
