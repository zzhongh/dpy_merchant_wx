// pages/personalCenter/rechargePay/rechargePay.js
const app = getApp()
var toastStatus = true;
Page({ 

  /**
   * 页面的初始数据
   */
  data: {
    isSelected:false,
    toastStatus: toastStatus,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ payablePrice: options.payablePrice})
    this.getRechargeInfo()
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
    this.getConfigList()
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
   * 获取支付相关
  */
  getRechargeInfo:function(){
    var that = this
    var url = app.data.HOST + 'rechargeOrder'
    var params = {'payablePrice':that.data.payablePrice}
    app.request.requestPostApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ rechargeInfo: res })
      }
    }, function (res) {
      
    }, function (res) {
      if(res.data.code == 99){
        setTimeout(function () {
          wx.navigateBack()
        }, 1000)
        
      }
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
            that.setData({ rechargePayNotice: that.data.configList[i].value })
            break
          }
        }
      },
      fail: function (res) {

      }
    })
  },
  /**
   * 更改选择状态
  */
  selectPayMethod:function(){
    this.setData({ isSelected: !this.data.isSelected})
  },
  /**
   * 支付按钮
  */
  rechargePay:function(){
    var that = this
    if(!that.data.isSelected){
      wx.showToast({
        title: '请选择充值方式',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.payRechangeOrderFromWeixin()
  },
  /**
   * 获取微信支付签名信息
  */
  payRechangeOrderFromWeixin: function (){
    var that = this
    that.toastShow()
    var url = app.data.HOST + 'rechargeOrder/' + that.data.rechargeInfo.orderNo +'/wxPay/miniProgram'
    var params = {}
    app.request.requestPostApi(url, params, that, function (signInfo) {
      that.toastHide()
      if (signInfo != null) {
        console.log((Date.parse(new Date()) / 1000).toString())
        wx.requestPayment(
          {
            'nonceStr': signInfo.nonceStr,
            'package': signInfo.package,
            'paySign': signInfo.paySign,
            'signType': 'MD5',
            'timeStamp': signInfo.timeStamp,
            'success': function (res) { 
              console.log(res)
              // 跳转到充值成功页面
              wx.redirectTo({
                url: '../rechargeSuccess/rechargeSuccess?payablePrice=' + that.data.rechargeInfo.payablePrice.toString()
              })
             },
            'fail': function (errorRes) { 
              console.log(errorRes)
              that.toastHide()
              if (errorRes.errMsg.indexOf("cancel") != -1) {
                wx.showToast({
                  title: '支付已取消',
                  icon: 'none',
                  duration: 2000
                })
                return
              }
              wx.showToast({
                title: errorRes.errMsg,
                icon: 'none',
                duration: 2000
              })
             },
            'complete': function (res) { 
              that.toastHide()
              // console.log(res)
             }
          })
      }
    }, function (res) {
    }, function (res) {
    })

    // wx.redirectTo({
    //   url: '../rechargeSuccess/rechargeSuccess?payablePrice=' + that.data.rechargeInfo.payablePrice.toString()
    // })
  },
  /**
   * 获取当前时间戳
  */
  getCurrentTimeStamp: function () {
    var timestamp = (new Date()).valueOf();
    return timestamp
  },
})