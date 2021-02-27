// pages/personalCenter/aboutUs/aboutUs.js
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
    this.imgHeight()
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
  // 获取图片宽高
  imgHeight: function () {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var winHei = wx.getSystemInfoSync().windowHeight; //获取当前屏幕的宽度
    var logoH = (winWid * 0.3) * 292 / 302 + "px"
    var qrH = (winWid * 0.3) * 200 / 200 + "px"
    this.setData({
      logoH: logoH,
      qrH: qrH
    })
  },
})