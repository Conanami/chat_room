<template>
  <div  id="chatRoom" >

      <el-card  shadow="never" class="box-card">
        <template #header>
          <div class="card-header" style="text-align: center">
            <h4 style="display: inline"> 在线聊天室</h4>
         </div>
        </template>
        <div>
          <div style="overflow: auto;padding: 6px;position: absolute;
              bottom: 220px;
              left: 0;
              right: 0;
              top: 80px;"
               class="chat-content" ref="chat_div">

            <!-- recordContent 聊天记录数组-->
            <div v-for="(item, index) in store.state.chatRecords" :key="index">
              <!-- 对方 -->
              <div class="word" v-if="item.from != store.state.userInfo.id">
                <div style="width: 40px;" class="headDiv">{{ (store.state.chatRoomInfo.users!=undefined &&store.state.chatRoomInfo.users.length<3)? '他':filters(item.from) }}</div>
                <div class="info">
                  <p class="time">{{ filters(item.from,5) }}</p>
                  <p class="time2"> {{ item.time }}</p>
                  <div class="info-content">{{ item.msg }}
                    <!--                            <span class="read" v-if="item.status=='1'">已收</span>-->
                    <!--                            <span class="read" v-if="item.status=='0'">未读</span>-->
                    <!--                            <span class="read" v-if="item.status=='2'">已读</span>-->
                  </div>

                </div>
              </div>
              <!-- 我的 -->
              <div class="word-my" v-else>
                <div class="info">
                  <p class="time">{{filters(item.from,5) }}</p>
                  <p class="time2"> {{ item.time }}</p>
                  <div class="info-content">{{ item.msg}}
                    <span class="readTwo" v-if="item.status=='2'">已读</span>
                    <span class="readTwo" v-else-if="item.status=='0'">未收</span>
                    <span v-else></span>
                  </div>
                </div>
                <div class="headDiv">{{  (store.state.chatRoomInfo.users!=undefined &&store.state.chatRoomInfo.users.length<3)? '我':filters(item.from)}}</div>
              </div>
            </div>
          </div>

          <!--                  输入框-->
          <div id="editText">
            <div>
              <el-input @keyup.enter="sendMsg(msg)" resize="none" v-model.trim="msg"  type="textarea" placeholder="文明聊天，从这开始" ></el-input>
            </div>
            <div style="text-align:right;padding:10px;border-top:1px solid rgb(231, 229, 229)">
              <el-button  type="primary" @click="sendMsg(msg)"  plain>发送</el-button>

              <el-button plain>清空</el-button>
            </div>
          </div>

        </div>
      </el-card>

<!--    提示弹框-->
    <el-dialog  center :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" :model-value="store.state.chatRoomInfo.error!=undefined" title="温馨提示">
      <h3   style="text-align: center;color:#d92a2a">{{store.state.chatRoomInfo.error}}</h3>

    </el-dialog>
<!--    提示弹框-->
    <el-dialog  center :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" :model-value="store.state.chatRoomInfo.error==undefined && store.state.chatRoomInfo.id==undefined " title="温馨提示">
      <h3  style="text-align: center;color:#d92a2a">正在进入聊天室，请稍后...</h3>
    </el-dialog>


  </div>
</template>

<script>
import {onMounted, reactive, toRefs, ref, watch, nextTick,computed} from 'vue'
import { useRoute } from "vue-router"
import RoomModel from '../model/RoomModel'
import {useStore} from "vuex";
import {ElMessage} from 'element-plus'


export default {
  setup() {
    const roomModel = RoomModel()
    const store = useStore()
    const {id}=useRoute().query; // 地址兰参数
    const data = reactive({
      chatRecords:[],
      msg:'',
      hint:'提示',
      dialogTableVisible:false,//弹框
      screenWidth: document.documentElement.clientWidth,//屏幕宽度
    });
    //加入聊天室
    const joinChatRoom=()=>{
      let exist = roomModel.loadCacheUser(id)
      if(!exist){
          data.dialogTableVisible=true;
          setTimeout(()=>{
            roomModel.createUser(id)
            roomModel.connect().then(()=>{
              roomModel.joinRoom().then((obj)=>{
                console.log('加入聊天室成功', obj)
              })
            })
          },500)
      }else{
        roomModel.connect().then(()=>{
              roomModel.joinRoom().then((obj)=>{
                console.log('加入聊天室成功', obj)
              })
            })
      }
    }
  const filters=(val,number=1)=>{
    let str=val+'';
    return str.substring(0, number)
  };
//发送之后回到最下方
    const chat_div = ref(null)
    watch(() => store.state.chatRecords, (neval, olval) => {
      // console.log(chat_div)
      nextTick(() => {
        chat_div.value.scrollTop = chat_div.value.scrollHeight;
      });
    }, {deep: true})
    //发送信息
    const sendMsg = (text) => {
      if(text==''){
        ElMessage({
          message: '发送消息不能为空！',
          type: 'warning',
        })
        return;
      };
      roomModel.sendMsg(text).then(()=>{
        data.msg = ''
      });
    };

    onMounted(() => {
      // 屏幕宽
      window.onresize = () => {
        return (() => {
          window.fullWidth = document.documentElement.clientWidth;
          data.screenWidth = window.fullWidth;
        })()
      };
      joinChatRoom();
    });
    return {
      ...toRefs(data),
      store,
      sendMsg,
      roomModel,
      filters,
      joinChatRoom,
      chat_div

    }
  }
}
</script>

<style>
body{
  background-color: #fff !important;
}
.readTwo{
  position: absolute;
  left: -33px;
  color: #ccc;
}
#editText{
  border-top: 1px solid #ccc;
  position: absolute;
  left:0;
  right:0;
  bottom:0px;
}
#editText textarea {
  height: 160px !important;
  padding: 10px !important;
  border: 0px solid #ccc !important;
  box-shadow: none !important
}
#chatRoom{
  height: 100vh;

  position: relative;

  border: 1px solid #fff;
}
#chatRoom .el-card__body{
  padding: 0 !important;
}
#chatRoom .info-content {
  border-radius: 5px;
}

#chatRoom .word {
  display: flex;
  margin-bottom: 20px;
  text-align: left;
}
#chatRoom .myhead{
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  line-height: 47px;
  text-align: center;
  border-radius: 50%;  color: #79bbff;

}
.headDiv {
  min-width:40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ccc;
  text-align: center;
  line-height: 37px;
  color: #79bbff;
}


#chatRoom .word .info {
  margin-left: 10px;
}

#chatRoom .word .time {
  font-size: 12px;
  color: rgba(51, 51, 51, 0.8);
  font-weight: bold;
  margin: 0;
  height: 20px;
  line-height: 20px;
  margin-top: -5px;
}

#chatRoom .word .time2 {
  font-size: 10px;
  color: rgba(51, 51, 51, 0.8);
  margin: 0;
  line-height: 20px;
  margin-top: -5px;
}

#chatRoom .word .info-content {
  padding: 10px;
  font-size: 14px;
  background: #79bbff;
  position: relative;
  margin-top: 0px;
  margin-left: 10px;

  float: left;
  word-break:break-all !important;
  max-width: 100%;

}

#chatRoom .word .info-content::before {
  position: absolute;
  left: -8px;
  top: 3px;
  content: '';
  border-right: 10px solid #79bbff;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}


#chatRoom .word-my {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}


#chatRoom .word-my .info {
  width: 90%;
  margin-left: 10px;
  text-align: right;
}

#chatRoom .word-my .time {
  font-size: 12px;
  color: rgba(51, 51, 51, 0.8);
  font-weight: bold;
  margin: 0;
  height: 20px;
  line-height: 20px;
  margin-top: -5px;
  margin-right: 10px;
}

#chatRoom .word-my .time2 {
  font-size: 10px;
  color: rgba(51, 51, 51, 0.8);
  margin: 0;
  line-height: 20px;
  margin-right: 10px;

  margin-top: -5px;
}

#chatRoom .word-my .info-content {
  max-width: 90%;
  padding: 10px;
  font-size: 14px;
  float: right;
  margin-right: 10px;
  background: #a2f898;
  text-align: left;
  position: relative;
  word-break:break-all !important;
}

#chatRoom .word-my .info-content::after {
  position: absolute;
  right: -8px;
  top: 3px;
  content: '';
  border-left: 10px solid #a2f898;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}


</style>
