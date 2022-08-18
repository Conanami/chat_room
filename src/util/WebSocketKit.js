var websock;
var options = {url:'', heartDelay: 5}
var isConnect = false
var rec, timeoutObj
var heartMsg = JSON.stringify({type:100})
var globalCallback = function (obj) {}

const configWebSocket = (url, heartDelay) =>{
    options = {url:url, heartDelay: heartDelay}
}

const init = (callback)=>{
    if(callback){
        globalCallback = callback
    }
    if(!isConnect){
        websock = new WebSocket(options.url)
        websock.onmessage = (e)=>{
            console.log('receive:', e.data)
            let obj = JSON.parse(decodeUnicode(e.data))
            if(!obj){
                // 重发心跳
            }else{
                globalCallback(obj)
            }
        }
        websock.onclose = (e)=>{
            console.log('onclose', e)
            isConnect = false
        }
        websock.onopen = (e)=>{
            console.log('onopen', e.target.url)
            isConnect = true
            startHeart()
        }
        websock.onerror = (e)=>{
            console.log('onerror', e)
            isConnect = false
            reConnect()
        }   
    }
}

const sendSock = (agentData)=>{
    if (websock==null || isConnect==false) {
        // 如果没有初始化，重连，等待5s后重新发送
        console.log('websock is null? ', websock==null)
        console.log('isConnect', isConnect)
        reConnect();
        setTimeout(function () {
            sendSock(agentData)
        }, 5000)
    }else{
        if (websock.readyState === websock.OPEN) {
            // 若是ws开启状态
            websocketsend(agentData)
        } else if (websock.readyState === websock.CONNECTING) {
            // 若是 正在开启状态，则等待1s后重新调用
            setTimeout(function () {
                sendSock(agentData)
            }, 1000)
        }
    }
}

// 数据发送
function websocketsend(agentData) {
    console.log('send: ', JSON.stringify(agentData))
    websock.send(JSON.stringify(agentData))
}

//定义重连函数
const reConnect = () => {
    if (isConnect) return; //如果已经连上就不在重连了
    console.log("尝试重新连接");
    rec && clearTimeout(rec);
    rec = setTimeout(function () { // 延迟5秒重连  避免过多次过频繁请求重连
        init();
    }, 5000);
};

//开启心跳
const startHeart = ()=>{
    timeoutObj && clearTimeout(timeoutObj)
    timeoutObj = setTimeout(function () {
        if (isConnect) {
            console.log('send', heartMsg)
            websock.send(heartMsg);
        }
    }, options.heartDelay);
}

// 重置心跳
const resetHeart = ()=>{
    timeoutObj && clearTimeout(timeoutObj);
    startHeart();
}

// 停止心跳
const stopHeart = ()=>{
    timeoutObj && clearTimeout(timeoutObj);
}

// 返回是否连接的状态
const getStatus = ()=>{
    return isConnect
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

export {init, configWebSocket, sendSock, getStatus}