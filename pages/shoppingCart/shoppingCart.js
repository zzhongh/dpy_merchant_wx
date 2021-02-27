// pages/enterTheSalesCenter/enterTheSalesCenter.js 
const app = getApp()
var toastStatus = true;
var touchDot = 0;//触摸时的原点
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = "";// 记录/清理时间记录
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toastStatus: toastStatus,
    showQuantityModal:false,
    totalPrice:0.00,
    selectedIds:'',
    selectedIdsArr:[],
    isSelectAll:false,
    shoppingCartProducts:[],
    deviceType:'',
    //是否显示选择微信支付时弹出的提示框
    isShowWxModal: false,
  },
  /**
   * 获取环境变量列表
   */
  getConfigList: function () {
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
      }
    }, function (res) {

    }, function (res) {

    })

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
    this.getConfigList()
    this.setData({ 
      isSelectAll: false, 
      totalPrice:0.00,
      selectedIds: '',
      selectedIdsArr: [],
    })
    this.getShoppingCartProducts()
    var that = this
    wx.getStorage({
      key: 'deviceType',
      success: function (res) {
        that.setData({ deviceType: res.data })
      },
      fail: function (res) {

      }
    })
    if (wx.getStorageSync('isLogin')) {
      that.getRelatedData()
    }
  },
  /**
   * 获取个人中心信息
   */
  getRelatedData: function () {
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = { 'cityId': '1' }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        if (res.merchant.wxOpenId != "1") {  //微信已解绑，重新登录
          wx.setStorageSync('userToken', '')
          wx.setStorageSync('isLogin', false)
          wx.setStorageSync('localProductInfo', [])
          wx.setStorageSync('localCollect', [])
          that.setData({ shoppingCartProducts:[]})
          wx.removeTabBarBadge({
            index: 2,
          })
          that.goToLogin()
        }
      }
    }, function (res) {
      
    }, function (res) {
      
    })
  },
  /**
   * 重新登录
  */
  goToLogin: function () {
    this.setData({ isShowWxModal: true })

  },
  /**
   * 点击model的取消按钮
   */
  logoutModalCancel: function () {
    this.setData({ isShowWxModal: false })

  },
  /**
   * 点击model的确定按钮
   */
  logoutModalConfirm: function () {
    this.setData({ isShowWxModal: false })
    wx.redirectTo({
      url: '/pages/login/login'
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
  
  },
  toastShow: function () {
    toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    toastStatus = true
    this.setData({ toastStatus: toastStatus })
  },
  /**
   * 获取购物车商品列表
   */
  getShoppingCartProducts:function(){
    this.setData({ shoppingCartProducts: [] })
    var that = this
    that.toastShow()
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function(res){
      that.toastHide()
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      if (res != null) {
        var localProductInfo = []
        var totalShoppinCartCount = 0
        for (var i = 0; i < res.length; i++) {
          res[i].specificationPrice = res[i].specificationPrice.toFixed(2)
          res[i].isSelected = false
          that.setData({ shoppingCartProducts: res })
          localProductInfo.push({ 'shoppingCartId': res[i].id, 'quantity': res[i].quantity, 'activityCode': res[i].activityCode, 'specificationId': res[i].specificationId, 'specificationPrice': res[i].specificationPrice})
          totalShoppinCartCount += res[i].quantity
        }
        wx.setStorage({
          key: "localProductInfo",
          data: localProductInfo
        })
        wx.setStorage({
          key: "totalShoppinCartCount",
          data: totalShoppinCartCount
        })
        if (totalShoppinCartCount == 0){
          wx.removeTabBarBadge({
            index: 2,
          })
        }else{
          wx.setTabBarBadge({
            index: 2,
            text: totalShoppinCartCount.toString()
          })
        }
      }
    }, function (res){

    }, function (res) {
        wx.hideNavigationBarLoading()
        that.toastHide()
        wx.stopPullDownRefresh()
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    let that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getShoppingCartProducts()
  },
  /**
   * 删除购物车商品按钮
   */
  deleteProductAction: function (e){
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: "是否将" + that.data.shoppingCartProducts[e.currentTarget.dataset.index].productName+"从购物车中删除？",
      success: function (res) {
        if (res.confirm) {
          that.deleteProduct(e.currentTarget.dataset.item.id, e.currentTarget.dataset.index)
        }
      },
      fail: function () {
        if (res.confirm) {
          
        }
      }
    })
    
  },
  /**
   * 删除购物车商品 
   */
  deleteProduct: function (id,index) {
    var that = this
    that.toastShow()
    var url = app.data.HOST + 'shoppingCart/' + id
    var params = {}
    app.request.requestDeleteApi(url, params, that, function(res){
      that.data.shoppingCartProducts.splice(index, 1)
      that.setData({ shoppingCartProducts: that.data.shoppingCartProducts })
      wx.getStorage({
        key: 'localProductInfo',
        success: function (res) {
          for (var i = 0; i < res.data.length; i++) {
            if (id == res.data[i].shoppingCartId) {
              res.data.splice(i, 1)
            }
          }
          wx.setStorage({
            key: "localProductInfo",
            data: res.data
          })
        },
        fail: function (res) {

        }
      })
      that.updateBadgeValue()
      that.updateSelectedProduct()
    }, function (res){
      that.toastHide()
    },function(){
      that.toastHide()
    })
  },
  /**
   * 选择/不选
   */
  changeSelectStatus:function(e){
    var that = this
    that.data.shoppingCartProducts[e.currentTarget.dataset.index].isSelected = !that.data.shoppingCartProducts[e.currentTarget.dataset.index].isSelected
    that.setData({ shoppingCartProducts: that.data.shoppingCartProducts})
    that.updateSelectedProduct()
  },
  /**
   * 自定义购买数量点击取消
   */
  modalCancel:function(){
    this.setData({ showQuantityModal: false })
  },
  /**
   * 自定义购买数量点击确定
   */
  modalConfirm: function () {
    var that = this
    if (that.data.quantityInput == null || that.data.quantityInput == undefined || that.data.quantityInput == ""){
      wx.showToast({
        title: '请输入购买数量',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.quantityInput.indexOf(".") != -1){
      wx.showToast({
        title: '请输入整数',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.setData({ showQuantityModal: false })
    that.updateQuantity(that.data.currentSelectedProduct.id, parseInt(that.data.quantityInput), that.data.currentUpdateIndex)
  },
  /**
   * 自定义购买数量
   */
  update: function (e){
    this.setData({ 
      showQuantityModal: true, 
      currentSelectedProduct: e.currentTarget.dataset.item, 
      currentUpdateIndex: e.currentTarget.dataset.index
    })
  },
  /**
   * 减少购买数量
   */
  minus: function (e) {
    this.updateQuantity(e.currentTarget.dataset.item.id, e.currentTarget.dataset.item.quantity - 1, e.currentTarget.dataset.index)
  },
  /**
   * 增加购买数量
   */
  add:function(e){
    this.updateQuantity(e.currentTarget.dataset.item.id, e.currentTarget.dataset.item.quantity + 1, e.currentTarget.dataset.index)
  },
  /**
   * 更新购买数量
   */
  updateQuantity: function (id,num,index) {
    var that = this
    if (num <= 0) {
      wx.showModal({
        title: '温馨提示',
        content: "是否将" + that.data.shoppingCartProducts[index].productName + "从购物车中删除？",
        success: function (res) {
          if (res.confirm) {
            that.deleteProduct(id, index)
          }
        },
        fail: function () {
          if (res.confirm) {

          }
        }
      })
      return
    }
    if (num > 300){
      wx.showToast({
        title: '单个商品购买数量不能超过300件',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    var url = app.data.HOST + 'shoppingCart/' + id + '?quantity=' + num + '&version=2.4.0'
    var params = {}
    app.request.requestPostApi(url, params, that, function (res) {
      if(res != null){
        if (res < num) {
          wx.showToast({
            title: '操作失败，剩余库存为' + res,
            icon: 'none',
            duration: 2000
          })
        } else {
          that.data.shoppingCartProducts[index].quantity = num
          that.setData({ shoppingCartProducts: that.data.shoppingCartProducts })
          wx.getStorage({
            key: 'localProductInfo',
            success: function (res) {
              for (var i = 0; i < res.data.length; i++) {
                if (id == res.data[i].shoppingCartId){
                  res.data[i].quantity = num
                }
              }
              wx.setStorage({
                key: "localProductInfo",
                data: res.data
              })
            },
            fail: function (res) {

            }
          })
          that.updateBadgeValue()
          that.updateSelectedProduct()
        }
      }
    }, function (res) {
      that.toastHide()
    }, function () {
      that.toastHide()
    })
  },
  /**
   * 更新所选商品信息
  */
  updateSelectedProduct:function(){
    var that = this
    that.setData({ selectedIds: '', selectedIdsArr: [], totalPrice: 0.00 })
    var totalPrice = 0.00
    var selectedIdsArr = []
    for (var i = 0; i < that.data.shoppingCartProducts.length; i++) {
      if (that.data.shoppingCartProducts[i].isSelected){
        totalPrice += that.data.shoppingCartProducts[i].specificationPrice * that.data.shoppingCartProducts[i].quantity
        selectedIdsArr.push(that.data.shoppingCartProducts[i].id)
      }
      if (selectedIdsArr.length == that.data.shoppingCartProducts.length){
        that.setData({ isSelectAll: true })
      }else{
        that.setData({ isSelectAll: false })
      }
    }
    that.setData({ totalPrice: totalPrice.toFixed(2), selectedIds: selectedIdsArr.join(','), selectedIdsArr: selectedIdsArr })
  },
  /**
   * 去结算
  */
  order:function(){
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = { 'cityId': '1' }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
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
        }else{
          if (that.data.selectedIdsArr.length == 0) {
            wx.showToast({
              title: '请选择商品',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.navigateTo({
              url: '../orderComfirm/orderComfirm?ids=' + that.data.selectedIdsArr,
            })
          }
        }
      }
    }, function (res) {
      if (that.data.selectedIdsArr.length == 0) {
        wx.showToast({
          title: '请选择商品',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.navigateTo({
          url: '../orderComfirm/orderComfirm?ids=' + that.data.selectedIdsArr,
        })
      }
    }, function (res) {
      if (res.statusCode != 200){
        if (that.data.selectedIdsArr.length == 0) {
          wx.showToast({
            title: '请选择商品',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.navigateTo({
            url: '../orderComfirm/orderComfirm?ids=' + that.data.selectedIdsArr,
          })
        }
      }
    })
    
  },
  /**
   * 全选
  */
  selectAll:function(){
    var that = this
    var totalPrice = 0.00
    var selectedIdsArr = []
    that.setData({ isSelectAll: !that.data.isSelectAll})
    for (var i = 0; i < that.data.shoppingCartProducts.length; i++) {
      if (that.data.isSelectAll){
        that.data.shoppingCartProducts[i].isSelected = true
        totalPrice += that.data.shoppingCartProducts[i].specificationPrice * that.data.shoppingCartProducts[i].quantity
        selectedIdsArr.push(that.data.shoppingCartProducts[i].id)
      }else{
        that.data.shoppingCartProducts[i].isSelected = false
      }
    }
    that.setData({ shoppingCartProducts: that.data.shoppingCartProducts, totalPrice: totalPrice.toFixed(2), selectedIds: selectedIdsArr.join(','), selectedIdsArr: selectedIdsArr })
  },
  /**
   * 更新badge数值
  */
  updateBadgeValue:function(){
    var that = this
    var totalShoppinCartCount = 0
    for (var i = 0; i < that.data.shoppingCartProducts.length; i++) {
      totalShoppinCartCount += that.data.shoppingCartProducts[i].quantity
    }
    wx.setStorage({
      key: "totalShoppinCartCount",
      data: totalShoppinCartCount
    })
    if(totalShoppinCartCount == 0){
      wx.removeTabBarBadge({
        index: 2,
      })
    }else{
      wx.setTabBarBadge({
        index: 2,
        text: totalShoppinCartCount.toString()
      })
    }
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
   * 跳转到分类页面
  */
  goToCategory:function(){
    wx.switchTab({
      url: "../category/category"
    });
  }
})