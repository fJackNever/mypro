import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form,Card,Input, Row, Col, Button,Table,Tag,Select,Checkbox,notification,Progress  } from 'antd';
import StandardFormRow from 'components/StandardFormRow';
import styles from './../CarType/CarType.less';
import request from "../../../utils/request";

const FormItem = Form.Item;
const { Option } = Select;

const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};
class CheckIllegals extends PureComponent {
  state = {
    tableLoading:false,
    carType:0,
    belongCompany:0,
    ButtonLoading:false,

    simple:1,

    showAmount:false,
    percent:0,


    AlltableData:[],
  }
  componentDidMount() {
    this.getAccountInter();
    this.getTemplateInter();
  }
  //获取查违章点数
  getAccountInter = ()=>{
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
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    })
    let TotalDataForm = new FormData();
    TotalDataForm.append('key','diuber2017');
    TotalDataForm.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalDataForm.append('limit',9999);
    request('/api/web/vehicle/getVehicleWeizhang',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        this.setState({
          violationTotal:data.data.data.total
        })
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    })
  }
  //获取全部车型
  getTemplateInter = ()=>{
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('limit',9999);
    request('/api/web/vehicle/getTemplate',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        var templateList = data.data.data.rows.map((item) => {
          return <Option value={item.id}>{item.brand + '-' + item.model}</Option>;
        });
        this.setState({templateList})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
    request('/api/web/vehicle_violation/getBelongCompany',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){
        var BelongCom = data.data.data.map((item) => {
          return <Option value={item}>{item}</Option>;
        });
        this.setState({BelongCom})
      }else{
        openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
      }
    }).catch(()=>{})
  }
  //选择车型
  changeCarType = (value)=>{
    this.setState({
      carType:value
    })
  }
  //选择所属公司
  changebelongCompany = (value)=>{
    this.setState({
      belongCompany:value,
    })
  }
  //单辆查违章
  SimpleCheck = ()=>{
    this.setState({simple:1})
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({tableLoading:true,license_plate_no:values.license_plate_no})
        let AddCarData = new FormData();
        AddCarData.append('key','diuber2017');
        AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
        AddCarData.append('license_plate_no',values.license_plate_no);
        request('/api/web/vehicle_violation/getViolation',{
          method:'POST',
          body:AddCarData,
          credentials:'include',
        }).then((data)=>{
          this.setState({tableLoading:false,})
          if(data.data.code==1){
            this.getAccountInter();
            if(data.data.data.list.length>0){
              this.setState({
                tableData:data.data.data.list,
                tableDataLen:data.data.data.list.length,
              })
            }else{
              openNotificationWithIcon('success', '嘀友提醒', '恭喜你，该车辆无违章行为！')
            }
          }else if(data.data.code==20152){
            openNotificationWithIcon('warning', '嘀友提醒', data.data.data);
          }else{
            openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
          }
        }).catch((e)=>{})
      }
    })
  }
  componentWillUnmount = ()=>{

  }
  //批量查违章
  AllCheck = ()=>{
      this.setState({ButtonLoading:true, simple:2})
      let AddCarData = new FormData();
      AddCarData.append('key','diuber2017');
      AddCarData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
      AddCarData.append('vehicle_template',this.state.carType);
      AddCarData.append('company_belong',this.state.belongCompany);
      request('/api/web/vehicle_violation/getAllVehicle',{
        method:'POST',
        body:AddCarData,
        credentials:'include',
      }).then((data)=>{
        if(data.data.code==1){
          if(data.data.data.count>0){
            this.getAccountInter();
            this.setState({
              ButtonLoading:true,
              tableLoading:true,
              showAmount:true,
              remain_count:data.data.data.remain_count,
              count:data.data.data.count,
              redis_vid:data.data.data.redis_vid,
              redis_rid:data.data.data.redis_rid,
            })
            this.getViolationAllInter();
            this.getViolationResultForAppInter();
            window.checkPayInterval = setInterval(()=>this.getViolationAllInter(),300000);
          }
        }else{
          this.setState({ButtonLoading:false})
          openNotificationWithIcon('warning', '嘀友提醒', data.data.msg);
        }
      }).catch((e)=>{})
  }
  //触发查违章
  getViolationAllInter = ()=>{
    let submitData = new FormData();
    submitData.append('key','diuber2017');
    submitData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    submitData.append('redis_vid',this.state.redis_vid);
    submitData.append('redis_rid',this.state.redis_rid);
    request('/api/web/vehicle_violation/getViolationAll',{
      method:'POST',
      body:submitData,
      credentials:'include',
    }).then((data)=>{
      if(data.data.code==1){}}).catch((e)=>{})
  }
  //查违章
  getViolationResultForAppInter= ()=>{
   let FormSubmitData = new FormData();
   FormSubmitData.append('key','diuber2017');
   FormSubmitData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
   FormSubmitData.append('redis_vid',this.state.redis_vid);
   FormSubmitData.append('redis_rid',this.state.redis_rid);
   request('/api/web/vehicle_violation/getViolationResultForApp',{
     method:'POST',
     body:FormSubmitData,
     credentials:'include',
   }).then((data)=>{
     var illegalCar = this.state.AlltableData.concat(data.data.data.info);
     var percent = illegalCar.length/this.state.count*100;
     this.setState({AlltableData:illegalCar,AlltableDataLen:illegalCar.length,percent:percent,})
     if(data.data.code==1){
       this.setState({
         ButtonLoading:false,
         tableLoading:false
       })
       clearInterval(window.checkPayInterval);
     }else{
       this.getViolationResultForAppInter();
     }
   }).catch((e)=>{
   })
   }
  //查看违章车辆具体信息
  CheckCarList = ()=>{
    this.props.history.push('/Car/CarManager?CarType=12');
  }
  onTabChange = (key) => {
  }
  //违章查询记住
  checkonChange = () =>{

  }
  //查违章充值
  AddCISHU = ()=>{
    this.props.history.push('/Car/CarManager/AddCheckllsgal');
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
    const columns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',
        render: (text,record) =>
          <div>{this.state.license_plate_no}</div>},
      { title: '违章金额', dataIndex: 'price', key: 'price',},
      { title: '违章扣分', dataIndex: 'score', key: 'score',  },
      { title: '违章时间', dataIndex: 'time', key: 'time',  },
      { title: '违章地点', dataIndex: 'address', key: 'address',},
      { title: '违章内容', dataIndex: 'content', key: 'content',},
    ]
    const Allcolumns = [
      { title: '车牌号',  dataIndex: 'license_plate_no', key: 'license_plate_no',},
      { title: '违章总金额', dataIndex: 'totalprice', key: 'totalprice',},
      { title: '违章总扣分', dataIndex: 'totalscore', key: 'totalscore',  },
      { title: '违章总次数', dataIndex: 'count', key: 'count',  },
      { title: '备注', dataIndex: 'msg', key: 'msg',},
    ]
    return (
      <div>
        <div className={styles.standardList}>
          <Row>
            <Col onClick={this.CheckCarList} className={styles.RowCol} md={4} sm={12} xs={24} style={{background:'#fff',padding:'12px 0px'}}>
              <Info title="违章车辆" value={this.state.violationTotal} bordered={false}/>
            </Col>
          </Row>
        </div>
        <div style={{marginTop:24}}>
          <Card bordered={false}>
            <StandardFormRow title="查违章提醒">
              <p>系统只能查询到已存在于系统中的有正确发动机号以及车架号的车辆；</p>
              <p>不能查询“赣”、“湘”（除了"湘A"）、“桂”（除了"桂A"）以及“辽”（除了"辽B、辽E、辽F、辽K、辽L"）的车牌号。</p>
            </StandardFormRow>
            <StandardFormRow title="剩余查违章次数">
              <Tag style={{height:'32px',lineHeight:'32px',fontSize:'14px'}} color="#f50">{this.state.violation_count} 次</Tag>
              <Button onClick={this.AddCISHU} type="primary" ghost  style={{ marginLeft: '24px' }}>充值</Button>
            </StandardFormRow>
            <StandardFormRow title="单辆查询违章" block style={{ paddingBottom: 11 }}>
              <Form layout="inline">
                <Row>
                  <Col className={styles.RowCol} xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                      className={styles.RowColInput}
                      style={{width:'80%'}}
                    >
                      {getFieldDecorator('license_plate_no', {})(
                        <Input placeholder="请手动输入车牌号" />
                      )}
                    </FormItem>
                  </Col>
                  <Col className={styles.RowCol} xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                    >
                      <Button onClick={this.SimpleCheck} type="primary">查询</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </StandardFormRow>
            <StandardFormRow
              title="多条快速违章查询"
              grid
              last
            >
              <Form layout="inline">
                <Row>
                  <Col className={styles.RowCol} xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                      className={styles.RowColInput}
                      style={{width:'80%'}}
                    >
                      <Select value={this.state.carType} onChange={this.changeCarType} placeholder="请选择车辆所属车型">
                        <Option value={0}>全部车型</Option>
                        {this.state.templateList}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col className={styles.RowCol} xl={6} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                      className={styles.RowColInput}
                      style={{width:'80%'}}
                    >
                      <Select value={this.state.belongCompany} onChange={this.changebelongCompany} placeholder="请选择车辆所属公司">
                        <Option value={0}>全部所属公司</Option>
                        {this.state.BelongCom}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col className={styles.RowCol} xl={12} lg={12} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                    >
                      <Button loading={this.state.ButtonLoading} onClick={this.AllCheck} type="primary">查询</Button>
                    </FormItem>
                  </Col>
                  <Col className={styles.RowCol} xl={24} lg={12} md={12} sm={24} xs={24} style={{marginTop:'15px'}}>
                    <FormItem
                      {...formItemLayout}
                    >
                      <Checkbox onChange={this.checkonChange}>违章次数3次以上的车辆是否发送短信提醒(注：每发送一次短信会扣除一次违章查询次数)</Checkbox>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </StandardFormRow>
          </Card>
        </div>
        {
          this.state.showAmount &&
            <Card style={{marginTop:24,color:'red',}}>
              <StandardFormRow title="查询提示">
                <span style={{color:'rgba(0,0,0,0.85)'}}>您有<span style={{fontSize:'20px',fontWeight:'bold',color:'red'}}> {this.state.count} </span>辆车需要查违章，目前剩余查违章次数为<span style={{fontSize:'20px',fontWeight:'bold',color:'red'}}> {this.state.remain_count} </span>次</span>
              </StandardFormRow>
              <StandardFormRow title="查询进度" grid last>
                <Progress strokeWidth={30} style={{width:'80%'}} percent={this.state.percent} status="active" />
              </StandardFormRow>
            </Card>
        }
        <div style={{marginTop:24}}>
          <Card bordered={false} title="查询结果">
            {
              this.state.simple==1?
              <Table scroll={{x: 600}} loading={this.state.tableLoading} dataSource={this.state.tableData} columns={columns} footer={() => <p>总共 {this.state.tableDataLen} 条数据</p>}/>
                :
             <Table scroll={{x: 600}} loading={this.state.tableLoading} dataSource={this.state.AlltableData} columns={Allcolumns} footer={() => <p>总共 {this.state.AlltableDataLen} 条数据</p>}/>
            }
          </Card>
        </div>
      </div>
    );
  }
}
const CheckIllegal = Form.create()(CheckIllegals);

export default CheckIllegal;
