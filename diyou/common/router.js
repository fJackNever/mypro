import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
    ),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props => createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/workbench/workplace': {
      name:'工作台',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Workbench/Workplace')),
    },
    '/Driller/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Driller/workplace')),
    },
    '/Announcement': {
      name: '系统公告',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Workbench/Announcement')),
    },
    '/Garage/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Garage/Garage')),
    },
    '/Garage/CheckRecord': {
      name: '查看记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Garage/CheckRecord/CheckRecord')),
    },
    '/Garage/NewKeepCarNotes': {
      name: '保养记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Garage/NewKeepCarNotes/NewKeepCarNotes')),
    },
    '/Garage/NewMaintainCarNotes': {
      name: '维修记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Garage/NewMaintainCarNotes/NewMaintainCarNotes')),
    },
    '/Garage/NewAccidentCarNotes': {
      name: '出险记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Garage/NewAccidentCarNotes/NewAccidentCarNotes')),
    },
    '/BrokenQuery/workplace': {
      name: '查失信',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/BrokenQuery/BrokenQuery')),
    },
    '/BrokenQuery/workplace/AddBroken': {
      name: '添加失信',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/BrokenQuery/AddBroken/AddBroken')),
    },
    '/Sale/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/workplace/workplace')),
    },
    '/Sale/SaleManager': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/Sale')),
    },
    '/Sale/SaleManager/ShowBookingOrder': {
      name: '预订订单详情',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/ShowBookingOrder/ShowBookingOrder')),
    },
    '/Sale/SaleManager/ShowSignNotes': {
      name: '待签约记录详情',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/ShowSignNotes/ShowSignNotes')),
    },
    '/Sale/SaleManager/ShowCompanyRent': {
      name: '求租记录详情',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/ShowCompanyRent/ShowCompanyRent')),
    },
    '/Sale/SaleManager/UnderCar': {
      name: '下架车辆',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/UnderCar/UnderCar')),
    },
    '/Sale/SaleManager/NewRentalCar': {
      name: '新增上架租车车辆',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/NewRentalCar/NewRentalCar')),
    },
    '/Sale/SaleManager/NewSaleCar': {
      name: '新增上架卖车车辆',
        component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/NewSaleCar/NewSaleCar')),
    },
    '/Sale/SaleManager/NewSigning': {
      name: '新增签约记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Sale/NewSigning/NewSigning')),
    },
    '/Car/workplace': {
      name: '车管工作台',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/workplace/workplace')),
    },
    '/Car/CarManager': {
      name: '车辆管理',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/Car')),
    },
    '/Setting/CarType': {
      name: '车型管理',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/CarType/CarType')),
    },
    '/Car/CarManager/ShowCar': {
      name: '查看车辆',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/ShowCar/ShowCar')),
    },
    '/Car/CarManager/BackCar': {
      name: '退出运营',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/BackCar/BackCar')),
    },
    '/Car/CarManager/RefundCar': {
      name: '退车',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/RefundCar/RefundCar')),
    },
    '/Car/CarManager/ToMentionCar': {
      name: '待提车辆',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/ToMentionCar/ToMentionCar')),
    },
    '/Car/CarManager/NewCar': {
      name: '车辆信息',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewCar/NewCar')),
    },
    '/Car/CarManager/NewCarNotes': {
      name: '租车记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewCarNotes/NewCarNotes')),
    },
    '/Car/CarManager/NewBorrowCarNotes': {
      name: '借车记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewBorrowCarNotes/NewBorrowCarNotes')),
    },
    '/Car/CarManager/NewCheckCarNotes': {
      name: '验车记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewCheckCarNotes/NewCheckCarNotes')),
    },
    '/Car/CarManager/NewSignCarNotes': {
      name: '签约记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewSignCarNotes/NewSignCarNotes')),
    },
    '/Car/CarManager/NewExtensionCarNotes': {
      name: '延期记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewExtensionCarNotes/NewExtensionCarNotes')),
    },
    '/Car/CarManager/NewMaintainCarNotes': {
      name: '维修记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewMaintainCarNotes/NewMaintainCarNotes')),
    },
    '/Car/CarManager/NewKeepCarNotes': {
      name: '保养记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewKeepCarNotes/NewKeepCarNotes')),
    },
    '/Car/CarManager/NewSurveryCarNotes': {
      name: '年检记录',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewSurveryCarNotes/NewSurveryCarNotes')),
    },
    '/Car/CarManager/NewAccidentCarNotes': {
      name: '出险记录',
        component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewAccidentCarNotes/NewAccidentCarNotes')),
    },
    '/Car/CarManager/NewPolicyCarNotes': {
      name: '保单记录',
        component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/NewPolicyCarNotes/NewPolicyCarNotes')),
    },
    '/Car/CarManager/CheckIllegal': {
      name: '查违章',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/CheckIllegal/CheckIllegal')),
    },
    '/Car/CarManager/AddIllegal': {
      name: '手动添加违章',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/CheckIllegal/AddIllegal/AddIllegal')),
    },
    '/Car/CarManager/AddCheckllsgal': {
      name: '查违章充值',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Car/AddCheckllsgal/AddCheckllsgal')),
    },
    '/ShowContract': {
      name: '查看合同',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/ShowContract/ShowContract')),
    },




    '/Setting/Workplace': {
      name:'公司配置',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Setting/Setting')),
    },
    '/Setting/PersonalCenter': {
      name:'个人中心',
      component: dynamicWrapper(app, [], () => import('../routes/Setting/PersonalCenter')),
    },
    '/Setting/Renewal': {
      name:'充值续费',
      component: dynamicWrapper(app, [], () => import('../routes/Setting/Renewal')),
    },
    '/Money/MoneyManager': {
      component: dynamicWrapper(app, [], () => import('../routes/Money/Money')),
    },
    '/Money/workplace': {
      component: dynamicWrapper(app, [], () => import('../routes/Money/workplace/workplace')),
    },
    '/Money/MoneyManager/ShowRent': {
      name:'查看详情',
      component: dynamicWrapper(app, [], () => import('../routes/Money/ShowRent/ShowRent')),
    },
    '/Money/MoneyManager/ShowDeposit': {
      name: '查看详情',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Money/ShowDeposit/ShowDeposit')),
    },
    '/Money/MoneyManager/ShowPayment': {
      name: '查看详情',
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () => import('../routes/Money/ShowPayment/ShowPayment')),
    },
    '/Money/MoneyManager/AddPayRent': {
      name:'新增交租金记录',
      component: dynamicWrapper(app, [], () => import('../routes/Money/AddPayRent/AddPayRent')),
    },
    '/Money/MoneyManager/AddContractPayment': {
      name:'新增签约收款记录',
      component: dynamicWrapper(app, [], () => import('../routes/Money/AddContractPayment/AddContractPayment')),
    },
    '/Money/MoneyManager/AddOtherPayment': {
      name:'新增其他收款记录',
      component: dynamicWrapper(app, [], () => import('../routes/Money/AddOtherPayment/AddOtherPayment')),
    },
    '/Money/MoneyManager/AddPayment': {
      name:'新增付款记录',
      component: dynamicWrapper(app, [], () => import('../routes/Money/AddPayment/AddPayment')),
    },
    '/Money/MoneyManager/AddRefundDeposit': {
      name:'新增退押金记录',
      component: dynamicWrapper(app, [], () => import('../routes/Money/AddRefundDeposit/AddRefundDeposit')),
    },
    '/Setting/Employees': {
      name:'员工管理',
      component: dynamicWrapper(app, [], () => import('../routes/Employees/Employees')),
    },
    '/Setting/Employees/AddEmployees': {
      name:'新增员工',
      component: dynamicWrapper(app, [], () => import('../routes/Employees/AddEmployees/AddEmployees')),
    },
    '/Setting/Employees/UpdateEmployees': {
      name:'更新员工信息',
        component: dynamicWrapper(app, [], () => import('../routes/Employees/UpdateEmployees/UpdateEmployees')),
    },
    '/Customer': {
      name:'客户管理',
      component: dynamicWrapper(app, [], () => import('../routes/Customer/Customer')),
    },
    '/Customer/AddCustomer': {
      name:'新增客户',
      component: dynamicWrapper(app, [], () => import('../routes/Customer/AddCustomer/AddCustomer')),
    },
    '/Customer/ShowCustomer': {
      name:'查看客户信息',
      component: dynamicWrapper(app, [], () => import('../routes/Customer/AddCustomer/AddCustomer')),
    },
    '/Customer/AddCustomerRecord': {
      name:'新增客户交流记录',
      component: dynamicWrapper(app, [], () => import('../routes/Customer/AddCustomerRecord/AddCustomerRecord')),
    },
    '/Setting/Partner':{
      name:'合作伙伴',
      component: dynamicWrapper(app, [], () => import('../routes/Partner/Partner')),
    },
    '/Setting/Partner/AddPartner':{
      name:'合作伙伴',
      component: dynamicWrapper(app, [], () => import('../routes/Partner/AddPartner/AddPartner')),
    },
    '/Setting/ImportExport':{
      name:'导入导出',
      component: dynamicWrapper(app, [], () => import('../routes/ImportExport/ImportExport')),
    },
    '/workbench/InsuranceCommissioner':{
      name:'保险专员工作台',
      component: dynamicWrapper(app, [], () => import('../routes/Workbench/InsuranceCommissioner/InsuranceCommissioner')),
    },
    '/workbench/InsuranceCommissioner/CheckReocrd':{
      name:'查看保单记录',
      component: dynamicWrapper(app, [], () => import('../routes/Workbench/InsuranceCommissioner/CheckReocrd/CheckReocrd')),
    },
    '/workbench/InsuranceCommissioner/NewPolicyCarNotes':{
      name:'保单记录',
      component: dynamicWrapper(app, [], () => import('../routes/Workbench/InsuranceCommissioner/NewPolicyCarNotes/NewPolicyCarNotes')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    },

    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/Login/Login')),
    },
    '/user/forgetPwd': {
      component: dynamicWrapper(app, [], () => import('../routes/User/ForgetPwd')),
    },
    '/user/forgetEntityId': {
      component: dynamicWrapper(app, [], () => import('../routes/User/ForgetEntityId')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach((path) => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
    };
    routerData[path] = router;
  });
  return routerData;
};
