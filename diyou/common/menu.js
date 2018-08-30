import { isUrl } from '../utils/utils';

const FreeVersion = [
  {
    name: '工作台',
    path: 'workbench/workplace',
  },{
    name: '车辆管理',
    path: 'Car/CarManager',
  },{
    name: '销售管理',
    path: 'Sale/SaleManager',
  }, {
    name: '财务管理',
    path: 'Money/MoneyManager',
  }, {
    name: '客户管理',
    path: 'Customer',
  }, {
    name: '配置管理',
    path: 'Setting',
    children: [{
      name: '公司配置',
      path: '/Workplace',
      component:(import('../routes/Setting/Setting')),
    },{
      name: '个人中心',
      path: '/PersonalCenter',
      component:(import('../routes/Setting/PersonalCenter')),
    },{
      name: '车型管理',
      path: '/CarType',
      component:(import('../routes/Car/CarType/CarType')),
    },{
      name: '员工管理',
      path: '/Employees',
      component:(import('../routes/Employees/Employees')),
    },{
      name: '合作伙伴',
      path: '/Partner',
      component:(import('../routes/Partner/Partner')),
    },]
  }
];
const AdminMenuData = [
  {
  name: '工作台',
  path: 'workbench/workplace',
},{
  name: '车辆管理',
  path: 'Car/CarManager',
},{
  name: '销售管理',
  path: 'Sale/SaleManager',
}, {
  name: '财务管理',
  path: 'Money/MoneyManager',
}, {
  name: '客户管理',
  path: 'Customer',
}, {
  name: '配置管理',
  path: 'Setting',
  children: [{
    name: '公司配置',
    path: '/Workplace',
    component:(import('../routes/Setting/Setting')),
  },{
    name: '个人中心',
    path: '/PersonalCenter',
    component:(import('../routes/Setting/PersonalCenter')),
  },{
    name: '车型管理',
    path: '/CarType',
    component:(import('../routes/Car/CarType/CarType')),
  },{
    name: '员工管理',
    path: '/Employees',
    component:(import('../routes/Employees/Employees')),
  },{
    name: '导入导出',
    path: '/ImportExport',
    component:(import('../routes/ImportExport/ImportExport')),
  },{
    name: '合作伙伴',
    path: '/Partner',
    component:(import('../routes/Partner/Partner')),
  },]
}];
const CarMenuData = [{
  name: '车管工作台',
  path: 'Car/workplace',
}, {
  name: '车辆管理',
  path: 'Car/CarManager',
},{
  name: '车型管理',
  path: 'Setting/CarType',
},{
  name: '客户管理',
  path: 'Customer',
}, {
  name: '合作伙伴',
  path: 'Setting/Partner',
}, {
  name: '导入导出',
  path: 'Setting/ImportExport',
}];
const XLCMenuData = [{
  name: '工作台',
  path: 'Driller/workplace',
}, {
  name: '车辆管理',
  path: 'Car/CarManager',
},{
  name: '客户管理',
  path: 'Customer',
}];
const MoneyMenuData = [{
  name: '财务工作台',
  path: 'Money/workplace',
},{
  name: '财务管理',
  path: 'Money/MoneyManager',
}, {
  name: '车辆管理',
  path: 'Car/CarManager',
},{
  name: '客户管理',
  path: 'Customer',
}];
const SaleMenuData = [{
  name: '销售工作台',
  path: 'Sale/workplace',
}, {
  name: '销售管理',
  path: 'Sale/SaleManager',
},{
  name: '车辆管理',
  path: 'Car/CarManager',
},{
  name: '客户管理',
  path: 'Customer',
}];
const  ComMenuData = [
  {
    name: '保险专员工作台',
    path: 'workbench/InsuranceCommissioner'
  },
];
const WXCarMenuData =  [
  {
    name: '修理厂',
    path: 'Garage/workplace'
  },
];
const MarketingVersion =  [
  {
    name: '销售工作台',
    path: 'Sale/workplace',
  },{
    name: '销售管理',
    path: 'Sale/SaleManager',
  },{
    name: '员工管理',
    path: 'Setting/Employees',
    component:(import('../routes/Employees/Employees')),
  },{
    name: '小程序配置',
    path: 'Setting/Workplace',
    component:(import('../routes/Setting/Setting')),
  },
];
function children(data, parentPath = '/', parentAuthority){
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    return result;
  });
}
function formatter(data, parentPath = '/', parentAuthority) {
let permision = window.localStorage.getItem("permision");
let com_type = window.localStorage.getItem("com_type");
var Menudata=[];
if(com_type=='智享版'){
  if(permision==0 || permision==1){
    Menudata = AdminMenuData;
  }else if(permision==3){
    Menudata = CarMenuData;
  }else if(permision==4){
    Menudata = XLCMenuData;
  }else if(permision==5){
    Menudata = MoneyMenuData;
  }else if(permision==6){
    Menudata = WXCarMenuData;
  }else if(permision==7){
    Menudata = SaleMenuData;
  }else if(permision==8){
    Menudata = ComMenuData;
  }
}else if(com_type=='营销版'){
  Menudata = MarketingVersion;
}else if(com_type=='免费版'){
  if(permision==0 || permision==1){
    Menudata = FreeVersion;
  }else if(permision==3){
    Menudata = CarMenuData;
  }else if(permision==4){
    Menudata = XLCMenuData;
  }else if(permision==5){
    Menudata = MoneyMenuData;
  }else if(permision==6){
    Menudata = WXCarMenuData;
  }else if(permision==7){
    Menudata = SaleMenuData;
  }else if(permision==8){
    Menudata = ComMenuData;
  }
}

return Menudata.map((item) => {
  let { path } = item;
  if (!isUrl(path)) {
    path = parentPath + item.path;
  }
  const result = {
    ...item,
    path,
    authority: item.authority || parentAuthority,
  };
  if (item.children) {
    result.children = children(item.children, `${parentPath}${item.path}/`, item.authority);
  }
  return result;
});
}

export const getMenuData = () => formatter()

