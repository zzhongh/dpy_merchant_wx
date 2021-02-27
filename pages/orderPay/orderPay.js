// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')
var MD5 = require('../../utils/MD5.js')
var CryptoJS = require('../../utils/aes_base64/public.js')
var baseUtils = require('../../utils/baseUtils.js')

//倒计时对象
var mCountDownTimer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payablePrice:0.00,
    transportPrice:0.00,
    orderPrice:0.00,
    payMethodList:[],
    orderNo:'',
    //剩余支付时间
    remainingTime:'',
    yuePayIsShow: false,
    codPayIsShow: false,
    wxpayIsShow: false,
    //选择的支付方式
    selectedPaymethod:'',
    //支付的有效时间
    paymentValidMinutes:0,
    //下单时间
    orderTime:0,
    toastStatus:false,
    //是否是从设置支付密码界面返回的
    isResetPayPasswordBack:false,
    //是否开启了免密支付
    isOpenedFreePassword:false,
    //是否选中了开启免密支付
    isSelectedFreePassword:false,
    //密码输入框的长度等于这个数组的长度
    passwordLength:[1,2,3,4,5,6],
    //密码输入框是否获取焦点
    focus:true,
    //支付密码
    password:'',
    //是否显示密码输入modal
    flag:false,
    //是否显示选择微信支付时弹出的提示框
    isShowWxModal:false,
    //是否需要主动跳转到订单列表，这里主要是为了如果是从订单列表界面进来的，就不需要跳了
    isShouldGoToOrderList:true,
    isShowLogoutModal: false,
  },
  /**
   * 获取个人中心信息
   */
  getRelatedData: function () {
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        if (res.merchant.wxOpenId != "1") {  //微信已解绑，重新登录
          // wx.setStorageSync('userToken', '')
          // wx.setStorageSync('isLogin', false)
          // wx.setStorageSync('localProductInfo', [])
          // wx.setStorageSync('localCollect', [])
          // wx.removeTabBarBadge({
          //   index: 2,
          // })
          that.goToLogin()
          return
        }
      }
    }, function (res) {

    }, function (res) {

    })
  },

  /**
   * 重新登录
  */
  goToLogin: function () {
    this.setData({ isShowLogoutModal: true })

  },
  /**
   * 点击model的取消按钮
   */
  logoutModalCancel: function () {
    this.setData({ isShowLogoutModal: false })

  },
  /**
   * 点击model的确定按钮
   */
  logoutModalConfirm: function () {
    this.setData({ isShowLogoutModal: false })
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    this.setData({
      payablePrice: options.payablePrice, orderTime: options.orderTime, orderNo: options.orderNo, isShouldGoToOrderList: options.isGoOrderList,
      transportPrice: options.transportPrice, orderPrice: options.orderPrice, payMethodList: options.payMethodList})
    

    // if (!options.orderNo){
    //   //没有传orderNO说明从待确认订单界面过来
    //   this.createOrder()
    // } else if (options.orderTime){
    //   //上个界面传了OrderNo说明已经生成过订单了,并且又下单时间
    //   this.setData({ orderNo: options.orderNo, orderTime: options.orderTime})
    // }
    //获取可选支付方式
    this.getAvalablePayMethod(options.orderNo)
    //初始化倒计时
    this.initCountDown()
    //获取新的购物车列表
    this.getShoppingCartProducts()
  },
  
  /**
   * 获取可选的支付方式
   */
  getAvalablePayMethod:function(orderNo){
    var that = this
    var url = app.data.HOST + 'orderPayMethods'
    var header = { 'Authorization': app.data.token }
    var params = { 'orderNo':orderNo}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'GET', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var payMethodList = res.data.content
          var yuePayIsShow = false
          var codPayIsShow = false
          var wxpayIsShow = false
          for(var i=0;i<payMethodList.length;i++){
            switch (payMethodList[i]) {
              case 'yue':
                yuePayIsShow = true
                break
              case 'cod':
                codPayIsShow = true
                break
              case 'weixin':
                wxpayIsShow = true
                break
            }
          }
          that.setData({ yuePayIsShow: yuePayIsShow, codPayIsShow: codPayIsShow,wxpayIsShow: wxpayIsShow})
        } else {
          if (res && res.data && res.data.message) {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 初始化倒计时
   */
  initCountDown:function(){
    var that = this
    wx.getStorage({
      key: 'configList',
      success: function(res) {
        var config = res.data
        for(var i=0;i<config.length;i++){
          if ('PAYMENT_VALID_MINUTES' == config[i].key){
            that.setData({ paymentValidMinutes: config[i].value})
            that.startCountDown()
          }
        }
      },
    })
  },
  /**
   * 开始倒计时
   */
  startCountDown:function(){
    var expireTime = this.data.paymentValidMinutes * 60 * 1000 + this.data.orderTime * 1
    this.count_down(expireTime)
  },
  /**
   * 点击选择支付方式
   */
  payMethodClick:function(e){
    var payMethod = e.currentTarget.dataset.hi
    this.setData({ selectedPaymethod : payMethod})

  },
  /**
   * 点击确认支付
   */
  pay:function(){
    
    var paymethod = this.data.selectedPaymethod
    if(!paymethod){
      wx.showToast({
        icon:'none',
        title: '请选择支付方式',
      })
      return
    }
    var that = this
    var url = app.data.HOST + 'merchant/relatedData'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        if (res.merchant.wxOpenId != "1") {  //微信已解绑，重新登录
          wx.setStorageSync('userToken', '')
          wx.setStorageSync('isLogin', false)
          wx.setStorageSync('localProductInfo', [])
          wx.setStorageSync('localCollect', [])
          wx.removeTabBarBadge({
            index: 2,
          })
          that.goToLogin()
          return
        }else{
          //停止倒计时,这里暂停倒计时，是为了防止在设置支付密码界面时，倒计时结束自动跳转到购物车界面，找不到购物车界面报错
          if (mCountDownTimer) {
            clearTimeout(mCountDownTimer)
          }
          switch (paymethod) {
            case 'yue':
              that.getPasswordIsEmpty()
              break
            case 'cod':
              that.codPay()
              break
            case 'weixin':
              that.weixinPay()
              that.setData({ isShowWxModal: true })
              break
          }
        }
      }
    }, function (res) {

    }, function (res) {
      if (res.statusCode != 200){
        //停止倒计时,这里暂停倒计时，是为了防止在设置支付密码界面时，倒计时结束自动跳转到购物车界面，找不到购物车界面报错
        if (mCountDownTimer) {
          clearTimeout(mCountDownTimer)
        }
        switch (paymethod) {
          case 'yue':
            that.getPasswordIsEmpty()
            break
          case 'cod':
            that.codPay()
            break
          case 'weixin':
            that.weixinPay()
            that.setData({ isShowWxModal: true })
            break
        }
      }
    })
    
  },
  /**
   * 余额支付
   */
  yuePay:function(){
    //判断密码
    var password = this.data.password
    if (password){
      if (password.length != 6){
        wx.showToast({
          icon: 'none',
          title: '请输入6位支付密码',
        })
        return
      }
      //加密密码
      var passwordByMd5 = MD5.hex_md5(password)
      //获取当前日期
      var timestamp = new Date().getTime()
      var dateStr = baseUtils.timestampFormat(timestamp, 'YMDhms')
      var walletPassword = {
        'password': passwordByMd5,
        'timestamp': dateStr
      }
      var dataStr = JSON.stringify(walletPassword)
      var secureData = CryptoJS.AES_Encrypt(dataStr)
      //发送支付请求
      var that = this
      var url = app.data.HOST + 'orders/' + this.data.orderNo + '/yuePay'
      var header = { 'Authorization': app.data.token }
      var params = { 'secure': secureData}
      that.toastShow()
      HttpRequst.HttpRequst(url,'POST',params,
        function(res){
          that.toastHide()
          //清空密码输入框
          that.setData({password: '' })
          if(res && res.data && res.data.code == 100){ 
            //隐藏密码输入框
            that.setData({ flag: false, password:''})
            if (that.data.isSelectedFreePassword){
              //如果选中了开启免密支付，就发送开启免密支付的请求
              that.openFreePayPassword(secureData)
            }
            
            //跳转支付成功界面
            wx.redirectTo({
              url: '../orderPaySuccess/orderPaySuccess?price=' + that.data.payablePrice + '&payMethod=yue'
                + '&isShouldGoToOrderList=' + that.data.isShouldGoToOrderList,
            })
          }else{
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
    }else{
      wx.showToast({
        icon:'none',
        title: '请输入支付密码',
      })
    }
    
  },
  /**
   * 货到付款
   */
  codPay: function () {
    var that = this
    var url = app.data.HOST + 'orders/' + this.data.orderNo + '/codPay'
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'POST',params,
      function(res){
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          //跳转支付成功界面
          wx.redirectTo({
            url: '../orderPaySuccess/orderPaySuccess?price=' + that.data.payablePrice + '&payMethod=cod'
              + '&isShouldGoToOrderList=' + that.data.isShouldGoToOrderList,
          })
        } else {
          if (res && res.data && res.data.code == 94){
            that.deleteOrderByCountDownOver()
          }else{
            that.startCountDown()
          }
          

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
  /**
   * 微信支付
   */
  weixinPay: function () {
    this.payOrderFromWeixin()
  },
  /**
   * 获取微信支付签名信息
  */
  payOrderFromWeixin: function () {
    var that = this
    that.toastShow()
    var url = app.data.HOST + 'orders/' + that.data.orderNo + '/wxPay/miniProgram'
    var params = {}
    app.request.requestPostApi(url, params, that, function (signInfo) {
      that.toastHide()
      if (signInfo != null) {
        wx.requestPayment(
          {
            'nonceStr': signInfo.nonceStr,
            'package': signInfo.package,
            'paySign': signInfo.paySign,
            'signType': 'MD5',
            'timeStamp': signInfo.timeStamp,
            'success': function (res) {
              //跳转支付成功界面
              wx.redirectTo({
                url: '../orderPaySuccess/orderPaySuccess?price=' + that.data.payablePrice + '&payMethod=weixin'
                  + '&isShouldGoToOrderList=' + that.data.isShouldGoToOrderList,
              })
            },
            'fail': function (errorRes) {
              that.toastHide()
              if (errorRes.errMsg.indexOf("cancel") != -1) {
                wx.showToast({
                  title: '支付已取消',
                  icon: 'none',
                  duration: 2000
                })
                return
              }
              wx.showToast({
                title: errorRes.errMsg,
                icon: 'none',
                duration: 2000
              })
            },
            'complete': function (res) {
              that.toastHide()
            }
          })
      }
    }, function (res) {
    }, function (res) {
      if(res && res.data && res.data.code != 100){
        if(res.data.code == 94){
          that.deleteOrderByCountDownOver()
        }else{
          if (that.data.isShouldGoToOrderList == 'true'){
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }else{
            wx.navigateBack()
          }
         
        }
      }
    })
  },
  /**
   * 判断是否设置了支付密码
   */
  getPasswordIsEmpty:function(){
    var that = this
    var url = app.data.HOST + 'wallet/passwordIsEmpty'
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          
          if(res.data.content){
            //设置了支付密码
            that.payPasswordIsRequired()
          }
          if ( !res.data.content) {
            //未设置支付密码
            that.showModal('为了您的支付安全，请先设置支付密码')
          }

        }else{
          if (res && res.data && res.data.message){
            wx.showToast({
              icon:'none',
              title: res.data.message,
            })
          }
        }
      },
      function(res){
        that.toastHide()
      })
  },
  //判断是否免密支付
  payPasswordIsRequired:function(){
    var that = this
    var url = app.data.HOST + 'isPayPasswordRequired/' + that.data.orderNo
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'GET', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          //开启了免密支付，并且符合免密支付的条件
          that.setData({ isOpenedFreePassword:true})
          that.freePasswordPay()
        } else if (res && res.data && res.data.code == 99) {
          //未开启免密支付
          //显示密码输入框
          that.setData({ isOpenedFreePassword: false, flag: true })
        } else if (res && res.data && res.data.code == 98){
          //开启了免密支付，但是不符合免密支付的条件
          //显示密码输入框
          that.setData({ isOpenedFreePassword: true, flag: true })
        }else {
          if (res && res.data && res.data.message) {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 免密支付
   */
  freePasswordPay:function(){
    var that = this
    var url = app.data.HOST + 'orders/' + this.data.orderNo + '/yuePayFreePassword'
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          //跳转支付成功界面
          wx.redirectTo({
            url: '../orderPaySuccess/orderPaySuccess?price=' + that.data.payablePrice + '&payMethod=yue_free' 
              + '&isShouldGoToOrderList=' + that.data.isShouldGoToOrderList,
          })
        } else {
          if (res && res.data && res.data.code == 94) {
            that.deleteOrderByCountDownOver()
          } else {
            that.startCountDown()
            // if (that.data.isShouldGoToOrderList == 'true') {
            //   wx.redirectTo({
            //     url: '../orderList/orderList',
            //   })
            // } else {
            //   wx.navigateBack()
            // }
          }

          if (res && res.data && res.data.message) {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 发送开启免密支付请求
   */
  openFreePayPassword: function (secureData){
    var that = this
    var url = app.data.HOST + 'wallet/freePassword/enable?password=' + encodeURIComponent(secureData)
    var header = { 'Authorization': app.data.token }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'POST',params,
      function(res){
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          wx.showToast({
            icon: 'none',
            title: '免密支付开启成功',
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
      function(res){
        that.toastHide()
      })
  },
  /**
   * 输入支付密码
   */
  payPasswordInput:function(e){
    var password = e.detail.value
    this.setData({ password: password})
    if (password && password.length == 6){
      //当输满六位时执行支付
      this.yuePay()
    }
  },
  /**
   * 密码输入框被点击
   */
  payPasswordInputClick:function(){
    this.setData({ focus: true })
  },
  /**
   * 跳转重置支付密码界面
   */
  toResetPassword:function(){
    //停止倒计时,这里暂停倒计时，是为了防止在设置支付密码界面时，倒计时结束自动跳转到购物车界面，找不到购物车界面报错
    // if (mCountDownTimer) {
    //   clearTimeout(mCountDownTimer)
    // }
    //跳转到设置支付密码界面
    wx.navigateTo({
      url: '../personalCenter/resetPayPassword/resetPayPassword',
    })
  },
  /**
   * 开启免密支付被点击
   */
  freePasswordClick:function(){
    var isSelectedFreePassword = this.data.isSelectedFreePassword
    this.setData({ isSelectedFreePassword: !isSelectedFreePassword})
  },

  /**
  * 获取购物车商品列表
  */
  getShoppingCartProducts: function () {
    var that = this
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    var header = {
      'Authorization': app.data.token,
      'Content-Type': 'application/json'
    }
    that.toastShow()
    HttpRequst.HttpRequst(url, 'GET', params, function (res) {
      that.toastHide()
      if (res && res.data && res.data.code == 100) {
        var localProductInfo = []
        var products = res.data.content
        for (var i = 0; i < products.length; i++) {
          localProductInfo.push({ 'shoppingCartId': products[i].id, 'quantity': products[i].quantity, 'activityCode': products[i].activityCode, 'specificationId': products[i].specificationId, 'specificationPrice': products[i].specificationPrice })
        }
        
        wx.setStorage({
          key: "localProductInfo",
          data: localProductInfo
        })
        //
        var total = that.getShoppingCartTotalNum(localProductInfo)
        wx.setStorage({
          key: "totalShoppinCartCount",
          data: total
        })
        wx.setTabBarBadge({
          index: 2,
          text: total.toString()
        })
      }
    }, function (res) {
      that.toastHide()
    })
  },

  /**
   * 根据本地购物车商品列表计算总数量
   */
  getShoppingCartTotalNum(shoppingCartProducts) {
    var num = 0
    if (shoppingCartProducts) {
      for (var i = 0; i < shoppingCartProducts.length; i++) {
        num = num + shoppingCartProducts[i].quantity
      }
    }
    return num
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
   * 弹出模态框
   */
  showModal:function(text){
    var that = this
    wx.showModal({
      title: '提示',
      content: text,
      success: function (res) {
        if (res.confirm) {
          //停止倒计时,这里暂停倒计时，是为了防止在设置支付密码界面时，倒计时结束自动跳转到购物车界面，找不到购物车界面报错
          // if (mCountDownTimer){
          //   clearTimeout(mCountDownTimer)
          // }
          //跳转到设置支付密码界面
          wx.navigateTo({
            url: '../personalCenter/resetPayPassword/resetPayPassword',
          })
          
        } else if (res.cancel) {
          that.startCountDown()
        }
      }
    })
  },
  deleteOrderByCountDownOver:function(){
    var that = this
    var url = app.data.HOST + 'orders/' + that.data.orderNo +'/cancelTimeoutUnpaidOrder'
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'POST',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          wx.showToast({
            title: '支付超时，订单已取消',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 1000)
          that.setData({
            remainingTime: "订单已取消"
          });
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
  /* 毫秒级倒计时 expireMs是结束日期的毫秒值*/
  count_down: function (expireMs) {
    var that = this
    // //2016-12-27 12:47:08 转换日期格式
    // var a = that.data.expireTime.split(/[^0-9]/);
    // //截止日期：日期转毫秒
    // var expireMs = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
    //倒计时毫秒
    var duringMs = expireMs - (new Date()).getTime();
    // 渲染倒计时时钟
    that.setData({
      remainingTime: that.date_format(duringMs)
    });

    if (duringMs <= 0) {
      that.setData({
        remainingTime: "订单已取消"
      });
      that.deleteOrderByCountDownOver()
    
      // timeout则跳出递归
      return;
    }
    mCountDownTimer = setTimeout(function () {
      // 放在最后--
      duringMs -= 200;
      that.count_down(expireMs);
    }, 200)
    //that.setData({ countDownTimer: countDownTimer})
  },
  /* 格式化倒计时 */
  date_format: function (micro_second) {
    var that = this
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = that.fill_zero_prefix( Math.floor(second / 3600));
    // 分钟位
    var min = that.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
    // 秒位
    var sec = that.fill_zero_prefix(second % 60);// equal to => var sec = second % 60;
    return min + ":" + sec + " ";
  },

  /* 分秒位数补0 */
  fill_zero_prefix: function (num) {
    return num < 10 ? "0" + num : num
  },

  /**
   * 点击model的取消按钮
   */
  modalCancel: function () {
    this.setData({isShowWxModal: false })
    if (this.data.isShouldGoToOrderList == 'true') {
      wx.redirectTo({
        url: '../orderList/orderList',
      })
    } else {
      wx.navigateBack()
    }
  },
  /**
   * 点击model的确定按钮
   */
  modalConfirm: function () {
    this.setData({ isShowWxModal: false })
    if (this.data.isShouldGoToOrderList == 'true') {
      wx.redirectTo({
        url: '../orderList/orderList',
      })
    } else {
      wx.navigateBack()
    }
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
  
    //判断是否是从设置支付密码界面返回的
    if (this.data.isResetPayPasswordBack){
      this.setData({ isResetPayPasswordBack:false})
      if (!this.data.flag){
        //当从设置支付界面返回，并且密码输入框不显示的时候从新开始计时
        this.startCountDown()
      }
      
    }
  },

  /**
   * 点击什么是免密支付
   */
  whatIsFreePassword:function(){
    var that = this
    wx.getStorage({
      key: 'configList',
      success: function (res) {
        var config = res.data
        for (var i = 0; i < config.length; i++) {
          if ('FREE_PASS_EXPLAIN_URL' == config[i].key) {
            var url = config[i].value
            if(url){
              wx.navigateTo({
                url: '../common/webView?url=' + url,
              })
            }
            
          }
        }
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
    if (mCountDownTimer) {
      clearTimeout(mCountDownTimer)
    }

    var pages = getCurrentPages()
    var prePage = pages[pages.length - 2]
    var isBackFromOrderPay = prePage.data.isBackFromOrderPay
    if (isBackFromOrderPay || isBackFromOrderPay == false){
      prePage.setData({ isBackFromOrderPay: true})
    }
  },
  /**
   * 关闭密码输入框
  */
  closePasswordInputModal:function(){
    this.setData({ flag: false, password:''})
    this.startCountDown()
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