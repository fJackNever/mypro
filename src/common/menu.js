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
    path: 'Customer/CusManager',
  }
];

// let permision = window.localStorage.getItem("permision");
// let com_type = window.localStorage.getItem("com_type");
// let Menudata=[];
// if(com_type=='智享版'){
//   if(permision==0 || permision==1){
//     Menudata = AdminMenuData;
//   }else if(permision==3){
//     Menudata = CarMenuData;
//   }else if(permision==4){
//     Menudata = XLCMenuData;
//   }else if(permision==5){
//     Menudata = MoneyMenuData;
//   }else if(permision==6){
//     Menudata = WXCarMenuData;
//   }else if(permision==7){
//     Menudata = SaleMenuData;
//   }else if(permision==8){
//     Menudata = ComMenuData;
//   }
// }else if(com_type=='营销版'){
//   Menudata = MarketingVersion;
// }else if(com_type=='免费版'){
//   if(permision==0 || permision==1){
//     Menudata = FreeVersion;
//   }else if(permision==3){
//     Menudata = CarMenuData;
//   }else if(permision==4){
//     Menudata = XLCMenuData;
//   }else if(permision==5){
//     Menudata = MoneyMenuData;
//   }else if(permision==6){
//     Menudata = WXCarMenuData;
//   }else if(permision==7){
//     Menudata = SaleMenuData;
//   }else if(permision==8){
//     Menudata = ComMenuData;
//   }
// }

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
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
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}


export const getMenuData = () => formatter(FreeVersion);
