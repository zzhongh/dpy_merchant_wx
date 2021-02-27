// pages/personalCenter/transactionRecords/transactionRecords.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp()
var toastStatus = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["消费记录", "退款记录","充值记录"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageIndex:1,
    pageSize:10,
    isLoadedAllAuditDataText:"点击加载更多",
    tradingRecord:[], //记录
  },
  /**
   * 切换列表 
   * */
  tabClick: function (e) {
    let that = this;
    console.log(e.currentTarget.id)
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      pageIndex:1
    });
    that.getRecordsList()
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
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 3
        });
      }
    });
    that.getRecordsList()
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
   * 获取记录列表
   */
  getRecordsList:function(){
    var that = this
    that.setData({
      isLoadedAllAuditDataText: "点击加载更多"
    })
    var url = ''
    if(that.data.activeIndex == 0){
      url = app.data.HOST + 'merchant/myTradingRecord/orderTradingRecord?pageIndex='+that.data.pageIndex+'&pageSize='+that.data.pageSize
    } else if (that.data.activeIndex == 1){
      url = app.data.HOST + 'merchant/myTradingRecord/orderRefundTradingRecord?pageIndex=' + that.data.pageIndex + '&pageSize=' + that.data.pageSize
    } else if (that.data.activeIndex == 2){
      url = app.data.HOST + 'merchant/myTradingRecord/rechargeTradingRecord?pageIndex=' + that.data.pageIndex + '&pageSize=' + that.data.pageSize
    }
    var params = {  }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        var tradingRecord = []
        if (that.data.pageIndex == 1) {
          tradingRecord = res.records
          that.setData({ tradingRecord: tradingRecord })
          if (res.records.length < 10) {
            that.setData({
              isLoadedAllAuditDataText: "暂无更多数据"
            })
          }
        } else if (that.data.pageIndex > 1) {
          console.log("大于1")
          let newTradingRecordData = that.data.tradingRecord.concat(res.records)
          that.setData({
            tradingRecord: newTradingRecordData
          })
          if (res.records.length < 10) {
            that.setData({
              isLoadedAllAuditDataText: "暂无更多数据"
            })
          }
        }
      }
    }, function (res) {
    }, function (res) {
    })
  },
  /**
   * 加载更多
  */
  loadMore:function(){
    var that = this
    if (that.data.isLoadedAllAuditDataText == "点击加载更多"){
      that.setData({
        pageIndex: that.data.pageIndex + 1
      });
      that.getRecordsList()
    }
  },
  /**
   * 跳转到订单详情
  */
  goToOrderDetail: function (e) {
    var orderNo = e.currentTarget.dataset.orderno
    var that = this
    if (that.data.activeIndex != 2){
      that.getOrderDetailInfo(orderNo)
    }
  },
  /**
   * 获取订单详情信息
  */
  getOrderDetailInfo: function (orderNo){
    var that = this
    var url = app.data.HOST + 'orders/' + orderNo
    var params = {  }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        var orderInfo = JSON.stringify(res)
        wx.navigateTo({
          url: '../../orderList/orderDetail/orderDetail?orderInfo=' + orderInfo,
        })
      }
    }, function (res) {
    }, function (res) {
    })
  }
})