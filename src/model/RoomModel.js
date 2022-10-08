/**
 * model layer for chatroom
 * 1， if no room , createRoom
 * 2， if room exists, loadCacheRoom , if no cache createUser
 * 3,  if user exists, connect server，joinRoom
 * 4，
 */
import {
  aesDecrypt,
  aesEncrypt,
  generateKey,
  rsaDecrypt,
  rsaEncrypt,
} from "@/util/rsa.js";
import SnowflakeID from "@/util/snowflake.js";
import dateFormat from "@/util/time.js";
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import * as Socket from "../util/Socket";
import { useI18n } from "vue-i18n";

const RoomModel = () => {
  var user = reactive({
    id: new SnowflakeID().generate(),
    pub: "",
    pri: "",
    roomId: "",
    roomInfo: {}, // {id:abc123, users:['user1', 'user2', 'user3'], pubs:{user1: yyyy, user2: yyyy2}, name:'聊天室名字', size:2 }
    chatRecords: {},
  });

  const KEY_ROOM = "room:";
  const store = useStore();
  const { t } = useI18n();
  //  try to load room info
  const loadCacheUser = (roomId) => {
    let l = localStorage.getItem(KEY_ROOM + roomId);

    if (l == undefined || l.indexOf("error") == 1) {
      return false;
    }
    let obj = JSON.parse(localStorage.getItem(KEY_ROOM + roomId));
    user.id = obj.id;
    user.pub = obj.pub;
    user.pri = obj.pri;
    user.roomId = obj.roomId;
    // sync vuex
    store.commit("syncUser", obj);
    store.commit("syncRoomId", user.roomId);

    console.log("room:" + roomId + " load cache complete", obj);
    return true;
  };

  // create user key
  const createUser = (roomId) => {
    let rsa = { id: new SnowflakeID().generate(), pri: "", pub: "" };
    if (roomId.substring(0, 2) == "2s") {
      //peer to peer,2 men room
      rsa = generateKey();
    }

    rsa.roomId = roomId;

    user.pub = rsa.pub;
    user.pri = rsa.pri;
    user.id = rsa.id;
    user.roomId = roomId;
    console.log("room:" + roomId + " create complete", rsa);
    store.commit("syncUser", rsa);
    localStorage.setItem(KEY_ROOM + roomId, JSON.stringify(rsa));
  };

  // connect server
  const connect = async () => {
    // Socket.configWebSocket("ws://127.0.0.1:2740/ws/" + user.id, 5, onMessage)
    Socket.configWebSocket(
      "wss://chatserver02.herokuapp.com/ws/" + user.id,
      //"wss://agile-dusk-31941.herokuapp.com/ws/" + user.id,
      5,
      onMessage
    );
    return Socket.init();
  };

  const onMessage = (msgObj) => {
    console.log("rcv message=", msgObj);
    let type = parseInt(msgObj.type);
    switch (type) {
      case 110:
        break;
      case 120:
        // createroom
        user.roomId = msgObj.body.id;
        store.commit("syncRoomId", user.roomId);
        break;
      case 130:
        // join room
        handle130(msgObj);
        break;
      case 300:
        // rcv message
        handle300(msgObj);
        break;
      case 310:
        // update status
        handle310(msgObj);
        break;
    }
  };

  const handle130 = (msgObj) => {
    localStorage.setItem(
      "roominfo:" + user.roomId,
      JSON.stringify(msgObj.body)
    );
    user.roomInfo = msgObj.body;
    // sync vuex
    store.commit("syncRoomInfo", user.roomInfo);
    store.commit("syncNicknames", msgObj.body.nicknames);
  };

  const handle300 = (msgObj) => {
    let { auth, context } = msgObj.body;
    if (parseInt(user.roomInfo.size) == 2) {
      let rawBody = JSON.parse(aesDecrypt(context, rsaDecrypt(auth, user.pri)));
      console.log("rawBody", rawBody);

      //return 310 to peer
      Socket.sendSock({
        type: 310,
        from: msgObj.to,
        to: msgObj.from,
        body: { localid: rawBody.localid },
      }).then((obj2) => {
        // console.log('send 310 complete')
        addRecords(rawBody);
      });
    } else {
      // console.log('rcvd key=',user.roomInfo.passwd)
      let rawBody = JSON.parse(aesDecrypt(context, user.roomInfo.passwd));
      console.log("rawBody", rawBody);
      addRecords(rawBody);
    }
  };

  // update chat status
  const handle310 = (msgObj) => {
    let { localid } = msgObj.body;
    if (localid) {
      console.log("sync records");
      let key = "records:" + user.roomId;
      // load from cache
      let str = localStorage.getItem(key);
      let obj = JSON.parse(str);
      obj.forEach((item) => {
        if (localid == item.localid) {
          item.status = "2";
        }
      });
      user.chatRecords[key] = obj;
      localStorage.setItem(key, JSON.stringify(obj));
      //sync vuex
      store.commit("syncChatRecords", obj);
    }
  };

  // Create Room
  const createRoom = async (name, size) => {
    return new Promise((resolve, reject) => {
      let msg = {
        type: 120,
        from: user.id,
        to: "server",
        body: { name: name, size: size },
      };
      // websock.sendSock(msg)
      Socket.sendSock(msg).then((msgObj) => {
        user.roomId = msgObj.body.id;
        store.commit("syncRoomId", user.roomId);

        let href = window.location.href;
        href = href.substring(0, href.indexOf("#"));
        href = href + "#/chatroom?id=" + user.roomId;
        console.log("syncChatRoomUrl", href);
        store.commit("syncChatRoomUrl", href);

        resolve(msgObj);
      });
    });
  };

  // Join Room
  const joinRoom = (nickname) => {
    return new Promise((resolve, reject) => {
      let msg = {
        type: 130,
        from: user.id,
        to: "server",
        body: {
          roomid: user.roomId,
          userid: user.id,
          pub: user.pub,
          nickname: nickname,
        },
      };
      Socket.sendSock(msg).then((obj) => {
        handle130(obj);
        addRecords("");
        resolve(obj);
      });
    });
  };

  // Send Message
  const sendMsg = (msg) => {
    return new Promise((resolve, reject) => {
      // if not enough user, no send
      if (user.roomInfo.users.length < 2) {
        reject({ error: t("chatroom.msg") });
        return;
      }

      // room type is 2 , send to peer
      if (parseInt(user.roomInfo.size) == 2) {
        let tos = user.roomInfo.users.filter((userid) => {
          if (userid != user.id) {
            return userid;
          }
        });
        let to = null;
        if (tos.length > 0) {
          to = tos[0];
        }
        console.log("sendMsg to ", to);
        if (to) {
          let rawBody = {
            msg: msg,
            from: user.id,
            to: to,
            status: 0,
            time: ftime(new Date()),
            localid: new SnowflakeID().generate(),
          }; //body before encrypt
          let source = JSON.stringify(rawBody);
          let key = "s" + new SnowflakeID().generate().substring(0, 3); // generate session key
          let auth = rsaEncrypt(key, user.roomInfo.pubs[to]); //public key encrypt
          console.log("key:", key, user.roomInfo.pubs[to]);

          let encrypt = aesEncrypt(source, key); //session key encrypt content,id
          let obj = {
            type: 140,
            from: user.id,
            to: user.roomId,
            body: { auth: auth, context: encrypt },
          };
          Socket.sendSock(obj).then((msgObj) => {
            addRecords(rawBody);
            resolve(rawBody);
          });
        }
      } else {
        // more than 2, room send everyone
        let to = user.roomId;
        let rawBody = {
          msg: msg,
          from: user.id,
          to: to,
          status: 2,
          time: ftime(new Date()),
          localid: new SnowflakeID().generate(),
        };
        console.log("passwd=", user.roomInfo.passwd);
        //body
        let encrypt = aesEncrypt(JSON.stringify(rawBody), user.roomInfo.passwd);
        let obj = {
          type: 140,
          from: user.id,
          to: to,
          body: { context: encrypt },
        };
        Socket.sendSock(obj).then((msgObj) => {
          addRecords(rawBody);
          resolve(rawBody);
        });
      }
    });
  };

  // save log to local
  const addRecords = (param) => {
    console.log("addRecords:", param);
    let key = "records:" + user.roomId;
    let obj = user.chatRecords[key];
    if (!obj) {
      // load from cache
      let str = localStorage.getItem(key);
      if (!str) {
        // initialize null
        localStorage.setItem(key, "[]");
        obj = [];
        user.chatRecords[key] = obj;
      } else {
        obj = JSON.parse(str);
        user.chatRecords[key] = obj;
      }
    }
    if (param != "") {
      obj.push(param);
    }

    localStorage.setItem(key, JSON.stringify(obj));

    //synchronize to vuex
    store.commit("syncChatRecords", obj);
  };

  // time format
  const ftime = (t) => {
    if (t) {
      console.log("t", t);
      return dateFormat("YYYY-mm-dd HH:MM:SS", t);
    } else {
      return "";
    }
  };

  return {
    user,
    connect,
    createRoom,
    loadCacheUser,
    createUser,
    joinRoom,
    sendMsg,
  };
};

export default RoomModel;
