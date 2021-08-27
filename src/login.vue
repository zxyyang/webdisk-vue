<template>
  <div id="app">
    <a-layout-content>
      <a-spin tip="Loading..." :spinning="spinning">
        <div :class="contentClass">
          <a-page-header
            style="border: 1px solid rgb(235, 237, 240)"
            title="云盘"
            sub-title="在这里登陆你的云盘"
            @back="() => null"
          />
          <i class="iconfont" style="font-size: 8rem;">&#xe654;</i>
          <div class="form">
            <a-input
              class="input"
              ref="userNameInput"
              v-model="formData.username"
              placeholder="输入你的用户名"
            >
              <a-icon slot="prefix" type="user" />
              <a-tooltip slot="suffix" title="Extra information">
                <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
              </a-tooltip>
            </a-input>
            <a-input-password
              class="input"
              ref="userNameInput"
              v-model="formData.password"
              placeholder="输入你的密码"
            >
              <a-icon slot="prefix" type="lock" />
            </a-input-password>
            <a-input-password
              class="input"
              ref="userNameInput"
              v-if="isRegister"
              v-model="repeatPassword"
              placeholder="再次确认你的密码"
            >
              <a-icon slot="prefix" type="lock" />
            </a-input-password>
            <a-row type="flex" class="input" justify="start" align="top">
              <a-col class="button_a_col">
                <a-button
                  class="button_a_col_b"
                  type="primary"
                  :disabled="isRegister"
                  @click="login"
                  @keyup.enter="login"
                  >登陆</a-button
                >
              </a-col>
              <a-col class="button_a_col_">
                <a-button class="button_a_col_b" @click="register"
                  >注册</a-button
                >
              </a-col>
            </a-row>
          </div>
        </div>
      </a-spin>
    </a-layout-content>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      repeatPassword: '',
      contentClass: 'content',
      isRegister: false,
      finish: false,
      spinning: false
    }
  },
  watch: {
    finish(val) {
      if (val == true) {
        window.location.href = 'index.html'
      }
    }
  },
  methods: {
    login() {
      this.spinning = true
      let token = 1
      let userId =1
      let level = 1
      localStorage.setItem('token', token)
      localStorage.setItem('username', this.formData.username)
      localStorage.setItem('userId', userId)
      localStorage.setItem('level', level)
      // axios.post('/api/login', this.formData).then(res => {
      //   this.spinning = false
      //   let code = res.data.code
      //   if (code == 1) {
      //     this.$error({
      //       title: '警告',
      //       content: '您的用户名或密码不正确'
      //     })
      //     return
      //   }
      //   let token = res.data.token
      //   let userId = res.data.userId
      //   let level = res.data.level
      //   localStorage.setItem('token', token)
      //   localStorage.setItem('username', this.formData.username)
      //   localStorage.setItem('userId', userId)
      //   localStorage.setItem('level', level)
      //   this.$success({
      //     title: '信息',
      //     okText: '确定',
      //     content: (
      //       <div>
      //         <p>登录成功，点击确定进入用户界面...</p>
      //       </div>
      //     ),
      //     onOk() {
      //       return new Promise((resolve, reject) => {
      //         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
      //       }).catch(() => console.log('Oops errors!'))
      //     },
      //     onCancel() {}
      //   })
      //   setTimeout(() => {
      //     this.finish = true
      //   }, 2000)
      // })
    },
    register() {
      if (!this.isRegister) {
        this.isRegister = true
        this.contentClass = 'content_reg'
        return
      }
      if(this.formData.username.trim().length == 0|| this.formData.password.trim().length == 0){
        this.$message.warning('用户名或密码为空！')
        return
      }
      if (this.formData.password != this.repeatPassword) {
        this.$message.error('狗东西，第一次输入的密码和第二次的不一样！')
        return
      }

      axios.post('/api/register', this.formData).then(res => {
        let data = res.data
        if (data.code != 0) {
          this.$message.error('狗东西，用户名是不是跟被人重了？')
        } else {
          this.$message.success('注册成功！')
           this.isRegister = false
        }
      })
    }
  }
}
</script>

<style>
body {
  flex: content;
  justify-content: center;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.content {
  height: 30rem;
  width: 30rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 0px auto;
}
.content_reg {
  height: 33rem;
  width: 30rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 0px auto;
}
.input {
  width: 75%;
  height: 40px;
  margin-top: 20px;
}
.button_a_col {
  margin-left: 17%;
}
.button_a_col_ {
  margin-left: 5px;
}
.button_a_col_b {
  width: 100px;
}
@font-face {
  font-family: 'iconfont'; /* project id 1908817 */
  src: url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.eot');
  src: url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.eot?#iefix')
      format('embedded-opentype'),
    url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.woff2') format('woff2'),
    url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.woff') format('woff'),
    url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.ttf') format('truetype'),
    url('//at.alicdn.com/t/font_1908817_ci4kf5vxa99.svg#iconfont') format('svg');
}
.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
</style>
