var websock;
var options = { url: "", heartDelay: 5 };
var isConnect = false;
var rec, timeoutObj;
var heartMsg = JSON.stringify({ type: 100 });
var globalCallback = function (obj) {};

const configWebSocket = (url, heartDelay) => {
  options = { url: url, heartDelay: heartDelay };
};

const init = (callback) => {
  if (callback) {
    globalCallback = callback;
  }
  if (!isConnect) {
    websock = new WebSocket(options.url);
    websock.onmessage = (e) => {
      console.log("receive:", e.data);
      let obj = JSON.parse(decodeUnicode(e.data));
      if (!obj) {
        // resend heartbeat
      } else {
        globalCallback(obj);
      }
    };
    websock.onclose = (e) => {
      console.log("onclose", e);
      isConnect = false;
    };
    websock.onopen = (e) => {
      console.log("onopen", e.target.url);
      isConnect = true;
      startHeart();
    };
    websock.onerror = (e) => {
      console.log("onerror", e);
      isConnect = false;
      reConnect();
    };
  }
};

const sendSock = (agentData) => {
  if (websock == null || isConnect == false) {
    // no init, wait 5 second ,reconnect
    console.log("websock is null? ", websock == null);
    console.log("isConnect", isConnect);
    reConnect();
    setTimeout(function () {
      sendSock(agentData);
    }, 5000);
  } else {
    if (websock.readyState === websock.OPEN) {
      // if open
      websocketsend(agentData);
    } else if (websock.readyState === websock.CONNECTING) {
      // if connecting , wait 1 sec.
      setTimeout(function () {
        sendSock(agentData);
      }, 1000);
    }
  }
};

// send data
function websocketsend(agentData) {
  console.log("send: ", JSON.stringify(agentData));
  websock.send(JSON.stringify(agentData));
}

// reconnect
const reConnect = () => {
  if (isConnect) return;
  console.log("try reconnect");
  rec && clearTimeout(rec);
  rec = setTimeout(function () {
    // wait 5 secs
    init();
  }, 5000);
};

//start heartbeat
const startHeart = () => {
  timeoutObj && clearTimeout(timeoutObj);
  timeoutObj = setTimeout(function () {
    if (isConnect) {
      console.log("send", heartMsg);
      websock.send(heartMsg);
    }
  }, options.heartDelay);
};

// reset heartbeat
const resetHeart = () => {
  timeoutObj && clearTimeout(timeoutObj);
  startHeart();
};

// stop heartbeat
const stopHeart = () => {
  timeoutObj && clearTimeout(timeoutObj);
};

// return status of connection
const getStatus = () => {
  return isConnect;
};

// globalCallback(JSON.parse(e.data))
const decodeUnicode = (str) => {
  str = str.replace(/\\/g, "%");
  //UTF
  str = unescape(str);
  //roll back
  str = str.replace(/%/g, "\\");
  //URL
  str = str.replace(/\\/g, "");
  return str;
};

export { init, configWebSocket, sendSock, getStatus };
