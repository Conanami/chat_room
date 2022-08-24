/**
 * 使用 异步，Promis 重构 websocket 的使用
 */

import {EventDispatcher} from '../util/EventDispatcher'


var websock;
var options = {url:'', heartDelay: 5}
var isConnect = false
var heartMsg = JSON.stringify({type:100})
// var globalCallback = function (obj) {}
var eventDispatcher 

const configWebSocket = (url, heartDelay, callback) =>{
    options = {url:url, heartDelay: heartDelay, callback: callback} 
}

// globalCallback(JSON.parse(e.data))
const decodeUnicode = (str)=> {
    str = str.replace(/\\/g, "%");
    //转换中文
    str = unescape(str);
    //将其他受影响的转换回原来
    str = str.replace(/%/g, "\\");
    //对网址的链接进行处理
    str = str.replace(/\\/g, "");
    return str;
}

const init = ()=>{
    return new Promise((resolve, reject)=>{
        if(!isConnect){
            websock = new WebSocket(options.url)
            eventDispatcher = new EventDispatcher();
            websock.onmessage = (e)=>{
                console.log('receive:', e.data)
                let obj = JSON.parse(decodeUnicode(e.data))
                if(!obj){
                    // 异常就重新初始化吧
                    isConnect = false
                    reject({error:'数据异常'})
                }else{
                    let type = parseInt(obj.type)
                    if (parseInt(obj.type)==110){
                        //收到欢迎消息
                        resolve(obj)
                    }else{
                        if(eventDispatcher.containsListener(type)){
                            eventDispatcher.dispatchEvent(type, obj)
                            eventDispatcher.removeListener(type, obj)
                        }else{
                            // 没有监听的，走全局通用返回
                            let fun = options.callback
                            if (fun) fun(obj)
                        }
                    }
                }
            }
            websock.onclose = (e)=>{
                console.log('onclose', e)
                isConnect = false
            }
            websock.onopen = (e)=>{
                console.log('onopen')
                isConnect = true
                // startHeart()
            }
            websock.onerror = (e)=>{
                console.log('onerror', e)
                isConnect = false
                // console.log(e.data)
                reject({message:'聊天服务器配置异常'})
            }   
        }else{
            resolve({})
        }
    }) 
}

/**
 * 发送数据
 */
const sendSock = (agentData)=>{
    return new Promise((resolve, reject)=>{
        if(!isConnect){
            init().then(()=>{
                sendSock(agentData)
            }).catch(()=>{
                reject({message:'数据发送异常'})
            })
        }else{
            let type = parseInt(agentData.type)
            eventDispatcher.addListener(type, resolve)
            websock.send(JSON.stringify(agentData))
        }
    })
}

// const createRoom = (agentData) => {
//     return new Promise((resolve, reject)=>{
//         eventDispatcher.addListener(120, resolve)
//         sendSock(agentData).catch((errObj)=>{
//             reject(errObj)
//         })
//     })
// }

// const joinRoom = (agentData) => {
//     return new Promise((resolve, reject)=>{
//         eventDispatcher.addListener(130, resolve)
//         sendSock(agentData).catch((errObj)=>{
//             reject(errObj)
//         })
//     })
// }

export {configWebSocket, init, sendSock}