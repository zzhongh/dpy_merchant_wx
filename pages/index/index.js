//index.js
//获取应用实例
const app = getApp()
var HttpRequst = require('../../utils/request.js')
var baseUtils = require('../../utils/baseUtils.js')
var toastStatus = true;
var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
var winHei = wx.getSystemInfoSync().windowHeight; //获取当前屏幕的宽度
var touchDot = 0;//触摸时的原点
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = "";// 记录/清理时间记录
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    open: false,
    indicatorDots: true,//是否显示面板指示点
    autoplay: true,//是否开启自动切换
    interval: 3000,//自动切换时间间隔
    duration: 500,//滑动动画时长
    Height: "",
    toastStatus: toastStatus,
    unreadCountIsShow:false,
    swiperH : winWid * 480 / 1080 + "px",
    //商品图片右边宽度
    productImgRightWidth: (winWid - 3*10 - 80) + 'px',
    modal:[
      {
        id:1,
        name:'我的收藏',
        isSelected:true,
      },
      // {
      //   id:2,
      //   name:'为您推荐',
      //   isSelected:true,
      // }
    ],
    //modal中当前显示的商品列表
    productList:[],
    //收藏商品列表
    localCollect:[],
    //购物车商品列表
    localShoppingCartProducts:[],
    //为您推荐商品列表
    recommendProducts:[],
    isShowPrice:true,
    //是否显示编辑数量的弹窗
    showQuantityModal: false,
    //正在编辑数量的商品信息
    selecteEditProductInfo: {},
    isLogin:false,
    //是否显示广告图片
    hideADImage: true,
    isShowSwiper:true,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
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
   * 获取个人中心信息
   */
  getRelatedData: function () {
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
        }
      }
    }, function (res) {

    }, function (res) {

    })
  },
  /**
   * 获取弹出广告
  */
  getPopAdBanner:function(){
    var that = this
    var url = app.data.HOST + 'banner/getBanner'
    var params = { 'cityId': wx.getStorageSync('cityId'), 'showLocation':'APP_POP'}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ 
          ADImageUrl: res.imageUrl,
          ADDetailUrl: res.detailUrl,
          ADWidth: winWid * 0.8 + "px", 
          ADHeight: (winWid * 0.8) * res.height / res.width + "px",
          ADMarginLeft: (winWid - winWid * 0.8) / 2 + "px",
          ADMarginTop: (winHei - ((winWid * 0.8) * res.height / res.width)) / 2 + "px",
          CloseADIconMarginLeft: (winWid-20)/2 + "px",
          hideADImage:false
        })
      }
    }, function (res) {

    }, function (res) {

    })
  },
  /**
   * 关闭广告 
  */
  closeADModal:function(){
    this.setData({
      hideADImage:true
    })
    wx.setStorageSync('saveDateStr', this.getNowFormatDate())
  },
  /**
   * 获取当前日期
  */
  getNowFormatDate:function() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if(month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
},
  onLoad: function () {
    // 没有存储过城市跳转到选择城市
    wx.getStorage({
      key: 'haveSaveCityId',
      success: function (res) {
        if (res.data == true) {
          
        } else {
          wx.redirectTo({
            url: '../chooseCity/chooseCity'
          })
        }
      },
      fail: function (res) {
        wx.setStorageSync('haveSaveCityId', false)
        wx.redirectTo({
          url: '../chooseCity/chooseCity'
        })
      }
    })
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow:function(e){
    this.getConfigList()
    this.getIndexBaseData()
    this.setData({ isLogin: wx.getStorageSync('isLogin')})
    var that = this
    //获取基本数据 
    wx.getStorage({
      key: 'haveSaveCityId',
      success: function (res) {
        if (res.data == true) {
          wx.getStorage({
            key: 'saveDateStr',
            success: function (saveDate) {
              if (that.getNowFormatDate() != saveDate.data) {
                that.getPopAdBanner()
              } else {

              }
            },
          })
        } else {
          
        }
      },
    })
    that.setIsShowPrice()
    //获取收藏
    if (wx.getStorageSync('isLogin')) {
      that.getRelatedData()
      that.getShoppingCartProducts()
      
      that.getMessageList()
      that.getMerchantCollect()
    }else{
      that.setData({ productList:[]})
      wx.setStorage({
        key: "localProductInfo",
        data: []
      })
      wx.setStorage({
        key: "totalShoppinCartCount",
        data: 0
      })
      wx.removeTabBarBadge({
        index: 2,
      })
      that.setData({ unreadCountIsShow: false })
    }
    // 获取商品推荐
    //that.getRecommendProducts()
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 获取基本数据，首页轮播及分类
  getIndexBaseData:function(){
    var that = this
    that.setData({
      bannerInfo: [],
    })
    that.toastShow()
    var url = app.data.HOST + 'indexBaseData'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      if (res != null) {
        that.setData({ isShowSwiper: false })
        that.setData({
          isShowSwiper: true,
          indexBaseData:res,
          bannerInfo: res.banners,
          currentCityName: res.cityName,
          categoryInfo: res.rootCategories,
          rows: Math.ceil(res.rootCategories.length / 5),
          bannerInfo: res.banners,
        })
        // console.log("轮播图")
        // console.log(that.data.bannerInfo)
        // console.log(that.data.bannerInfo.length)
      }
    }, function (res) {
      that.toastHide()
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    }, function (res) {
      that.toastHide()
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    })
  },
  // 获取图片宽高
  imgHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height;//图片高度
    var imgw = e.detail.width;//图片宽度
    // var swiperH = winWid * 480 / 1080 + "px"
    var categorySwiperH = (winWid/5) * imgh / imgw + "px"
    this.setData({
      // swiperH: swiperH,//设置高度
      categoryHeight: categorySwiperH
    })
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    this.setData({ currentTab: e.detail.current });
  },
  /**
   * 获取环境变量列表
   */
  getConfigList: function () {
    //初始化一下
    wx.setStorage({
      key: "configList",
      data: []
    })
    var url = app.data.HOST + 'config/list'
    var params = {}
    app.request.requestGetApi(url, params, this, function (res) {
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
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    let that = this
    
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getIndexBaseData()
    if(wx.getStorageSync('isLogin')){
      that.getMerchantCollect()
      // 获取商品推荐
      // that.getRecommendProducts()
    }
  },
  /**
   * 获取用户收藏商品列表
   */
  getMerchantCollect:function(){
    var that = this
    var url = app.data.HOST + 'collectionProduct'
    var header = { 'Authorization': app.data.token}
    var params = {'cityId':wx.getStorageSync('cityId')}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          var data = res.data.content
          for (var i = 0;i<data.length;i++){
            
            data[i].isShowSpecification = false
            var specificationList = data[i].productSpecificationList
            data[i].productSpecificationList = that.findInShoppingCartProducts(that.data.localShoppingCartProducts, specificationList)
            for (var j = 0; j < data[i].productSpecificationList.length; j++){
              data[i].productSpecificationList[j].price = data[i].productSpecificationList[j].price.toFixed(2)
            }
            var priceStr = baseUtils.getMinMaxPrice(data[i].productSpecificationList)
            data[i].priceStr = priceStr
          }
          
          wx.setStorage({
            key: 'localCollect',
            data: data,
          })
          
          that.setData({ localCollect: data})
          //显示收藏或者推荐列表
          that.showSelectedModal()
        }
      },
      function(res){
        that.toastHide()
      })
  },
  /**
   * 获取购物车商品列表
   */
  getShoppingCartProducts: function () {
    var that = this
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        var localProductInfo = []
        var totalShoppinCartCount = 0
        for (var i = 0; i < res.length; i++) {
          localProductInfo.push({ 'shoppingCartId': res[i].id, 'quantity': res[i].quantity, 'activityCode': res[i].activityCode, 'specificationId': res[i].specificationId, 'specificationPrice': res[i].specificationPrice })
          totalShoppinCartCount += res[i].quantity
        }
        that.setData({ localShoppingCartProducts:localProductInfo})
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
      } else {
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
      if (res.statusCode != 200) {
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
  /**
   * 获取推荐商品列表
   */
  getRecommendProducts:function(){
    var that = this
    var url = app.data.HOST + 'recommend/listRecommendProduct'
    var params = { 'cityId': wx.getStorageSync('cityId'),'recommendAmount':10}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          var data = res.data.content
          for(var i=0;i<data.length;i++){
            var priceStr = baseUtils.getMinMaxPrice(data[i].productSpecificationList)
            data[i].priceStr = priceStr
            data[i].isShowSpecification = false
            var specificationList = data[i].productSpecificationList
            data[i].productSpecificationList = that.findInShoppingCartProducts(that.data.localShoppingCartProducts, specificationList)
          }
          that.setData({ recommendProducts:data})
          //显示收藏或者推荐列表
          that.showSelectedModal()
        }else{
          if(res && res.data && res.data.message){
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
  /**
   * 跳转到分类
  */
  goToCategory:function(e){
    console.log(e.currentTarget.dataset.item)
    app.globalData.currentSelectedIndex = e.currentTarget.dataset.index + 2;
    app.globalData.currentSelectedId = e.currentTarget.dataset.item.id;
    wx.switchTab({
      url: "../category/category"
    });
  },
  /**
   * 选择城市
  */
  goToSelectCity:function(){
    var that = this
    wx.navigateTo({
      url: '../chooseCity/chooseCity?source=index',
    })
  },
  /**
   * 去搜索
  */
  goToSearch:function(){
    wx.navigateTo({
      url: '../productSearch/productSearch',
    })
  },
  /**
   * 获取消息列表
  */
  getMessageList: function () {
    var that = this
    var url = app.data.HOST + 'message/messageCenter'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].unread > 0) {
            that.setData({ unreadCountIsShow: true })
            break
          }
        }
      }
    }, function (res) {
    }, function (res) {
    })
  },
  test:function(){
    // wx.navigateTo({
    //   url: "../useableRedPacketList/useableRedPacketList"
    // });
  },
  /**
   * 跳转 webview
  */
  goToWebView:function(e){
    console.log(e.currentTarget.dataset.url)
    var that = this
    if (e.currentTarget.dataset.url != null && e.currentTarget.dataset.url != ''){
      wx.navigateTo({
        url: '../common/webView?url=' + e.currentTarget.dataset.url,
      })
      if (that.data.hideADImage == false){
        that.setData({
          hideADImage: true
        })
        wx.setStorageSync('saveDateStr', that.getNowFormatDate())
      }
    }
  },
  //设置是否显示价格
  setIsShowPrice: function () {
    if (wx.getStorageSync('isLogin')) {
      this.setData({ isShowPrice: true })
    } else {
      var that = this
      wx.getStorage({
        key: 'configList',
        success: function (res) {
          var configList = res.data
          for (var i = 0; i < configList.length; i++) {
            if (configList[i].key == 'SHOW_PRICE_AFTER_LOGIN') {
              if (configList[i].value == '1') {
                that.setData({ isShowPrice: false })
              } else {
                true
                that.setData({ isShowPrice: true })
              }
            }
          }
        },
        fail: function () {
          that.setData({ isShowPrice: false })
        }
      })
    }
  },
  modalClick:function(e){
    var index = e.currentTarget.dataset.index
    console.log(index)
    var modal = this.data.modal
    for(var i=0;i<modal.length;i++){
      modal[i].isSelected = false
      if(i == index){
        modal[i].isSelected = true
      }
    }
    this.setData({modal:modal})
    this.showSelectedModal()
    
  },
  showSelectedModal:function(){
    var modal = this.data.modal
    var item 
    for(var i=0;i<modal.length;i++){
      if(modal[i].isSelected){
        item = modal[i]
      }
    }
    var id = item.id
    switch (id) {
      case 1:
        //我的收藏
        var data = this.data.localCollect
        this.setData({ productList: data })
        break
      case 2:
        //为您推荐
        var data = this.data.recommendProducts
        this.setData({ productList: data })
        break
    }
  },
  /**
   * 设置规格是否展开
   */
  setIsShowSpecification:function(e){
    var index = e.currentTarget.dataset.index
    var productList = this.data.productList
    productList[index].isShowSpecification = !productList[index].isShowSpecification
    this.setData({ productList: productList})
  },
  /**
   * 匹配购物车中的商品和列表中的商品
   */
  findInShoppingCartProducts: function (localShoppingCartProducts, productSpecificationList) {
    //遍历存储在本地已经加入购物车的商品列表
    for (var i = 0; i < productSpecificationList.length; i++) {
      productSpecificationList[i].hasInShoppingCart = false
      productSpecificationList[i].shoppingCartNum = 0
      if (localShoppingCartProducts && localShoppingCartProducts.length > 0 && productSpecificationList) {
        for (var j = 0; j < localShoppingCartProducts.length; j++) {
          var activityCode = localShoppingCartProducts[j].activityCode
          var specificationId = localShoppingCartProducts[j].specificationId
          var num = localShoppingCartProducts[j].quantity
          if (!activityCode && productSpecificationList[i].id == specificationId) {
            productSpecificationList[i].hasInShoppingCart = true
            productSpecificationList[i].shoppingCartNum = num
          }
        }
      }

    }

    return productSpecificationList
  },
  /**
   * 跳转到商品详情
   */
  gotoProductDetail: function (e) {
    var product = this.data.productList[e.currentTarget.dataset.index]
    var productData = JSON.stringify(product)
    wx: wx.navigateTo({
      url: '../productDetail/productDetail?data=' + productData,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 增加数量按钮被点击
   */
  addNum: function (e) {
    console.log(1)
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex

    if (num > 0) {
      num = num + 1
      console.log(2)
      this.addShoppingCart(id, num, productIndex, specificationIndex)
    } else {
      console.log(3)
      this.insertShoppingCart(id, 1, productIndex, specificationIndex)
    }
  },

  /**
   * 减少数量按钮被点击
   */
  subNum: function (e) {
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex

    if (num <= 1) {
      this.deleteShoppingCart(id, 0, productIndex, specificationIndex)
    } else {
      num = num - 1
      this.addShoppingCart(id, num, productIndex, specificationIndex)
    }
  },

  /**
   * 添加到购物车
   */
  insertShoppingCart: function (specificationId, num, productIndex, specificationIndex) {
    var that = this
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'specificationId': specificationId, 'quantity': num, 'activityCode': '' }
    var header = {
      'Authorization': app.data.token,
      'Content-Type': 'application/json'
    }
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var product
          //找到商品列表中对应的商品以及对应的规格
          var products = that.data.productList
          var product = products[productIndex]
          var productSpecificationList = product.productSpecificationList
          productSpecificationList[specificationIndex].shoppingCartNum = num
          productSpecificationList[specificationIndex].hasInShoppingCart = true
          // for (var i = 0; i < productSpecificationList.length;i++){
          //   if (specificationId == productSpecificationList[i].id){
          //     productSpecificationList[i].shoppingCartNum = num
          //     productSpecificationList[i].hasInShoppingCart = true
          //     break
          //   }
          // }
          product.productSpecificationList = productSpecificationList
          products[productIndex] = product

          that.setData({ productList: products })
          that.getShoppingCartProducts()
        } else {
          var message = ''
          if (res && res.data && res.data.message) {
            message = res.data.message
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 增加购物车里的数量
   */
  addShoppingCart: function (specificationId, num, productIndex, specificationIndex) {
    var localShoppingCartProducts = this.data.localShoppingCartProducts
    var shoppingCartId = -1
    console.log(4)
    for (var i = 0; i < localShoppingCartProducts.length; i++) {
      var shoppingCartProduct = localShoppingCartProducts[i]
      if (specificationId == shoppingCartProduct.specificationId) {
        shoppingCartId = shoppingCartProduct.shoppingCartId
        break
      }
    }
    if (shoppingCartId >= 0) {
      console.log(5)
      var that = this
      var url = app.data.HOST + 'shoppingCart/' + shoppingCartId + '?quantity=' + num + '&version=2.0.7+'
      var params = {}
      var header = {
        'Authorization': app.data.token
      }
      that.toastShow()
      HttpRequst.HttpRequst(url, 'POST', params,
        function (res) {
          that.toastHide()
          if (res && res.data && res.data.code == 100) {
            var resultNum = res.data.content
            if (resultNum != num) {
              wx.showToast({
                icon: 'none',
                title: '库存不足，库存剩余' + resultNum + '件',
              })
            } else {
              var products = that.data.productList
              var product = products[productIndex]
              var specification = product.productSpecificationList[specificationIndex]
              specification.shoppingCartNum = resultNum
              specification.hasInShoppingCart = true
              product.productSpecificationList[specificationIndex] = specification
              products[productIndex] = product

              var localShoppingCartList = that.data.localShoppingCartProducts
              for (var i = 0; i < localShoppingCartList.length; i++) {
                if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                  localShoppingCartList[i].quantity = resultNum
                }
              }
              that.setData({ productList: products, localShoppingCartProducts: localShoppingCartList })
              wx.setStorage({
                key: 'localProductInfo',
                data: localShoppingCartList,
              })
              var total = that.getShoppingCartTotalNum(localShoppingCartList)
              wx.setStorage({
                key: "totalShoppinCartCount",
                data: total
              })
              wx.setTabBarBadge({
                index: 2,
                text: total.toString()
              })
            }
          } else {
            var message = ''
            if (res && res.data && res.data.message) {
              message = res.data.message
              wx.showToast({
                icon: 'none',
                title: message,
              })
            }
          }
        },
        function (res) {
          that.toastHide()
        })
    }

  },
  /**
   * 从购物车中删除
   */
  deleteShoppingCart: function (specificationId, num, productIndex, specificationIndex) {
    var localShoppingCartProducts = this.data.localShoppingCartProducts
    var shoppingCartId = -1
    for (var i = 0; i < localShoppingCartProducts.length; i++) {
      var shoppingCartProduct = localShoppingCartProducts[i]
      if (specificationId == shoppingCartProduct.specificationId) {
        shoppingCartId = shoppingCartProduct.shoppingCartId
        break
      }
    }
    if (shoppingCartId >= 0) {
      var that = this
      var url = app.data.HOST + 'shoppingCart/' + shoppingCartId
      var params = {}
      var header = {
        'Authorization': app.data.token
      }
      that.toastShow()
      HttpRequst.HttpRequst(url, 'DELETE', params,
        function (res) {
          that.toastHide()
          if (res && res.data && res.data.code == 100) {
            var products = that.data.productList
            var product = products[productIndex]
            var specification = product.productSpecificationList[specificationIndex]
            specification.shoppingCartNum = 0
            specification.hasInShoppingCart = false
            product.productSpecificationList[specificationIndex] = specification
            products[productIndex] = product

            var localShoppingCartList = that.data.localShoppingCartProducts
            for (var i = 0; i < localShoppingCartList.length; i++) {
              if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                localShoppingCartList.splice(i, 1)
              }
            }

            that.setData({ productList: products, localShoppingCartProducts: localShoppingCartList })
            wx.setStorage({
              key: 'localProductInfo',
              data: localShoppingCartList,
            })
            var total = that.getShoppingCartTotalNum(localShoppingCartList)
            if (total == 0) {
              wx.removeTabBarBadge({
                index: 2,
              })
            } else {
              wx.setTabBarBadge({
                index: 2,
                text: total.toString()
              })
            }
          } else {
            var message = ''
            if (res && res.data && res.data.message) {
              message = res.data.message
              wx.showToast({
                icon: 'none',
                title: message,
              })
            }
          }
        },
        function (res) {
          that.toastHide()
        })
    }
  },
  /**
   * 点击显示已加入购物车数量的输入框
   */
  editNum: function (e) {
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex
    this.setData({ showQuantityModal: true })
    //获取当前的
    var productInfo = {
      productIndex: productIndex,
      specificationIndex: specificationIndex,
      specificationId: id,
      num: num
    }
    this.setData({ selecteEditProductInfo: productInfo })
  },
  /**
   * 编辑数量
   */
  editInput: function (e) {
    var num = e.detail.value
    var productInfo = this.data.selecteEditProductInfo
    productInfo.num = num
    this.setData({ selecteEditProductInfo: productInfo })
  },
  /**
   * 点击model的取消按钮
   */
  modalCancel: function () {
    this.setData({ selecteEditProductInfo: {}, showQuantityModal: false })
  },
  /**
   * 点击model的确定按钮
   */
  modalConfirm: function () {
    var productInfo = this.data.selecteEditProductInfo
    var num = productInfo.num
    var id = productInfo.specificationId
    var productIndex = productInfo.productIndex
    var specificationIndex = productInfo.specificationIndex
    if (!num) {
      wx.showToast({
        icon: 'none',
        title: '内容不能为空',
      })
      return
    }
    if ((num + '').indexOf('.') != -1) {
      wx.showToast({
        icon: 'none',
        title: '请输入正整数',
      })
      return
    }
    if (num == 0) {
      this.deleteShoppingCart(id, 0, productIndex, specificationIndex)
      this.setData({ selecteEditProductInfo: {}, showQuantityModal: false })
      return
    }
    if (!(/(^[1-9]\d*$)/.test(num))) {
      wx.showToast({
        icon: 'none',
        title: '请输入正整数',
      })
      return
    }
    this.addShoppingCart(id, num, productIndex, specificationIndex)
    this.setData({ selecteEditProductInfo: {}, showQuantityModal: false })
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
    if (num > 99) {
      num = '99+'
    }
    this.setData({ totalNum: num })
    return num
  },
  /**
   * 加入到货通知
   */
  insertSubscribeStock: function (e) {
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var products = this.data.productList
    var that = this
    var url = app.data.HOST + 'subscribeStockUser/save?productId=' + products[productIndex].id + '&specificationId=' + id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.message) {
          wx.showToast({
            icon: 'none',
            title: res.data.message,
            duration: 2000
          })
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  toLogin:function(res){
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },
  //控制回到顶部按钮的显示与消失
  scrollTopFun(e) {
    let that = this;
    that.top = e.detail.scrollTop;
    that.$apply();
  }
})
