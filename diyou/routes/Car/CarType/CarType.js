import React, { PureComponent } from 'react';
import request from "../../../utils/request";
import $ from 'jquery';
import { connect } from 'dva';
import {Link,} from 'react-router-dom';
import { Form,Card,Input, Row, Col, Button,Table,Modal,message,notification,Tag,Popconfirm,Alert,Popover } from 'antd';
import StandardFormRow from 'components/StandardFormRow';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './../../Sale/Sale.less';

const FormItem = Form.Item;

const EditableCell = ({ editable, value, onChange }) => (
  <div>
    {editable
      ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
      : value
    }
  </div>
);

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};


class BasicList extends PureComponent {
  state = {
    ListTitle:'全部车型',
    visible: false,
    RefundLoading:false,
    isNew:0,
    showpopver:0,
  }
  constructor(props) {
    super(props);
    this.columns = [
      { title: '车型编号', dataIndex: 'id', key: 'id',},
      { title: '品牌',  dataIndex: 'brand', key: 'brand',render: (text, record) => this.renderColumns(text, record, 'brand'),},
      { title: '车型', dataIndex: 'model', key: 'model',render: (text, record) => this.renderColumns(text, record, 'model'),},
      { title: '车辆数', dataIndex: 'vehicle_count', key: 'vehicle_count',},
      {
        title: '操作',
        dataIndex: 'operation',
        width:'13%',
        render: (text, record) => {
          const {editable} = record;
          return (
            <div>
            {
              editable ?
                <span className={styles.TagBtnDiv}>
                  <Tag className={styles.TagBtn} onClick={() => this.save(record.id)} color="blue">保存</Tag>
                  <Popconfirm title="确定取消?" onConfirm={() => this.cancel(record.id)}>
                    <Tag className={styles.TagBtn}>取消</Tag>
                  </Popconfirm>
                </span> :
                <div style={{display:'flex',flexFlow:'row'}}>
                  <Tag loading={this.state.deleteLoading} onClick={this.DeleteCarType.bind(this,record.id)} className={styles.TagBtn} color="magenta" >删除</Tag>
                  <Tag className={styles.TagBtn} onClick={() => this.edit(record.id)} style={{marginLeft:'10px'}} color="green">编辑</Tag>
                </div>
            }
            </div>
          )
        }
}];
}
  componentDidMount() {
    if(window.location.href.split('is_new=')[1]){
      let HostFormData = new FormData();
      HostFormData.append('key','diuber2017');
      HostFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      request('/api/web/admin_setting/checkNewCompany',{
        method:'POST',
        body:HostFormData,
        credentials: 'include',
      }).then((data)=> {
        if(data.data.code==1){
          if(data.data.data.template==0){
            this.setState({ visible: true, isNew:1,})
          }else{
            $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.65);'></div>");
            this.setState({ visible: false, isNew:2,})
          }
        }
      }).catch(()=>{})
    }
    this.setState({
      RefundLoading:true
    })
    this.GetTemplateInter('');
  }
  componentWillUnmount = ()=>{
    $("#Showed").remove();
  }
  //查看所有车型接口
  GetTemplateInter = (search) =>{
    this.setState({RefundLoading:true})
    let GetTemplateData = new FormData();
    GetTemplateData.append('key','diuber2017');
    GetTemplateData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    GetTemplateData.append("search", search);
    GetTemplateData.append("limit", 9999);
    GetTemplateData.append("type", 1);
    request('/api/web/vehicle/getTemplate',{
      method:'POST',
      body:GetTemplateData,
      credentials: 'include',
    }).then((data)=> {
      console.log(data)
      this.setState({RefundLoading:false})
      if (data.data.code === 1) {
        this.setState({
          TemplateRecord:data.data.data.rows,
          TemplateRecordLen:data.data.data.rows.length,
          AllTemplate:data.data.data.total,
        });
      } else {
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //添加车型对话框
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleCancel = (e) => {
    if(this.state.isNew!=1){
      this.setState({
        visible: false,
        loading:false
      });
    }
  }
  handleOk = (e) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          visible: true,
          loading: true
        });
        let AddCarType = new FormData();
        AddCarType.append('key','diuber2017');
        AddCarType.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarType.append('brand',values.brand);
        AddCarType.append('model',values.model);
        request('/api/web/vehicle/addTemplate',{
          method:'POST',
          body:AddCarType,
          credentials:'include'
        }).then((data)=>{
          if(data.data.code==1){
            this.setState({
              visible: false,
              loading: false
            });
            message.success('添加车型成功');
            if(window.location.href.split('is_new=')[1]){
              $('body').append("<div id='Showed' style='position: fixed;overflow: auto;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background:rgba(0, 0, 0, 0.65);'></div>");
              this.setState({isNew:2})
            }
            this.props.form.setFields({
              brand : {value:''},
              model : {value:''},
            })

            this.GetTemplateInter('');
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch(()=>{})
      }
    })
  }
  //修改车型
  renderColumns(text, record, column) {
    return (
      <EditableCell
        editable={record.editable}
        value={text}
        onChange={value => this.handleChange(value, record.id, column)}
      />
    );
  }
  handleChange(value, key, column) {
    const newData = [...this.state.TemplateRecord];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({ data: newData });
    }
  }
  edit(key) {
    const newData = [...this.state.TemplateRecord];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData });
    }
  }
  save(key) {
    const newData = [...this.state.TemplateRecord];
    const target = newData.filter(item => key === item.id)[0];
    let UpDatas = new FormData();
    UpDatas.append('key','diuber2017');
    UpDatas.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    UpDatas.append("id",key);
    UpDatas.append("model",target.model);
    UpDatas.append("brand",target.brand);
    request('/api/web/vehicle/editTemplate',{
      method:'POST',
      body:UpDatas,
      credentials:'include'
    }).then((data)=>{
      if(data.data.code==1){
        if (target) {
          delete target.editable;
          this.setState({ TemplateRecord: newData });
        }
        message.success('修改车型成功');
      }else{
        openNotificationWithIcon('error', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  cancel(key) {
    const newData = [...this.state.TemplateRecord];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      delete target.editable;
      this.setState({ TemplateRecord: newData });
    }
  }
  //快速查询
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: ''
      })
      this.GetTemplateInter('');
    }else{
    }
  }
  QuickQuary = () =>{
    this.setState({
      search:$("input[name='search']").val()
    })
      if($("input[name='search']").val()){
        this.GetTemplateInter($("input[name='search']").val());
      }else{
        this.GetTemplateInter('');
      }
  }

  //删除车型
  DeleteCarType = (target)=>{
    let deleteCarTypedata = new FormData();
    deleteCarTypedata.append('key','diuber2017');
    deleteCarTypedata.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    deleteCarTypedata.append('id',target);
    request('/api/web/vehicle/delTemplate',{
      method:'POST',
      body:deleteCarTypedata,
      credentials:'include'
    }).then((data)=>{
      if(data.data.code==1){
        message.success('成功删除车型！');
        this.GetTemplateInter('');
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 24 },
      },
    };
    const ShowModelLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );
    const SaleTopData = [
      {key:'SaleTopData01',title:'全部车型',value:this.state.AllTemplate,bordered:false},
    ];
    return (
        <PageHeaderLayout>
          <div>
                <div className={styles.standardList}>
                  <Row>
                    {
                      SaleTopData.map(item => (
                          <Col className={styles.RowCol} md={4} sm={12} xs={24} style={{background:'#fff',padding:'12px 0px'}}>
                            <Info title={item.title} value={item.value} bordered={item.bordered}/>
                          </Col>
                        )
                      )}
                  </Row>
                </div>
                <div style={{marginTop:24}}>
                  <Card bordered={false}>
                    <StandardFormRow title="快速添加入口" block style={{ paddingBottom: 11 }}>
                      <Button onClick={this.showModal} type="primary">新增车型</Button>
                      <Modal
                        maskClosable={false}
                        title="添加车型"
                        confirmLoading={this.state.loading}
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        okText="确认添加"
                        cancelText="取消"
                      >
                        {this.state.isNew == 1 &&
                        <Alert message="嘀友提醒：添加车辆之前必须添加车型" style={{marginBottom: 24}} type="info" showIcon />
                        }
                        <Form layout="inline">
                          <FormItem
                            {...ShowModelLayout}
                            label="所属品牌"
                            className={styles.QuickFormItem}
                          >
                            {getFieldDecorator('brand', {
                              rules: [
                                { required: true, message: '请输入所属品牌!' },
                              ],
                            })(
                              <Input placeholder="请输入所属品牌" />
                            )}
                          </FormItem>
                          <FormItem
                            {...ShowModelLayout}
                            label="所属车型"
                            className={styles.QuickFormItem}
                            style={{marginTop:'15px'}}
                          >
                            {getFieldDecorator('model', {
                              rules: [
                                { required: true, message: '请输入所属车型!' },
                              ],
                            })(
                              <Input placeholder="请输入所属车型" />
                            )}
                          </FormItem>
                        </Form>
                      </Modal>
                    </StandardFormRow>
                    <StandardFormRow
                      title="快速查询"
                      grid
                      last
                    >
                      <Form layout="inline">
                        <Row>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <Input style={{width:'80%'}} name="search" onChange={this.SearchInput}  placeholder="输入关键字" defaultValue={this.state.search}/>
                          </Col>
                          <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                            <FormItem
                              className={styles.QuickFormItem}
                              {...formItemLayout}
                            >
                              <Button onClick={()=>this.QuickQuary()} type="primary">搜索</Button>
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                    </StandardFormRow>
                  </Card>
                </div>
                <div style={{marginTop:24}}>
                  {
                    this.state.isNew == 2 &&
                   <Popover content={<div style={{padding:'24px 0px'}}>这里就是刚才新增第一种车型。现在就可以新增第一辆车了。立即 <Link style={{color:'#1890ff'}} to="/Car/CarManager/NewCar?is_new=1">新增车辆</Link></div>} visible={true}>
                      <Card bordered={false} title={this.state.ListTitle} style={{position:'relative',zIndex:'1010',}}>
                        <Table loading={this.state.RefundLoading} bordered={true} columns={this.columns} scroll={{x: 600}}
                               dataSource={this.state.TemplateRecord}
                               footer={() => <text>总共 {this.state.TemplateRecordLen} 条数据</text>}/>
                      </Card>
                    </Popover>
                  }
                  {
                    this.state.isNew !=2 &&
                  <Card bordered={false} title={this.state.ListTitle}>
                    <Table loading={this.state.RefundLoading} bordered={true} columns={this.columns} scroll={{x: 600}}
                           dataSource={this.state.TemplateRecord}
                           footer={() => <text>总共 {this.state.TemplateRecordLen} 条数据</text>}/>
                  </Card>
                  }
                </div>
              </div>
        </PageHeaderLayout>
    );
  }
}

const BasicLists = Form.create()(BasicList);

export default BasicLists;
