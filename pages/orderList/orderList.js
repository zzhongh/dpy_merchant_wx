// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')
var baseUtils = require('../../utils/baseUtils.js')
var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ['全部', '待付款','待收货','待评价','售后'],
    //当前界面indxe
    activityIndex:0,
    orderList:[],
    pageIndex:0,
    pageSize:10,
    toastStatus: true,
    isRefresh:false,
    isBackFromOrderPay:false,
    //允许申请退货的时间范围
    refundAvaliableHours:0,
    imgHeight: winWid * 0.20 + 'px', 
    imgWidth: winWid * 0.20 + 'px', 
    tenVersionBefore: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    //获取到index后转换成整数
    var index = options.index * 1
    if (!index){
      index = 0
    }
    this.setData({ activityIndex:index})
    //this.getOrderList(index)
  },
  /**
   * 获取订单列表
   */
  getOrderList:function(index){
    var that = this
    var status = ''
    switch(index){
      case 0:
        status = ''
        break
      case 1:
        status = 'unpaid'
        break
      case 2:
        status = 'undeliveredUniteUnreceived'
        break
      case 3:
        status = 'unevaluated'
        break
      case 4:
        status = 'afterSaleService'
        break

    }
    var url = ''
    if(status == ''){
      url = app.data.HOST + 'orders?pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize 
    } else if (status == 'afterSaleService'){
      this.getRefundOrderList()
      return
    }else{
      url = app.data.HOST + 'orders?pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize + '&status=' + status
    }
    
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    that.setData({isRefresh:true})
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        wx.stopPullDownRefresh()
        that.setData({ isRefresh: false })
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          var orderData = res.data.content
          console.log(orderData)
          var oldOrderData = that.data.orderList
          var pageIndex = that.data.pageIndex
          if (pageIndex > 0){
            //当是第不是第一页，并且返回的数据为空的时候
            if (!orderData || orderData.length < 1){
              return
            }
          }
          if (orderData && orderData.length >= 1) {
            that.setData({ pageIndex: pageIndex + 1 })
          }
          var refundAvaliableHours = that.data.refundAvaliableHours * 1
          for(var i=0;i<orderData.length;i++){
            //格式化金额
            var order = orderData[i]
            var productPrice = order.productPrice
            order.productPrice = productPrice.toFixed(2)
            var payablePrice = order.payablePrice
            order.payablePrice = payablePrice.toFixed(2)
            var specificationUnitPrice =  order.orderProductSnapshotList[0].specificationUnitPrice
            order.orderProductSnapshotList[0].specificationUnitPrice = specificationUnitPrice.toFixed(2)
            //计算总件数
            var totalNum = 0
            var specificationList = order.orderProductSnapshotList
            for(var j=0;j<specificationList.length;j++){
              totalNum += specificationList[j].purchasedNum
            }
            order.totalNum = totalNum
            //格式化预约送达时间
            var appointDeliveryStartTime = order.appointDeliveryStartTime
            var appointDeliveryEndTime = order.appointDeliveryEndTime
            var appointsDeliveryTimeStr = that.getAppointsDeliveryStartAndEndTimeStr(appointDeliveryStartTime, appointDeliveryEndTime)
            order.appointsDeliveryTimeStr = appointsDeliveryTimeStr

            //设置是否显示退换货按钮
            order.isCanRefund = true
            if (order.deliveryTime){
              var time = new Date().getTime() - order.deliveryTime
              if (time > refundAvaliableHours * 60 * 60 * 1000) {
                order.isCanRefund = false
              } 
            }
            
          
          }
          if (pageIndex >= 1 && orderData.length >= 1) {
            orderData = oldOrderData.concat(orderData)
          }
          that.setData({ orderList: orderData})
        }else{
          var message = ''
          if (res && res.data && res.data.message) {
            message = res.data.message
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        }
        
      },
      function(res){
        wx.stopPullDownRefresh()
        that.setData({ isRefresh: false })
        that.toastHide()
      })
  },
  /**
 * 获取售后订单列表
 */
  getRefundOrderList: function () {
    var that = this
    var url = app.data.HOST + 'refundOrders?pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize
    
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    that.setData({ isRefresh: true })
    HttpRequst.HttpRequst(url, 'GET', params,
      function (res) {
        wx.stopPullDownRefresh()
        that.setData({ isRefresh: false })
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var orderData = res.data.content
          var oldOrderData = that.data.orderList
          var pageIndex = that.data.pageIndex
          if (pageIndex > 0) {
            //当是第不是第一页，并且返回的数据为空的时候
            if (!orderData || orderData.length < 1) {
              return
            }
          }
          if (orderData && orderData.length >= 1) {
            that.setData({ pageIndex: pageIndex + 1 })
          }
          for (var i = 0; i < orderData.length; i++) {
            //格式化金额
            var order = orderData[i]
            var refundPrice = order.refundPrice
            order.refundPrice = refundPrice.toFixed(2)
            var poundageAmount = order.poundageAmount
            if (poundageAmount){
              order.poundageAmount = poundageAmount.toFixed(2)
            }else{
              order.poundageAmount = 0.00.toFixed(2)
            }
            var specificationUnitPrice = order.refundOrderProductSnapshotList[0].specificationUnitPrice
            order.refundOrderProductSnapshotList[0].specificationUnitPrice = specificationUnitPrice.toFixed(2)
            //计算总件数
            var totalNum = 0
            var specificationList = order.refundOrderProductSnapshotList
            for (var j = 0; j < specificationList.length; j++) {
              totalNum += specificationList[j].refundNum
            }
            order.totalNum = totalNum
            //格式化申请退货时间
            var appointsDeliveryTimeStr = baseUtils.timestampFormat(order.timestamp, 'Y-M-D h:m')
            order.appointsDeliveryTimeStr = appointsDeliveryTimeStr
          }
          if (pageIndex >= 1 && orderData.length >= 1) {
            orderData = oldOrderData.concat(orderData)
          }
          that.setData({ orderList: orderData })
        } else {
          var message = ''
          if (res && res.data && res.data.message) {
            message = res.data.message
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        }
      },
      function (res) {
        wx.stopPullDownRefresh()
        that.setData({ isRefresh: false })
        that.toastHide()
      })
  },
  /**
   * 顶部导航栏被点击
   */
  navbarTap:function(e){
    if(!this.data.isRefresh){
      var index = e.currentTarget.dataset.idx
      this.setData({ activityIndex: index, pageIndex: 0 })
      this.getOrderList(index)
    }
    
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
   * 取消订单
   */
  cancelOrder:function(e){
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: "是否取消该订单？",
      success: function (res) {
        if (res.confirm) {
          
          var index = e.currentTarget.dataset.index
          var orders = that.data.orderList
          var order = orders[index]
          var url = app.data.HOST + 'orders/' + order.orderNo + "/cancel"
          var header = { 'Authorization': app.data.token }
          var params = {}
          that.toastShow()
          HttpRequst.HttpRequst(url, 'POST', params,
            function (res) {
              that.toastHide()
              if (res && res.data && res.data.code == 100) {
                order.orderStatus = '0'
                orders[index] = order
                if (that.data.activityIndex == 1 || that.data.activityIndex == 2 ){
                  orders.splice(index, 1)
                }
                
                that.setData({ orderList: orders })
                //that.getOrderList()
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
        }
      },
      fail: function () {
        if (res.confirm) {

        }
      }
    })
    
  },
  /**
   * 去支付
   */
  toPay:function(e){
    var index = e.currentTarget.dataset.index
    var order = this.data.orderList[index]
    console.log(order)
    wx.navigateTo({
      url: '../orderPay/orderPay?orderNo=' + order.orderNo + '&payablePrice=' + order.payablePrice + '&orderTime='
        + order.orderTime + '&transportPrice=' + order.shippingPrice + '&orderPrice=' + order.productPrice + '&isGoOrderList='+false
        
    })
  },
  /**
   * 跳转订单详情 
   */
  toOrderDetail:function(e){
    var that = this
    var index = e.currentTarget.dataset.index
    var orderInfo = JSON.stringify(that.data.orderList[index])
    if (that.data.activityIndex == 4){      //售后订单详情
      wx.navigateTo({
        url: './afterSaleOrderDetail/afterSaleOrderDetail?orderInfo=' + orderInfo,
      })
    } else {                                //普通订单详情
      wx.navigateTo({
        url: './orderDetail/orderDetail?orderInfo=' + orderInfo,
      })
    }
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
    if(this.data.isBackFromOrderPay){
      console.log('onShow')
      this.setData({ isBackFromOrderPay: false,pageIndex: 0})
    }
    this.getConfig()
    this.getOrderList(this.data.activityIndex)

    var that = this
    wx.getStorage({
      key: 'deviceType',
      success: function (res) {
        wx.getStorage({
          key: 'deviceVersion',
          success: function (deviceVersion) {
            console.log("deviceType")
            console.log(res.data)
            console.log("deviceVersion")
            console.log(deviceVersion.data)
            if (res.data == "iPhone" && deviceVersion.data > 1000) {
              that.setData({ tenVersionBefore: false })
            } else {
              that.setData({ tenVersionBefore: true })
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
    this.setData({pageIndex:0})
    this.getOrderList(this.data.activityIndex)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getOrderList(this.data.activityIndex)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 将预约送达日期格式化
   */
  getAppointsDeliveryStartAndEndTimeStr:function(startTime,endTime){
    var startDate = baseUtils.timestampFormat(startTime,'M月D日 h:m')
    var endDate = baseUtils.timestampFormat(endTime, 'h:m')
    var str = startDate + '-' + endDate
    return str
  },
  /**
   * 退换货  
  */
  toExchange:function(e){
    var index = e.currentTarget.dataset.index
    var orderNo = this.data.orderList[index].orderNo
    wx.navigateTo({
      url: '../chooseRefundProducts/chooseRefundProducts?orderNo=' + orderNo,
    })
  },
  /**
   * 去评价
  */
  toEvaluate:function(){
    wx.showToast({
      icon: 'none',
      title: "该功能暂未开通，敬请期待!",
    })
  },
  /**
   * 
   * 获取环境变量中可申请退货的时间
   */
  getConfig:function(){
    var configList = wx.getStorageSync('configList')
    if(configList && configList.length > 0){
      for (var i = 0; i < configList.length; i++) {
        if (configList[i].key == 'REFUND_AVAILABLE_HOURS') {
          this.setData({ refundAvaliableHours: configList[i].value})
        }
      }
    }
  }
})