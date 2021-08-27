import Vue from 'vue'
import Router from 'vue-router'
import files from '../components/files'
import share from '../components/share'
import myShare from '../components/myShare'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'files',
      component: files
    },
    {
      path: '/share',
      name: 'share',
      component: share
    },
    {
      path: '/myShare',
      name: 'myShare',
      component: myShare
    },
  ]
})
