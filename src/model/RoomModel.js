/**
 * 聊天室的model层
 * 1， 如果只是为了创建房间，调用 createRoom 即可。
 * 2， 如果已经有了房间，准备进入， 首先要调用 loadCacheRoom 尝试加载缓存数据，如果没有，则需要调用 createUser 来生成用户密钥对数据
 * 3,  有了用户数据后，需要调用 connect 连接聊天服务器，然后调用 joinRoom 加入房间
 * 4，
 */
import {aesDecrypt, aesEncrypt, generateKey, rsaDecrypt, rsaEncrypt} from '@/util/rsa.js'
import SnowflakeID from '@/util/snowflake.js'
import dateFormat from '@/util/time.js'
import {reactive,computed} from 'vue'
import {useStore} from 'vuex'
import * as Socket from '../util/Socket'

const RoomModel = () => {

    var user = reactive({
        id: new SnowflakeID().generate(),
        pub: '',
        pri: '',
        roomId: '',
        roomInfo: {},  // {id:abc123, users:['user1', 'user2', 'user3'], pubs:{user1: yyyy, user2: yyyy2}, name:'聊天室名字', size:2 }
        chatRecords: {},
    })

    const KEY_ROOM = 'room:'
    const store = useStore()

    //  尝试加载缓存里面的房间信息，如果没有，返回 false。
    const loadCacheUser = (roomId) => {
        let l = localStorage.getItem(KEY_ROOM + roomId);

        if (l == undefined || l.indexOf('error') == 1) {
            return false
        }
        let obj = JSON.parse(localStorage.getItem(KEY_ROOM + roomId))
        user.id = obj.id
        user.pub = obj.pub
        user.pri = obj.pri
        user.roomId = obj.roomId
        // 数据同步给 vuex
        store.commit('syncUser', obj);
        store.commit('syncRoomId', user.roomId)

        console.log('room:' + roomId + ' load cache complete', obj)
        return true

    }

    // 创建用户密钥对
    const createUser = (roomId) => {

        let rsa = {id: new SnowflakeID().generate(), pri:'', pub:''}
        if(roomId.substring(0,2)=='2s'){
            //双人聊天室
            rsa = generateKey()
        }

        rsa.roomId = roomId

        user.pub = rsa.pub
        user.pri = rsa.pri
        user.id = rsa.id
        user.roomId = roomId
        console.log('room:' + roomId + ' create complete', rsa)
        store.commit('syncUser', rsa)
        localStorage.setItem(KEY_ROOM + roomId, JSON.stringify(rsa))
    }

    // 连接服务器
    const connect = async () => {
        // Socket.configWebSocket("ws://127.0.0.1:2740/ws/" + user.id, 5, onMessage)
        Socket.configWebSocket("wss://dev.huifintech.com/ws/" + user.id, 5, onMessage)
        return Socket.init()
    }

    const onMessage = (msgObj) => {
        console.log('收到信息=', msgObj)
        let type = parseInt(msgObj.type)
        switch (type) {
            case 110:
                break
            case 120:
                // 房间创建返回
                user.roomId = msgObj.body.id;
                store.commit('syncRoomId', user.roomId)
                break
            case 130:
                // 加入房间返回
                handle130(msgObj);
                break
            case 300:
                // 收到聊天信息
                handle300(msgObj);
                break
            case 310:
                // 收到310信息，修改聊天状态
                handle310(msgObj);
                break
        }
    }

    const handle130 = (msgObj) => {
        localStorage.setItem('roominfo:' + user.roomId, JSON.stringify(msgObj.body));
        user.roomInfo = msgObj.body
        // 同步聊天室信息给 vuex
        store.commit('syncRoomInfo', user.roomInfo)
    }

    const handle300 = (msgObj) => {
        let {auth, context} = msgObj.body;
        if(parseInt(store.getters.getUserLength)==2){
            let rawBody = JSON.parse(aesDecrypt(context, rsaDecrypt(auth, user.pri)));
            console.log('rawBody', rawBody);

            //返回310给对方
            Socket.sendSock({type: 310, from: msgObj.to, to: msgObj.from, body: {'localid': rawBody.localid}}).then((obj2)=>{
                // console.log('send 310 complete')
                addRecords(rawBody)
            })
        }else{
            console.log('接收的密码=',user.roomInfo.passwd)
            let rawBody = JSON.parse(aesDecrypt(context, user.roomInfo.passwd));
            console.log('rawBody', rawBody);
            addRecords(rawBody)
        }
    }

    // 修改聊天状态
    const handle310 = (msgObj) => {
        let {localid} = msgObj.body;
        if(localid){
            console.log('sync records')
            let key = 'records:' + user.roomId
            // 从缓存加载
            let str = localStorage.getItem(key)
            let obj = JSON.parse(str);
            obj.forEach(item => {
                if (localid == item.localid) {
                    item.status = '2'
                }
            })
            user.chatRecords[key] = obj;
            localStorage.setItem(key, JSON.stringify(obj))
            //同步聊天记录给 vuex
            store.commit('syncChatRecords', obj)
        }
    }

    // 创建房间
    const createRoom = async (name, size) => {
        return new Promise((resolve, reject)=>{
            let msg = {type: 120, from: user.id, to: 'server', body: {name: name, size: size}}
            // websock.sendSock(msg)
            Socket.sendSock(msg).then((msgObj)=>{
                user.roomId = msgObj.body.id;
                store.commit('syncRoomId', user.roomId)

                let href = window.location.href
                href = href.substring(0, href.indexOf('#'))
                href = href + '#/chatroom?id=' + user.roomId
                console.log('syncChatRoomUrl', href)
                store.commit('syncChatRoomUrl', href)

                resolve(msgObj)
            })
        })
    }

    // 加入房间
    const joinRoom = () => {
        return new Promise((resolve, reject)=>{
            let msg = {type: 130, from: user.id, to: 'server', body: {roomid: user.roomId, userid: user.id, pub: user.pub}}

            Socket.sendSock(msg).then((obj)=>{
                handle130(obj)
                addRecords('')
                resolve(obj)
            })
        })
    }

    // 发送消息
    const sendMsg = (msg) => {
        return new Promise((resolve, reject)=>{
            console.log('人数1=',store.getters.getUserLength)

            // 判断聊天室，如果只有两个人，那消息直接发给对方
            if (parseInt(user.roomInfo.size) == 2) {
                let tos = user.roomInfo.users.filter((userid) => {
                    if (userid != user.id) {
                        return userid
                    }
                })
                let to = null
                if (tos.length > 0) {
                    to = tos[0]
                }
                console.log('sendMsg to ', to)
                if (to) {
                    let rawBody = {
                        msg: msg, from: user.id, to: to
                        , status: 0, time: ftime(new Date()), localid: new SnowflakeID().generate()
                    }    //原始body
                    let source = JSON.stringify(rawBody)
                    let key = 's'+ new SnowflakeID().generate().substring(0, 3)          // 生成会话密钥
                    let auth = rsaEncrypt(key, user.roomInfo.pubs[to])    //使用公钥加密 会话密钥
                    console.log('key:', key, user.roomInfo.pubs[to])

                    let encrypt = aesEncrypt(source, key)     //使用会话密钥加密 聊天内容以及id
                    let obj = {type: 140, from: user.id, to: user.roomId, body: {auth: auth, context: encrypt}}
                    Socket.sendSock(obj).then((msgObj)=>{
                        addRecords(rawBody)
                        resolve(rawBody)
                    })
                }else{
                    reject({error:'对方尚未加入聊天室，无法发送消息'})
                }

            } else if (user.roomInfo.users.length > 2) {
                // 超过两个人，消息是发给聊天室的，由聊天室发给每个人
                let to  = user.roomId
                let rawBody = {
                    msg: msg, from: user.id, to: to
                    , status: 2, time: ftime(new Date()), localid: new SnowflakeID().generate()
                }
                console.log('发送的密码=',user.roomInfo.passwd)
                //原始body
                let encrypt = aesEncrypt(JSON.stringify(rawBody), user.roomInfo.passwd)
                let obj = {type: 140, from: user.id, to: to, body: {context: encrypt}}
                    Socket.sendSock(obj).then((msgObj)=>{
                        addRecords(rawBody)
                        resolve(rawBody)
                    })

            }
        });
    }

    // 保存聊天记录到本地
    const addRecords = (param) => {
        console.log('addRecords:', param)
        let key = 'records:' + user.roomId
        let obj = user.chatRecords[key];
        if (!obj) {
            // 从缓存加载
            let str = localStorage.getItem(key)
            if (!str) {
                // 初始化为 空
                localStorage.setItem(key, '[]')
                obj = []
                user.chatRecords[key] = obj;
            } else {
                obj = JSON.parse(str);
                user.chatRecords[key] = obj;
            }
        }
        if (param != '') {
            obj.push(param)
        }

        localStorage.setItem(key, JSON.stringify(obj))

        //同步聊天记录给 vuex
        store.commit('syncChatRecords', obj)
    }

    // 时间格式化
    const ftime = (t) => {
        if (t) {
            console.log('t', t)
            return dateFormat('YYYY-mm-dd HH:MM:SS', t)
        } else {
            return ''
        }
    }

    return {
        user, connect, createRoom, loadCacheUser, createUser, joinRoom, sendMsg
    }
}

export default RoomModel
