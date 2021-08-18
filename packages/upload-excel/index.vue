<template>
  <div class="box">
    <span>{{text}}</span>
    <input
      ref="upload"
      type="file"
      accept=".xls,.xlsx"
      class="upload-file"
      @change="handleChange" />

    <el-dialog
      width="70vw"
      class="upload-preview-data"
      title="导入预览"
      :visible="visible"
    >
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(tab,index) in excelSheetData"
                     :label="tab.name"
                     :key="index"
                     :name="index+''">
          <el-table
            :data="tab.data.slice((tab.currentPage-1)*tab.pageSize,tab.currentPage*tab.pageSize)"
            class="preview-table"
          >
            <el-table-column v-for="item in columns"
                             :key="item.key"
                             :prop="item.key"
                             align="center"
                             :label="item.label"/>
          </el-table>
          <el-pagination align='center'
                         @size-change="e=>handleSizeChange(e,index)"
                         @current-change="e=>handleCurrentChange(e,index)"
                         :current-page="tab.currentPage"
                         :page-sizes="[1,5,10,20]"
                         :page-size="tab.pageSize"
                         layout="total, sizes, prev, pager, next, jumper"
                         :total="tab.data.length">

          </el-pagination>
        </el-tab-pane>
      </el-tabs>
      <el-button @click="handleOk" type="primary" size="middle">确定</el-button>
      <el-button @click="visible=false">取消</el-button>
    </el-dialog>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import XLSX from "xlsx"
import { Message } from 'element-ui'
import { SheetList } from './index.d.ts'
import 'element-ui/lib/theme-chalk/message.css'
import 'element-ui/lib/theme-chalk/dialog.css'
import 'element-ui/lib/theme-chalk/table.css'
import 'element-ui/lib/theme-chalk/table-column.css'
import 'element-ui/lib/theme-chalk/pagination.css'
import 'element-ui/lib/theme-chalk/tabs.css'
import 'element-ui/lib/theme-chalk/tab-pane.css'
import 'element-ui/lib/theme-chalk/button.css'


export default {
  name: "upload-excel",
  props: {
    text: {
      type: String,
      default: "导入文件"
    },
    sheetList: {
      type: Array,
      required: true
    },
    onFinished:{
      type: Function,
      required: true
    }
  },
  data: function(){
    return {
      lists: [],
      file: null,
      excelSheetData: [],
      columns: [],
      visible: false,
      activeName: '',
      messageInstance: null
    }
  },
  methods:{
    handleOk(){
      this.visible = false;
      onFinished&&onFinished(excelSheetData);
    },
    handleSizeChange(val,index) {
      this.excelSheetData[index].currentPage = 1;
      this.excelSheetData[index].pageSize = val;
    },
    handleCurrentChange(val,index) {
      this.excelSheetData[index].currentPage = val;

    },
    handleClick(){},
    handleChange(e: any){

      this.messageInstance = Message({
        showClose: true,
        message: '正在导入中...',
        duration: 0,
        type: "info"
      })

      const files = e.target.files

      if(!files.length || !this.sheetList.length) return;

      // 错误情况判断
      const reg = /\.(xls|xlsx)$/;
      if(!reg.test(files[0].name.toLowerCase())){
        return Message({
          message:  '上传格式不正确，请上传xls或者xlsx格式！',
          type: 'warning',
        });
      }
      // 读取表格
      const fileReader = new FileReader();

      fileReader.onload = this.parse;
      fileReader.readAsBinaryString(files[0])
    },

    parse(e: any){
      try {
        const excelSheetData = [];
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        this.sheetList.forEach((item: SheetList,index: number)=>{
          const list = [];
          const sheetName = workbook.SheetNames[index];
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

          //渲染表头
          if(this.renderColumn){
            this.columns = this.renderColumn(sheetData.slice(0,item.dataStartLine))
          }else{
            this.columns = Object.values(sheetData[item.columnLine]).map((label,i)=>({key: item.resultMap[i], label }));
          }
          // 将数据映射成对象
          for(let i = item.dataStartLine || 0; i< sheetData.length; i++){
            let record = {};
            Object.values(sheetData[i]).forEach((value,indexes)=>{
              record[item.resultMap[indexes]] = value;
            });
            list.push(record);
          }
          excelSheetData.push({
            name: sheetName,
            data: list,
            currentPage: 1,
            pageSize: 15,
          });
        })
        this.excelSheetData = excelSheetData;
        this.visible = true;
        this.onFinished && this.onFinished(excelSheetData);
      }catch (e){
        console.log(e);
      }finally {
        this.messageInstance.close();
      }
    }
  },
  watch:{
    visible: function(value) {
      !value && (this.$refs.upload.value = null);
    }
  }
};
</script>

<style scoped lang="less">

.box {
  position: relative;
  display: block;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  height: 35px;
  width: 98px;
  text-align: center;
  line-height: 35px;
  *zoom: 1;
  color: #FFFFFF;

  .upload-file {
    font-size: 20px;
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    filter: alpha(opacity=0);
    width: 100%;
  }
  .upload-preview-data{
    ::v-deep.el-dialog{
      margin-top: 8vh!important;
      overflow: auto;
    }

    ::v-deep.el-dialog__body{
      padding: 0 20px 20px;
    }
    ::v-deep.el-table__body-wrapper{
      overflow: auto;
      height: 50vh;
    }
    ::v-deep.el-pagination{
      margin: 10px 0;
      text-align: right;
    }
  }
}


</style>
