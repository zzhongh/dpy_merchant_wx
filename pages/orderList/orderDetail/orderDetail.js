// pages/orderList/orderDetail/orderDetail.js
var baseUtils = require('../../../utils/baseUtils.js')
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
    var orderInfo = JSON.parse(options.orderInfo)
    // console.log(orderInfo)  
    orderInfo.payTimeStr = this.getDateTime(orderInfo.payTime)
    orderInfo.orderTimeStr = this.getDateTime(orderInfo.orderTime)
    orderInfo.appointDeliveryStartTimeStr = this.getDateTime(orderInfo.appointDeliveryStartTime)
    orderInfo.appointDeliveryEndTimeStr = this.getDateTime(orderInfo.appointDeliveryEndTime)
    orderInfo.appointDeliveryTimeStr = this.getAppointsDeliveryStartAndEndTimeStr(orderInfo.appointDeliveryStartTime, orderInfo.appointDeliveryEndTime)
    orderInfo.redPacketAmount = orderInfo.redPacketAmount.toFixed(2)
    orderInfo.shippingPrice = orderInfo.shippingPrice.toFixed(2)
    orderInfo.pointDeductionPrice = orderInfo.pointDeductionPrice.toFixed(2)
    switch (orderInfo.payMethod) {
      case 'yue':
        orderInfo.payMethodStr = '余额支付'
        break;
      case 'cod':
        orderInfo.payMethodStr = '货到付款(未支付)'
        break;
      case 'ali':
        orderInfo.payMethodStr = '支付宝支付'
        break;
      case 'weixin':
        orderInfo.payMethodStr = '微信支付'
        break;
      case 'cod_yue':
        orderInfo.payMethodStr = '货到付款(余额)'
        break;
      case 'cod_cash':
        orderInfo.payMethodStr = '现金支付(货到付款)'
        break;
      case 'cod_weixin':
        orderInfo.payMethodStr = '微信支付(货到付款)'
        break;
      case 'cod_ali':
        orderInfo.payMethodStr = '支付宝支付(货到付款)'
        break;
      case 'abc':
        orderInfo.payMethodStr = '农行转账'
        break;
      case 'icbc':
        orderInfo.payMethodStr = '工行转账'
        break;
      case 'psbc':
        orderInfo.payMethodStr = '邮储转账'
        break; 
      case 'ali_transfer':
        orderInfo.payMethodStr = '支付宝转账'
        break;
      case 'weixin_transfer':
        orderInfo.payMethodStr = '微信转账'
        break;
      default:
        orderInfo.payMethodStr = ''
    }
    var totalWeight = 0.00
    for (var i = 0; i < orderInfo.orderProductSnapshotList.length; i++) {
      totalWeight += orderInfo.orderProductSnapshotList[i].weight * orderInfo.orderProductSnapshotList[i].purchasedNum
      orderInfo.orderProductSnapshotList[i].specificationUnitPrice = parseFloat(orderInfo.orderProductSnapshotList[i].specificationUnitPrice).toFixed(2)
      
    }
    orderInfo.totalWeight = totalWeight.toFixed(2)
    this.setData({ orderInfo: orderInfo})
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
   * 日期格式化
   */
  getDateTime: function (timesstamp) {
    var dateTimeStr = baseUtils.timestampFormat(timesstamp, 'Y-M-D h:m:s')
    return dateTimeStr
  },
  /**
   * 将预约送达日期格式化
   */
  getAppointsDeliveryStartAndEndTimeStr: function (startTime, endTime) {
    var startDate = baseUtils.timestampFormat(startTime, 'M月D日 h:m')
    var endDate = baseUtils.timestampFormat(endTime, 'h:m')
    var str = startDate + '-' + endDate
    return str
  },
})