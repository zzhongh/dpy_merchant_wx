// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')
var baseUtils = require('../../utils/baseUtils.js')
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    orderData:{},
    toastStatus: true,
    isSelectAll:false,
    totalPrice:0.00,
    selectedIdsArr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    var orderNo = options.orderNo
    this.setData({ orderNo: orderNo})
    this.getRefundProductsList(orderNo)
    this.setData({ isSelectAll: false })
  },
  /**
   * 获取退换货商品列表
  */
  getRefundProductsList: function (orderNo){
    var that = this
    var url = app.data.HOST + 'refundAbleProductNum?orderNo=' + orderNo
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      wx.hideNavigationBarLoading()
      wx.hideNavigationBarLoading()
      if (res != null) {
        for (var i = 0; i < res.length; i++) {
          res[i].isSelected = false
          if (res[i].purchasedNum < 1) {
            res[i].chooseRefundNum = res[i].purchasedNum
          } else {
            res[i].chooseRefundNum = 1
          }
          res[i].specificationUnitPrice = res[i].specificationUnitPrice.toFixed(2)
          //格式化purchasedNum
          var purchasedNum = res[i].purchasedNum
          res[i].purchasedNum = baseUtils.changeTwoDecimal_f(purchasedNum, 1)
        }
        that.setData({ orderData: res })
      }
    }, function (res) {
    }, function (res) {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  /**
   * 选择/不选
   */
  changeSelectStatus: function (e) {
    var that = this
    that.data.orderData[e.currentTarget.dataset.index].isSelected = !that.data.orderData[e.currentTarget.dataset.index].isSelected
    that.setData({ orderData: that.data.orderData })
    that.updateSelectedProduct()
  },
  /**
   * 减少购买数量
   */
  minus: function (e) {
    this.updateQuantity(e.currentTarget.dataset.item.chooseRefundNum - 1, e.currentTarget.dataset.index)
  },
  /**
   * 增加购买数量
   */
  add: function (e) {
    this.updateQuantity(e.currentTarget.dataset.item.chooseRefundNum + 1, e.currentTarget.dataset.index)
  },
  /**
   * 自定义购买数量
   */
  update: function (e) {
    this.setData({
      showQuantityModal: true,
      currentSelectedProduct: e.currentTarget.dataset.item,
      currentUpdateIndex: e.currentTarget.dataset.index,
      quantityInput: e.currentTarget.dataset.item.chooseRefundNum.toString()
    })
  },
  /**
   * 自定义购买数量点击取消
   */
  modalCancel: function () {
    this.setData({ showQuantityModal: false })
  },
  /**
   * 自定义购买数量点击确定
   */
  modalConfirm: function () {
    var that = this
    if (that.data.quantityInput == null || that.data.quantityInput == undefined || that.data.quantityInput == "") {
      wx.showToast({
        title: '请输入退货数量',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.quantityInput.indexOf(".") != -1) {
      wx.showToast({
        title: '请输入整数',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.setData({ showQuantityModal: false })
    that.updateQuantity(parseInt(that.data.quantityInput), that.data.currentUpdateIndex)
  },
  /**
   * 监听输入框变化
  */
  quantityInput: function (e) {
    this.setData({
      quantityInput: e.detail.value
    })
  },
  /**
   * 更新购买数量
   */
  updateQuantity: function (num, index) {
    var that = this
    if (num > that.data.orderData[index].purchasedNum) {
      wx.showToast({
        title: '超过可退换数量范围',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (num <= 0) {
      wx.showToast({
        title: '退货数量不能少于1',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.data.orderData[index].chooseRefundNum = num
    that.setData({ orderData: that.data.orderData})
    that.updateSelectedProduct()
  },
  /**
     * 更新所选商品信息
    */
  updateSelectedProduct: function () {
    var that = this
    that.setData({ selectedIds: '', selectedIdsArr: [], totalPrice: 0.00 })
    var totalPrice = 0.00
    var selectedIdsArr = []
    var selectedProducts = []
    for (var i = 0; i < that.data.orderData.length; i++) {
      if (that.data.orderData[i].isSelected == true) {
        totalPrice += that.data.orderData[i].specificationUnitPrice * that.data.orderData[i].chooseRefundNum
        selectedIdsArr.push(that.data.orderData[i].id)
        selectedProducts.push(that.data.orderData[i])
      }
    }
    if (selectedIdsArr.length == that.data.orderData.length){
      that.setData({ isSelectAll: true })
    }else{
      that.setData({ isSelectAll: false })
    }
    that.setData({ totalPrice: totalPrice.toFixed(2), selectedIds: selectedIdsArr.join(','), selectedIdsArr: selectedIdsArr, selectedProducts: selectedProducts})
  },
  /**
   * 全选
  */
  selectAll: function () {
    var that = this
    var totalPrice = 0.00
    var selectedIdsArr = []
    that.setData({ isSelectAll: !that.data.isSelectAll })
    for (var i = 0; i < that.data.orderData.length; i++) {
      if (that.data.isSelectAll == true) {
        that.data.orderData[i].isSelected = true
        totalPrice += that.data.orderData[i].specificationUnitPrice * that.data.orderData[i].chooseRefundNum
        selectedIdsArr.push(that.data.orderData[i].id)
      } else {
        that.data.orderData[i].isSelected = false
      }
    }
    that.setData({ orderData: that.data.orderData, totalPrice: totalPrice.toFixed(2), selectedIds: selectedIdsArr.join(','), selectedIdsArr: selectedIdsArr})
    that.updateSelectedProduct()
  },
  login:function(){

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
   * 退换货
  */
  goToExchange:function(){
    
    if (this.data.selectedIdsArr.length == 0){
      wx.showToast({
        title: '请选择退货商品',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.totalPrice == 0){
      wx.showToast({
        title: '所选商品未含可退换商品',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.totalPrice == 0) {
      wx.showToast({
        title: '所选商品含不可退换商品，请重新选择',
        icon: 'none',
        duration: 2000
      })
      return
    }
    for (var i = 0; i < this.data.selectedProducts.length; i++) {
      if (this.data.selectedProducts[i].isSelected = true && this.data.selectedProducts[i].chooseRefundNum < 1) {
        wx.showToast({
          title: '所选商品退货商品数量不能少于1',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }
    var that = this
    
    wx.navigateTo({
      url: '../exchange/exchange?totalPrice=' + that.data.totalPrice + '&selectedProducts=' + JSON.stringify(that.data.selectedProducts),
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