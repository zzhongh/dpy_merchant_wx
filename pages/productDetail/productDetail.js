// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,//是否显示面板指示点
    autoplay: true,//是否开启自动切换
    interval: 3000,//自动切换时间间隔
    duration: 500,//滑动动画时长
    //商品信息
    productData:{},
    //商品展示图片
    productDetailImageURLs:[],
    unCollectedImg: '../../images/common/collect_ico.png',
    collectedImg: '../../images/common/product_collect.png',
    collectStr:'加入清单',
    totalPrice:0.00,
    totalNum:0,
    isCollected:false,
    localMerchantCollectProducts:[],
    toastStatus: true,
    //存储在本地的已经加入购物车的商品列表
    localShoppingCartProducts: [],
    //是否显示编辑数量的弹窗
    showQuantityModal: false,
    //正在编辑数量的商品信息
    selecteEditProductInfo: {},
    //是否显示价格
    isShowPrice: true,
    shoppingCartImgEmpty:'../../images/common/shopcart_empty.png',
    shoppingCartImg: '../../images/common/shopcart.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var productData = JSON.parse(options.data)
    if (productData != null){
      this.setData({ productData: productData })
      var productDetailImageURLs = productData.productDetailImageURLs
      if (productDetailImageURLs != null && productDetailImageURLs != ''){
        var arr = productDetailImageURLs.split(',')
        this.setData({productDetailImageURLs:arr})
      }else{
        this.setData({ productDetailImageURLs: ["../../images/order/img_loading.jpg"] })
      }
    }
    if(wx.getStorageSync('isLogin')){
      this.getLocalCollectProducts()
      this.getLocalShoppingCartProducts()
    }
    this.setIsShowPrice()
  },

  /**
   * 获取本地的商户收藏列表，如果获取失败则从后台获取
   */
  getLocalCollectProducts: function () {
    var that = this
    wx.getStorage({
      key: 'localCollect',
      success: function (res) {
        var product = that.data.productData
        product.isCollected = that.findCollectProducts(product.id, res.data)
        var str = product.isCollected ? '移出清单':'加入清单'
        that.setData({ localMerchantCollectProducts: res.data, productData: product, collectStr: str})
      },
      fail: function (res) {
        this.getMerchantCollect()
      }
    })
  },
  /**
 * 匹配商品是否已经加入收藏的商品
 */
  findCollectProducts: function (productId, merchantCollect) {
    if (merchantCollect && merchantCollect.length > 0) {
      for (var i = 0; i < merchantCollect.length; i++) {
        if (merchantCollect[i].id == productId) {
          return true
        }
      }
    }
    return false
  },
  /**
   * 获取用户收藏商品列表
   */
  getMerchantCollect: function () {
    var that = this
    var url = app.data.HOST + 'collectionProduct'
    var header = { 'Authorization': app.data.token }
    var params = { 'cityId': wx.getStorageSync('cityId') }
    that.toastShow()
    HttpRequst.HttpRequst(url, 'GET', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          var product = that.data.productData
          product.isCollected = that.findCollectProducts(product.id, res.data.content)
          that.setData({ localMerchantCollectProducts: res.data.content, productData: product })
          wx.setStorage({
            key: 'localCollect',
            data: res.data.content,
          })
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 收藏图标被点击
   */
  collectClick: function (e) {
    if (this.data.productData) {
      if (this.data.productData.isCollected) {
        //点击前是收藏的状态
        this.delectCollectProduct(this.data.productData)
      } else {
        //点击前是未收藏的状态
        this.collectProduct(this.data.productData)
      }
    } else {
      wx.showToast({
        title: '商品不存在',
      })
    }
  },
  /**
   * 将商品收藏
   */
  collectProduct: function (product, index) {
    var that = this
    var url = app.data.HOST + 'collectionProduct/' + product.id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          product.isCollected = true
          var merchantCollected = that.data.localMerchantCollectProducts
          if (merchantCollected) {
            merchantCollected.push(product)
          } else {
            merchantCollected = []
            merchantCollected.push(product)
          }
          that.setData({ localMerchantCollectProducts: merchantCollected, productData: product, collectStr: '移出清单' })
          wx.setStorage({
            key: 'localCollect',
            data: merchantCollected,
          })
          wx.showToast({
            icon: 'none',
            title: '加入常购清单',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '加入常购清单失败',
          })
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 将商品从收藏中删除
   */
  delectCollectProduct: function (product, index) {
    var that = this
    var url = app.data.HOST + 'collectionProduct/' + product.id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'DELETE', params,
      function (res) {
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          product.isCollected = false
          var merchantCollected = that.data.localMerchantCollectProducts
          var collectedIndex = -1
          //获取此商品再收藏列表中的index
          for (var i = 0; i < merchantCollected.length; i++) {
            if (product.id == merchantCollected[i].id) {
              collectedIndex = i
            }
          }
          //从收藏列表中删除此商品
          if (collectedIndex >= 0) {
            merchantCollected.splice(collectedIndex, 1)
          }
          that.setData({ localMerchantCollectProducts: merchantCollected, productData: product, collectStr:'加入清单' })
          wx.setStorage({
            key: 'localCollect',
            data: merchantCollected,
          })
          wx.showToast({
            icon: 'none',
            title: '移出常购清单',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '移出常购清单失败',
          })
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  init:function(){

  },
  toastShow: function () {
    var toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    var toastStatus = true
    this.setData({ toastStatus: toastStatus })
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
          this.setData({ isShowPrice: false })
        }
      })
    }
  },
  /**
     * 获取本地的购物车商品列表
     */
  getLocalShoppingCartProducts: function () {
    var that = this
    wx.getStorage({
      key: 'localProductInfo',
      success: function (res) {
        that.setData({ localShoppingCartProducts: res.data })
        that.sumTotalPric(res.data)
        that.getShoppingCartTotalNum(res.data)
      },
      fail: function (res) {
        if (wx.getStorageSync('isLogin')) {
          that.getShoppingCartProducts()
        }

      }
    })
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
    HttpRequst.HttpRequst(url, 'GET', params, function (res) {
      
      if (res && res.data && res.data.code == 100) {
        var localProductInfo = []
        var products = res.data.content
        for (var i = 0; i < products.length; i++) {
          localProductInfo.push({ 'shoppingCartId': products[i].id, 'quantity': products[i].quantity, 'activityCode': products[i].activityCode, 'specificationId': products[i].specificationId, 'specificationPrice': products[i].specificationPrice })
        }
        that.setData({ localShoppingCartProducts: localProductInfo })
        wx.setStorage({
          key: "localProductInfo",
          data: localProductInfo
        })
        //
        that.sumTotalPric(localProductInfo)
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
    })
  },
  /**
   * 跳转到购物车
   */
  goToShoppingCart:function(){
    wx.switchTab({
      url: '/pages/shoppingCart/shoppingCart'
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
    if(num > 99){
      num = '99+'
    }
    this.setData({totalNum:num})
    return num
  },
  /**
   * 增加数量按钮被点击
   */
  addNum: function (e) {
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    var specificationIndex = e.currentTarget.dataset.sindex
    
    if (num > 0) {
      num = num + 1
      this.addShoppingCart(id, num, specificationIndex)
    } else {
      this.insertShoppingCart(id, 1, specificationIndex)
    }
  },

  /**
   * 减少数量按钮被点击
   */
  subNum: function (e) {
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    var specificationIndex = e.currentTarget.dataset.sindex

    if (num <= 1) {
      this.deleteShoppingCart(id, 0, specificationIndex)
    } else {
      num = num - 1
      this.addShoppingCart(id, num,specificationIndex)
    }
  },

  /**
   * 添加到购物车
   */
  insertShoppingCart: function (specificationId, num, specificationIndex) {
    var that = this
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'specificationId': specificationId, 'quantity': num, 'activityCode': '' }
    var header = {
      'Authorization': app.data.token,
      'Content-Type': 'application/json'
    }
    
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        if (res && res.data && res.data.code == 100) {
          var product
          //找到商品列表中对应的商品以及对应的规格
          var product = that.data.productData
          var productSpecificationList = product.productSpecificationList
          productSpecificationList[specificationIndex].shoppingCartNum = num
          productSpecificationList[specificationIndex].hasInShoppingCart = true
          product.productSpecificationList = productSpecificationList

          that.setData({ productData: product })
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
      })
  },
  /**
   * 增加购物车里的数量
   */
  addShoppingCart: function (specificationId, num,specificationIndex) {
    var localShoppingCartProducts = this.data.localShoppingCartProducts
    var shoppingCartId = -1
    console.log(localShoppingCartProducts)
    for (var i = 0; i < localShoppingCartProducts.length; i++) {
      var shoppingCartProduct = localShoppingCartProducts[i]
      if (specificationId == shoppingCartProduct.specificationId) {
        shoppingCartId = shoppingCartProduct.shoppingCartId
        break
      }
    }
    if (shoppingCartId >= 0) {
      var that = this
      var url = app.data.HOST + 'shoppingCart/' + shoppingCartId + '?quantity=' + num + '&version=2.0.7+'
      var params = {}
      var header = {
        'Authorization': app.data.token
      }
      HttpRequst.HttpRequst(url, 'POST', params,
        function (res) {
          if (res && res.data && res.data.code == 100) {
            var resultNum = res.data.content
            if (resultNum != num) {
              wx.showToast({
                icon: 'none',
                title: '库存不足，库存剩余' + resultNum + '件',
              })
            } else {
              var product = that.data.productData
              var specification = product.productSpecificationList[specificationIndex]
              specification.shoppingCartNum = resultNum
              specification.hasInShoppingCart = true
              product.productSpecificationList[specificationIndex] = specification

              var localShoppingCartList = that.data.localShoppingCartProducts
              for (var i = 0; i < localShoppingCartList.length; i++) {
                if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                  localShoppingCartList[i].quantity = resultNum
                }
              }
              that.setData({ productData: product, localShoppingCartProducts: localShoppingCartList })
              wx.setStorage({
                key: 'localProductInfo',
                data: localShoppingCartList,
              })
              that.sumTotalPric(localShoppingCartList)
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
        })
    }

  },
  /**
   * 从购物车中删除
   */
  deleteShoppingCart: function (specificationId, num, specificationIndex) {
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
      HttpRequst.HttpRequst(url, 'DELETE', params,
        function (res) {
          if (res && res.data && res.data.code == 100) {
            var product = that.data.productData
            var specification = product.productSpecificationList[specificationIndex]
            specification.shoppingCartNum = 0
            specification.hasInShoppingCart = false
            product.productSpecificationList[specificationIndex] = specification

            var localShoppingCartList = that.data.localShoppingCartProducts
            for (var i = 0; i < localShoppingCartList.length; i++) {
              if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                localShoppingCartList.splice(i, 1)
              }
            }

            that.setData({ productData: product, localShoppingCartProducts: localShoppingCartList })
            wx.setStorage({
              key: 'localProductInfo',
              data: localShoppingCartList,
            })
            that.sumTotalPric(localShoppingCartList)
            var total = that.getShoppingCartTotalNum(localShoppingCartList)
            wx.setStorage({
              key: "totalShoppinCartCount",
              data: total
            })
            wx.setTabBarBadge({
              index: 2,
              text: total.toString()
            })
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
        })
    }
  },
  /**
   * 点击显示已加入购物车数量的输入框
   */
  editNum: function (e) {
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    var specificationIndex = e.currentTarget.dataset.sindex
    this.setData({ showQuantityModal: true })
    //获取当前的
    var productInfo = {
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
      this.deleteShoppingCart(id, 0,  specificationIndex)
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
    this.addShoppingCart(id, num, specificationIndex)
    this.setData({ selecteEditProductInfo: {}, showQuantityModal: false })
  },
  /**
   * 加入到货通知
   */
  insertSubscribeStock: function (e) {
    var id = e.currentTarget.dataset.id
    var product = this.data.productData
    var that = this
    var url = app.data.HOST + 'subscribeStockUser/save?productId=' + product.id + '&specificationId=' + id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if(res && res.data && res.data.message){
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
  sumTotalPric:function(shoppingcartProducts){
    var totalPrice = 0.00
    if (shoppingcartProducts){
      for(var i=0;i<shoppingcartProducts.length;i++){
        totalPrice = totalPrice + (parseFloat(shoppingcartProducts[i].specificationPrice) 
            * parseFloat(shoppingcartProducts[i].quantity))
      }
    }
    this.setData({ totalPrice: totalPrice.toFixed(2)})
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