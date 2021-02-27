/**
 * 传入商品的规格列表，返回价格的范围
 */
function getMinMaxPrice(specificationList) {
  if (specificationList != null && specificationList.length > 0){
    var arr = new Array()
    for (var i = 0; i < specificationList.length;i++){
      arr.push(specificationList[i].price)
    }
    var len = specificationList.length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {        // 相邻元素两两对比
          var temp = arr[j + 1];        // 元素交换
          arr[j + 1] = arr[j];
          arr[j] = temp;
        }
      }
    }
    if (arr.length >= 2 && (arr[0] != arr[arr.length - 1])){
      return arr[0] + '-' + arr[arr.length - 1] + '元'
    }
    if (arr.length = 1 || (arr[0] == arr[arr.length - 1])){
      return arr[0] + '元'
    }else{
      return ''
    }
    
  }
} 

/**
 * 传入商品的规格列表，返回重量的范围
 */
function getMinMaxWeight(specificationList) {
  if (specificationList != null && specificationList.length > 0) {
    var arr = new Array()
    for (var i = 0; i < specificationList.length; i++) {
      arr.push(specificationList[i].weight)
    }
    var len = specificationList.length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {        // 相邻元素两两对比
          var temp = arr[j + 1];        // 元素交换
          arr[j + 1] = arr[j];
          arr[j] = temp;
        }
      }
    }
    if (arr.length >= 2 && (arr[0] != arr[arr.length - 1])) {
      return arr[0].toFixed(2) + '-' + arr[arr.length - 1].toFixed(2) + 'KG'
    }
    if (arr.length = 1 || (arr[0] == arr[arr.length - 1])) {
      return arr[0].toFixed(2) + 'KG'
    } else {
      return ''
    }

  }
} 

//数据转化
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
*/
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];
  
  var date;
  if ((number + '').length == 10){
    date = new Date(number * 1000);
  }else{
    date = new Date(number);
  }
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

function stringFormatTime(dateString) {
  let date = dateString.slice(0, 4) + '-' + dateString.slice(4, 6)
    + '-' + dateString.slice(6, 8) + ' ' + dateString.slice(8, 10) + ':' +
    dateString.slice(10, 12) + ':' + dateString.slice(12, 14)
  
  return date;
}
/**
 * 判断是否是保留两位小数的正整数
 */
function isTowDecimalPlacesNum(num){
  var numStr = num + ''
  if(numStr.indexOf('.') == -1){
    return false
  }
  //这个正则当是正整数的时候也返回true,所以要在他之前判断是不是一个小数
  var res = /^[0-9]+(.[0-9]{2})?$/
  return res.test(num)
}

/**
 * 强制将制定的数字，保留n为小数
 */
function changeTwoDecimal_f(num,n) {
  var f_x = parseFloat(num);
  if (isNaN(f_x)) {
    alert('function:changeTwoDecimal->parameter error');
    return false;
  }
  f_x = Math.round(f_x * 100) / 100;
  var s_x = f_x.toString();
  var pos_decimal = s_x.indexOf('.');
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += '.';
  }
  while (s_x.length <= pos_decimal + n) {
    s_x += '0';
  }
  return s_x;
}

module.exports = {
  getMinMaxPrice: getMinMaxPrice,
  getMinMaxWeight: getMinMaxWeight,
  timestampFormat: formatTime,
  stringFormatTime: stringFormatTime,
  isTowDecimalPlacesNum: isTowDecimalPlacesNum,
  changeTwoDecimal_f: changeTwoDecimal_f
}
