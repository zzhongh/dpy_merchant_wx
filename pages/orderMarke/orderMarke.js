// pages/login/login.js
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //备注的内容
    markes:'',
    //备注的字数
    fontNum:0,
    //历史备注列表
    historyMarkeList:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    var markes = options.markes
    this.setData({ markes: markes })
    var that = this 
    wx.getStorage({
      key: 'historyMarkeList',
      success: function(res) {
        console.log(res.data)
        that.setData({ historyMarkeList: res.data })
      },
      fail:function(res){
        wx.setStorage({
          key: 'historyMarkeList',
          data: [],
        })
      }

    })
  },

  /**
   * 输入框输入的监听
   */
  bindInput:function(e){
    var value = e.detail.value

    

    this.setData({ markes: e.detail.value, fontNum: e.detail.value.length })

  },
  /**
   * 历史记录被点击
   */
  historyClick:function(e){
    var item = e.currentTarget.dataset.item
    //将此次的备注内容返回到待确认订单界面
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    prevPage.setData({ remarkeStr: item })
    wx.navigateBack()
  },
  /**
   * 点击确定
   */
  entry:function(){

    // var markes = this.data.markes
    if (this.data.markes == null || this.data.markes == undefined){
      this.setData({ markes: ''})
    }
    var historyMarkeList = this.data.historyMarkeList
    //判断以及存在的历史数据中是否已经有了这个
    var hasInHistroy = false
    for (var i = 0; i < historyMarkeList.length; i++) {
      if (historyMarkeList[i] == this.data.markes) {
        hasInHistroy = true
      }
    }
    if (!hasInHistroy) {
      historyMarkeList.push(this.data.markes)
    }
    //将最新的历史记录存储
    wx.setStorage({
      key: 'historyMarkeList',
      data: historyMarkeList,
    })
    this.setData({ historyMarkeList: historyMarkeList })
    //将此次的备注内容返回到待确认订单界面
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    prevPage.setData({ remarkeStr: this.data.markes})
    wx.navigateBack()
  },
  login:function(){

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
  
  }
})