<template>
  <a-layout id="components-layout-demo-top-side-2" class="content">
    <a-layout-header class="header">
      <div class="logo" style="height: 40px;background: rgba(0, 0, 0, 0);">
        <div class="logo_main">
          <a-icon type="ant-cloud" /><span>千度网盘</span>
        </div>
      </div>
      <a-menu
        theme="dark"
        mode="horizontal"
        v-model="navigationDef"
        :style="{ lineHeight: '64px' }"
        @click="menu_item_click"
        router
      >
        <a-menu-item key="/">网盘首页</a-menu-item>
        <a-menu-item key="/share">分享大厅</a-menu-item>
        <a-sub-menu key="/user">
          <span slot="title"> <a-icon type="user" />{{ username }} </span>
          <a-menu-item @click="updatePwdDialogVisible = true"
            >修改密码</a-menu-item
          >
          <a-menu-item @click="quit">注销账号</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          mode="inline"
          :default-selected-keys="navigationDef"
          :default-open-keys="['sub1']"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="sub1">
            <span slot="title"> <a-icon type="appstore" />我的文件 </span>
            <a-menu-item key="0" @click="updateFileType('file')"
              >文件</a-menu-item
            >
            <a-menu-item key="1" @click="updateFileType('image')"
              >图片</a-menu-item
            >
            <a-menu-item key="2" @click="updateFileType('text')"
              >文档</a-menu-item
            >
            <a-menu-item key="3" @click="updateFileType('mp4')"
              >视频</a-menu-item
            >
            <a-menu-item key="4" @click="updateFileType('mp3')"
              >音乐</a-menu-item
            >
          </a-sub-menu>
          <a-menu-item key="5" @click="updateFileType('隐私空间')">
            <a-icon type="safety-certificate" />隐私空间
          </a-menu-item>
          <a-menu-item key="myShare" @click="menu_item_click">
            <a-icon type="branches" />我的分享
          </a-menu-item>
          <a-menu-item key="7" @click="updateFileType('回收站')">
            <a-icon type="delete" />回收站
          </a-menu-item>
          <a-menu-item key="8">
            <a-tooltip placement="top">
              <template slot="title">
                <span
                  >已使用：{{ spaceSize }}MB,剩余空间：{{ levelSpace }}MB</span
                >
              </template>
              <a-progress
                :percent="progress"
                :status="progress_status"
                :showInfo="false"
              />
            </a-tooltip>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-layout-content
          :style="{
            background: '#fff',
            padding: '24px',
            margin: 0,
            minHeight: '280px'
          }"
        >
          <router-view
            :fileType="fileType"
            :uploadList="uploadList"
            :isRecycle="isRecycle"
            v-on:changeUploadList="changeUploadList"
          />
          <div class="side_button_group">
            <a-button
              icon="plus-circle"
              class="side_button_item"
              @click="updateShareDiaglogVis(true)"
            /><br />
            <a-popover placement="leftTop" :visible="ongoingVisible">
              <template slot="content">
                <ongoing :uploadList="uploadList" />
              </template>
              <template slot="title">
                <span>现在上传的任务</span>
              </template>
              <a-button icon="info-circle" class="side_button_item" /><br />
            </a-popover>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
    <a-modal
      v-model="downloadShareFileDialogVisible"
      title="获得别人分享的文件"
      @ok="downloadShareFile"
      @cancel="downloadShare_cancel"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
    >
      <a-spin tip="正在下载中..." :spinning="share_loading">
        <div class="share_text">
          <span>文件秘钥：</span>
          <a-input
            class="share_input"
            v-model="shareKey_"
            style="margin-top: 10px;"
            placeholder="其他用户给你的秘钥"
          >
            <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
          </a-input>
          <div class="share_private_pwd">
            <span>提取密码：</span>
            <a-input
              class="share_input_pwd"
              v-model="sharePwd"
              style="margin-top: 10px;"
              placeholder="没有则留空"
            />
          </div>
        </div>
      </a-spin>
    </a-modal>
    <a-modal
      v-model="verifyPwdDialogVisible"
      title="验证密码"
      @ok="verifyPwd"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
    >
      <a-spin tip="正在验证中..." :spinning="verifyPwd_loading">
        <p>为了文件安全，隐私空间需要重新验证密码。</p>
        <a-input-password
          v-model="verifyPwd_input"
          placeholder="输入你的密码"
          style="margin-top: 10px;"
        ></a-input-password>
      </a-spin>
    </a-modal>
    <a-modal
      v-model="updatePwdDialogVisible"
      title="修改密码"
      @ok="updatePwd"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
    >
      <a-spin tip="正在验证中..." :spinning="update_Pwd_loading">
        <p>请输入当前密码与新密码。</p>
        <a-input-password
          style="margin-bottom: 11px;"
          v-model="update_old_Pwd_input"
          placeholder="输入原密码"
        ></a-input-password>
        <a-input-password
          class="input"
          v-model="update_new_Pwd_input"
          placeholder="输入新密码"
        ></a-input-password>
      </a-spin>
    </a-modal>
  </a-layout>
</template>
<script>
import files from './files'
import req from '../js/request'
import utils from '../js/utils'
import ongoing from './popover/ongoing'
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
import Axios from 'axios'
export default {
  components: {
    files: files,
    ongoing: ongoing
  },
  data() {
    return {
      isRecycle: false,
      collapsed: false,
      username: 'temp',
      fileType: 'file',
      progress: 0,
      spaceSize: 0,
      levelSpace: 0,
      shareKey_: '',
      sharePwd: '',
      uploadList: [],
      progress_status: 'active',
      update_old_Pwd_input: '',
      update_new_Pwd_input: '',
      share_loading: false,
      verifyPwd_loading: false,
      update_Pwd_loading: false,
      updatePwdDialogVisible: false,
      navigationDef: [],
      navigationDef_: [],
      verifyPwd_input: '',
      verifyPwdDialogVisible: false,
      ongoingVisible: false
    }
  },
  computed: {
    ...mapState(['shareKey', 'downloadShareFileDialogVisible'])
  },
  watch: {
    downloadShareFileDialogVisible: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.shareKey_ = this.shareKey
        }
      }
    }
  },
  mounted() {
    this.username = localStorage.getItem('username')
    this.navigationDef = [this.$route.path]
    this.getUserInfo()
  },

  methods: {
    ...mapMutations(['updateShareDiaglogVis', 'updateShareKey']),
    quit() {
      localStorage.removeItem('token')
      this.$message.success('您已成功注销。')
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 1000)
    },
    getUserInfo() {
      let _this = this
      req.getUserInfo().then(res => {
        let data = JSON.parse(res.data.data)
        _this.spaceSize = Math.round((data.spaceSize / 1048576) * 100) / 100
        _this.levelSpace = Math.round((data.levelSpace / 1048576) * 100) / 100
        _this.progress = (_this.spaceSize / _this.levelSpace) * 100
        if (_this.progress >= 80) {
          _this.progress_status = 'exception'
        }
      })
    },
    updateFileType(val) {
      if (this.$route.path != '/') {
        this.$router.push('/')
      } else {
        this.isRecycle = false
        if (val == '隐私空间') {
          this.verifyPwdDialogVisible = true
          return
        } else if (val == '回收站') {
          this.isRecycle = true
        }
        this.fileType = val
      }
    },
    menu_item_click(e) {
      let key = e.key
      if (key == 'user-menu-item_0') {
        return
      }
      this.$router.push(key)
    },
    downloadShareFile() {
      this.share_loading = true
      let pwd = this.sharePwd.length < 4 ? '0' : this.sharePwd
      req.getShare(this.shareKey_, pwd).then(res => {
        let fileJson = res.data.data
        if (res.data.code == 0) {
          utils.downloadFile(fileJson)
          this.$message.success('下载成功！')
        } else {
          this.$message.error(res.data.data)
        }

        this.share_loading = false
      })
    },
    downloadShare_cancel() {
      this.updateShareDiaglogVis(false)
      this.updateShareKey('')
    },
    verifyPwd() {
      this.verifyPwd_loading = true
      let data = {
        username: this.username,
        password: this.verifyPwd_input
      }
      Axios.post('/api/login', data).then(res => {
        this.verifyPwd_loading = false
        if (res.data.code == 0) {
          this.$message.success('验证成功!')
          this.fileType = '隐私空间'
          this.verifyPwd_input = ''
          this.verifyPwdDialogVisible = false
        } else {
          this.$message.error('密码错误，请重试！')
          this.verifyPwdDialogVisible = true
        }
      })
    },
    updatePwd() {
      this.update_Pwd_loading = true
      let pwd = this.update_old_Pwd_input
      let newPwd = this.update_new_Pwd_input
      if (pwd == newPwd) {
        this.$message.error('狗东西，两次用的一样的！')
      } else {
        req.upDataPwd(pwd, newPwd).then(res => {
          let code = res.data.code
          if (code == 0) {
            this.$message.success('修改成功，请重新登录！')
            localStorage.removeItem('token')
            setTimeout(() => {
              window.location.href = 'login.html'
            }, 1000)
          } else {
            this.$message.error(res.data.data)
          }
          this.update_Pwd_loading = false
        })
      }
    },
    changeUploadList(res) {
      if (res == '0') {
        this.getUserInfo() //更新空间大小
        this.uploadList = []
        this.ongoingVisible = false
        return
      }
      this.ongoingVisible = true
      this.uploadList.push(res)
    }
  }
}
</script>

<style>
#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
.content {
  height: 100vh;
}

.side_button_group {
  position: absolute;
  right: 0px;
  top: 35vh;
}
.side_button_item {
  width: 40px;
  height: 40px;
}
.logo {
  line-height: 31px;
  height: 40px;
  color: #fff;
  text-align: center;
  font-size: 1rem;
  position: relative;
  left: -35px;
}
.anticon-ant-cloud {
  font-size: 2.1rem;
  position: relative;
  left: -5px;
  top: 6px;
}
.logo_main {
  position: relative;
  top: -3px;
  left: 3px;
}
.anticon-lock,
.anticon-unlock {
  /* color: #00abfa; */
  font-size: 1.4rem;
}
</style>
