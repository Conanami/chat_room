<template>
  <div  id="chatRoom" >

      <el-card style="border: none" shadow="never" class="box-card">
        <template #header>
          <div class="card-header" style="text-align: center">
            <h4 style="display: inline"> {{roomTitle}}</h4>
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
              <el-tooltip
                    class="box-item"
                    effect="light"
                    :content="'ID:'+item.from"
                    placement="top-start"
                >
                <div style="width: 40px;"  class="headDiv">{{ (store.state.chatRoomInfo.users!=undefined &&store.state.chatRoomInfo.users.length<3)? '他':filters(item) }}</div>
              </el-tooltip>
                <div class="info">
                  <p class="time">{{ filters(item,5) }}</p>
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
                  <p class="time">{{filters(item,5) }}</p>
                  <p class="time2"> {{ item.time }}</p>
                  <div class="info-content">{{ item.msg}}
                    <span class="readTwo" v-if="item.status=='2'">已读</span>
                    <span class="readTwo" v-else-if="item.status=='0'">未收</span>
                    <span v-else></span>
                  </div>
                </div>
                <el-tooltip
                    class="box-item"
                    effect="light"
                    :content="'ID:'+item.from"
                    placement="top-end"
                >
                <div @click="rightClick(item)" class="headDiv">{{  (store.state.chatRoomInfo.users!=undefined &&store.state.chatRoomInfo.users.length<3)? '我':filters(item)}}</div>
                </el-tooltip>
              </div>
            </div>
          </div>

          <!--                  输入框-->
          <div id="editText">
            <div>
              <el-input @keyup.enter="sendMsg(msg)" resize="none" v-model.trim="msg"  type="textarea" placeholder="文明聊天，从这开始" ></el-input>
            </div>
            <div style="text-align:right;padding:10px;border-top:1px solid rgb(231, 229, 229)">
              <el-button  type="primary" @click="sendMsg(msg)"  >发送</el-button>

              <el-button plain>清空</el-button>
            </div>
          </div>

        </div>
      </el-card>

<!--    提示弹框-->
    <el-dialog :width="screenWidth>768?'30%':'90%'"  center :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" :model-value="store.state.chatRoomInfo.error!=undefined" title="温馨提示">
      <h3  class="fontColorh3">{{store.state.chatRoomInfo.error}}</h3>

    </el-dialog>
<!--    提示弹框-->
    <el-dialog :width="screenWidth>768?'30%':'90%'"  center :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" :model-value="store.state.chatRoomInfo.error==undefined && store.state.chatRoomInfo.id==undefined " title="温馨提示">
      <h3  class="fontColorh3">正在进入聊天室，请稍后...</h3>
    </el-dialog>
<!--修改备注-->

    <el-dialog  :width="screenWidth>768?'30%':'90%'" center v-model="dialogRemarkVisible" title="修改昵称">
      <el-form :model="remarkForm" label-width="70px">
        <el-form-item label="昵称：" >
          <el-input v-model="remarkForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogRemarkVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRemarkSubimit(remarkForm.name)"
        >确定</el-button
        >
      </span>
      </template>
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
    const roomModel = RoomModel();
    const store = useStore();
    const {id}=useRoute().query; // 地址兰参数
    const data = reactive({
      chatRecords:[],
      msg:'',
      hint:'提示',
      remarkForm:{},//备注表单
      dialogTableVisible:false,//弹框
      dialogRemarkVisible:false,//备注弹框
      screenWidth: document.documentElement.clientWidth,//屏幕宽度
    });
    // 右键
   const rightClick= (item)=>{
     data.dialogRemarkVisible=true;
    };
    const roomTitle = computed(()=>{
      if(store.state.chatRoomInfo.online==undefined){
        return '多人聊天室'
      }
      if(store.state.chatRoomInfo.size==2){
        return '双人聊天室('+store.state.chatRoomInfo.online+'/'+ store.state.chatRoomInfo.total +')'
      }else{
        return '多人聊天室('+store.state.chatRoomInfo.online+'/'+ store.state.chatRoomInfo.total +')'
      }
    })
   //修改备注
    const updateRemarkSubimit=(newName)=>{
      roomModel.joinRoom(newName).then(()=>{
        data.dialogRemarkVisible=false;
        ElMessage({
          message: '修改昵称成功！',
          type: 'success',
        })
        return;
      }).catch(()=>{
        ElMessage({
          message: '修改昵称失败！',
          type: 'error',
        })
        return;
      });

    };
    //加入聊天室
    const joinChatRoom=()=>{
      let exist = roomModel.loadCacheUser(id)
      if(!exist){
          data.dialogTableVisible=true;
          setTimeout(()=>{
            roomModel.createUser(id)
            roomModel.connect().then(()=>{
              roomModel.joinRoom('').then((obj)=>{
                console.log('加入聊天室成功', obj)
                data.dialogTableVisible=false;
              })
            })
          },500)
      }else{
        roomModel.connect().then(()=>{
              roomModel.joinRoom('').then((obj)=>{
                console.log('加入聊天室成功', obj)
              })
            })
      }
    }
  const filters=(userObj,number=1)=>{
      let {from}=userObj;
    let str=from+'';
   if(Object.keys(store.state.nicknames).length>0){

        for (const fromKey in store.state.nicknames) {

          if(fromKey==from ){
            str=store.state.nicknames[fromKey]+'';
            return str.substring(0, number)

          }
        }

   }else{
     str=from+'';
   }

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
      }).catch((obj)=>{
        ElMessage({
          message: obj.error,
          type: 'warning',
        })
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
      roomTitle,
      sendMsg,
      roomModel,
      filters,
      joinChatRoom,
      updateRemarkSubimit,
      rightClick,
      chat_div

    }
  }
}
</script>

<style>
body{
  margin: 0;
  padding: 0;
}
.fontColorh3{
  text-align: center;color:#d92a2a;
  padding-bottom: 30px !important;
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
  z-index: 120 !important;


}

 .el-popper.is-light{
  z-index: 100 !important;
}
.el-dialog--center .el-dialog__body{
  padding: 0px 20px !important;
}

#editText textarea {
  height: 160px !important;
  padding: 10px !important;
  border: 0px solid #ccc !important;
  box-shadow: none !important
}
#chatRoom{
  height: 100vh;
  background: #fff;
  position: relative;

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
  cursor: pointer;
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

/*滚动条*/
::-webkit-scrollbar {
  width: 5px;
  height: 4px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: skyblue;
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
}

::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(227, 227, 227, 0.5);
}

@media screen and (min-width: 768px) {
 #chatRoom{
   height: 90vh;

   margin: 20px 100px;
   /*border: 1px solid #e8e6e6;*/
   background: #fff !important;
   box-shadow: 0px 80px 100px -10px #b3b0af;

 }
  body{
    background: #a7a3a3;
  }
}

</style>
