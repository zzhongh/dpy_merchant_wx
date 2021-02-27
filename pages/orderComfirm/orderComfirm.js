// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //从购物车界面传过来的购物车ids
    ids:[],
    //待确认订单信息
    orderComfirmData:{},
    //收货地址
    defaultDeliveryAddress:{},
    selectedApointsTime:'点击选择预约送达时间',
    //预约配送时间说明
    timeState:'',
    //使用的红包
    useRedPacket:'暂无红包可用',
    //使用积分抵扣的金额
    pointeDeductionPrice:0.00,
    //应付金额
    payablePrice:0.00,
    //选择预约送达时间的mode是否隐藏
    flag:true,
    selectedDateIndex:0,
    selectedTimeIndex:-1,
    //可用红包列表
    merchantRedPackets:{},
    //可用积分
    points:0.00,
    //选择的红包名称
    redPacketName:'',
    //选择的红包抵扣金额
    redPacketDeductionPrice:0.00,
    //是否是从我的红包界面返回
    isBackFromMyRedPacket:false,
    isSelectedPoints:false,
    //备注的内容
    remarkeStr:'',
    toastStatus: false,
    deviceType:''
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    var ids = options.ids
    this.setData({ids:ids})
    this.initData()
    //获取预约是送达时间的说明
    var that = this
    wx.getStorage({
      key: 'configList',
      success: function(res) {
        
        var config = res.data
        if(config){
          for(var i=0;i<config.length;i++){
            if (config[i].key == 'ORDER_CONFIRM_NOTICE'){
              that.setData({ timeState: config[i].value})
            }
          }
        }
      },
    })
  },

  login:function(){

  },

  /**
   * 初始化待确认订单数据
   */
  initData:function(){
    var that = this
    var url = app.data.HOST + 'orderConfirmFromShoppingCart/' + this.data.ids
    var header = { 'Authorization': app.data.token}
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        if(res && res.data && res.data.code == 100){
          var data = res.data.content

          //格式化一些数据
          //商品总金额
          var productPrice = data.productPrice
          data.productPrice = productPrice.toFixed(2)
          //运费
          var shippingPrice = data.shippingPrice
          data.shippingPrice = shippingPrice.toFixed(2)
          //应付金额
          var payablePrice = productPrice * 1 + shippingPrice * 1
          payablePrice = payablePrice.toFixed(2)
          //计算新的可用积分
          var points = data.points
          var tempPrice = productPrice
          tempPrice = tempPrice / 2
          var canUsePoints = tempPrice / data.ratio
          if (canUsePoints >= 1){
            //可用积分大于等于1
            if (canUsePoints >= points) {
              //当可用积分大于等于当前积分
              that.setData({ points: points.toFixed(2) })
              // if (that.data.isSelectedPoints) {
              //   var pointeDeductionPrice = points * data.ratio
              //   that.setData({ pointeDeductionPrice: pointeDeductionPrice.toFixed(2) })
              // }
            } else {
              //当可用积分小于当前积分
              canUsePoints = parseInt(canUsePoints)
              that.setData({ points: canUsePoints.toFixed(2) })
              // if (that.data.isSelectedPoints) {
              //   var pointeDeductionPrice = canUsePoints * data.ratio
              //   that.setData({ pointeDeductionPrice: pointeDeductionPrice.toFixed(2) })
              // }
            }
          }else{
            //可用积分小于1
            that.setData({ points: 0.00})
          }
            
          //商品价格
          var productList = data.latestProductInfoList
          for(var i=0;i<productList.length;i++){
            var price = productList[i].specificationPrice
            productList[i].specificationPrice = price.toFixed(2)
          }
          data.latestProductInfoList = productList
          //可选的时间
          if (data.availableAppointDay && data.availableAppointDay.length >= 1){
            data.availableAppointDay[0].isSelected = true
          }
          //红包
          if (data.merchantRedPackets.length > 0){
            that.setData({ useRedPacket: data.merchantRedPackets.length + '个红包可用'})
          }
          
          that.setData({ orderComfirmData: data, defaultDeliveryAddress: data.defaultDeliveryAddress, 
            merchantRedPackets: data.merchantRedPackets, payablePrice: payablePrice, pointeDeductionPrice:0.00,
            redPacketName: '', redPacketDeductionPriceL: 0.00, remarkeStr: '', isSelectedPoints:false,
            selectedApointsTime: '点击选择预约送达时间', selectedDateIndex: 0, selectedTimeIndex:-1})
          
        } else {
          if (res && res.data && res.data.message) {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }
      },
      function(res){
        that.toastHide()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      })
  },
  /**
   * 跳转到选择地址界面 
   */
  chooseAddress:function(){
    var id = -1;
    if (this.data.defaultDeliveryAddress && this.data.defaultDeliveryAddress.id ){
      id = this.data.defaultDeliveryAddress.id
    }
    wx.navigateTo({
      url: '../personalCenter/deliveryAddress/deliveryAddress?source=orderConfirm&id=' + id,
    })
  },
  chooseTime: function () {
    this.setData({ flag: false })
  },
  hide: function () {
    this.setData({ flag: true })
  },
  /**
   * 当预约配送时间的日期被点击
   */
  clickDate:function(e){
    var index = e.currentTarget.dataset.index
    var data = this.data.orderComfirmData
    for (var i=0;i<data.availableAppointDay.length;i++){
      data.availableAppointDay[i].isSelected = false
      if(index == i){
        data.availableAppointDay[i].isSelected = true
      }
    }
    this.setData({ selectedDateIndex: index, orderComfirmData : data})
  },
  /**
   * 当预约配送时间的时间被点击
   */
  clickTime:function(e){
    var index = e.currentTarget.dataset.index
    var data = this.data.orderComfirmData
    var selectedDateIndex = this.data.selectedDateIndex
    var dateData = data.availableAppointDay
    
    for (var i = 0; i < dateData.length;i++){
      for (var j = 0; j < dateData[i].availableTime.length;j++){
        dateData[i].availableTime[j].isSelected = false
        if (i == selectedDateIndex && j == index){
          dateData[i].availableTime[j].isSelected = true
          var str = dateData[i].date + dateData[i].availableTime[j].name
          this.setData({ selectedApointsTime:str})
        }
      }
    }
    data.availableAppointDay = dateData
    this.setData({ selectedTimeIndex: index, orderComfirmData: data})
    this.hide()
  },
  /**
   * 去选择红包
   */
  toSelectRedPacket:function(){
    wx.navigateTo({
      url: '../useableRedPacketList/useableRedPacketList?redPacketList=' + JSON.stringify(this.data.merchantRedPackets)
        + '&points=' + this.data.points + '&cartIds=' + this.data.ids + '&payablePrice=' + this.data.payablePrice,
    })
  },
  /**
   * checkBox被点击
   */
  checkboxChange:function(e){
    
    var isSelectedPoints = this.data.isSelectedPoints
    this.setData({ isSelectedPoints : !isSelectedPoints})
    if (!isSelectedPoints){
      //由未选中到选中
      var pointeDeductionPrice = this.data.orderComfirmData.ratio * this.data.points
      this.setData({ pointeDeductionPrice: pointeDeductionPrice.toFixed(2)})
    }else{
      this.setData({ pointeDeductionPrice: 0.00 })
    }
    var redPacketDeductionPrice = this.data.redPacketDeductionPrice * 1
    var pointeDeductionPrice = this.data.pointeDeductionPrice * 1
    var productPrice = this.data.orderComfirmData.productPrice * 1 
    var shippingPrice = this.data.orderComfirmData.shippingPrice * 1
    var payablePrice = productPrice + shippingPrice - pointeDeductionPrice - redPacketDeductionPrice
    this.setData({ payablePrice: payablePrice.toFixed(2) })
  },
  remarks:function(){
    wx.navigateTo({
      url: '../orderMarke/orderMarke?markes=' + this.data.remarkeStr,
    })
  },
  /**
   * 去支付
   */
  toPay:function(){
    var orderConfirmData = this.data.orderComfirmData
    //判断是否选择了预约送达时间
    var isSelectedApointsTime = false
    var selectedAvailableAppointDay = {}
    var availableAppointDay = orderConfirmData.availableAppointDay
    for (var i=0;i<availableAppointDay.length;i++){
      for (var j = 0; j < availableAppointDay[i].availableTime.length;j++){
        if (availableAppointDay[i].availableTime[j].isSelected) {
          isSelectedApointsTime = true
          selectedAvailableAppointDay = availableAppointDay[i].availableTime[j]
        }
      }
      
    }
    if (!isSelectedApointsTime){
      //如果没有选择时间，则弹出提示，并弹出选择时间的modal
      wx.showToast({
        icon:'none',
        title: '请选择预约送达时间',
      })
      this.chooseTime()
      return
    }
    //判断是否选择了收货地址
    if (!this.data.defaultDeliveryAddress || !this.data.defaultDeliveryAddress.id){
      wx.showToast({
        icon: 'none',
        title: '请选收货地址',
      })
      return
    }
    //获取参数
    var payablePrice = this.data.payablePrice
    var transportPrice = ''
    var orderPrice = orderConfirmData.productPrice
    var payMethodList = orderConfirmData.availablePaymentMethodList
    
    var shippingPrice = orderConfirmData.shippingPrice
    if (shippingPrice && shippingPrice > 0){
      transportPrice = shippingPrice + ''
    }else{
      transportPrice = 0.00 + ''
    }

    var shoppingCartProductIds = this.data.ids

    var points = this.data.points
    if (!this.data.isSelectedPoints){
      points = '0.00'
    }

    var merchantRedPacketId = ''
    var merchantRedPackets = this.data.merchantRedPackets
    for (var i = 0; i < merchantRedPackets.length;i++){
      if (merchantRedPackets[i].isSelected){
        merchantRedPacketId = merchantRedPackets[i].id
      }
    }

    var postOrder = {}
    postOrder.appointTime = selectedAvailableAppointDay
    postOrder.addressId = this.data.defaultDeliveryAddress.id
    postOrder.remark = this.data.remarkeStr
    postOrder.shoppingCartProductIds = shoppingCartProductIds
    postOrder.points = points
    postOrder.merchantRedPacketId = merchantRedPacketId
    this.createOrder(postOrder)
  },
  /**
   * 创建订单
   */
  createOrder: function (postOrder) {
    var that = this
    var url = app.data.HOST + 'orderFromShoppingCart'
    var params = JSON.stringify(postOrder)
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var orderInfo = res.data.content


          //更新应付金额，商品总金额，运费
          var payablePrice = orderInfo.payablePrice * 1
          payablePrice = payablePrice.toFixed(2)
          var productPrice = orderInfo.productPrice * 1
          productPrice = productPrice.toFixed(2)
          var shippingPrice = orderInfo.shippingPrice * 1
          shippingPrice = shippingPrice.toFixed(2)
          var orderTime = orderInfo.orderTime
          //that.setData({ payablePrice: payablePrice, orderPrice: productPrice, transportPrice: shippingPrice, orderTime: orderTime })

          wx.redirectTo({
            url: '../orderPay/orderPay?orderNo=' + orderInfo.orderNo + '&payablePrice=' + payablePrice + '&orderTime=' 
              + orderTime + '&transportPrice=' + shippingPrice + '&orderPrice=' + productPrice 
              + '&payMethodList=' + that.data.orderComfirmData.availablePaymentMethodList + '&isGoOrderList=' + true,
          })
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
        console.log(res.data)
        that.setData({ deviceType: res.data })
      },
      fail: function (res) {

      }
    })
    if (this.data.isBackFromMyRedPacket){
      var orderComfirmData = this.data.orderComfirmData
      orderComfirmData.points = this.data.points
      this.setData({ isBackFromMyRedPacket: false, orderComfirmData: orderComfirmData})
      var useRedPacketPrice = 0.00
      var pointeDeductionPrice = that.data.pointeDeductionPrice * 1
      var productPrice = that.data.orderComfirmData.productPrice * 1
      var shippingPrice = that.data.orderComfirmData.shippingPrice * 1
      //如果是从我的红包界面返回，判断选择红包情况，以及计算红包抵扣金额
      var merchantRedPackets = that.data.merchantRedPackets
      that.setData({
        redPacketName: '',useRedPacket: '暂无红包可用'
      })
      if (merchantRedPackets){
        that.setData({
          useRedPacket: merchantRedPackets.length + '个红包可用'
        })
        for (var i = 0; i < merchantRedPackets.length;i++){
          if (merchantRedPackets[i].isSelected){
            useRedPacketPrice = merchantRedPackets[i].amount
            that.setData({
              redPacketName: useRedPacketPrice + '元红包', 
              useRedPacket: '-' + useRedPacketPrice + '元'})
          }
        }
      }
      //计算新的可用积分
      var points = orderComfirmData.points
      var tempPrice = productPrice - useRedPacketPrice
      tempPrice = tempPrice/2
      var canUsePoints = tempPrice / that.data.orderComfirmData.ratio
      if (canUsePoints >= 1){
        if (canUsePoints >= points) {
          //当可用积分大于等于当前积分
          this.setData({ points: points })
          if (this.data.isSelectedPoints) {
            pointeDeductionPrice = points * this.data.orderComfirmData.ratio
            this.setData({ pointeDeductionPrice: pointeDeductionPrice.toFixed(2) })

          }
        } else {
          //当可用积分小于当前积分
          //将可用积分的小数位去掉
          canUsePoints = parseInt(canUsePoints)
          that.setData({ points: canUsePoints.toFixed(2) })
          if (that.data.isSelectedPoints) {
            pointeDeductionPrice = canUsePoints * that.data.orderComfirmData.ratio
            that.setData({ pointeDeductionPrice: pointeDeductionPrice.toFixed(2) })
          }

        }
      }else{
        this.setData({ points: 0.00 })
      }
      
      var payablePrice = productPrice + shippingPrice - pointeDeductionPrice - useRedPacketPrice
      that.setData({ payablePrice: payablePrice.toFixed(2)})
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
    this.initData()
    //this.checkboxChange()
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