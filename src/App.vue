<template>
  <div id="app">
    <container />
  </div>
</template>

<script>
import req from './js/request'
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
import container from './components/content'
export default {
  name: 'App',
  watch: {
    requestCode(val) {
      if (val == 5000) {
        location.reload()
      }
      this.updateRequestCode(val)
    }
  },
  data() {
    return {
      token: null
    }
  },
  computed: {
    ...mapState(['requestCode'])
  },
  // store,
  components: {
    container: container
  },
  created() {
    this.token = localStorage.getItem('token')
    /*
       如果token为空或通过token鉴定为已过期(错误),则跳转到登录页面。
    */
    if (this.token == null) {
      window.location.href = 'login.html'
    } else {
      req.getTokenVerity(this.token).then(res => {
        if (res.data == 1) {
          window.location.href = 'login.html'
        }
      })
    }
  },
  methods: {},
  mounted() {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
* {
  padding: 0px;
  margin: 0px;
}
</style>
