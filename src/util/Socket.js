/**
 * Async WebSocket
 */

import { EventDispatcher } from "../util/EventDispatcher";

var websock;
var options = { url: "", heartDelay: 5 };
var isConnect = false;
var heartMsg = JSON.stringify({ type: 100 });
// var globalCallback = function (obj) {}
var eventDispatcher;

const configWebSocket = (url, heartDelay, callback) => {
  options = { url: url, heartDelay: heartDelay, callback: callback };
};

// globalCallback(JSON.parse(e.data))
const decodeUnicode = (str) => {
  str = str.replace(/\\/g, "%");
  //UTF-8
  str = unescape(str);
  //roll back decode
  str = str.replace(/%/g, "\\");
  //process URL
  str = str.replace(/\\/g, "");
  return str;
};

const init = () => {
  return new Promise((resolve, reject) => {
    if (!isConnect) {
      websock = new WebSocket(options.url);
      eventDispatcher = new EventDispatcher();
      websock.onmessage = (e) => {
        console.log("receive:", e.data);
        let obj = JSON.parse(decodeUnicode(e.data));
        if (!obj) {
          // reInit while error
          isConnect = false;
          reject({ error: "Data error" });
        } else {
          let type = parseInt(obj.type);
          if (parseInt(obj.type) == 110) {
            //reveive welcome
            resolve(obj);
          } else {
            if (eventDispatcher.containsListener(type)) {
              eventDispatcher.dispatchEvent(type, obj);
              eventDispatcher.removeListener(type, obj);
            } else {
              // no listening return
              let fun = options.callback;
              if (fun) fun(obj);
            }
          }
        }
      };
      websock.onclose = (e) => {
        console.log("onclose", e);
        isConnect = false;
      };
      websock.onopen = (e) => {
        console.log("onopen");
        isConnect = true;
        // startHeart()
      };
      websock.onerror = (e) => {
        console.log("onerror", e);
        isConnect = false;
        // console.log(e.data)
        reject({ message: "Server Config Error" });
      };
    } else {
      resolve({});
    }
  });
};

/**
 * send Data
 */
const sendSock = (agentData) => {
  return new Promise((resolve, reject) => {
    if (!isConnect) {
      init()
        .then(() => {
          sendSock(agentData);
        })
        .catch(() => {
          reject({ message: "Exception while sending data" });
        });
    } else {
      let type = parseInt(agentData.type);
      eventDispatcher.addListener(type, resolve);
      websock.send(JSON.stringify(agentData));
    }
  });
};

export { configWebSocket, init, sendSock };
