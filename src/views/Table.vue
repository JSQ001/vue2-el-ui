<template>
  <div class="common-element-ui-table-example">
    <cel-table></cel-table>
    <upload-excel :sheetList="sheetList" :onFinished="onFinished"/>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data:function() {
    return {
      sheetList: [
        {
          dataStartLine: 3,
          columnLine: 1,
          resultMap: [
            'date','name','account','startWork','endWork','punchTimes','actualWorkTime',
            'calibrationStatus','overtimeStatus','punchTime','punchStatus'
          ]
        }
      ]
    };
  },
  methods:{
    onFinished(data){
      console.log(data)
    }
  }
});
</script>
<style lang="less" scoped></style>
