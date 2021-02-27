//pages/personalCenter/personalCenter.js
const app = getApp()
var toastStatus = true;
var touchDot = 0;//触摸时的原点
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = "";// 记录/清理时间记录
var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
Page({

  /**
   * 页面的初始数据  6df04931-43e8-4889-a072-066389c8eaf2
   */
  data: {
    toastStatus: toastStatus,
    servicePhone:'18789100819',
    unreadCountIsShow:false,
    //是否显示选择微信支付时弹出的提示框
    isShowWxModal: false,
    rechargeImgHeight: (winWid / 2 * 0.7) * 200 / 540 + "px"
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
    this.getRelatedData()
    this.getConfigList()
    this.getMessageList()
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
  toastShow: function () {
    // console.log("触发了点击事件，弹出toast")
    toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    // console.log("触发bindchange，隐藏toast")
    toastStatus = true
    this.setData({ toastStatus: toastStatus })
  },
  // 获取图片宽高
  imgHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height;//图片高度
    var imgw = e.detail.width;//图片宽度
    var swiperH = winWid * imgh / imgw + "px"
    var categorySwiperH = (winWid / 2 * 0.7) * 200 / 540 + "px"
    this.setData({
      Height: swiperH,//设置高度
      rechargeImgHeight: categorySwiperH
    })
  },
  /**
   * 获取个人中心信息
   */
  getRelatedData:function(){
    var that = this
    that.toastShow()
    var url = app.data.HOST + 'merchant/relatedData'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      wx.hideNavigationBarLoading()
      if (res != null) { 
        res.balance = res.balance.toFixed(2)
        that.setData({ relatedData: res })
        if (res.merchant.telephone != null && res.merchant.telephone != "") {
          that.setData({ telephone: res.merchant.telephone.slice(0, 3) + "****" + res.merchant.telephone.slice(-4) })
          wx.setStorage({
            key: "registerPhone",
            data: res.merchant.telephone
          })
        }
        if (res.merchant.wxOpenId != "1") {  //微信已解绑，重新登录 
          wx.setStorageSync('userToken', '')
          wx.setStorageSync('isLogin', false)
          wx.setStorageSync('localProductInfo', [])
          wx.setStorageSync('localCollect', [])
          wx.setStorage({
            key: "totalShoppinCartCount",
            data: 0
          })
          wx.removeTabBarBadge({
            index: 2,
          })
          that.goToLogin()
        }
      }
    }, function (res) {
      that.toastHide()
      wx.hideNavigationBarLoading()
      console.log(res)
    }, function (res) {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh() //停止下拉刷新
      that.toastHide()
    })
  },
  /**
   * 重新登录
  */
  goToLogin:function(){
    this.setData({ isShowWxModal:true})
    
  },
  /**
   * 点击model的取消按钮
   */
  modalCancel: function () {
    this.setData({ isShowWxModal: false })
    
  },
  /**
   * 点击model的确定按钮
   */
  modalConfirm: function () {
    this.setData({ isShowWxModal: false })
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },
  /**
   * 拨打电话
   */
  calling: function () {
    var that = this
    //初始化一下
    wx.setStorage({
      key: "configList",
      data: []
    })
    var url = app.data.HOST + 'config/list'
    var params = {}
    app.request.requestGetApi(url, params, this, function (res) {
      if (res != null) {
        wx.setStorage({
          key: "configList",
          data: res
        })
        that.setData({ configList: res })
        for (var i = 0; i < that.data.configList.length; i++) {
          if (that.data.configList[i].key == "SERVICE_TELEPHONE") {
            that.setData({ servicePhone: that.data.configList[i].value })
            wx.makePhoneCall({
              phoneNumber: that.data.configList[i].value,
              success: function () {
                console.log("拨打电话成功！")
              },
              fail: function () {
                console.log("拨打电话失败！")
              }
            })
            break
          }
        }
      }
    }, function (res) {

    }, function (res) {

    })
    
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    // console.log("下拉刷新")
    let that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getRelatedData()
  },
  /**
   * 获取配置信息
  */
  getConfigList:function(){
    var that = this
    //初始化一下
    wx.setStorage({
      key: "configList",
      data: []
    })
    var url = app.data.HOST + 'config/list'
    var params = {}
    app.request.requestGetApi(url, params, this, function (res) {
      if (res != null) {
        wx.setStorage({
          key: "configList",
          data: res
        })
        that.setData({ configList: res })
        for (var i = 0; i < that.data.configList.length; i++) {
          if (that.data.configList[i].key == "SERVICE_TELEPHONE") {
            that.setData({ servicePhone: that.data.configList[i].value })
            break
          }
        }
      }
    }, function (res) {

    }, function (res) {

    })
  },
  /**
   * 获取消息列表 
  */
  getMessageList: function () {
    var that = this
    var url = app.data.HOST + 'message/messageCenter'
    var params = { 'cityId': '1' }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].unread > 0){
            that.setData({ unreadCountIsShow: true })
            break
          }
        }
      }
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 跳转到收货地址列表 
  */
  goToDeliveryAdressView:function(){
    wx.navigateTo({
      url: './deliveryAddress/deliveryAddress?source=person',
    })
  },
  /**
   * 跳转到售后规则页面
  */
  goToAfterSaleServiceView:function(){
    wx.navigateTo({
      url: '../common/webView?url=' + app.data.HOST + 'static/rechargeRules.html',
    })
  },
  /**
   * 查看交易明细
  */
  goToTransactionRecords:function(){
    wx.navigateTo({
      url: './transactionRecords/transactionRecords',
    })
  },
  /**
   * 我的红包
  */
  goToMyRedPacket:function(){
    wx.navigateTo({
      url: './myRedPacket/myRedPacket',
    })
  },
  /**
   * 积分兑换 
  */
  goToPointExchange:function(e){
    wx.navigateTo({
      url: './pointExchange/pointExchange?points=' + e.currentTarget.dataset.points,
    })
  },
  /**
   * 充值规则
  */
  goToRechargeRules:function(e){
    wx.navigateTo({
      url: './rechargeRules/rechargeRules?balance=' + e.currentTarget.dataset.balance,
    })
  },
  /**
   * 我的订单
   */
  toOrderList:function(e){
    var index = e.currentTarget.dataset.hi
    wx.navigateTo({
      url: '../orderList/orderList?index=' + index,
    })
  },
  /**
   * 跳转到设置页面
  */
  goToSetting:function(){
    wx.navigateTo({
      url: './setting/setting',
    })
  },
  /**
   * 跳转到收藏页面
  */
  goToCollectionProducts: function () {
    wx.navigateTo({
      url: './collectionProducts/collectionProducts',
    })
  }
})