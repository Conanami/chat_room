<template>
  <div id="createQr" style="height: 100vh;">
    <el-row style="padding: 30px 10px;text-align: center" >
        <el-col>

      <el-card style="margin: 0 auto" :style="{'width':screenWidth>786?'600px':''}" class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t(`createqr.header`)}}</span>
            </div>
          </template>
          <div class="text item">
            <el-form :model="form" label-width="90px">
              <el-form-item :label="$t('createqr.labelname')">
                <el-input :placeholder="$t('createqr.plhname')" v-model="form.name" />
              </el-form-item>
              <el-form-item :label="$t('createqr.labelqty')">
                <el-select v-model="form.size" :placeholder="$t('createqr.plhqty')">
                  <el-option :label="$t('createqr.two')" value="2" />
                  <el-option :label="$t('createqr.unlimit')" value="0" />
                </el-select>
              </el-form-item>
              <el-form-item >
                  <el-button type="primary" @click="onSubmit">{{ $t(`createqr.btn`)}}</el-button>
              </el-form-item>
            </el-form>

          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
        center
        v-model="dialogVisible"
        :title="$t('createqr.scan')"
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
import {useI18n} from 'vue-i18n'

export default {
  components:{qrCode},
  setup() {
    const data = reactive({
      dialogVisible:false,
      screenWidth: document.documentElement.clientWidth,
      form:{},
      userid:'',
      value:'',
      infoObj:{}
    })
    const {t} = useI18n()
    const roomModel = RoomModel();
    const store = useStore()

    const childRef = ref(null);
    const onSubmit=()=>{
      let {name,size}=data.form;
      if(!name){
        ElMessage({
          message: t('createqr.noname'),
          type: 'warning',
        })
        return;
      }
      if(!size){
        ElMessage({
          message: t('createqr.noqty'),
          type: 'warning',
        })
        return;
      }
      let {userid,form}=data;

      roomModel.connect().then(()=>{
        roomModel.createRoom(name, size).then((msgObj)=>{
          data.dialogVisible=true;
        });
      })
    };

    onMounted(() => {

      window.onresize = () => {
        return (() => {
          window.fullWidth = document.documentElement.clientWidth;
          data.screenWidth = window.fullWidth; 
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
