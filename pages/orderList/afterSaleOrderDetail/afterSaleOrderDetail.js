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
    orderInfo.submitTimeStr = this.getDateTime(orderInfo.timestamp)
    // that.setData({ telephone: orderInfo.auditDateTime.slice(0, 3) + "****" + orderInfo.auditDateTime.slice(-4) })

    orderInfo.refundPrice = parseFloat(orderInfo.refundPrice).toFixed(2)
    orderInfo.refundRedPacketAmount = orderInfo.refundRedPacketAmount.toFixed(2)
    if (orderInfo.refundPointAmount != null && orderInfo.refundPointAmount != ""){
      orderInfo.refundPointAmount = orderInfo.refundPointAmount.toFixed(2)
    }
    
    if (orderInfo.poundageAmount != null && orderInfo.poundageAmount != ""){
      orderInfo.poundageAmount = parseFloat(orderInfo.poundageAmount).toFixed(2)
    }
    orderInfo.returnShippingPrice = orderInfo.returnShippingPrice.toFixed(2)
    if (orderInfo.auditDateTime != null){
      orderInfo.refundTimeStr = baseUtils.stringFormatTime(orderInfo.auditDateTime)
    }

    for (var i = 0; i < orderInfo.refundOrderProductSnapshotList.length; i++) {
      orderInfo.refundOrderProductSnapshotList[i].specificationUnitPrice = parseFloat(orderInfo.refundOrderProductSnapshotList[i].specificationUnitPrice).toFixed(2)

    }
    
    var refundNum = 0
    if (orderInfo.status == '2') {
      orderInfo.totalRefundNum = 0
    } else {
      for (var i = 0; i < orderInfo.refundOrderProductSnapshotList.length; i++) {
        refundNum += orderInfo.refundOrderProductSnapshotList[i].refundNum
        var specificationUnitPrice = orderInfo.refundOrderProductSnapshotList[i].specificationUnitPrice
        orderInfo.refundOrderProductSnapshotList[i].specificationUnitPrice = baseUtils.changeTwoDecimal_f(specificationUnitPrice, 2)
      }
      orderInfo.totalRefundNum = refundNum
    }
    
    switch (orderInfo.status) {
      case '0':
        orderInfo.statusStr = '待审核'
        break;
      case '1':
        orderInfo.statusStr = '审核通过'
        break;
      case '2':
        orderInfo.statusStr = '审核驳回'
        break;
      default:
        orderInfo.statusStr = ''
    }
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
    this.setData({ orderInfo: orderInfo })
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
})