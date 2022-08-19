<template>
  <div id="createQr" style="height: 100vh;">
    <el-row style="padding: 30px 10px;text-align: center" >
        <el-col>

      <el-card style="margin: 0 auto" :style="{'width':screenWidth>786?'600px':''}" class="box-card">
          <template #header>
            <div class="card-header">
              <span>创建聊天室</span>
            </div>
          </template>
          <div class="text item">
            <el-form :model="form" label-width="90px">
              <el-form-item label="聊天室名称">
                <el-input placeholder="请输入聊天室名称" v-model="form.name" />
              </el-form-item>
              <el-form-item label="聊天室人数">
                <el-select v-model="form.size" placeholder="请选择聊天室人数">
                  <el-option label="两人" value="2" />
                  <el-option label="不限" value="0" />
                </el-select>
              </el-form-item>
              <el-form-item >
                  <el-button type="primary" @click="onSubmit">确定</el-button>
              </el-form-item>
            </el-form>

          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
        center
        v-model="dialogVisible"
        title="请扫描二维码进入聊天室"
        :width="screenWidth>786?'400px':'90%'"
    >
      <div v-loading="store.state.roomId==''" style="text-align: center;overflow: auto">
      <qrCode  ref="childRef" :screenWidth="screenWidth"></qrCode>
        <p>{{form.name}}</p>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import {onMounted, reactive, toRefs, ref, watch, nextTick} from 'vue'
import qrCode from '@/components/QrCode.vue'
import {ElMessage} from "element-plus";
import RoomModel from '../model/RoomModel'
import {useStore} from "vuex";

export default {
  components:{qrCode},
  setup() {
    const data = reactive({
      dialogVisible:false,
      screenWidth: document.documentElement.clientWidth,//屏幕宽度
      form:{},//聊天名称
      userid:'',//聊天id
      value:'',
      infoObj:{}
    })
    const roomModel = RoomModel();
    const store = useStore()

    const childRef = ref(null);
    const onSubmit=()=>{
      let {name,size}=data.form;
      if(!name){
        ElMessage({
          message: '请输入聊天室名称',
          type: 'warning',
        })
        return;
      }
      if(!size){
        ElMessage({
          message: '请选择聊天人数',
          type: 'warning',
        })
        return;
      }
      let {userid,form}=data;

      roomModel.connect()
        roomModel.createRoom(data.form);
      nextTick(()=>{
        data.dialogVisible=true;

        setTimeout(()=>{

         // childRef.value.updateValue(''+store.state.roomId);

        },500)

      })
    };

    //收到消息
    const receiveMsg = (msg) => {
      let {type,body:{id}}=msg;
      if(id){
        data.infoObj=msg;
        childRef.value.updateValue('https://hxx.huifintech.com/chat_user/chatroom?id='+id);

      }
      console.log('收到信息=',msg);

    };
    onMounted(() => {

      window.onresize = () => {
        return (() => {
          window.fullWidth = document.documentElement.clientWidth;
          data.screenWidth = window.fullWidth; // 宽
        })()
      };
    });
    return {
      ...toRefs(data),
      childRef,
      store,
          onSubmit
    }
  }
}
</script>

<style>
body{
  background-color: #f8f6f6 !important;
}
#createQr .el-select{
  width: 100% !important;
}
#createQr  .el-form-item__content{
  margin-left: 0px !important;
  text-align: center !important;
  display: block;
}
</style>
