// pages/personalCenter/resetPayPassword/resetPayPassword.js
let md5 = require("../../utils/MD5.js");
const app = getApp()
var toastStatus = true;
var interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    telephone: '',
    date: '请选择日期',
    fun_id: 2,
    time: '获取验证码', //倒计时 
    currentTime: 61,
    disabled: false,
    toastStatus: toastStatus,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ headImgURL: options.headImgURL, nickName: options.nickName, openid: options.openid})
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
    if (prePage.data.isResetPayPasswordBack || prePage.data.isResetPayPasswordBack == false) {
      //如果上一个界面有isResetPayPasswordBack这个数据
      prePage.setData({ isResetPayPasswordBack: true })
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
   * 手机号输入框
  */
  telephoneInput: function (e) {
    this.setData({ telephoneInput: e.detail.value })
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
  getMessageCode: function () {
    if (this.data.telephoneInput == "" || this.data.telephoneInput == null || this.data.telephoneInput == undefined){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.telephoneInput.length != 11) {
      wx.showToast({
        title: '请输入11位手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.toastShow()
    var that = this
    var url = app.data.HOST + 'merchant/bindWeChatMsgCode'
    var params = { "telephone": that.data.telephoneInput}
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      wx.showToast({
        title: '验证码已发送至' + that.data.telephoneInput + '请注意查收',
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
      if (res.statusCode != 200) {
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
    if (!that.data.disabled) {
      that.getMessageCode();
    }

  },
  /**
   * 提交，设置/修改支付密码
  */
  submit: function () {
    var that = this
    if (that.data.telephoneInput == "" || that.data.telephoneInput == undefined || that.data.telephoneInput == null) {
      wx.showToast({
        title: '请输入您的手机号',
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
    that.bindWeChatMsgCodeAndLogin()
  },
  /**
   * 绑定手机号并登陆  merchant/bindWeChat
  */
  /**
   *  param["openId"] = openid
      param["nickName"] = UserDefaults.standard.string(forKey: "wechatNickname")
      param["headImgURL"] = UserDefaults.standard.string(forKey: "headimgurl")
      param["telephone"] = phone.text!
      param["msgCode"] = messageCode.text!
      param["currentCityId"] = UserDefaults.standard.string(forKey: "selectedCityId")
      this.setData({ headImgURL: options.headImgURL, nickName: options.nickName, openid: options.openid})
  */
  bindWeChatMsgCodeAndLogin:function(){
    var that = this
    wx.getStorage({
      key: 'cityId',
      success: function (resData) {
        that.toastShow()
        var url = app.data.HOST + 'merchant/bindWeChat'
        var params = {
          "openId": that.data.openid,
          "currentCityId": resData.data,
          "headImgURL": that.data.headImgURL,
          "nickName": that.data.nickName,
          "telephone": that.data.telephoneInput,
          "msgCode": that.data.msgCodeInput
        }
        app.request.requestGetApi(url, params, that, function (res) {
          that.toastHide()
          console.log(res)
          if(res != null){   //绑定成功并登陆，跳转到首页
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
          console.log(res)
        }, function (res) {
          console.log(res)
          that.toastHide()
        })
      },
      fail: function (res) {

      }
    })
  },
})