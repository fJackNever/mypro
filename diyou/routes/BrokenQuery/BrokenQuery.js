import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import {HashRouter as Router, Route, Link,Switch  } from 'react-router-dom';
import { Form,Card,Input ,Select,Row, Col, Button,Table,Tag,notification } from 'antd';
import { ChartCard, Field,yuan} from 'components/Charts';
import StandardFormRow from 'components/StandardFormRow';
import { Trend} from 'components/Trend';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import styles from './../Sale/Sale.less';
import AddBroken from "../BrokenQuery/AddBroken/AddBroken";
import request from "../../utils/request";

const { Option } = Select;
const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class brokenQuery extends PureComponent {
  state = {
    QueryLoading:false,
    tableLoading:false,
  }
  componentWillReceiveProps (){
    this.componentDidMount();
  }
  componentDidMount() {
    this.getTotalListInter();
  }
  //获取查失信次数
  getTotalListInter =()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    request('/api/web/admin_setting/getAccount',{
    method:'POST',
    body:TotalData,
    credentials:'include',
  }).then((data)=>{
    if(data.data.code==1){
      this.setState({
        violation_count:data.data.data.violation_count
      })
    }else if(data.data.code==90001){
      this.props.history.push('/user/login')
    }else{
      openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
    }
  }).catch(()=>{})
  }
  //查询失信
  SearchSubmit = ()=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({  QueryLoading:true,tableLoading:true,})
        let AddFormData = new FormData();
        AddFormData.append('key', 'diuber2017');
        AddFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddFormData.append('name', $("input[name='name']").val());
        AddFormData.append('idno', $("input[name='idno']").val());
        request('/api/web/admin_setting/getShixin', {
          method: 'POST',
          body: AddFormData,
          credentials: 'include',
        }).then((data) => {
          console.log(data)
          this.setState({  QueryLoading:false,tableLoading:false,})
          if(data.data.code==1){
            this.setState({
              blackList:data.data.data.black_list,
              shixinList:data.data.data.shixin_list,
            })
            openNotificationWithIcon('success', '嘀友提醒', data.data.data.info);
          }else if(data.data.code==90001){
            this.props.history.push('/user/login')
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //添加失信
  AddBroken = ()=>{
    this.props.history.push('/BrokenQuery/workplace/AddBroken');
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
      {key:'SaleTopData01',title:'剩余查失信次数',value:this.state.violation_count,bordered:true},
    ];
    const SXColumns =  [
      { title: '姓名', dataIndex: 'iname', key: 'iname',width:80},
      { title: '性别',dataIndex: 'sex', key: 'sex',width:50,
        render: (text,record) =>
          <div>
            {record.sex==1 && <span>男</span>}
            {record.sex==0 && <span>女</span>}
          </div>
      },
      { title: '年龄', dataIndex: 'age', key: 'age', width:50,},
      { title: '身份证号', dataIndex: 'cardnum', key: 'cardnum',},
      { title: '地区', dataIndex: 'areaName', key: 'areaName',},
      { title: '立案时间', dataIndex: 'regDate', key: 'regDate',},
      { title: '法院名称', dataIndex: 'courtName', key: 'courtName',},
      { title: '案件代码', dataIndex: 'gistCid', key: 'gistCid',},
      { title: '公布时间', dataIndex: 'publishDate', key: 'publishDate',},
      { title: '执行', dataIndex: 'performance', key: 'performance',},
      { title: '依据单位', dataIndex: 'gistUnit', key: 'gistUnit',},
      { title: '失信代码', dataIndex: 'epCode', key: 'epCode',},
      { title: '责任', dataIndex: 'duty', key: 'duty',},
      { title: '备注', dataIndex: 'disreputTypeName', key: 'disreputTypeName', },
    ];
    const HZZLColumns = [
      { title: '姓名', dataIndex: 'name', key: 'name',},
      { title: '身份证号',dataIndex: 'idno', key: 'idno',},
      { title: '描述', dataIndex: 'comment', key: 'comment', },
      { title: '公布时间', dataIndex: 'create_time', key: 'create_time', },];
    return (
      <Router>
        <PageHeaderLayout>
          <Switch>
            <Route exact path="/BrokenQuery/workplace" component={
              () => <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col className={styles.RowCol} md={4} sm={12} xs={24}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button onClick={()=>this.AddBroken()} type="primary" className={styles.QuickButton}>添加黑名单</Button>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Input style={{width:'80%'}} name="name"  placeholder="输入查询人姓名" />
                          </Col>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Input style={{width:'80%'}}  name="idno"  placeholder="输入查询人身份证号" />
                          </Col>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Button loading={this.state.QueryLoading} onClick={this.SearchSubmit}  type="primary">查询</Button>
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                    </StandardFormRow>
                  </Card>
                </div>
                <Card style={{marginTop:24}} title="失信查询结果" >
                    <Table scroll={{x: 600}} loading={this.state.tableLoading} bordered={true} dataSource={this.state.shixinList} columns={SXColumns} footer={() => <p>总共 {this.state.PartnerRecordLen} 条数据</p>}/>
                </Card>

                <Card style={{marginTop:24}} title="嘀友管车共享黑名单提示" >
                  <Table scroll={{x: 600}} loading={this.state.tableLoading} bordered={true} dataSource={this.state.blackList} columns={HZZLColumns} footer={() => <p>总共 {this.state.PartnerRecordLen} 条数据</p>}/>
                </Card>
              </div>
            }/>
            <Route path="/BrokenQuery/workplace/AddBroken" component={AddBroken}/>
          </Switch>
        </PageHeaderLayout>
      </Router>
    );
  }
}

const BrokenQuery = Form.create()(brokenQuery);

export default BrokenQuery;
