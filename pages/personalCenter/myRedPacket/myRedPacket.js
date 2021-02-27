// pages/personalCenter/transactionRecords/transactionRecords.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp()
var toastStatus = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["待使用", "已使用", "已过期"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageIndex: 1, 
    pageSize: 10,
    isLoadedAllAuditDataText: "点击加载更多",
    redPacketList: [], //记录
  },
  /**
   * 切换列表 
   * */
  tabClick: function (e) {
    let that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      pageIndex: 1,
      // redPacketList: [],
    });
    that.getRedPacketList()
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
    that.getRedPacketList()
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
   * 获取红包列表
   */
  getRedPacketList: function () {
    var that = this
    that.setData({
      isLoadedAllAuditDataText: "点击加载更多",
    })
    var status = ''
    if (that.data.activeIndex == 0) {
      status = "0"
    } else if (that.data.activeIndex == 1) {
      status = "1"
    } else if (that.data.activeIndex == 2) {
      status = "2"
    }
    var url = app.data.HOST + 'merchantRedPacket/listRedPacket?pageIndex=' + that.data.pageIndex + '&pageSize=' + that.data.pageSize + '&status=' + status
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        var redPacketList = []
        if (that.data.pageIndex == 1) {
          for (var i = 0; i < res.records.length; i++) {
            res.records[i].amount = res.records[i].amount.toFixed(2)
            res.records[i].amountCondition = res.records[i].amountCondition.toFixed(2)
          }
          redPacketList = res.records
          that.setData({ redPacketList: redPacketList })
          if (res.records.length < 10) {
            that.setData({
              isLoadedAllAuditDataText: "暂无更多数据"
            })
          }
        } else if (that.data.pageIndex > 1) {
          for (var i = 0; i < res.records.length; i++) {
            res.records[i].amount = res.records[i].amount.toFixed(2)
            res.records[i].amountCondition = res.records[i].amountCondition.toFixed(2)
          }
          let newRedPacketListData = that.data.redPacketList.concat(res.records)
          that.setData({
            redPacketList: newRedPacketListData
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
  loadMore: function () {
    var that = this
    if (that.data.isLoadedAllAuditDataText == "点击加载更多") {
      that.setData({
        pageIndex: that.data.pageIndex + 1
      });
      that.getRedPacketList()
    }
  },
  /**
   * 跳转到兑换红包列表
  */
  goToExchange: function () {
    wx.navigateTo({
      url: '../pointExchange/pointExchange',
    })
  }
})