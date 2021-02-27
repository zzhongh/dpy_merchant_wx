// pages/login/login.js
const app = getApp()
var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度

Page({

  /**
   * 页面的初始数据 
   */
  data: {
    payMethod:'',
    payablePrice:'0.00',
    isShouldGoToOrderList:true,
    tenVersionBefore:false,
    moneyImgMarginLeft:0+"px"
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    var payablePrice = options.price
    var payMethod = options.payMethod
    if (payMethod == 'yue_free'){
      payMethod = '您已免密支付成功'
    }else{
      payMethod = '支付成功'
    }
    console.log(options.isShouldGoToOrderList)
    this.setData({ payMethod: payMethod, payablePrice: payablePrice, isShouldGoToOrderList: options.isShouldGoToOrderList})

  
  },

  goRecharge:function(){
    wx.redirectTo({
      url: '../personalCenter/rechargeRules/rechargeRules',
    })
  },
  goHome: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },
  goOrderList: function () {
    if (this.data.isShouldGoToOrderList == 'true') {
      wx.redirectTo({
        url: '../orderList/orderList',
      })
    }else{
      wx.navigateBack()
    }
    
  },

  /**
 * 获取购物车商品列表
 */
  // getShoppingCartProducts: function () {
    
  //   var that = this
  //   var url = app.data.HOST + 'shoppingCart'
  //   var params = { 'cityId': wx.getStorageSync('cityId') }
  //   app.request.requestGetApi(url, params, that, function (res) {
      
  //     if (res != null) {
  //       var localProductInfo = []
  //       var totalShoppinCartCount = 0
  //       for (var i = 0; i < res.length; i++) {
  //         res[i].specificationPrice = res[i].specificationPrice.toFixed(2)
  //         res[i].isSelected = false
  //         localProductInfo.push({ 'shoppingCartId': res[i].id, 'quantity': res[i].quantity, 'activityCode': res[i].activityCode, 'specificationId': res[i].specificationId, 'specificationPrice': res[i].specificationPrice })
  //         totalShoppinCartCount += res[i].quantity
  //       }
  //       wx.setStorage({
  //         key: "localProductInfo",
  //         data: localProductInfo
  //       })
  //       wx.setStorage({
  //         key: "totalShoppinCartCount",
  //         data: totalShoppinCartCount
  //       })
  //       if (totalShoppinCartCount == 0) {
  //         wx.removeTabBarBadge({
  //           index: 2,
  //         })
  //       } else {
  //         wx.setTabBarBadge({
  //           index: 2,
  //           text: totalShoppinCartCount.toString()
  //         })
  //       }
  //     }
  //   }, function (res) {

  //   }, function (res) {
  //   })
  // },
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
    var that = this
    wx.getStorage({
      key: 'deviceType',
      success: function (res) {
        wx.getStorage({
          key: 'deviceVersion',
          success: function (deviceVersion) {
            if (res.data == "iPhone" && deviceVersion.data > 1000) {
              that.setData({ tenVersionBefore: false, moneyImgMarginLeft: -(winWid - 140) / 2 + "px"})
            }else{
              that.setData({ tenVersionBefore: true, moneyImgMarginLeft: (winWid - 140) / 2 + "px"})
            }
          },
          fail: function (res) {

          }
        })
        
      },
      fail: function (res) {

      }
    })
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