<template>
  <div class="table">
    <a-table
      class="myShareTable"
      :data-source="myShareList"
      :pagination="false"
      bordered
    >
      <a-table-column key="filePath" title="文件名称" data-index="filePath">
        <template slot-scope="filePath">
          {{ changePath(filePath) }}
        </template>
      </a-table-column>

      <a-table-column key="id" title="文件秘钥" data-index="id" />
      <a-table-column key="pwd" title="提取码" data-index="pwd">
         <template slot-scope="pwd">
          <span>{{ pwd == null ? '公开': pwd }}</span>
        </template>
      </a-table-column>
      <a-table-column key="shareDate" title="分享时间" data-index="shareDate">
        <template slot-scope="shareDate">
          <span>{{ timestampToTime(shareDate) }}</span>
        </template>
      </a-table-column>
      <template slot="title" slot-scope="currentPageData">
        我的分享列表
      </template>
    </a-table>
  </div>
</template>

<script>
import req from '../js/request'
import utils from '../js/utils'
export default {
  name: 'myShare',
  data() {
    return {
      myShareList: []
    }
  },
  mounted() {
    req.getShareMeList().then(res => {
      this.myShareList = res.data
    })
  },
  methods: {
    changePath(str) {
      return str.substr(str.lastIndexOf('/') + 1, str.length)
    },
    timestampToTime(date) {
      return utils.timestampToTime(date)
    }
  }
}
</script>
