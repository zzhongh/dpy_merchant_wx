// pages/personalCenter/availableArea/availableArea.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentStep:0,
    selectedProvinceId: '',
    selectedProvinceName: '',
    selectedCityId: '',
    selectedCityName: '',
    selectedDistrictId: '',
    selectedDistrictName: '',
    selectedStreetId: '',
    selectedStreetName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAvaliableAreaList()
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
   * 获取可选地址列表
  */
  getAvaliableAreaList:function(e){
    var that = this
    if(that.data.currentStep>0){
      console.log(e.currentTarget.dataset)
      console.log(e.currentTarget.dataset.item.id)
    }
    var url = ""
    var params = {}
    if(that.data.currentStep == 0){
      url = app.data.HOST + 'availableAreas/provinces'
      params = {}
      wx.setNavigationBarTitle({
        title: "选择省份"
      })
    }else if(that.data.currentStep == 1){
      url = app.data.HOST + 'availableAreas/cities'
      params = { 'provinceId': e.currentTarget.dataset.item.id}
      wx.setNavigationBarTitle({
        title: "选择城市"
      })
      that.setData({ selectedProvinceId: e.currentTarget.dataset.item.id, selectedProvinceName: e.currentTarget.dataset.item.name})
    } else if (that.data.currentStep == 2) {
      url = app.data.HOST + 'availableAreas/districts'
      params = { 'cityId': e.currentTarget.dataset.item.id}
      wx.setNavigationBarTitle({
        title: "选择区域"
      })
      that.setData({ selectedCityId: e.currentTarget.dataset.item.id, selectedCityName: e.currentTarget.dataset.item.name })
    } else if (that.data.currentStep == 3) {
      url = app.data.HOST + 'availableAreas/streets'
      params = { 'districtId': e.currentTarget.dataset.item.id}
      wx.setNavigationBarTitle({
        title: "选择街道"
      })
      that.setData({ selectedDistrictId: e.currentTarget.dataset.item.id, selectedDistrictName: e.currentTarget.dataset.item.name })
    } else if (that.data.currentStep == 4) {
      that.setData({ selectedStreetId: e.currentTarget.dataset.item.id, selectedStreetName: e.currentTarget.dataset.item.name })
      that.bacToPreView()
      return
    }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res.length == 0){
        that.bacToPreView()
        return
      }
      if (res != null) {
        that.setData({ avaliableAreaList:res})
        if (that.data.currentStep < 4){
          that.setData({ currentStep: that.data.currentStep + 1 })
          console.log(that.data.currentStep)
        }else{
          that.bacToPreView()
        }
      }
    }, function (res) {

    }, function (res) {
      
    })
  },
  /**
   * 返回上一个页面并传递数据
  */
  bacToPreView:function(){
    var that = this
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      selectedProvinceId: that.data.selectedProvinceId,
      selectedProvinceName: that.data.selectedProvinceName,
      selectedCityId: that.data.selectedCityId,
      selectedCityName: that.data.selectedCityName,
    })
    if (that.data.selectedDistrictName == ''){
      prevPage.setData({
        selectedDistrictId: "",
        selectedDistrictName: "",
      })
    }else{
      prevPage.setData({
        selectedDistrictId: that.data.selectedDistrictId,
        selectedDistrictName: that.data.selectedDistrictName,
      })
    }

    if (that.data.selectedStreetName == '') {
      prevPage.setData({
        selectedStreetId: "",
        selectedStreetName: "",
      })
    } else {
      prevPage.setData({
        selectedStreetId: that.data.selectedStreetId,
        selectedStreetName: that.data.selectedStreetName,
      })
    }
    wx.navigateBack();
  }
})