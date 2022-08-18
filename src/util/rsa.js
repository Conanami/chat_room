import jsrsasign from 'jsrsasign'
import CryptoJS from 'crypto-js'

const trimKey = (str)=> {
    str = str.replace(/.*--\r\n/, "");
    str = str.replace(/\r\n---.*/, "");
    str = str.replace(new RegExp("\r\n",'g'), "");
    return str;
}

/**
 *
 * @returns 生成RSA密钥对，密钥长度1024， 私钥格式 pcks1, 公钥格式 pkcs8
 */
const generateKey = ()=>{

    let rsaKeypair = jsrsasign.KEYUTIL.generateKeypair("RSA", 1024);
	let prikey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS1PRV");
	let pubkey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.pubKeyObj);
    // console.log(pubkey);
    // console.log(prikey);
    return {'pri':trimKey(prikey), 'pub':trimKey(pubkey), id: md5(trimKey(pubkey))};
}

/**
 *
 * @param {原文} str
 * @returns 密文
 */
const md5 = (str)=>{
	return CryptoJS.MD5(str).toString().toLocaleLowerCase();
}

/**
 * aes 加密
 * @param encryptString 要加密的字符串
 * @param key 秘钥
 * @returns {string} 加密后的字符串
 */
const aesEncrypt = (encryptString, key) => {
    var key2 = CryptoJS.enc.Utf8.parse(key);
    var srcs = CryptoJS.enc.Utf8.parse(encryptString);
    var encrypted = CryptoJS.AES.encrypt(srcs, key2, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

/**
 * aes 解密
 * @param decryptString 要解密的字符串
 * @param key 秘钥
 * @returns {string} 解密后的字符串
 */
const aesDecrypt = (decryptString, key) => {

    var key2 = CryptoJS.enc.Utf8.parse(key);
    var decrypt = CryptoJS.AES.decrypt(decryptString, key2, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

// RSA 公钥 加密
const rsaEncrypt = (txt, pub) => {
    let rsa = jsrsasign.KEYUTIL.getKey('-----BEGIN PUBLIC KEY-----' + pub + '-----END PUBLIC KEY-----');
    let enc = jsrsasign.KJUR.crypto.Cipher.encrypt(txt, rsa);
    return jsrsasign.hextob64(enc);
}

// RSA 私钥 解密
const rsaDecrypt = (txt, pri) => {
    // console.log('解密前数据:%o', txt);
    // console.log('解密私钥:%o', pri);
    let rsa = jsrsasign.KEYUTIL.getKey('-----BEGIN RSA PRIVATE KEY-----' + pri + '-----END RSA PRIVATE KEY-----');
    let uncrypted = jsrsasign.KJUR.crypto.Cipher.decrypt(jsrsasign.b64tohex(txt), rsa);

    // console.log('解密后数据:%o', uncrypted);

    return uncrypted;
}

// 使用密钥对 字符串加签，得到签名
const rsaSignCreate = (str, pri) =>{
    let sig = new jsrsasign.KJUR.crypto.Signature({"alg": "SHA1withRSA", 'prvkeypem': "-----BEGIN RSA PRIVATE KEY-----" + pri + '-----END RSA PRIVATE KEY-----'});
    sig.updateString(str);
    let sign = jsrsasign.hextob64(sig.sign());
    return sign;
}

// 使用公钥 验证签名和原文
const rsaSignVerify = (str, sign, pub)=>{
    let sig = new jsrsasign.KJUR.crypto.Signature({"alg": "SHA1withRSA", 'prvkeypem': "-----BEGIN PUBLIC KEY-----" + pub + '-----END PUBLIC KEY-----'});
    sig.updateString(str);
    let b = sig.verify(jsrsasign.b64tohex(sign));
    return b;
}

export  {trimKey, aesEncrypt, aesDecrypt, rsaEncrypt, rsaDecrypt, rsaSignCreate, rsaSignVerify, generateKey, md5}
