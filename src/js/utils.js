/**
 *
 * 时间戳 to 时间
 */
let timestampToTime = timestamp => {
  console.log(timestamp)

  let date = new Date(timestamp)

  let Y = date.getFullYear() + '-'
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-'
  let D = date.getDate() + ' '
  let h = date.getHours() + ':'
  let m = date.getMinutes() + ':'
  let s = date.getSeconds()

  return Y + M + D + h + m + s
}
let downloadFile = (fileJson) => {
  let data = JSON.parse(fileJson)
  
  let url = data.fileUrl
  let name = data.fileName
  if (url.indexOf('.txt') != -1) {
    downloadFile_txt_getUrl(url,name)
    return
  }
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  document.body.appendChild(link)
  link.click()
}

//如果下载的文件是 txt，浏览器会自动打开而不是下载。
let downloadFile_txt_getUrl = (url,name) => {
  url = url.replace('http://webdisk-kum.oss-cn-shanghai.aliyuncs.com/', '/aly/')
  const xmlHttp = new XMLHttpRequest()
  xmlHttp.open('get', url, true)
  xmlHttp.send()
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState == 4) {
      //4表示执行完成
      if (xmlHttp.status == 200) {
        var aLink = document.createElement('a')
        aLink.download = name //设置a标签的下载名字
        aLink.style.display = 'none'
        // 字符内容转变成blob地址
        var blob = new Blob([xmlHttp.responseText])
        aLink.href = URL.createObjectURL(blob)
        // 触发点击
        document.body.appendChild(aLink)
        aLink.click()
        // 然后移除
        document.body.removeChild(aLink)
      }
    }
  }
}

export default {
  timestampToTime,
  downloadFile
}
