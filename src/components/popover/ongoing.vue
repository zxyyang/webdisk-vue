<template>
  <div class="side">
    <a-list size="small" bordered :data-source="uploadList">
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-spin>
          <a-icon
            slot="indicator"
            type="loading"
            style="font-size: 24px"
            spin
          />
        </a-spin>
        {{ item }}
      </a-list-item>
    </a-list>
  </div>
</template>

<script>
export default {
  name: 'ongoing',
  props: ['uploadList']
}
</script>
<style>
.ant-popover-inner-content {
  padding: 0px;
}
.ant-list {
  border: 0px;
}
</style>
