//  pages/personalCenter/rechargeRules/rechargeRules.js
const app = getApp()
var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeRules:[],
    rechargeNotice:"",
    bannerH : winWid * 480 / 1080 + "px",
    itemH : (winWid / 3 * 0.8) * 21 / 28 + 1 + "px"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({ balance: options.balance})
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
    this.getRechargeRules()
    this.getConfigList()
    this.getRelatedData()
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
   * 获取个人信息
   */
  getRelatedData: function () {
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        console.log(res)
        that.setData({ balance: res.balance })
      }
    }, function (res) {

    }, function (res) {
    })
  },
  // 获取图片宽高
  imgHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height;//图片高度
    var imgw = e.detail.width;//图片宽度
    var bannerH = winWid * 480 / 1080 + "px"//等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
    this.setData({
      bannerH: bannerH,//设置高度 
    })
  },
  /**
   * 获取充值规则列表
  */
  getRechargeRules:function(){
    var that = this
    var url = app.data.HOST + 'rechargeRules'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ rechargeRules: res })
      }
    }, function (res) {
    }, function (res) {
    })
  },
  // 获取图片宽高
  itemHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height;//图片高度
    var imgw = e.detail.width;//图片宽度
    var itemH = (winWid / 3 * 0.8) * 21 / 28 + 1 + "px"
    this.setData({
      itemH: itemH,//设置高度
    })
  },
  /**
   * 获取配置信息
  */
  getConfigList: function () {
    var that = this
    wx.getStorage({
      key: 'configList',
      success: function (res) {
        that.setData({ configList: res.data })
        for (var i = 0; i < that.data.configList.length; i++) {
          if (that.data.configList[i].key == "RECHARGE_NOTICE") {
            that.setData({ rechargeNotice: that.data.configList[i].value })
            break
          }
        }
      },
      fail: function (res) {

      }
    })
  },
  /**
   * 监听充值金额输入框
  */
  rechargePrice:function(e){
    this.setData({ rechargePrice: e.detail.value})
  },
  /**
   * 去支付
  */
  goToRechargePay:function(e){
    var payablePrice = ''
    if (e.currentTarget.dataset.type == 'input'){
      payablePrice = e.currentTarget.dataset.rechargeprice
    }else{
      payablePrice = e.currentTarget.dataset.rechargeprice.toString()
    }
    if (payablePrice == null || payablePrice == undefined || payablePrice == "") {
      wx.showToast({
        title: '请输入充值金额',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (payablePrice == 0) {
      wx.showToast({
        title: '充值金额必须大于或等于1元',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (payablePrice.indexOf(".") != -1) {
      wx.showToast({
        title: '请输入整数',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (payablePrice.length > 11) {
      wx.showToast({
        title: '超过可充值金额范围',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.navigateTo({
      url: '../rechargePay/rechargePay?payablePrice=' + e.currentTarget.dataset.rechargeprice,
    })
  }
})