import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select, Row, Col, Button,Table, notification,Tag,message,Popover} from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import AddEmployees from './AddEmployees/AddEmployees';
import UpdateEmployees from './UpdateEmployees/UpdateEmployees';

import styles from './../Sale/Sale.less';
import request from "../../utils/request";

const { Option } = Select;
const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class Employees extends PureComponent {
  state = {
    ListTitle:'在职员工',
    tableLoading:false,
    role:55,
    search:'',
    isNew:0
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
    this.getEmployeesInfo();
    /*查看是否是显示新手教学*/
    if(window.location.href.split('is_new=')[1]==2){
      $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.5);'></div>");
      this.setState({
        isNew:1,
      })
    }
    this.GetStaffInter(1,-1,'');
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
    if ("AbortController" in window) {
      window.controller.abort();
    }
  }
  //获取员工管理总数据
  getEmployeesInfo = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/staff/getStaffHost',{
      method:'POST',
      body:TotalData,
      credentials:'include',
      signal:this.state.signal,
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          total:data.data.data.total,
          guoqi:data.data.data.guoqi,
          cheguan_total:data.data.data.cheguan_total,
          caiwu_total:data.data.data.caiwu_total,
          jiaguan_total:data.data.data.jiaguan_total,
          jingli_total:data.data.data.jingli_total,
          xiaoshou_total:data.data.data.xiaoshou_total,
          xiulicang_total:data.data.data.xiulicang_total,
        })
      }
      if(data.data.code==90001){
        this.props.history.push('/user/login')
      }
    }).catch(()=>{})
  }
  //获取员工列表接口
  GetStaffInter = (status,role,search) =>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("search", search);
    GFHFormData.append("status", status);
    GFHFormData.append("role", role);
    GFHFormData.append("limit", 10000);
    request('/api/web/staff/getStaff',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      this.setState({
        tableLoading:false
      })
      if (data.data.code === 1) {
        this.setState({
          StaffRecord:data.data.data.rows,
          StaffRecordLen:data.data.data.rows.length,
          StaffLoading:false
        });
      } else  if(data.data.code==90001){
        this.props.history.push('/user/login')
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch((e)=>{
    })
  }
  //查看不同角色的列表数据
  chooseList = (e)=>{
    this.setState({
      ListTitle:e,
      tableLoading:true,
      search:''
    })
    if(e=='在职员工'){
      this.GetStaffInter(1,-1,'');
    }else if(e=='离职员工'){
      this.GetStaffInter(0,-1,'');
    }else if(e=='车管'){
      this.GetStaffInter(1,0,'');
    }else if(e=='财务'){
      this.GetStaffInter(1,2,'');
    }else if(e=='驾管'){
      this.GetStaffInter(1,1,'');
    }else if(e=='经理'){
      this.GetStaffInter(1,3,'');
    }else if(e=='销售'){
      this.GetStaffInter(1,5,'');
    }else if(e=='合作修理厂'){
      this.GetStaffInter(1,4,'');
    }
  }
  //跳转新增员工页面
  AddEmployees = () =>{
    this.props.history.push('/Setting/Employees/AddEmployees');
  }
  //停用正常员工
  DisableEmployees = (e)=>{
    let GFHFormData = new FormData();
    GFHFormData.append('key','diuber2017');
    GFHFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GFHFormData.append("id", e);
    GFHFormData.append("status", 0);
    request('/api/web/staff/editAction',{
      method:'POST',
      body:GFHFormData,
      credentials: 'include',
      signal:this.state.signal,
    }).then((data)=> {
      if(data.data.code==1){
        message.success('成功停用员工！');
        if(this.state.ListTitle=='在职员工'){
          this.GetStaffInter(1,-1,'');
        }else if(this.state.ListTitle=='离职员工'){
          this.GetStaffInter(0,-1,'');
        }else if(this.state.ListTitle=='车管'){
          this.GetStaffInter(1,0,'');
        }else if(this.state.ListTitle=='财务'){
          this.GetStaffInter(1,2,'');
        }else if(this.state.ListTitle=='驾管'){
          this.GetStaffInter(1,1,'');
        }else if(this.state.ListTitle=='经理'){
          this.GetStaffInter(1,3,'');
        }else if(this.state.ListTitle=='销售'){
          this.GetStaffInter(1,5,'');
        }else if(this.state.ListTitle=='合作修理厂'){
          this.GetStaffInter(1,4,'');
        }
        let TotalData = new FormData();
        TotalData.append('key','diuber2017');
        TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
        request('/api/web/staff/getStaffHost',{
          method:'POST',
          body:TotalData,
          credentials:'include',
          signal:this.state.signal,
        }).then((data)=>{
          if(data.data.code==1){
            this.setState({
              total:data.data.data.total,
              guoqi:data.data.data.guoqi,
              cheguan_total:data.data.data.cheguan_total,
              caiwu_total:data.data.data.caiwu_total,
              jiaguan_total:data.data.data.jiaguan_total,
              jingli_total:data.data.data.jingli_total,
              xiaoshou_total:data.data.data.xiaoshou_total,
              xiulicang_total:data.data.data.xiulicang_total,
            })
          }
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //查看员工具体信息
  ShowEmployees= (e)=>{
    this.props.history.push('/Setting/Employees/UpdateEmployees?EmployeeID='+e.split('-')[0]+'&EmployeeStatus='+e.split('-')[1]);
  }
  //筛选员工角色查看列表
  changeRole = (value)=>{
    this.setState({
      role:value,
      tableLoading:true,
      search:'',
    })
    if(value!=55){
      this.GetStaffInter(1,value,'')
    }else{
      this.GetStaffInter(1,-1,'')
    }
  }
  //模糊查询
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
      this.UpdateReocrd();
    }else{
    }
  }
  SearchSubmit = ()=>{
    this.setState({
      search:$("input[name='search']").val()
    })
    if(this.state.ListTitle=='在职员工'){
      this.GetStaffInter(1,-1,$("input[name='search']").val());
    }else if(this.state.ListTitle=='离职员工'){
      this.GetStaffInter(0,-1,$("input[name='search']").val());
    }else if(this.state.ListTitle=='车管'){
      this.GetStaffInter(1,0,$("input[name='search']").val());
    }else if(this.state.ListTitle=='财务'){
      this.GetStaffInter(1,2,$("input[name='search']").val());
    }else if(this.state.ListTitle=='驾管'){
      this.GetStaffInter(1,1,$("input[name='search']").val());
    }else if(this.state.ListTitle=='经理'){
      this.GetStaffInter(1,3,$("input[name='search']").val());
    }else if(this.state.ListTitle=='销售'){
      this.GetStaffInter(1,5,$("input[name='search']").val());
    }else if(this.state.ListTitle=='合作修理厂') {
      this.GetStaffInter(1,4,$("input[name='search']").val());
    }
  }
  //更新列表
  UpdateReocrd = ()=>{
    if(this.state.ListTitle=='在职员工'){
      if(this.state.role!=55){
        this.GetStaffInter(1,this.state.role,'');
      }else{
        this.GetStaffInter(1,-1,'');
      }
    }else if(this.state.ListTitle=='离职员工'){
      this.GetStaffInter(0,-1,'');
    }else if(this.state.ListTitle=='车管'){
      this.GetStaffInter(1,0,'');
    }else if(this.state.ListTitle=='财务'){
      this.GetStaffInter(1,2,'');
    }else if(this.state.ListTitle=='驾管'){
      this.GetStaffInter(1,1,'');
    }else if(this.state.ListTitle=='经理'){
      this.GetStaffInter(1,3,'');
    }else if(this.state.ListTitle=='销售'){
      this.GetStaffInter(1,5,'');
    }else if(this.state.ListTitle=='合作修理厂'){
      this.GetStaffInter(1,4,'');
    }
  }
  render() {
    const {total,guoqi,cheguan_total,caiwu_total,jiaguan_total,jingli_total,xiaoshou_total,xiulicang_total} = this.state;
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
      {key:'total',title:'在职员工',value:total,bordered:true},
      {key:'guoqi',title:'离职员工',value:guoqi,bordered:true},
      {key:'cheguan_total',title:'车管',value:cheguan_total,bordered:true},
      {key:'caiwu_total',title:'财务',value:caiwu_total,bordered:true},
      {key:'jiaguan_total',title:'驾管',value:jiaguan_total,bordered:true},
      {key:'jingli_total',title:'经理',value:jingli_total,bordered:true},
      {key:'xiaoshou_total',title:'销售',value:xiaoshou_total,bordered:true},
      {key:'xiulicang_total',title:'合作修理厂',value:xiulicang_total,bordered:false},
    ];
    const columns = [
      { title: '员工姓名', dataIndex: 'name', key: 'name',},
      { title: '手机号', dataIndex: 'telephone', key: 'telephone',},
      { title: '员工角色', dataIndex: 'role', key: 'role',
        render: (text,record) =>
          <div>
            {record.role==0 && <span>车管</span>}
            {record.role==1 && <span>驾管</span>}
            {record.role==2 && <span>财务</span>}
            {record.role==3 && <span>经理</span>}
            {record.role==4 && <span>合作修理厂</span>}
            {record.role==5 && <span>销售</span>}
            {record.role==6 && <span>保险专员</span>}
          </div>
      },
      { title: '状态', dataIndex: 'status', key: 'status',
        render: (text,record) =>
          <div>
            {record.status==0 && <span style={{color:'#F48932'}}>停用</span>}
            {record.status==1 && <span>正常</span>}
          </div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text,record) =>
          <div className={styles.TagBtnDiv}>
            {record.status==1 && <Tag onClick={this.DisableEmployees.bind(this,record.id)} className={styles.TagBtn} color="volcano" >停用</Tag>}
            <Tag onClick={this.ShowEmployees.bind(this,record.id+'-'+record.status,)} className={styles.TagBtn} color="green" style={{marginLeft:'10px'}} >查看</Tag>
          </div>
      },
    ];

    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/Setting/Employees" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col onClick={this.chooseList.bind(this,item.title)} className={styles.RowCol} md={3} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button onClick={this.AddEmployees} type="primary" style={{ marginRight: '24px' }}>新增员工</Button>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          {
                            this.state.ListTitle=='在职员工' &&
                            <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                              <FormItem
                                className={styles.QuickFormItem}
                                {...formItemLayout}
                              >
                                <Select value={this.state.role} placeholder="选择员工角色" onChange={this.changeRole}>
                                  <Option value={55}>选择角色</Option>
                                  <Option value={0}>车管</Option>
                                  <Option value={1}>驾管</Option>
                                  <Option value={2}>财务</Option>
                                  <Option value={3}>经理</Option>
                                  <Option value={5}>销售</Option>
                                  <Option value={6}>保险专员</Option>
                                  <Option value={4}>合作修理厂</Option>
                                </Select>
                              </FormItem>
                            </Col>
                          }
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Input style={{width:'80%'}} name="search" onChange={this.SearchInput}  placeholder="输入关键字" defaultValue={this.state.search}/>
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
                  {this.state.isNew==0 &&
                    <Card bordered={false} title={this.state.ListTitle}>
                      <Table loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={columns} dataSource={this.state.StaffRecord} footer={() => <p>总共 {this.state.StaffRecordLen} 条数据</p>}/>
                    </Card>
                  }
                  {
                    this.state.isNew!=0 &&
                      <Popover content={<div style={{padding:'24px 0px'}}>这里就是刚才新增第一位员工。下一步是新增车辆，新增车辆前要先新增车型，立即<Link style={{color:'#1890ff'}} to="/Setting/CarType?is_new=1">新增车型</Link></div>} visible={true}>
                      <Card bordered={false} title={this.state.ListTitle} style={{position:'relative',zIndex:'1010',}}>
                        <Table loading={this.state.tableLoading} bordered={true} scroll={{x:300}} columns={columns} dataSource={this.state.StaffRecord} footer={() => <p>总共 {this.state.StaffRecordLen} 条数据</p>}/>
                      </Card>
                    </Popover>
                  }
                </div>
              </div>
            }/>
            <Route path="/Setting/Employees/AddEmployees" component={AddEmployees}/>
            <Route path="/Setting/Employees/UpdateEmployees" component={UpdateEmployees}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const Employee = Form.create()(Employees);

export default Employee;
