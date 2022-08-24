import { createStore } from 'vuex'

export default createStore({
  state: {
    roomId:'',
    chatRoomUrl: '',
    userInfo:{},//用户信息:roomId userId pri  pub,
    chatRoomInfo:{
      id:null,
      name:null,
      passwd:null,
      pubs:null,
      size:0,
      users:Array
    },// // {id:abc123, users:['user1', 'user2', 'user3'], pubs:{user1: yyyy, user2: yyyy2}, name:'聊天室名字', size:2 }
    chatRecords:{}
  },
  getters: {
    getUserLength(state){
      console.log('进来了=',state.chatRoomInfo.users)
      return state.chatRoomInfo.users.length || 0
    }
  },
  mutations: {

    //同步用户信息
    syncUser(state, user){
      state.userInfo = user
      state.roomId = user.roomId
    },
    //同步聊天室地址
    syncChatRoomUrl(state, url){
      state.chatRoomUrl = url
    },
    //同步房间号
    syncRoomId(state, roomId){
      state.roomId = roomId
    },
    // 同步聊天室信息
    syncRoomInfo(state, roomInfo){
      state.chatRoomInfo = roomInfo
    },
    // 同步聊天记录
    syncChatRecords(state, records){
      console.log('同步聊天信息',)

      state.chatRecords = records
    },
  },
  actions: {
  },
  modules: {
  }
})
