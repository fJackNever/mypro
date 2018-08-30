import fetch from 'dva/fetch';

const checkStatus = (response) => {
    if(response.status >= 200 && response.status <= 300){
      return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

const parseJSON = (response)=>{
  return response.json()
}


export default (url,option)=>{
    return fetch(url,option)
      .then(checkStatus)
      .then(parseJSON)
      .then(data => ({data}))
      .catch(err => ({err}))
}
