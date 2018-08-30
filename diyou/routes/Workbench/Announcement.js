import React, { PureComponent } from 'react';
import moment from 'moment';
import $ from 'jquery';
import { connect } from 'dva';
import utils from '../../utils/utils';
import request from '../../utils/request';
import { Link } from 'dva/router';
import { Form,Avatar,notification,Timeline,List,Card} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './../Workbench/Workplace.less';


const openNotificationWithIcon = (type,title,desc) => {
  notification[type]({
    message: title,
    description: desc,
  });
};

class announcement extends PureComponent {
  state = {
    TodayTime:'2018年3月8号',
  }
  componentDidMount() {
    const TodayTime = new Date();
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    this.setState({
      TodayTime:TodayTime.getFullYear()+'年'+(TodayTime.getMonth()+1)+'月'+TodayTime.getDate()+'日',
      weekday:week[TodayTime.getDay()],
      company_name:window.localStorage.getItem("company_name")
    })
    this.getSystemNoticeInter();
  }

  getSystemNoticeInter = ()=>{
    let SSGFIFormData = new FormData();
    SSGFIFormData.append('key','diuber2017');
    SSGFIFormData.append("secret_key", '09e8b1b88e615f0d9650886977af33e9');
    SSGFIFormData.append('offset',0);
    SSGFIFormData.append('limit',9999);
    request('/api/web/admin_setting/getSystemNotice',{
      method:'POST',
      body:SSGFIFormData,
      credentials:'include',
    }).then((data)=>{
      console.log(data);
        if(data.data.code==1){
          this.setState({
            noticeList:data.data.data.rows
          })
        }
    }).catch(()=>{})
  }
  render() {
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );
    return (
      <PageHeaderLayout
        content={pageHeaderContent}
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
          dataSource={this.state.noticeList}
          renderItem={item => (
            <List.Item>
              <Card hoverable={true}>
                <p style={{fontSize:'15px',color:'#515151',}}>{item.content}</p>
                <div style={{fontSize:'14px',color:'rgba(0,0,0,0.35)',textAlign:'right'}}>发布时间：{item.create_time}</div>
              </Card>
            </List.Item>
          )}
        />
      </PageHeaderLayout>
    );
  }
}
const Announcement = Form.create()(announcement);

export default Announcement;
