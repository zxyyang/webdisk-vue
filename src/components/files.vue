<template>
  <div class="file_main">
    <div class="file_head">
      <div class="file_head_left" style="float:left;">
        <a-input-search
          placeholder="搜索文件"
          style="width: 200px"
          v-model="searchFileText"
          @search="searchFile"
        />
        <a-upload
          class="upload_but"
          name="file"
          :multiple="true"
          :data="uploadData"
          action="/api/oss/upload"
          :headers="headers"
          @change="uploadFileHandle"
          :beforeUpload="uploadBeforeUpload"
          :showUploadList="false"
        >
          <a-button type="primary"> <a-icon type="upload" />上传 </a-button>
        </a-upload>
        <a-button
          @click="downloadFile"
          :disabled="isDirDisable || multiDirDisable"
        >
          <a-icon type="download" />下载
        </a-button>
        <a-button @click="mkDirDialogVisible_fun">
          <a-icon type="folder-add" />新建文件夹
        </a-button>
        <a-button @click="deleteFile"> <a-icon type="delete" />删除 </a-button>
        <a-button @click="moveFileDialogVisible_fun" :disabled="isDirDisable">
          <a-icon type="block" />移动
        </a-button>
        <a-button
          @click="shareFile"
          :disabled="isDirDisable || multiDirDisable"
        >
          <a-icon type="branches" />分享
        </a-button>
        <a-button @click="deleteRecycle" v-if="isRecycle">
          <a-icon type="delete" />清空回收站
        </a-button>
      </div>
      <div class="file_head_right" style="margin-left: 60vw;"></div>
      <br /><br />
      <a-divider />
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item v-for="(item, index) in path" :key="index">
          <a-button
            class="breadcrumb_but"
            type="link"
            @click="clickBreadcrumb(index)"
            >{{ item }}</a-button
          >
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div class="table">
      <a-table
        class="filesTable"
        :data-source="filesList"
        :pagination="false"
        :loading="skeleton_loading"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
      >
        <a-table-column key="name" title="文件名称" data-index="name">
          <template slot-scope="name">
            <span>
              <a-icon class="file_ico" :type="checkType(name)" />
              <a-button
                type="link"
                @click="
                  if (name.substr(name.length - 1) == '/') {
                    clickDir(name)
                  } else {
                    clickFile(name)
                  }
                "
                >{{ name }}</a-button
              >
            </span>
          </template>
        </a-table-column>
        <a-table-column key="size" title="文件大小" data-index="size">
          <template slot-scope="size">
            {{ updataFileSize(size) }}
          </template>
        </a-table-column>
        <a-table-column
          key="lastModified"
          title="修改时间"
          data-index="lastModified"
        >
          <template slot-scope="lastModified">
            <span>{{ timestampToTime(lastModified) }}</span>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <el-dialog
      title="选择目标文件夹"
      :visible.sync="moveFileDialogVisible"
      width="40%"
    >
      <a-page-header
        style="border: 1px solid rgb(235, 237, 240)"
        :bordered="true"
        @back="moveClickUp"
        sub-title="返回上一层"
      />
      <a-table :data-source="dirsList" :showHeader="false" :pagination="false">
        <a-table-column key="name" title="" data-index="name">
          <template slot-scope="name">
            <span>
              <a-icon class="file_ico" :type="checkDir_Ico(name)" />
              <a-button type="link" @click="moveClickDir(name)">{{
                name
              }}</a-button>
            </span>
          </template>
        </a-table-column>
      </a-table>
      <a-button type="primary" class="moveFile_but" @click="moveClickOk"
        >确定</a-button
      >
      <a-button class="moveFile_but" @click="moveFileDialogVisible = false"
        >取消</a-button
      >
    </el-dialog>
    <a-modal
      v-model="mkdirDialogVisible"
      title="新建文件夹"
      @ok="mkdir()"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
    >
      <p>文件夹会建立在当前目录下</p>
      <a-input
        class="mkdir_input"
        v-model="dirName"
        placeholder="输入文件夹名称"
      ></a-input>
    </a-modal>
    <a-modal
      v-model="shareFileDialogVisible"
      title="分享文件"
      @ok="shareFileDialogVisible = flase"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
    >
      <a-spin tip="正在生成分享秘钥..." :spinning="share_loading">
        <span>分享类型：</span>
        <a-radio-group
          default-value="private"
          button-style="solid"
          @change="shareTypeChange"
        >
          <a-radio-button value="private">
            私密
          </a-radio-button>
          <a-radio-button value="public">
            公开
          </a-radio-button>
        </a-radio-group>
        <br />
        <div class="share_text">
          <span>文件秘钥：</span>
          <a-input
            class="share_input"
            v-model="shareKey"
            placeholder="秘钥"
            style="margin-top: 10px;"
          >
            <a-tooltip slot="suffix" title="将这个发送给你的好友~">
              <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
            </a-tooltip>
          </a-input>
          <div class="share_private_pwd" v-if="shareIsPrivate">
            <span>提取密码：</span>
            <a-input
              class="share_input_pwd"
              v-model="sharePwd"
              placeholder="提取码"
              style="margin-top: 10px;"
            />
          </div>
        </div>
      </a-spin>
    </a-modal>
    <el-dialog
      title="预览"
      class="preView_diaglog"
      :visible.sync="preViewVisible"
      width="50%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <a-textarea
        :disabled="true"
        v-if="preViewType == 'txt'"
        v-model="preViewText"
        :auto-size="{ minRows: 18 }"
        style="color: #000;background-color: #fff;height: 60vh;"
      />
      <img :src="previewSrc" v-if="preViewType == 'img'" />
    </el-dialog>
  </div>
</template>
<script>
import req from '../js/request'
import utils from '../js/utils'
import Axios from 'axios'
export default {
  name: 'files',
  props: ['fileType', 'uploadList', 'isRecycle'],
  created() {},
  data() {
    return {
      preViewVisible: false,
      previewSrc: '',
      preViewType: 'txt',
      preViewText: '',
      searchFileText: '',
      isDirDisable: false,
      multiDirDisable: false,
      skeleton_loading: false,
      share_loading: false,
      mkdirDialogVisible: false,
      moveFileDialogVisible: false,
      shareFileDialogVisible: false,
      shareIsPrivate: true,
      path: ['根目录'],
      filesList: [],
      dirsList: [],
      selectedRowKeys: [],
      userId: localStorage.getItem('userId'),
      currentPath: '',
      moveCurrentPath: '',
      dirName: '',
      headers: {
        token: localStorage.getItem('token')
      },
      uploadData: {
        path: ''
      },
      shareType: 'private',
      shareKey: '',
      sharePwd: ''
    }
  },
  watch: {
    path: {
      handler(newValue, oldValue) {
        if (newValue[newValue.length - 1] == '搜索到的文件') {
          return
        }
        let currentPath = ''
        for (let i = 1; i < newValue.length; i++) {
          currentPath += newValue[i] + '/'
        }
        //此处理应使用 computed 去写..
        console.log(currentPath)

        this.uploadData.path = '/' + currentPath
        this.currentPath = '/' + currentPath
        this.getFileList(this.currentPath)
        this.selectedRowKeys = []
      }
    },
    selectedRowKeys: {
      handler(newValue, oldValue) {
        /**
         * 如果文件大于 1，那么将无法正常下载文件。
         * 如果目标文件是文件夹，那么将无法分享、移动、下载。
         */
        if (newValue.length > 1) {
          this.multiDirDisable = true
        } else {
          this.multiDirDisable = false
        }
        let _this = this
        let noDir = true
        console.log(newValue)

        newValue.forEach(element => {
          let name = _this.filesList[element].name
          if (name.charAt(name.length - 1) == '/') {
            this.isDirDisable = true
            noDir = false
          }
        })
        if (noDir) {
          this.isDirDisable = false
        }
      }
    },
    moveCurrentPath(val) {
      this.getDirList(val)
    },
    fileType(val) {
      let lastDir = this.path[this.path.length - 1]
      if (lastDir == '回收站' || lastDir == '隐私空间') {
        this.path.splice(this.path.length - 1, 1)
      }
      if (val == '回收站' || val == '隐私空间') {
        this.path.push(val)
        return
      } else {
        this.fileType = val
        if (val != 'file') {
          this.getFileFormatList(val)
          return
        }
      }
      this.filesList = []
      this.getFileList(this.currentPath)
    }
  },
  mounted() {
    this.currentPath = '/'
    this.uploadData.path = '/'
    // 获取用户根目录内容
    this.getFileList(this.currentPath)
  },
  methods: {
    async getFileList(path) {
      this.skeleton_loading = true

      req.getFileList(path).then(res => {
        let data = res.data

        this.setFileList(data)
        this.skeleton_loading = false
      })
    },
    getFileFormatList(format) {
      req.getFileFormatList(format).then(res => {
        this.setFileList(res.data)
      })
    },
    setFileList(data) {
      this.filesList = []

      if (data.length == 0) {
        return
      }
      let index = this.userId.length + 12
      for (let i = 1; i < this.path.length; i++) {
        index += this.path[i].length + 1
      }
      let file_arr = []
      data.forEach(element => {
        if (element.size == 0) {
          return
        }
        element.name = element.name.substr(index)
        //为了保证文件列表中文件夹在文件上面，优先将「文件夹」push进文件列表。
        if (element.name.charAt(element.name.length - 1) == '/') {
          this.filesList.push(element)
          return
        }
        file_arr.push(element)
      })
      this.filesList = this.filesList.concat(file_arr)
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    timestampToTime(timestamp) {
      if (timestamp == null) {
        return ''
      }
      let date = new Date(timestamp)
      let Y = date.getFullYear() + '-'
      let M =
        (date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = date.getHours() + ':'
      let m = date.getMinutes()
      return Y + M + D + h + m
    },
    clickBreadcrumb(index) {
      if (this.path[index] == '搜索到的文件') {
        return
      }
      this.path.splice(index + 1, this.path.length + 1)
    },
    checkType(name) {
      if (name.charAt(name.length - 1) == '/') {
        return 'folder'
      }
      switch (name.substr(name.indexOf('.') + 1)) {
        case 'txt':
          return 'file-text'
          break
        case 'pdf':
          return 'file-pdf'
          break
        case 'png':
          return 'file-image'
          break
        case 'jpg':
          return 'file-image'
          break
        case 'jpeg':
          return 'file-image'
          break
        case 'gif':
          return 'file-image'
          break

        default:
          return 'file'
          break
      }
    },
    clickFile(name) {
      //当点击的是文件时
      let type = name.substr(name.indexOf('.') + 1)
      this.previewSrc = ''
      if (
        type == 'jpg' ||
        type == 'png' ||
        type == 'bmp' ||
        type == 'gif' ||
        type == 'jpeg'
      ) {
        this.preViewType = 'img'
      } else if (type == 'txt') {
        this.preViewType = 'txt'
      } else {
        //如果不是上述格式，则不允许预览
        return
      }
      let path = this.currentPath + name
      req.downloadFile(path).then(res => {
        let data = JSON.parse(res.data.data)
        let url = data.fileUrl
        if (this.preViewType == 'img') {
          this.previewSrc = url
        } else {
          url = url.substr(47)
          Axios.get(url).then(ress => {
            this.preViewText = ress.data
          })
        }

        this.preViewVisible = true
      })
    },
    clickDir(name) {
      //当点击的是文件夹时
      this.path.push(name.substr(0, name.length - 1))
      //清空当前选中的文件。
      this.selectedRowKeys = []
    },
    uploadBeforeUpload(file) {
      console.log(file.name)
      let name = file.name
      if (name.length > 13) {
        name = name.substr(0, 10) + '...'
      }
      this.$emit('changeUploadList', name)
      this.$message.info('正在上传中..')
    },
    uploadFileHandle(info) {
      let status = info.file.status
      if (status == 'done' || status == 'error') {
        if (status === 'done') {
          this.$message.success('上传成功！')
          //更新当前地址文件
          this.getFileList(this.currentPath)
        } else if (status === 'error') {
          this.$message.warning('上传失败！文件大于50M或空间不足！')
        }
        this.$emit('changeUploadList', '0')
      }
    },
    deleteFile() {
      if (this.selectedRowKeys.length == 0) {
        return
      }
      this.$message.info('正在删除中..')
      let taget = []
      let _this = this
      let skip = false
      for (let i = 0; i < this.selectedRowKeys.length; i++) {
        let temp = this.filesList[this.selectedRowKeys[i]].name
        if (temp.substr(temp.length - 1) == '/') {
          skip = true
        }
        taget.push(this.currentPath + temp)
      }
      if (skip) {
        this.$confirm({
          title: '你选择了文件夹，确定删除吗？',
          content: '删除将导致目录下所有文件被删除。',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            _this.deleteFile_fun(taget)
            return
          },
          onCancel() {
            return
          }
        })
      } else {
        this.deleteFile_fun(taget)
      }
    },
    //deleteFile 方法需要处理相关事件，所以另外编写了 deleteFile_fun。
    deleteFile_fun(taget) {
      let _this = this
      req.deleteFile(taget).then(res => {
        if (res.data.code == 0) {
          _this.$message.success('删除成功！')
          //更新文件列表，也可以直接去删除 filelist.
          _this.getFileList(this.currentPath)
          //更新文件选中列表.
          _this.selectedRowKeys = []
          _this.$emit('changeUploadList', '0')
          return
        }
        _this.$message.warning('未知错误。请刷新重试..')
      })
    },
    deleteRecycle() {
      this.deleteFile_fun(['/回收站/'])
    },
    mkDirDialogVisible_fun() {
      this.mkdirDialogVisible = true
    },
    mkdir() {
      let path = this.currentPath + this.dirName + '/'

      req.mkDir(path).then(res => {
        if (res.data.code == 0) {
          this.$message.success('文件夹创建成功！')
          this.dirName = ''
          this.mkdirDialogVisible = false
        }
        this.getFileList(this.currentPath)
      })
    },
    getDirList() {
      this.dirsList = []
      let path = this.moveCurrentPath
      req.getDirList(path).then(res => {
        let data = res.data
        let index = this.userId.length + 12
        data.forEach(element => {
          let name = element.name
          let temp = name.substr(0, name.length - 1)
          console.log(temp)

          element.name = name.substr(temp.lastIndexOf('/') + 1, name.length)
          console.log(element.name)

          this.dirsList.push(element)
        })
      })
    },
    moveFileDialogVisible_fun() {
      if (this.selectedRowKeys.length == 0) {
        return
      }
      this.moveFileDialogVisible = true
      this.moveCurrentPath = '/'
    },
    moveClickUp() {
      if (this.moveCurrentPath.length == this.userId.length + 1) {
        return
      }
      let temp = this.moveCurrentPath
      this.moveCurrentPath =
        temp.substring(0, temp.substring(0, temp.length - 1).lastIndexOf('/')) +
        '/'
    },
    moveClickDir(name) {
      this.moveCurrentPath += name
    },
    moveClickOk() {
      let target = []
      for (let i = 0; i < this.selectedRowKeys.length; i++) {
        let temp = this.filesList[this.selectedRowKeys[i]].name
        target.push(this.currentPath + temp)
      }
      req.moveFile(target, this.moveCurrentPath).then(res => {
        let data = res.data
        if (data.code == 0) {
          this.$message.success('文件移动成功！')
        }
        this.moveFileDialogVisible = false
        this.getFileList(this.currentPath)
      })
    },
    searchFile() {
      let name = this.searchFileText
      if (name.trim().length == 0) {
        this.$message.warning('搜索内容不得为空！')
        return
      }
      req.selectFileList(name).then(res => {
        this.setFileList(res.data)
        this.path.splice(1, this.path.length)
        this.path.push('搜索到的文件')
      })
    },
    downloadFile() {
      let len = this.selectedRowKeys.length
      if (len == 0 || len > 1) {
        return
      }
      let path = this.currentPath + this.filesList[this.selectedRowKeys[0]].name

      req.downloadFile(path).then(res => {
        let fileJson = res.data.data
        this.downloadFile_fun(fileJson)
      })
    },
    downloadFile_fun(fileJson) {
      utils.downloadFile(fileJson)
    },
    shareTypeChange(e) {
      this.shareType = e.target.value
      if (this.shareType == 'private') {
        this.shareIsPrivate = true
      } else {
        this.shareIsPrivate = false
      }
      this.shareFile_fun()
    },
    shareFile() {
      if (this.selectedRowKeys.length == 0) {
        return
      }
      this.shareFileDialogVisible = true
      this.shareFile_fun()
    },
    shareFile_fun() {
      this.share_loading = true
      let _this = this
      let filePath =
        this.currentPath + this.filesList[this.selectedRowKeys[0]].name
      req.shareFile(filePath, this.shareType).then(res => {
        let data = JSON.parse(res.data.data)

        this.shareKey = data.number
        this.sharePwd = data.pwd
        let str = '文件秘钥为：' + this.shareKey
        if (data.pwd != null) {
          this.sharePwd = data.pwd
          str += ',提取码为：' + this.sharePwd
        }
        this.copystr(str)
        _this.$message.success('已成功复制到剪辑版!')
        this.share_loading = false
      })
    },
    copystr(str) {
      var oInput = document.createElement('input')
      oInput.value = str
      document.body.appendChild(oInput)
      oInput.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      oInput.className = 'oInput'
      oInput.style.display = 'none'
    },
    checkDir_Ico(name) {
      if (name == '隐私空间/') {
        return 'lock'
      }
      return 'folder'
    },
    updataFileSize(size) {
      if (size == null) {
        return '-'
      }
      let size_ = '0'
      let type = 'B'
      if (size < 1000) {
        size_ = size
      } else if (size > 1000 && size < 1000000) {
        size_ = size / 1000
        type = 'K'
      } else {
        size_ = size / 1000000
        type = 'M'
      }
      return Math.round(size_ * 10) / 10 + type
    }
  }
}
</script>

<style>
.filesTable {
  margin-top: 15px;
}
.breadcrumb_but {
  margin: 0px;
  padding: 0px;
}
.ant-btn-link {
  color: black;
}
.upload_but {
  margin-left: 10px;
  /* float: left; */
  margin-right: 5px;
}
.file_ico {
  position: relative;
  top: 3px;
  font-size: 1.5rem;
}

.moveFile_but {
  margin-top: 15px;
  margin-right: 5px;
  width: 150px;
}
.ant-page-header {
  border: 0px;
}
.ant-btn-link {
  color: black;
}
.ant-divider-horizontal {
  margin: 10px 0px;
}
.share_input {
  margin-top: 10px;
  max-width: 200px;
}
.share_input_pwd {
  margin-top: 10px;
  max-width: 100px;
}
.ant-table-body {
  max-height: 70vh;
  overflow: auto;
}

.preView_diaglog .el-dialog__body {
  padding: 0px;
}
.preView_diaglog .el-dialog__body iframe {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #606266;
}
.preView_diaglog .el-dialog__body img {
  width: 100%;
}
</style>
