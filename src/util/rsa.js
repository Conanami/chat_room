import jsrsasign from "jsrsasign";
import CryptoJS from "crypto-js";

const trimKey = (str) => {
  str = str.replace(/.*--\r\n/, "");
  str = str.replace(/\r\n---.*/, "");
  str = str.replace(new RegExp("\r\n", "g"), "");
  return str;
};

/**
 *
 * @returns rsa pair，key length 1024， priv key pcks1, pub key pkcs8
 */
const generateKey = () => {
  let rsaKeypair = jsrsasign.KEYUTIL.generateKeypair("RSA", 1024);
  let prikey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS1PRV");
  let pubkey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.pubKeyObj);
  // console.log(pubkey);
  // console.log(prikey);
  return {
    pri: trimKey(prikey),
    pub: trimKey(pubkey),
    id: md5(trimKey(pubkey)),
  };
};

/**
 *
 * @param  str unencrypted
 * @returns cyphertext
 */
const md5 = (str) => {
  return CryptoJS.MD5(str).toString().toLocaleLowerCase();
};

/**
 * aes encrypt
 * @param encryptString string to be encrypted
 * @param key priv key
 * @returns {string} string
 */
const aesEncrypt = (encryptString, key) => {
  var key2 = CryptoJS.enc.Utf8.parse(key);
  var srcs = CryptoJS.enc.Utf8.parse(encryptString);
  var encrypted = CryptoJS.AES.encrypt(srcs, key2, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

/**
 * aes decrypt
 * @param decryptString string to be decrypted
 * @param key priv key
 * @returns {string} string after decrypted
 */
const aesDecrypt = (decryptString, key) => {
  var key2 = CryptoJS.enc.Utf8.parse(key);
  var decrypt = CryptoJS.AES.decrypt(decryptString, key2, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
};

// RSA pub key encrypt
const rsaEncrypt = (txt, pub) => {
  let rsa = jsrsasign.KEYUTIL.getKey(
    "-----BEGIN PUBLIC KEY-----" + pub + "-----END PUBLIC KEY-----"
  );
  let enc = jsrsasign.KJUR.crypto.Cipher.encrypt(txt, rsa);
  return jsrsasign.hextob64(enc);
};

// RSA priv key decrypt
const rsaDecrypt = (txt, pri) => {
  let rsa = jsrsasign.KEYUTIL.getKey(
    "-----BEGIN RSA PRIVATE KEY-----" + pri + "-----END RSA PRIVATE KEY-----"
  );
  let uncrypted = jsrsasign.KJUR.crypto.Cipher.decrypt(
    jsrsasign.b64tohex(txt),
    rsa
  );
  return uncrypted;
};

// create signature
const rsaSignCreate = (str, pri) => {
  let sig = new jsrsasign.KJUR.crypto.Signature({
    alg: "SHA1withRSA",
    prvkeypem:
      "-----BEGIN RSA PRIVATE KEY-----" + pri + "-----END RSA PRIVATE KEY-----",
  });
  sig.updateString(str);
  let sign = jsrsasign.hextob64(sig.sign());
  return sign;
};

// public key verify sig and content
const rsaSignVerify = (str, sign, pub) => {
  let sig = new jsrsasign.KJUR.crypto.Signature({
    alg: "SHA1withRSA",
    prvkeypem: "-----BEGIN PUBLIC KEY-----" + pub + "-----END PUBLIC KEY-----",
  });
  sig.updateString(str);
  let b = sig.verify(jsrsasign.b64tohex(sign));
  return b;
};

export {
  trimKey,
  aesEncrypt,
  aesDecrypt,
  rsaEncrypt,
  rsaDecrypt,
  rsaSignCreate,
  rsaSignVerify,
  generateKey,
  md5,
};
