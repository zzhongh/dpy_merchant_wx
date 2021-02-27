//app.js
// app.js
//var cfg = require('./utils/cfg.js') 
const request = require('./utils/requestUtil.js')
var CryptoJS = require('./utils/aes_base64/public.js')
var isDebug = false;
let DEV_HOST = "http://local.dongpinyun.cn:9090/dongpinyun/";
let TEST_HOST_SIT = "http://119.23.142.208:8080/dongpinyun/";
let TEST_HOST_UAT = "http://119.23.142.208:8081/dongpinyun/";
let PROD_HOST = "https://service.dongpinyun.com/dongpinyun/";
let OTHER_HOST = "http://192.168.202.25:8081/dongpinyun/";

App({
  request: request,
  data: {
    HOST: isDebug ? TEST_HOST_UAT : PROD_HOST,
    appId: '550rfKBfdA2bZBZSNuVIr+xo/WFbJ0+qkvNriQljW7c=',
    secret: 'NB9hKm3hyFatDWqqk7+mjU0SSERgYD/LtZFDD26XjxvcI8ZJQ7A8b/7e5FLhfBjO',
    userToken: '',
    openId: '',
    kScreenWidth: wx.getSystemInfoSync().windowWidth,
    kScreenHeight: wx.getSystemInfoSync().windowHeight,
  },
  onLaunch: function () {
    let that = this;284463
    // console.log("appId= " + CryptoJS.AES_Decrypt(that.data.appId))
    // console.log("secret= " + CryptoJS.AES_Decrypt(that.data.secret))
    wx.getSystemInfo({
      success: function (res) {
        wx.setStorageSync('systemInfo', res)
        wx.setStorageSync('deviceVersion', that.getNum(res.system))
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
        if (res.model.toString().indexOf("iPhone") != -1){
          wx.setStorageSync('deviceType', "iPhone")
        }else{
          wx.setStorageSync('deviceType', "Android")
        }
      }
    })

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    wx.setStorageSync('logs', logs)

    wx.getStorage({
      key: 'haveSaveCityId',
      success: function (res) {
        
      },
      fail: function (res) {
        wx.setStorageSync('haveSaveCityId', false)
      }
    })

    wx.getStorage({
      key: 'cityId',
      success: function (res) {
        
      },
      fail: function (res) {
        wx.setStorageSync('cityId', '')
      }
    })

    wx.getStorage({
      key: 'cityName',
      success: function (res) {

      },
      fail: function (res) {
        wx.setStorageSync('cityName', '')
      }
    })

    wx.getStorage({
      key: 'userToken',
      success: function (res) {
        // wx.setStorageSync('userToken', 'b500e959-99c9-4f6a-8cc6-44dadcdae17a')
      },
      fail: function (res) {
        wx.setStorageSync('userToken', '')
      }
    })

    wx.getStorage({
      key: 'isLogin',
      success: function (res) {
        
      },
      fail: function (res) {
        wx.setStorageSync('isLogin', false)
      }
    })
    
    wx.getStorage({
      key: 'localProductInfo',
      success: function (res) {

      },
      fail: function (res) {
        wx.setStorageSync('localProductInfo', [])
      }
    })

    wx.getStorage({
      key: 'localCollect',
      success: function (res) {

      },
      fail: function (res) {
        wx.setStorageSync('localCollect', [])
      }
    })

    wx.getStorage({
      key: 'saveDateStr',
      success: function (res) {

      },
      fail: function (res) {
        wx.setStorageSync('saveDateStr', '')
      }
    })
     
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况 
              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    that.getConfigList()



  },
  getNum: function(text){
    var value = text.replace(/[^0-9]/ig, "");
    return value;
  },
  onShow:function(){
    // wx.getStorage({
    //   key: 'haveSaveCityId',
    //   success: function (res) {
    //     if (res.data == true) {
    //       wx.switchTab({
    //         url: '../index/index'
    //       })
    //     } else {
    //       wx.redirectTo({
    //         url: '../chooseCity/chooseCity'
    //       })
    //     }
    //   },
    // })
  },
  /**
   * 获取环境变量列表
   */
  getConfigList:function(){
    //初始化一下
    wx.setStorage({
      key: "configList",
      data: []
    })
    var url = this.data.HOST + 'config/list'
    var params = {}
    this.request.requestGetApi(url, params, this, function (res) {
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
   * 获取购物车商品列表
   */
  getShoppingCartProducts: function () {
    var that = this
    var url = that.data.HOST + 'shoppingCart'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    that.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        var localProductInfo = []
        var totalShoppinCartCount = 0
        for (var i = 0; i < res.length; i++) {
          localProductInfo.push({ 'shoppingCartId': res[i].id, 'quantity': res[i].quantity, 'activityCode': res[i].activityCode, 'specificationId': res[i].specificationId, 'specificationPrice': res[i].specificationPrice })
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
        if (totalShoppinCartCount == 0) {
          wx.removeTabBarBadge({
            index: 2,
          })
        } else {
          wx.setTabBarBadge({
            index: 2,
            text: totalShoppinCartCount.toString()
          })
        }
      }else{
        wx.setStorage({
          key: "totalShoppinCartCount",
          data: 0
        })
        wx.removeTabBarBadge({
          index: 2,
        })
      }
    }, function (res) {
    }, function (res) {
      if (res.statusCode != 200){
        wx.setStorage({
          key: "totalShoppinCartCount",
          data: 0
        })
        wx.removeTabBarBadge({
          index: 2,
        })
      }
    })
  },
  globalData:{
    currentSelectedIndex:0
  }
})