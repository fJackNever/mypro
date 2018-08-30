import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Tabs } from 'antd';
import classNames from 'classnames';
import LoginItem from './LoginItem';
import LoginTab from './LoginTab';
import LoginSubmit from './LoginSubmit';
import styles from './index.less';

@Form.create()
class Login extends Component {
  static defaultProps = {
    className: '',
    defaultActiveKey: '',
    onTabChange: () => {},
    onSubmit: () => {},
  };
  static propTypes = {
    className: PropTypes.string,
    defaultActiveKey: PropTypes.string,
    onTabChange: PropTypes.func,
    onSubmit: PropTypes.func,
  };
  static childContextTypes = {
    tabUtil: PropTypes.object,
    form: PropTypes.object,
    updateActive: PropTypes.func,
  };
  state = {
    type: this.props.defaultActiveKey,
    tabs: [],
    active: {},
  };
  getChildContext() {
    return {
      tabUtil: {
        addTab: (id) => {
          this.setState({
            tabs: [...this.state.tabs, id],
          });
        },
        removeTab: (id) => {
          this.setState({
            tabs: this.state.tabs.filter(currentId => currentId !== id),
          });
        },
      },
      form: this.props.form,
      updateActive: (activeItem) => {
        const { type, active } = this.state;
        if (active[type]) {
          active[type].push(activeItem);
        } else {
          active[type] = [activeItem];
        }
        this.setState({
          active,
        });
      },
    };
  }
  onSwitch = (type) => {
    this.setState({
      type,
    });
    this.props.onTabChange(type);
  }
  handleSubmit = (e) => {
    this.props.form.validateFields((err, values) => {
      console.log(values)
      if (!err) {
        this.setState({ submitting: true });
        let formData = new FormData();
        formData.append("admin_no", values.admin_no);
        formData.append("entity_id", values.entity_id);
        formData.append("password", values.password);
        request('/api/login/loginAction',{
          method:'POST',
          body:formData,
        }).then((data)=>{
          console.log(data)
        })
      }
    })
  }
  render() {
    const { className, children } = this.props;
    const { type, tabs } = this.state;
    const TabChildren = [];
    const otherChildren = [];
    React.Children.forEach(children, (item) => {
      if (!item) {
        return;
      }
      // eslint-disable-next-line
      if (item.type.__ANT_PRO_LOGIN_TAB) {
        TabChildren.push(item);
      } else {
        otherChildren.push(item);
      }
    });
    return (
      <div className={classNames(className, styles.login)}>
        <Form onSubmit={this.handleSubmit}>
          {
            tabs.length ? (
              <div>
                <Tabs
                  animated={false}
                  className={styles.tabs}
                  activeKey={type}
                  onChange={this.onSwitch}
                >
                  {TabChildren}
                </Tabs>
                {otherChildren}
              </div>
            ) : [...children]
          }
        </Form>
      </div>
    );
  }
}

Login.Tab = LoginTab;
Login.Submit = LoginSubmit;
Object.keys(LoginItem).forEach((item) => {
  Login[item] = LoginItem[item];
});

export default Login;
