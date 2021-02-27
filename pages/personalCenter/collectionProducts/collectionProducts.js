// pages/personalCenter/collectionProducts/collectionProducts.js
const app = getApp()
var baseUtils = require('../../../utils/baseUtils.js')
var HttpRequst = require('../../../utils/request.js')
var toastStatus = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    localShoppingCartProducts:[],
    collectionProducts:[],
    shoppingCartImgEmpty: '../../../images/common/shopcart_empty.png',
    shoppingCartImg: '../../../images/common/shopcart.png',
    deviceType:''
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
    this.getLocalShoppingCartProducts()
    this.getCollectionProducts()
    var that = this
    wx.getStorage({
      key: 'deviceType',
      success: function (res) {
        that.setData({ deviceType:res.data})
      },
      fail: function (res) {
        
      }
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
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    let that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getCollectionProducts()
  },
  /**
   * 获取收藏商品列表
   */
  getCollectionProducts: function () {
    var that = this
    var url = app.data.HOST + 'collectionProduct'
    var params = { 'cityId': wx.getStorageSync('cityId') }
    that.toastShow()
    app.request.requestGetApi(url, params, that, function (res) {
      that.toastHide()
      wx.hideNavigationBarLoading()
      if (res != null) {
        var localShoppingCartProducts = that.data.localShoppingCartProducts
        for (var i = 0; i < res.length; i++) {
          if (res[i].productSpecificationList.length == 1){
            res[i].priceRange = res[i].productSpecificationList.sort(that.compare("price"))[0].price.toFixed(2).toString() + "元"
            res[i].weightRange = res[i].productSpecificationList.sort(that.compare("price"))[0].weight.toFixed(1).toString() + "KG"
          }else{
            res[i].priceRange = res[i].productSpecificationList.sort(that.compare("price"))[0].price.toFixed(1).toString() + " ~ " + res[i].productSpecificationList.sort(that.compare("price"))[res[i].productSpecificationList.length - 1].price.toFixed(2).toString()+"元"
            res[i].weightRange = res[i].productSpecificationList.sort(that.compare("price"))[0].weight.toFixed(1).toString() + " ~ " + res[i].productSpecificationList.sort(that.compare("price"))[res[i].productSpecificationList.length - 1].weight.toFixed(2).toString()+"KG"
          }
          for (var j = 0; j < res[i].productSpecificationList.length; j++) {
            res[i].productSpecificationList[j].price = res[i].productSpecificationList[j].price.toFixed(2)
          }
          res[i].productSpecificationList =
            that.findInShoppingCartProducts(localShoppingCartProducts, res[i].productSpecificationList)
        }
        that.setData({ collectionProducts: res })
        console.log(that.data.collectionProducts)
      }
    }, function (res) {
    }, function (res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      that.toastHide()
    })
  },
// var arr = [{ name: "zlw", age: 24 }, { name: "wlz", age: 25 }];
compare:function (prop) {
  return function (obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop]; if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
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
   * 增加购物车数量
  */
  add:function(e){
    var item = e.currentTarget.dataset.item
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex

    if (item.shoppingCartNum > 0) {
      item.shoppingCartNum = item.shoppingCartNum + 1
      this.addShoppingCart(item.id, item.shoppingCartNum, productIndex, specificationIndex)
    } else {
      this.insertShoppingCart(item.id, 1, productIndex, specificationIndex)
    }
  },
  /**
   * 减少购物车数量
  */
  minus: function (e) {
    var item = e.currentTarget.dataset.item
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex

    if (item.shoppingCartNum <= 1) {
      this.deleteShoppingCart(item.id, 0, productIndex, specificationIndex)
    } else {
      item.shoppingCartNum = item.shoppingCartNum - 1
      this.addShoppingCart(item.id, item.shoppingCartNum, productIndex, specificationIndex)
    }
  },
  /**
   * 增加购物车里的数量
   */
  addShoppingCart: function (specificationId, num, productIndex, specificationIndex) {
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
              var collectionProducts = that.data.collectionProducts
              var product = collectionProducts[productIndex]
              var specification = product.productSpecificationList[specificationIndex]
              specification.shoppingCartNum = resultNum
              specification.hasInShoppingCart = true
              product.productSpecificationList[specificationIndex] = specification
              collectionProducts[productIndex] = product

              var localShoppingCartList = that.data.localShoppingCartProducts
              for (var i = 0; i < localShoppingCartList.length; i++) {
                if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                  localShoppingCartList[i].quantity = resultNum
                }
              }
              // console.log(localShoppingCartList)
              that.setData({ collectionProducts: collectionProducts, localShoppingCartProducts: localShoppingCartList })
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
              that.sumTotalPric(localShoppingCartList)
            }
          } else {
            var message = ''
            if (res && res.data && res.data.message) {
              message = res.data.message
            }
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        },
        function (res) {
          that.toastHide()
        })
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
          var collectionProducts = that.data.collectionProducts
          var product = collectionProducts[productIndex]
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
          collectionProducts[productIndex] = product

          that.setData({ collectionProducts: collectionProducts })
          that.getShoppingCartProducts()
        } else {
          var message = ''
          if (res && res.data && res.data.message) {
            message = res.data.message
          }
          wx.showToast({
            icon: 'none',
            title: message,
          })
        }
      },
      function (res) {
        that.toastHide()
      })
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
            var collectionProducts = that.data.collectionProducts
            var product = collectionProducts[productIndex]
            var specification = product.productSpecificationList[specificationIndex]
            specification.shoppingCartNum = 0
            specification.hasInShoppingCart = false
            product.productSpecificationList[specificationIndex] = specification
            collectionProducts[productIndex] = product

            var localShoppingCartList = that.data.localShoppingCartProducts
            for (var i = 0; i < localShoppingCartList.length; i++) {
              if (localShoppingCartList[i].shoppingCartId == shoppingCartId) {
                localShoppingCartList.splice(i, 1)
              }
            }

            that.setData({ collectionProducts: collectionProducts, localShoppingCartProducts: localShoppingCartList })
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
            that.sumTotalPric(localShoppingCartList)
          } else {
            var message = ''
            if (res && res.data && res.data.message) {
              message = res.data.message
            }
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        },
        function (res) {
          that.toastHide()
        })
    }
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
        that.setData({ localShoppingCartProducts: localProductInfo })
        console.log(2)
        console.log(localProductInfo)
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
        that.sumTotalPric(localProductInfo)
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
    if (num > 99) {
      num = '99+'
    }
    this.setData({ totalNum: num })
    return num
  },
  /**
   * 计算购物车总金额
  */
  sumTotalPric: function (shoppingcartProducts) {
    var totalPrice = 0.00
    if (shoppingcartProducts) {
      for (var i = 0; i < shoppingcartProducts.length; i++) {
        totalPrice = totalPrice + (parseFloat(shoppingcartProducts[i].specificationPrice)
          * parseFloat(shoppingcartProducts[i].quantity))
      }
    }
    this.setData({ totalPrice: totalPrice.toFixed(2) })
  },
  /**
   * 加入到货通知
   */
  insertSubscribeStock: function (e) {
    var item = e.currentTarget.dataset.item
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex
    var product = this.data.collectionProducts
    var that = this
    var url = app.data.HOST + 'subscribeStockUser/save?productId=' + product[productIndex].id + '&specificationId=' + item.id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        wx.showToast({
          icon: 'none',
          title: res.data.message,
          duration: 2000
        })
      },
      function (res) {
        that.toastHide()
      })
  },
  /**
   * 点击显示已加入购物车数量的输入框
   */
  editNum: function (e) {
    var item = e.currentTarget.dataset.item
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex
    this.setData({ showQuantityModal: true })
    //获取当前的
    var productInfo = {
      productIndex: productIndex,
      specificationIndex: specificationIndex,
      specificationId: item.id,
      num: item.shoppingCartNum
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
   * 跳转到商品详情
   */
  gotoProductDetail: function (e) {
    var productData = JSON.stringify(e.currentTarget.dataset.item)
    wx: wx.navigateTo({
      url: '../../productDetail/productDetail?data=' + productData,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 移除收藏商品
  */
  removeCollect:function(e){
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: "是否将“" + e.currentTarget.dataset.item.name + '”移出常购清单？',
      success: function (res) {
        if (res.confirm) {
          var url = app.data.HOST + 'collectionProduct/' + e.currentTarget.dataset.item.id
          var params = {}
          that.toastShow()
          app.request.requestDeleteApi(url, params, that, function (res) {
            that.toastHide()
            wx.showToast({
              icon: 'none',
              title: '已移出常购清单',
            })
            that.getCollectionProducts()
          }, function (res) {
            that.toastHide()
          }, function (res) {
            that.toastHide()
          })
        }
      },
      fail: function () {
        if (res.confirm) {

        }
      }
    })
  },
  /**
   * 跳转到购物车页面
  */
  goToShoppingCart:function(){
    wx.switchTab({
      url: '../../shoppingCart/shoppingCart',
    })
  }
})