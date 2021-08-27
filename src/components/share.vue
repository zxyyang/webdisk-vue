<template>
  <div class="table">
    <a-table
      class="shareTable"
      :data-source="shareList"
      :pagination="false"
      bordered
    >
      <!-- :loading="skeleton_loading" -->
      <a-table-column key="shareName" title="分享用户" data-index="shareName" />
      <a-table-column key=" id" title="文件秘钥" data-index="id" />
      <a-table-column key="shareDate" title="分享时间" data-index="shareDate">
        <template slot-scope="shareDate">
          <span>{{ timestampToTime(shareDate) }}</span>
        </template>
      </a-table-column>
      <a-table-column key="encrypt" title="加密" data-index="encrypt">
        <template slot-scope="encrypt">
          <a-icon type="lock" v-if="encrypt == true" />
          <a-icon type="unlock" v-else />
        </template>
      </a-table-column>
      <a-table-column data-index="id" title="提取">
        <template slot-scope="id">
          <a-button icon="plus" type="dashed" @click="extractKey(id)" />
        </template>
      </a-table-column>
      <template slot="title" slot-scope="currentPageData">
        用户分享列表
      </template>
    </a-table>
  </div>
</template>

<script>
import utils from '../js/utils'
import req from '../js/request'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'share',
  data() {
    return {
      shareList: []
    }
  },
  computed: {},
  mounted() {
    req.getShareList().then(res => {
      this.shareList = res.data
    })
  },
  methods: {
    ...mapMutations(['updateShareDiaglogVis', 'updateShareKey']),
    extractKey(key) {
      this.updateShareKey(key)
      this.updateShareDiaglogVis(true)
    },
    timestampToTime(time) {
      return utils.timestampToTime(time)
    }
  }
}
</script>

<style></style>
