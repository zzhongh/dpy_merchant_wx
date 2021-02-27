// pages/personalCenter/setting/setting.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 退出登录
  */
  logout:function(){
    wx.showModal({
      title: '温馨提示',
      content: "是否退出当前账号？",
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync('userToken', '')
          wx.setStorageSync('isLogin', false)
          wx.switchTab({
            url: '../../index/index'
          })
        }
      },
      fail: function () {
        if (res.confirm) {

        }
      }
    })
  },
  /**
   * 关于我们
  */
  aboutUs:function(){
    wx.navigateTo({
      url: '../aboutUs/aboutUs',
    })
  },
  /**
   * 免密支付
  */
  goToSetPayWithoutPassword:function(){
    var that = this
    var url = app.data.HOST + 'wallet/passwordIsEmpty'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        if (res == true) {  // 已设置过支付密码
          wx.navigateTo({
            url: '../updatePayWithoutPasswordStatus/updatePayWithoutPasswordStatus',
          })
        } else {            // 未设置过支付密码 
          wx.showModal({
            title: '温馨提示',
            content: "请先设置支付密码",
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../resetPayPassword/resetPayPassword',
                })
              }
            },
            fail: function () {
              if (res.confirm) {

              }
            }
          })
        }
      }
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 重置支付密码
  */
  resetPayPassword:function(){
    wx.navigateTo({
      url: '../resetPayPassword/resetPayPassword',
    })
  }
})