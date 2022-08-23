import { createStore } from 'vuex'

export default createStore({
  state: {
    roomId:'',
    userInfo:{},//用户信息:roomId userId pri  pub,
    chatRoomInfo:{},// // {id:abc123, users:['user1', 'user2', 'user3'], pubs:{user1: yyyy, user2: yyyy2}, name:'聊天室名字', size:2 }
    chatRecords:{}
  },
  getters: {
  },
  mutations: {

    //同步用户信息
    syncUser(state, user){
      state.userInfo = user
      state.roomId = user.roomId
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

    // //添加信息
    // addRecords(state,param){
    //   console.log('id====',state.roomId)
    //   let {roomId,userId}=state.userInfo[state.roomId];
    //   let key = 'records::'+roomId+'::'+userId;
    //   //获取当前vux是否有值
    //   let obj = state.chatRecords[roomId];
    //   if (!obj.length<0) {
    //     // 从缓存加载
    //     let str = localStorage.getItem(key);
    //     if (!str){
    //       // 初始化为 空
    //       localStorage.setItem(key, '[]')
    //       obj = []
    //       state.chatRecords[roomId] = obj;
    //     }else{
    //       obj = JSON.parse(str);
    //       state.chatRecords[roomId] = obj;
    //     }
    //   }
    //   console.log(obj)
    //   obj.push(param)
    //   localStorage.setItem(key, JSON.stringify(obj))

    //   },
    // //获取聊天记录
    // loadRecords(state){
    //   let {roomId,userId}=state.userInfo[state.roomId];
    //   let key = 'records::'+roomId+'::'+userId;
    //   let r= JSON.parse(localStorage.getItem(key)) ;//聊天记录
    //   if(r){
    //     state.chatRecords[roomId]=r;
    //   }else{
    //     state.chatRecords[roomId]=[];
    //   }
    // },
    // // 当前用户的所有信息
    // saveCurrUser(state,roomId){
    //   console.log('当前聊天室id=',roomId)
    //   state.roomId=roomId;
    //   let u=JSON.parse(localStorage.getItem('userInfo::'+roomId));
    //   console.log('保存用户信息=',u)

    //   if(u){
    //     state.userInfo[roomId]=u;
    //   }
    // },
    // // 当前聊天室的所有信息
    // saveCurrchatRoom(state){
    //   let {roomId}=state.userInfo[state.roomId];
    //   let c=JSON.parse(localStorage.getItem('chatRoomInfo::'+[roomId]));
    //   if(c){
    //     state.chatRoomInfo[roomId]=c;
    //   }
    // },
  },
  actions: {
  },
  modules: {
  }
})
