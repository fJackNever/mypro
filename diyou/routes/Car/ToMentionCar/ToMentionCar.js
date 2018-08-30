import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Form,Card,Input, Row, Col, Button,Table,Tag,notification } from 'antd';
import StandardFormRow from 'components/StandardFormRow';

import styles from './../../Sale/Sale.less';
import request from "../../../utils/request";

const FormItem = Form.Item;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class toMentionCar extends PureComponent {
  state = {
    ListTitle:'待提车辆',
    visible: false,
    CarLoading:true
  }
  componentDidMount() {
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('limit',9999);
    request('/api/web/vehicle/getVehicleTiche',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          TotalCarNum:data.data.data.total,
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
    this.getVehicleTicheInter('');
  }
  //查看待提车辆列表
  getVehicleTicheInter =(search)=>{
    let DeleteData = new FormData();
    DeleteData.append('key','diuber2017');
    DeleteData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    DeleteData.append('search',search);
    DeleteData.append('limit',9999);
    request('/api/web/vehicle/getVehicleTiche',{
      method:'POST',
      body:DeleteData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          TotalCar:data.data.data.total,
          TotalCarDataRecord:data.data.data.rows,
          CarLoading:false
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //查看某条列表
  ShowListItem = (e) =>{
    this.props.history.push('/Money/MoneyManager/ShowRent?entity_id='+e)
  };
  //关键字查询
  SearchInput = (e) =>{
    if(e.target.value==''){
      this.setState({
        search: '',
        CarLoading:true,
      })
      this.getVehicleTicheInter('');
    }else{
    }
  }
  //快捷查询
  SearchSubmit =()=> {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          search: $("input[name='search']").val(),
          CarLoading:true,
        })
        this.getVehicleTicheInter($("input[name='search']").val());
      }
    })
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
      {key:'SaleTopData01',title:'待提车辆',value:this.state.TotalCarNum,bordered:false},
    ];
    const columns = [
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
          <Tag onClick={this.ShowListItem.bind(this,record.entity_id)} className={styles.TagBtn} color="green">查看</Tag>
        ,
      },
    ];

    return (
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
            <StandardFormRow
              title="快速查询"
              grid
              last
            >
              <Form layout="inline">
                <Row>
                  <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                    <Input style={{width:'80%'}} name="search" onChange={this.SearchInput} placeholder="输入关键字" defaultValue={this.state.search}/>
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
            <Table rowKey="id" bordered={true} scroll={{x:600}} columns={columns} loading={this.state.CarLoading} dataSource={this.state.TotalCarDataRecord}  footer={() => <p>总共 {this.state.TotalCar} 条数据</p>}/>
          </Card>
        </div>
      </div>
    );
  }
}

const ToMentionCar = Form.create()(toMentionCar);

export default ToMentionCar;
