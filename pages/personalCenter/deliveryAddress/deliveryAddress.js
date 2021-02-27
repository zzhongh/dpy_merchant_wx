// pages/personalCenter/deliveryAddress/deliveryAddress.js
const app = getApp()
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
    console.log(options)
    this.setData({source:options.source})
    if (options.id != undefined) {
      this.setData({ currentAddressId: options.id})
    }
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
    this.getDeliveryAddressList()
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
   * 获取收货地址列表
   */
  getDeliveryAddressList:function(){
    var that = this
    var url = app.data.HOST + 'deliveryAddress'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      wx.hideNavigationBarLoading()
      if (res != null) {
        that.setData({ deliveryAddressList:res})
      }
    }, function (res) {
    }, function (res) {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  /**
   * 设置默认地址   
  */
  setDefaultAddress:function(e){
    var that = this
    var url = app.data.HOST + 'defaultDeliveryAddress/' + e.currentTarget.dataset.item.id
    var params = {}
    app.request.requestPostApi(url, params, that, function (res) {
      that.getDeliveryAddressList()
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 删除地址   
  */
  deleteAddress: function (e) {
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: "是删除该地址？",
      success: function (res) {
        console.log(res)
        if (res.confirm) {
          var url = app.data.HOST + 'deliveryAddress/' + e.currentTarget.dataset.item.id
          var params = {}
          app.request.requestDeleteApi(url, params, that, function (res) {
            that.getDeliveryAddressList()
          }, function (res) {
          }, function (res) {
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
   * 跳转到更改地址页面   
  */
  goToModifyAddressView: function (e) {
    let jsonStr = JSON.stringify(e.currentTarget.dataset.item);
    wx.navigateTo({
      url: '../addOrModifyAddress/addOrModifyAddress?source=modify&addressInfo=' + jsonStr,
    })
  },
  /**
   * 跳转到新增地址页面   
  */
  goToAddNewAddressView: function () {
    wx.navigateTo({
      url: '../addOrModifyAddress/addOrModifyAddress?source=add',
    })
  },
  /**
   * 选择地址
  */
  chooseAddress:function(e){
    if (this.data.source == "orderConfirm"){
      
      //将新选中的地址信息赋值给上个页面的对象
      var addressInfo = e.currentTarget.dataset.item
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 2]
      prevPage.setData({ defaultDeliveryAddress: addressInfo})
      wx.navigateBack()
    }
  }
})