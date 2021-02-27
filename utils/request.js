
//sessionChoose 1是带sessionID的GET方法  2是不带sessionID的GET方法, 3是带sessionID的Post方法,4是不带sessionID的Post方法
//ask是是否要进行询问授权，true为要，false为不要   { 'Authorization': app.data.token }
//sessionChoose为1,2,3,4,所以paramSession下标为0的则为空
const app = getApp()

function HttpRequst(url, method, params, success, fail) {
  var token = ""
  wx.getStorage({
    key: 'userToken',
    success: function (res) {
      token = res.data
      wx.request({
        url: url,
        data: params,
        dataType: "json",
        header: { 'Authorization': res.data },
        method: method,
        success: function (res) {
          success(res);
        },
        fail: function (res) {

          if (res) {
          
          }
          fail(res)
        },
        complete: function (res) {
          var statusCode = res.statusCode
          if (res.statusCode && res.statusCode == 401) {
            wx.setStorageSync('userToken', '')
            wx.setStorageSync('isLogin', false)
            //未登录
            wx.showToast({
              icon: 'none',
              title: '登录状态过期，请重新登录',
            })
            wx.redirectTo({
              url: '/pages/login/login'
            })
          } else if (res.statusCode && res.statusCode == 400) {
            //参数错误
            wx.showToast({
              icon: 'none',
              title: '参数错误',
            })
          } else if (res.statusCode && res.statusCode == 500) {
            //请联系客服
            wx.showToast({
              icon: 'none',
              title: '请联系客服',
            })
          } else if (res.statusCode && res.statusCode != 200) {
            if (res.errMsg && res.errMsg) {
              wx.showToast({
                icon: 'none',
                title: res.errMsg,
              })
            }

          }
        }
      })
    },
    fail: function (res) {

    }
  })
  
}


module.exports = {
  HttpRequst: HttpRequst,
}