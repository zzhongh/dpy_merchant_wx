// pages/personalCenter/payWithoutPasswordInput/payWithoutPasswordInput.js
const app = getApp()
let md5 = require("../../../utils/MD5.js");
var CryptoJS = require('../../../utils/aes_base64/public.js')
let base64 = require("../../../utils/base64.js");
var baseUtils = require('../../../utils/baseUtils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 输入框参数设置
    inputData: {
      input_value: "",//输入框的初始内容
      value_length: 0,//输入框密码位数
      isNext: false,//是否有下一步的按钮
      get_focus: true,//输入框的聚焦状态
      focus_class: true,//输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6],//输入框格子数
      height: "98rpx",//输入框高度
      width: "604rpx",//输入框宽度
      see: false,//是否明文展示
      interval: true,//是否显示间隔格子 
    }
  },
  /**
   * 获取当前时间戳
  */
  getCurrentTimeStamp:function(){
    var timestamp = (new Date()).valueOf();
    return timestamp
  },
  // 当组件输入数字6位数时的自定义函数  AES(password:"{\"timestamp\":\"\(getCurrentTimeStamp())\",\"password\":\"\(password.md5)\"}")
  valueSix(e) {
    var that = this
    if (that.data.source == "update"){
      var timestamp = new Date().getTime()
      var dateStr = baseUtils.timestampFormat(timestamp, 'YMDhms')
      console.log(dateStr)
      let param = {
        "timestamp": dateStr,
        "password": md5.hex_md5(e.detail)
      }
      that.updatePayWithoutPasswordStatus(JSON.stringify(param))
      console.log(e.detail)
    }
    // console.log("1");
    // // 模态交互效果
    // wx.showToast({
    //   title: '支付成功',
    //   icon: 'success',
    //   duration: 2000
    // })
  },
  /**
   * 生命周期函数--监听页面加载 status=0 未开启 status=1 已开启
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({ source: options.source, status: options.status})
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
      }
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
    wx.setNavigationBarTitle({
      title: "验证支付密码"
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
  /**
   * 忘记密码
  */
  forget:function(){
    wx.navigateTo({
      url: '../resetPayPassword/resetPayPassword',
    })
  },
  strToHexCharCode: function(str) {
    　　if(str === "")
　　　　return "";
　　var hexCharCode = [];
　　hexCharCode.push("0x");
　　for (var i = 0; i < str.length; i++) {
  　　　　hexCharCode.push((str.charCodeAt(i)).toString(16));
　　}
　　return hexCharCode.join("");
},
  /**
   * 更新免密支付状态 wallet/freePassword/enable-开启  wallet/freePassword/disable-关闭
  */
  updatePayWithoutPasswordStatus: function (password){
    console.log(password)
    var that = this
    var url = ""
    if(that.data.status == "0"){  //关闭状态，开启
      url = app.data.HOST + 'wallet/freePassword/enable?password=' + encodeURIComponent(CryptoJS.AES_Encrypt(password))
    } else if (that.data.status == "1") {  //开启状态，关闭
      url = app.data.HOST + 'wallet/freePassword/disable?password=' + encodeURIComponent(CryptoJS.AES_Encrypt(password))
    }
    // var params = { "password": CryptoJS.AES_Encrypt(password)}
    var params = {}
    app.request.requestPostApi(url, params, that, function (res) {
      if (that.data.status == "0") {  //关闭状态，开启
        wx.showToast({
          title: '已开启免密支付',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 1000)
      } else if (that.data.status == "1") {  //开启状态，关闭
        wx.showToast({
          title: '已关闭免密支付',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 1000)
      }
    }, function (res) {
      
    }, function () {
      
    })
  }
})