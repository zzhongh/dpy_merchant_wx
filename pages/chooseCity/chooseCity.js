// pages/login/login.js 
const app = getApp()
var HttpRequst = require('../../utils/request.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    provincesAndCityList:[],
    toastStatus: true,
    source:''
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    console.log(options.source)
    if (options.source != undefined){
      this.setData({ source: options.source})
    }
    this.getCitys()
  },
  /**
   * 获取身份和城市列表
   */
  getCitys(){
    var that = this
    that.toastShow()
    HttpRequst.HttpRequst(app.data.HOST + 'availableAreas/provincesAndCities', 'GET', {},
          function(res){
            that.toastHide()
            if (res && res.data && res.data.code == 100){
              var provincesAndCityList = res.data.content
              //将每个城市对象中添加是否被选中的属性
              if (provincesAndCityList){
                for (var i = 0; i < provincesAndCityList.length;i++){
                  for (var j = 0; j < provincesAndCityList[i].cityList.length;j++){
                    if (wx.getStorageSync('cityId') == provincesAndCityList[i].cityList[j].id){
                      provincesAndCityList[i].cityList[j].isSelected = true
                    }else{
                      provincesAndCityList[i].cityList[j].isSelected = false
                    }
                  }
                }
              }
              that.setData({
                provincesAndCityList: provincesAndCityList
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
          function (res){
            that.toastHide()
          })
  },
  /**
   * 城市被点击
   */
  chooseCity:function(e){
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    app.data.cityId = id
    var provincesAndCityList = this.data.provincesAndCityList
    //将每个城市对象中添加是否被选中的属性
    if (provincesAndCityList) {
      for (var i = 0; i < provincesAndCityList.length; i++) {
        for (var j = 0; j < provincesAndCityList[i].cityList.length; j++) {
          if (id == provincesAndCityList[i].cityList[j].id) {
            provincesAndCityList[i].cityList[j].isSelected = true
          } else {
            provincesAndCityList[i].cityList[j].isSelected = false
          }
        }
      }
      this.setData({
        provincesAndCityList: provincesAndCityList
      })
    }
    if(wx.getStorageSync('isLogin')){
      this.updateCityId(id, name)
    }else{
      wx.setStorageSync('cityName', name)
      wx.setStorageSync('cityId', id)
      wx.setStorageSync('haveSaveCityId', true)
      if (this.data.source == 'index'){
        wx.navigateBack();
      } else if (this.data.source == '') {
        wx.switchTab({
          url: '../index/index'
        })
      }
      
    }
  },

  updateCityId: function (id, name){
    wx.setStorageSync('cityName', name)
    wx.setStorageSync('cityId', id)
    wx.setStorageSync('haveSaveCityId', true)
    wx.switchTab({
      url: '../index/index'
    })
    var that = this
    that.toastShow()
    HttpRequst.HttpRequst(app.data.HOST + 'merchant/currentCity?cityId=' + id, 'POST',
          {},
          function(res){
            that.toastHide()
            if(res && res.data && res.data.code == 100){
              wx.setStorageSync('cityName', name)
              wx.setStorageSync('cityId', id)
              wx.setStorageSync('haveSaveCityId', true)
              if (that.data.source == 'index') {
                wx.navigateBack();
              } else if (that.data.source == '') {
                wx.switchTab({
                  url: '../index/index'
                })
              }
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
          })
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