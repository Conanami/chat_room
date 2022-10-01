<template>
  <div class="home"> 
    <button @click="handleClick">Create</button>
    <button @click="handleClick2">Join</button>
    
    <button @click="handleClick3">发送</button>
    <div >{{store.state.userInfo.pub}}</div>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from '@vue/reactivity'
// @ is an alias to /src 
import RoomModel from '../model/RoomModel'
import {useStore} from 'vuex'
import {ElMessage} from "element-plus";
import * as Socket from '../util/Socket'

export default {
  name: 'HomeView',
  components: { 
    
  },
  setup (){
    const data = reactive({
      user: {id:'user123', pub:'pubxxx', pri:'prixxx'}
    })
 
    const roomModel = RoomModel()
    const store = useStore()
 

    const handleClick = ()=>{
      roomModel.connect()
      roomModel.createRoom('测试房间', 2)
    }

    const handleClick2 = ()=>{
      let roomId = '63e3a3839c70430ba379641ee8b51d65'
      let exist = roomModel.loadCacheUser(roomId)
      if(!exist){
        roomModel.createUser(roomId)
      }
      roomModel.connect()
      roomModel.joinRoom()
    }

    const handleClick3 = ()=>{
      
      // // roomModel.sendMsg('你好啊')
      // Socket.configWebSocket('ws://127.0.0.1:2740/ws/12334', 5)
      // Socket.init().then((obj)=>{
      //   console.log('init res:', obj)
      // })

      // Socket.sendSock({type:300, to:12344, body:{}}).then(()=>{
      //   console.log('已发送')
      // }).catch((error)=>{
      //   ElMessage({
      //     message: '数据发送失败：'+error.message,
      //     type: 'error',
      //   })
      // })

      // Socket.sendSock({type: 120, from: data.user.id, to: 'server', body: {name: '测试房间', size: 2}})
      // .then((obj)=>{
      //   console.log('then createRoom res id: ', obj.body.id)
      // })

      // Socket.sendSock({type: 120, from: data.user.id, to: 'server', body: {name: '测试房间', size: 2}})
      // .then((obj)=>{
      //   console.log('then createRoom res id: ', obj.body.id)
      // })


      

    }

    const onMessage = (obj)=>{

    }

    roomModel.connect().then((obj)=>{
      console.log('roomModel connect', obj);
    }).catch(()=>{
      console.log('roomModel catch');
    })

    // Socket.configWebSocket('ws://127.0.0.1:2740/ws/'+data.user.id, 5, onMessage)
    // Socket.init().then((obj)=>{
    //   console.log('init res:', obj)
    //   ElMessage({
    //       message: '初始化成功：'+JSON.stringify(obj),
    //       type: 'success',
    //       duration: 500
    //     })
    // }).catch((error)=>{
    //   ElMessage({
    //       message: '初始化失败：'+error.message,
    //       type: 'error',
    //     })
    // })

   return {
     ...toRefs(data), handleClick, handleClick2, handleClick3, store
   }  
  },
  mounted(){
    
  }
}
</script>
