// pages/personalCenter/updatePayWithoutPasswordStatus/updatePayWithoutPasswordStatus.js
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
    this.getPayWithoutPasswordStatus()
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
   * 获取免密支付状态 payNonPasswordFlag=1 未开启 payNonPasswordFlag=1 已开启
   */
  getPayWithoutPasswordStatus:function(){
    var that = this
    var url = app.data.HOST + 'wallet/get'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({payInfo:res})
      }
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 更换免密支付状态 
  */
  update:function(){
    console.log(this.data.payInfo)
    wx.navigateTo({
      url: '../payPasswordInput/payPasswordInput?source=update&status=' + this.data.payInfo.payNonPasswordFlag.toString(),
    })
  }
})