import Axios from 'axios'

const req = Axios.create({
  baseURL: '/api',
  timeout: -1
})

//创造一个拦截器，向每次请求头中加入 token
req.interceptors.request.use(config => {
    config.headers = {
      'content-Type': 'application/json;charset=utf-8',
      token: localStorage.getItem('token')
    }
  return config
})

//如果后端返回 5000 代表 token 已失效
req.interceptors.response.use(res => {
  if (res.data.code == 5000) {
    window.location.href = 'login.html'
  }
  return res
})

let getTokenVerity = token => {
  return req.get(`/getTokenVerity?token=${token}`)
}
let getUserInfo = () => {
  return req.get('/getUserInfo')
}

let upDataPwd = (password,newPassword) => {
  let data = {
    password:password,
    newPassword:newPassword
  }
  return req.post('/upDataPwd',data)
}

let getFileList = path => {
  let data = {
    path: path
  }
  return req.post('/oss/getFileList', data)
}
let getDirList = path => {
  let data = {
    path: path
  }
  return req.post('/oss/getDirList', data)
}

let deleteFile = target => {
  let data = {
    files: target
  }
  return req.post('/oss/deleteFile', data)
}
let moveFile = (paths, target) => {
  let data = {
    files: paths,
    target: target
  }
  return req.post('/oss/moveFile', data)
}

let mkDir = path => {
  let data = {
    path: path
  }
  return req.post('/oss/mkDir', data)
}

let selectFileList = name => {
  let data = {
    name: name
  }
  return req.post('/oss/selectFileList', data)
}

let downloadFile = path => {
  let data = {
    path: path
  }
  return req.post('/oss/downloadFile', data)
}

let getFileFormatList = format => {
  let data = {
    format: format
  }
  return req.post('/oss/getFileFormatList', data)
}

let shareFile = (filePath, shareType) => {
  let pwd = shareType == 'private' ? '0' : '1'
  let data = {
    filePath: filePath,
    pwd: pwd
  }
  return req.post('/share/addShare', data)
}

let getShare = (number, pwd) => {
  let data = {
    number:number,
    pwd:pwd
  }
  return req.post('/share/getShare',data)
}

let getShareList = () => {
 return req.get('/share/getShareList')
}
let getShareMeList = () => {
  return req.get('/share/getShareMeList')
}

export default {
  getTokenVerity, //验证 token 是否真实.
  getUserInfo, //获取用户信息「容量啊，啥啥啥的」
  upDataPwd, //修改密码
  getFileList, //显示文件列表
  getDirList, //只显示文件夹列表
  getFileFormatList, //显示指定格式的文件
  selectFileList, //搜索文件
  downloadFile, //下载文件
  shareFile, //分享文件
  getShare, //获得分享文件(下载)
  getShareList, //获取当前所有分享列表
  getShareMeList,//获取当前用户的分享列表
  deleteFile, //删除文件
  moveFile, //移动文件
  mkDir //创建文件夹
}
