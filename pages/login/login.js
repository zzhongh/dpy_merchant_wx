// pages/login/login.js 
const app = getApp()
var toastStatus = true;
var CryptoJS = require('../../utils/aes_base64/public.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appId:'550rfKBfdA2bZBZSNuVIr+xo/WFbJ0+qkvNriQljW7c=',
    secret:'NB9hKm3hyFatDWqqk7+mjU0SSERgYD/LtZFDD26XjxvcI8ZJQ7A8b/7e5FLhfBjO',
    toastStatus: toastStatus,
  },
  toastShow: function () {
    // console.log("触发了点击事件，弹出toast")
    toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    // console.log("触发bindchange，隐藏toast")
    toastStatus = true
    this.setData({ toastStatus: toastStatus })
  },
  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    // console.log(CryptoJS.AES_Encrypt("c9c682d563867d6962216281a369e692"))
    if (app.globalData.userInfo) {
      //存在用户信息
      // this.setData({
      //   userInfo: app.globalData.userInfo,
      //   hasUserInfo: true
      // })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // this.setData({
        //   userInfo: res.userInfo,
        //   hasUserInfo: true
        // })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          // this.setData({
          //   userInfo: res.userInfo,
          //   hasUserInfo: true
          // })
        }
      })
    }
  },

  getUserInfo: function (e) {
    console.log(e)
    if (e.detail.userInfo){
      //允许获取用户信息
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      this.toastShow()
      this.getCode();
    }else{
      //拒绝获取用户信息
    }
    
  },

  getCode:function(){
    var that = this
    wx.login({
      success: function (res) {
        console.log('coede:' + res.code)
        if (res.code) {
          var appid = CryptoJS.AES_Decrypt(that.data.appId)
          var secret = CryptoJS.AES_Decrypt(that.data.secret)
          that.WeChatLogin(res.code)
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
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
   * 去首页
  */
  goToHome:function(){
    wx.switchTab({
      url: '../index/index'
    })
  },
  /**
   * 微信登录接口  token/merchantOfWeChatLogin
  */
  WeChatLogin: function (code){
    var that = this
    
    wx.getStorage({
      key: 'cityId',
      success: function (resData) {
        var url = app.data.HOST + 'token/merchantOfWeChatLogin'
        var params = {
          "deviceTokens": "",
          "openId": "",
          "deviceType": "weixin",
          "accessToken": "",
          "code": code,
          "currentCityId": resData.data,
          "headImgURL": that.data.userInfo.avatarUrl,
          "nickName": that.data.userInfo.nickName,
        }
        app.request.requestGetApi(url, params, that, function (res) {
          that.toastHide()
          if (res != null) {   //绑定成功并登陆，跳转到首页
            wx.setStorageSync('userToken', res.token)
            wx.setStorageSync('isLogin', true)
            wx.setStorage({
              key: "registerPhone",
              data: res.merchant.telephone
            })
            wx.switchTab({
              url: '../index/index'
            })
          }
        }, function (res) {
        }, function (res) {
          that.toastHide()
          if(res.data.code == 90){   //未绑定手机号，跳转到绑定手机号页面
            if (res.data.content != null && res.data.content != ""){
              that.goToBindTelephone(res.data.content, that.data.userInfo.nickName, that.data.userInfo.avatarUrl)
            }else{
              wx.showToast({
                title: '授权失败，请重试',
                icon: 'none',
                duration: 2000
              })
            }
            
          }
        })
      },
      fail: function (res) {
        
      }
    })
  },
  /**
   * 跳转到绑定手机号页面
  */
  goToBindTelephone: function (openId, nickName, headImgURL){
    wx.navigateTo({
      url: '../bindTelephone/bindTelephone?openid=' + openId + '&nickName=' + nickName + '&headImgURL=' + headImgURL,
    })
  }
})