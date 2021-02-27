function requestPostApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'POST', sourceObj, successFun, failFun, completeFun)
}

function requestGetApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'GET', sourceObj, successFun, failFun, completeFun)
}

function requestDeleteApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'DELETE', sourceObj, successFun, failFun, completeFun)
}

function requestPutApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'PUT', sourceObj, successFun, failFun, completeFun)
}

/**
 * 请求API
 * @param  {String}   url         接口地址
 * @param  {Object}   params      请求的参数
 * @param  {String}   method      请求类型
 * @param  {Object}   sourceObj   来源对象
 * @param  {Function} successFun  接口调用成功返回的回调函数
 * @param  {Function} failFun     接口调用失败的回调函数
 * @param  {Function} completeFun 接口调用结束的回调函数(调用成功、失败都会执行)
 */
function requestApi(url, params, method, sourceObj, successFun, failFun, completeFun) {
  var contentType = 'application/json'
  var token = ''
  wx.getStorage({
    key: 'userToken',
    success: function (res) {
      token = res.data
      wx.request({
        url: url,
        method: method,
        data: params,
        header: { 'Content-Type': contentType, 'Authorization': res.data },
        success: function (res) {
          if (res.data.code == 100) {
            typeof successFun == 'function' && successFun(res.data.content, sourceObj)
          } else {
            if (res.data.message != null) {
              wx.showToast({
                icon: 'none',
                title: res.data.message,
              })
            } else {
              wx.showToast({
                icon: 'none',
                title: res.data.code,
              })
            }
          }
        },
        fail: function (res) {
          wx.showToast({
            title: String(res.statusCode) + res.errMsg,
            mask: true,
            duration: 2000
          })
          typeof failFun == 'function' && failFun(res.data, sourceObj)
        },
        complete: function (res) {
          if (res.errMsg.indexOf("UTF8") != -1){
            wx.setStorageSync('userToken', '')
            wx.setStorageSync('isLogin', false)
            wx.redirectTo({
              url: '/pages/login/login'
            })
            return
          }
          if (res.statusCode == 401) {
            wx.setStorageSync('userToken', '')
            wx.setStorageSync('isLogin', false)
            wx.redirectTo({
              url: '/pages/login/login'
            })
          } else if (res.statusCode && res.statusCode == 500) {
            //请联系客服
            wx.showToast({
              icon: 'none',
              title: '请联系客服',
            })
          } else if (res.statusCode != 200 && res.statusCode != 401) {
            wx.showToast({
              title: String(res.statusCode) + res.errMsg,
              mask: true,
              duration: 2000
            })
          }
          typeof completeFun == 'function' && completeFun(res, sourceObj)
        }
      })
    },
    fail: function (res) {

    }
  })
  
}
module.exports = {
  requestPostApi,
  requestGetApi,
  requestDeleteApi,
  requestPutApi
}