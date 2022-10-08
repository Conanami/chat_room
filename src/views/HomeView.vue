<template>
  <div class="home"> 
    <button @click="handleClick">Create</button>
    <button @click="handleClick2">Join</button>
    
    <button @click="handleClick3">Send</button>
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
      roomModel.createRoom('TestRoom', 2)
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
      
      


      

    }

    const onMessage = (obj)=>{

    }

    roomModel.connect().then((obj)=>{
      console.log('roomModel connect', obj);
    }).catch(()=>{
      console.log('roomModel catch');
    })

   

   return {
     ...toRefs(data), handleClick, handleClick2, handleClick3, store
   }  
  },
  mounted(){
    
  }
}
</script>
