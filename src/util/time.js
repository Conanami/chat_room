/**

        * let date = new Date()
        * dateFormat("YYYY-mm-dd HH:MM:SS", date)           2020-02-09 14:04:23
        * dateFormat("YYYY-mm-dd HH:MM:SS Q", date)         2020-02-09 14:09:03 一
        * dateFormat("YYYY-mm-dd HH:MM:SS WWW", date)       2020-02-09 14:45:12 星期日
        * dateFormat("YYYY-mm-dd HH:MM:SS QQQQ", date)      2020-02-09 14:09:36 第一季度
        * dateFormat("YYYY-mm-dd HH:MM:SS WWW QQQQ", date)  2020-02-09 14:46:12 星期日 第一季度
 * @param {*} format 
 * @param {*} date 
 * @returns 
 */
function dateFormat(format, date) {
  let we = date.getDay(); // week
  let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // quarter
  const opt = {
    "Y+": date.getFullYear().toString(), // year
    "m+": (date.getMonth() + 1).toString(), // month from 0 plus 1
    "d+": date.getDate().toString(), // date
    "H+": date.getHours().toString(), // hour
    "M+": date.getMinutes().toString(), // minute
    "S+": date.getSeconds().toString(), // second
    "q+": qut, // quarter
  };
  const week = {
    // Weekday
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturnday",
  };
  const quarter = {
    // Quarter
    1: "first",
    2: "second",
    3: "third",
    4: "fourth",
  };
  if (/(W+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? "Weekday:" + week[we]
          : "Week" + week[we]
        : week[we]
    );
  }
  if (/(Q+)/.test(format)) {
    //
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length == 4 ? "" + quarter[qut] + " Quarter" : quarter[qut]
    );
  }
  for (let k in opt) {
    let r = new RegExp("(" + k + ")").exec(format);
    if (r) {
      format = format.replace(
        r[1],
        RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, "0")
      );
    }
  }
  return format;
}

module.exports = dateFormat;
