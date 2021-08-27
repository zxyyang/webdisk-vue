import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  requestCode: 0,
  downloadShareFileDialogVisible: false,
  shareKey: '',
  sharePwd: '2'
}
const mutations = {
  updateShareDiaglogVis(state, vis) {
    state.downloadShareFileDialogVisible = vis
  },
  updateShareKey(state, key) {
    state.shareKey = key
  },
  updateSharePwd(state, pwd) {
    state.sharePwd = pwd
  }
}

export default new Vuex.Store({
  state,
  mutations
})
