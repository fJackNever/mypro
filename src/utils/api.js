import request from './request'

//登陆
export const loginAction = (params) => {
  return request('/api/web/login/loginaction',{
    method:'POST',
    body:params,
    credentials: 'include',
  })
}

//退出登录1
export const logoutStart = (params) =>{
  return request('/api/diuber/login/logoutAction',{
    method:'POST',
    body:params,
    credentials: 'include',
  })
}

//退出登录2
export const logoutEnd = (params) =>{
  return request('/api/web/login/logoutaction',{
    method:'POST',
    body:params,
    credentials:'include'
  })
}


