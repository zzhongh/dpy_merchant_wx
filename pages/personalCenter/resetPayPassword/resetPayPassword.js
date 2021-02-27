// pages/personalCenter/resetPayPassword/resetPayPassword.js
let md5 = require("../../../utils/MD5.js");
const app = getApp()
var toastStatus = true;
var interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    telephone:'',
    date: '请选择日期',
    fun_id: 2,
    time: '获取验证码', //倒计时 
    currentTime: 61,
    disabled:false,
    toastStatus: toastStatus,
    placeholderStr:'',
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
    var that = this
    that.getIsSetPayPasswordStatus()
    wx.getStorage({
      key: 'registerPhone',
      success: function(res) {
        that.setData({ telephone:res.data})
      },
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
    var pages = getCurrentPages()
    var prePage = pages[pages.length - 2]
    if (prePage.data.isResetPayPasswordBack || prePage.data.isResetPayPasswordBack == false){
      //如果上一个界面有isResetPayPasswordBack这个数据
      prePage.setData({ isResetPayPasswordBack:true})
    }
    
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
    this.setData({ toastStatus: toastStatus })
  },
  toastHide: function () {
    toastStatus = true
    this.setData({ toastStatus: toastStatus })
  },
  /**
   * 支付密码输入框
  */
  payPasswordInput:function(e){
    this.setData({ payPasswordInput:e.detail.value})
  },
  /**
   * 确认支付密码输入框
  */
  confirmPayPasswordInput: function (e) {
    this.setData({ confirmPayPasswordInput: e.detail.value })
  },
  /**
   * 验证码输入框
  */
  msgCodeInput: function (e) {
    this.setData({ msgCodeInput: e.detail.value })
  },
  /**
   * 获取短信验证码
  */
  getMessageCode:function(){
    this.toastShow()
    var that = this
    var url = app.data.HOST + 'wallet/sendMsgCode'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      wx.showToast({
        title: '验证码已发送至'+that.data.telephone+'请注意查收',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: true
      })
      that.updateTime()
    }, function (res) {
      that.setData({
        time: '获取验证码',
        currentTime: 61,
        disabled: false
      })
    }, function (res) {
      that.toastHide()
      if (res.statusCode != 200){
        that.setData({
          time: '获取验证码',
          currentTime: 61,
          disabled: false
        })
      }
    })
  },
  updateTime: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime + '秒'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '重新发送',
          currentTime: 61,
          disabled: false
        })
      }
    }, 1000)
  },
  getVerificationCode() {
    var that = this
    if (!that.data.disabled){
      that.getMessageCode();
    }
    
  },
  /**
   * 获取当前用户是否设置了支付密码
  */
  getIsSetPayPasswordStatus:function(){
    this.toastShow()
    var that = this
    var url = app.data.HOST + 'wallet/passwordIsEmpty'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      if (res != null) {
        if (res == true) {  // 已设置过支付密码
          that.setData({ placeholderStr: '请输入您的新密码'})
          wx.setNavigationBarTitle({
            title: "修改支付密码"
          })
        } else {            // 未设置过支付密码
          that.setData({ placeholderStr: '请输入6位数字密码用于手机支付'})
          wx.setNavigationBarTitle({
            title: "设置支付密码"
          })
        }
      }
    }, function (res) {
    }, function (res) {
      that.toastHide()
    })
  },
  /**
   * 提交，设置/修改支付密码
  */
  submit:function(){
    console.log(this.data.msgCodeInput)
    var that = this
    if (that.data.payPasswordInput == "" || that.data.payPasswordInput == undefined || that.data.payPasswordInput == null){
      wx.showToast({
        title: '请输入您的支付密码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.confirmPayPasswordInput == "" || that.data.confirmPayPasswordInput == undefined || that.data.confirmPayPasswordInput == null) {
      wx.showToast({
        title: '请再次输入您的支付密码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.msgCodeInput == "" || that.data.msgCodeInput == undefined || that.data.msgCodeInput == null) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.payPasswordInput != that.data.confirmPayPasswordInput) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.msgCodeInput.length != 6 || that.data.confirmPayPasswordInput.length != 6) {
      wx.showToast({
        title: '请输入6位数的支付密码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.updatePayPassword()
  },
  /**
   * 更新支付密码
  */
  updatePayPassword:function(){
    var that = this
    let md5Psw = md5.hex_md5(that.data.confirmPayPasswordInput);
    var url = app.data.HOST + 'wallet/updatePassword?password=' + md5Psw + '&msgCode=' + that.data.msgCodeInput
    // var params = { "password": md5Psw, "msgCode": that.data.msgCodeInput}
    var params = {}
    app.request.requestPostApi(url, params, that, function (res) {
      if (that.data.hasSetPayPassword){
        wx.showToast({
          title: '密码修改成功',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 1000)
      }else{
        wx.showToast({
          title: '密码设置成功',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 1000)
      }
    }, function (res) {
    }, function (res) {
    })
  }
})