import { createStore } from "vuex";

export default createStore({
  state: {
    roomId: "",
    chatRoomUrl: "",
    userInfo: {}, //userinfo:roomId userId pri  pub,
    chatRoomInfo: {
      id: null,
      name: null,
      passwd: null,
      pubs: null,
      size: 0,
      users: Array,
    }, //
    chatRecords: {},
    nicknames: null,
  },
  getters: {
    getUserLength(state) {
      return state.chatRoomInfo.users.length || 0;
    },
  },
  mutations: {
    //sync user info
    syncUser(state, user) {
      state.userInfo = user;
      state.roomId = user.roomId;
    },
    //sync user nickname
    syncNicknames(state, user) {
      state.nicknames = user;
    },
    //sync room url
    syncChatRoomUrl(state, url) {
      state.chatRoomUrl = url;
    },
    //sync room id
    syncRoomId(state, roomId) {
      state.roomId = roomId;
    },
    // sync room info
    syncRoomInfo(state, roomInfo) {
      state.chatRoomInfo = roomInfo;
    },
    // sync chat history
    syncChatRecords(state, records) {
      // console.log('sync chat info',)

      state.chatRecords = records;
    },
  },
  actions: {},
  modules: {},
});
