// pages/personalCenter/pointExchange/pointExchange.js
const app = getApp() 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    points:"0",
    redPacketList:[],
    showExchangeSuccessModal:true,
    exchangeSuccessImage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    // this.setData({ points: options.points})
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
    this.getRelatedData()
    this.getRedPacketList()
    this.imgHeight()
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
   * 获取兑换列表
   */
  getRedPacketList: function () {
    var that = this
    var url = app.data.HOST + 'redPacket'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        for (var i = 0; i < res.length; i++) {
          res[i].amount = res[i].amount.toFixed(2)
          res[i].amountCondition = res[i].amountCondition.toFixed(2)
          res[i].exchangePoint = res[i].exchangePoint.toFixed(2)
        }
        that.setData({ redPacketList:res})
      }
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 兑换
  */
  exchange:function(e){
    var that = this
    console.log(e.currentTarget.dataset.item)
    that.setData({ currentSelectedExchangeRedPacketInfo: e.currentTarget.dataset.item })
    wx.showModal({
      title: '温馨提示',
      content: "是否花" + e.currentTarget.dataset.item.exchangePoint + "点积分兑换" + e.currentTarget.dataset.item.amount + "元红包？",
      success: function (res) {
        if (res.confirm) {
          that.pointExchangeRedPacket(e.currentTarget.dataset.item.id)
        }
      },
      fail: function () {
        if (res.confirm) {

        }
      }
    })
  },
  /**
   * 积分兑换红包 
  */
  pointExchangeRedPacket: function (redPacketId){
    var that = this
    var url = app.data.HOST + 'merchantRedPacket/pointsExchangeRedPacket?redPacketId=' + redPacketId
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      that.setData({ showExchangeSuccessModal: false })
      that.getRelatedData()
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 获取个人信息
   */
  getRelatedData: function () {
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = {  }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ points: res.merchant.points })
      }
    }, function (res) {
      
    }, function (res) {
    })
  },
  /**
   * 点击model的取消按钮
   */
  hideExchangeSuccessModal: function () {
    this.setData({ showExchangeSuccessModal: true })
  },
  // 获取图片宽高
  imgHeight: function () {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var winHei = wx.getSystemInfoSync().windowHeight; //获取当前屏幕的宽度
    var modalH = (winWid * 0.75) * 632 / 843 + "px"//等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
    this.setData({
      modalH: modalH,//设置高度
      modalMarginTop: (winHei - ((winWid * 0.7) * 632 / 843))/2 + "px",
      modalTextContentMarginTop: (winHei - ((winWid * 0.7) * 632 / 843)) / 2 + ((winWid * 0.75) * 632 / 843)/3 + "px"
    })
  },
})