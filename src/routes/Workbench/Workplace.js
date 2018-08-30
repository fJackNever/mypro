import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Col, Card, List, Avatar } from 'antd';

import { Radar } from 'components/Charts';
import EditableLinkGroup from 'components/EditableLinkGroup';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Workplace.less';


export default class Workplace extends PureComponent {

  state={
    company_name:'',
    TodayTime:'',
    weekday:'',
    signal:'',
    rents:'',
    payRents:'',
    outRents:''
  }

  componentDidMount(){
    if("AbortController" in window){
      window.controller = new AbortController();
      this.setState({
        signal:controller.signal
      })
    }
  }

  componentWillUnmount(){
    if("AbortController" in window){
      window.controller.abort()
    }
  }

  render() {

    const { company_name, TodayTime, weekday, rents, payRents, outRents } = this.state

    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>欢迎您，{this.state.company_name}管理员！</div>
          <div>今天是 ：{this.state.TodayTime} {this.state.weekday}</div>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>租出率</p>
          <p>{rents}<span> %</span></p>
        </div>
        <div className={styles.statItem}>
          <p>交租金率</p>
          <p>{payRents}<span> %</span></p>
        </div>
        <div className={styles.statItem}>
          <p>出险率</p>
          <p>{outRents}<span> %</span></p>
        </div>
      </div>
    );

    return (
      <PageHeaderLayout content={pageHeaderContent} extraContent={extraContent}>
        111
      </PageHeaderLayout>
    );
  }
}


