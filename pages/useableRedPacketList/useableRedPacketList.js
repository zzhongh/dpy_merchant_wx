// pages/useableRedPacketList/useableRedPacketList.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redPacketList: [], //记录
    points:'',
    cartIds:'',
    //是否是点击左上角的返回键返回
    isGoBack:true,
    payablePrice:0.00,
    toastStatus: false,
  },
  /**
     * 获取红包列表
     */
  getRedPacketList: function () {
    var that = this
    
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var redPacketList = JSON.parse(options.redPacketList)
    var points = options.points
    var cartIds = options.cartIds
    var payablePrice = options.payablePrice
    this.setData({ redPacketList: redPacketList, points: points, cartIds: cartIds, payablePrice: payablePrice})
  },
  /**
   * 选择了红包
   */
  selectedRedPacket:function(e){
    var index = e.currentTarget.dataset.index
    var redPacketList = this.data.redPacketList
    var points = this.data.points
    //判断当前应付金额是否满足选中的红包的使用条件
    if (this.data.payablePrice < redPacketList[index].amountCondition){
      //如果不满足使用条件
      wx.showToast({
        icon:'none',
        title: '应付金额不满足红包的使用条件',
      })
      return
    }
    for (var i=0;i<redPacketList.length;i++){
      redPacketList[i].isSelected = false
      if(index == i){
        redPacketList[i].isSelected = true
      }
    }

    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    prevPage.setData({ merchantRedPackets: redPacketList, points: points, isBackFromMyRedPacket: true
      , redPacketDeductionPrice: redPacketList[index].amount})
    this.setData({isGoBack:false})
    wx.navigateBack()
  },
  /**
 * 获取待确认订单数据
 */
  getCanUseableRedPacket: function () {
    var that = this
    var url = app.data.HOST + 'orderConfirmFromShoppingCart/' + this.data.cartIds
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'GET', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var data = res.data.content

          //商品总金额
          var productPrice = data.productPrice
          //运费
          var shippingPrice = data.shippingPrice
          //应付金额
          var payablePrice = productPrice * 1 + shippingPrice * 1
          payablePrice = payablePrice.toFixed(2)
          //可用积分
          var points = data.points

          var redPacketList = data.merchantRedPackets
          var points = points.toFixed(2)
          that.setData({ redPacketList: redPacketList, points: points, payablePrice: payablePrice })
          
        } else {
          if (res && res.data && res.data.message) {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  toastShow: function () {
    var toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    var toastStatus = true
    this.setData({ toastStatus: toastStatus })
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
    this.getCanUseableRedPacket()

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
    var isGoBack = this.data.isGoBack
    //如果是点击返回键返回
    if(isGoBack){
      var redPacketList = this.data.redPacketList
      var points = this.data.points
      for (var i = 0; i < redPacketList.length; i++) {
        redPacketList[i].isSelected = false
      }
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 2]
      prevPage.setData({ merchantRedPackets: redPacketList, points: points, isBackFromMyRedPacket: true, redPacketDeductionPrice:0.00 })
    }
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
   * 去兑换
  */
  goToExchange(){
    wx.navigateTo({
      url: '../personalCenter/pointExchange/pointExchange',
    })
  }
})