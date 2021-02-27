// pages/dataCenter/dataCenter.js
const app = getApp()
var baseUtils = require('../../utils/baseUtils.js')
var HttpRequst = require('../../utils/request.js')
var touchDot = 0;//触摸时的原点
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = "";// 记录/清理时间记录
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //分类总数据
    dataList: [],
    categoryData:[],
    //菜系专区
    merchantTypeData:[],
    //品牌专区
    brandsData:[],
    //选中的以及分类id
    selectedCategoryListId:-1,
    //选中的一级分类index
    categoryListIndex:0,
    isCategoryGroupShow:true,
    productList:[],
    //可能情况的取值分别是 merchantTypeId，brandIdStr，categoryId
    categoryType:'merchantTypeId',
    groupId:-1,
    pageIndex:0,
    pageSize:10,
    isRefresh:false,
    isProductRefresh:false,
    //存储在本地的已经加入购物车的商品列表
    localShoppingCartProducts:[],
    //存储在本地的商户收藏商品列表
    localMerchantCollectProducts:[],
    unCollectedImg:'../../images/common/collect_ico.png',
    collectedImg:'../../images/common/product_collect.png',
    //是否显示编辑数量的弹窗
    showQuantityModal:false,
    //正在编辑数量的商品信息
    selecteEditProductInfo:{},
    //是否显示价格
    isShowPrice:true,
    sortData: [
      { name: '销量从高到低', alias: 'saleSortDirection', id: '1' },
      { name: '销量从低到高', alias: 'saleSortDirection', id: '0' },
      { name: '价格从高到低', alias: 'priceSortDirection', id: '1' },
      { name: '价格从低到高', alias: 'priceSortDirection', id: '0' }
    ],
    //是否隐藏自定义modal
    flag:true,
    //选中的排序方式下标
    sortIndex:-1,
    sortTitle:'排序',
    toastStatus:true,
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
          that.setIsShowPrice()
        }else{
          that.setIsShowPrice()
        }
      }
    }, function (res) {

    }, function (res) {
      that.setIsShowPrice()
    })
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
    if(wx.getStorageSync('isLogin')){
      this.getLocalCollectProducts()
      this.getLocalShoppingCartProducts()
    }
    // this.setIsShowPrice()
    this.getConfigList()
  },
  //设置是否显示价格
  setIsShowPrice:function(){
    if(wx.getStorageSync('isLogin')){
      this.setData({ isShowPrice:true})
    }else{
      var that = this 
      wx.getStorage({
        key: 'configList',
        success: function(res) {
          var configList = res.data
          for(var i=0;i<configList.length;i++){
            if (configList[i].key == 'SHOW_PRICE_AFTER_LOGIN'){
              if (configList[i].value == '1'){
                that.setData({ isShowPrice: false })
              }else{true
                that.setData({ isShowPrice: true })
              }
            }
          }
        },
        fail:function(){
          that.setData({ isShowPrice: false })
        }
      })
    }
  },

  /**
   * 获取一二级分类信息
   */
  getData:function(){
    wx.showNavigationBarLoading()
    this.getMerchantTypeData()
    this.getBrandsData()
    this.getCategoryData();
  },
  /**
   * 获取其他分类数据
   */
  getCategoryData:function(){
    var that = this
    this.setData({ isRefresh : true})
    that.toastShow()
    HttpRequst.HttpRequst(app.data.HOST + 'allCategoriesByGroup', 'GET', 
          { 'cityId': wx.getStorageSync('cityId') },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            if (res != null && res.data.code == 100) {
              wx.hideNavigationBarLoading()
              wx.stopPullDownRefresh()
              var tempData = that.data.merchantTypeData.concat(that.data.brandsData)
              tempData = tempData.concat(res.data.content)
              that.setData({
                dataList: tempData
              })

            } else {
              var message = ''
              if (res != null) {
                message = res.data.message
                wx.showToast({
                  title: message,
                  mask: true,
                  duration: 2000
                })
              }
            }
          },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            wx.hideNavigationBarLoading()
          })
  },
  /**
   * 菜系专区
   */
  getMerchantTypeData:function(){
    var that = this
    this.setData({ isRefresh: true })
    that.toastShow()
    HttpRequst.HttpRequst(app.data.HOST + 'merchantTypes', 'GET',
          { 'cityId': wx.getStorageSync('cityId') },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            if (res != null && res.data.code == 100) {
              if (res.data.content != null && res.data.content.length > 0) {
                var temData = {
                  id: -2,
                  name: '菜系专区',
                  groups: [],
                }
                for (var i = 0; i < res.data.content.length; i++) {
                  //因为菜系专区和品牌专区分组的名称不一样，需要统一
                  var group = {
                    groupName: res.data.content[i].groupName,
                    subCategoryList: res.data.content[i].subMerchantTypeList
                  }
                  temData.groups.push(group)
                }
                var merchantData = []
                merchantData.push(temData)
                that.setData({ merchantTypeData: merchantData })
              }

            } else {
              var message = ''
              if (res != null) {
                message = res.data.message
                wx.showToast({
                  title: message,
                  mask: true,
                  duration: 2000
                })
              }
            }
          },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            wx.hideNavigationBarLoading()
          })
  },

  /**
   * 品牌专区
   */
  getBrandsData:function(){
    var that = this
    this.setData({ isRefresh: true })
    that.toastShow()
    HttpRequst.HttpRequst(app.data.HOST + 'brands', 'GET',
          { 'cityId': wx.getStorageSync('cityId') },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            if (res != null && res.data.code == 100) {
              if (res.data.content != null && res.data.content.length > 0) {
                var temData = {
                  id: -1,
                  name: '品牌专区',
                  groups: [],
                }
                for (var i = 0; i < res.data.content.length; i++) {
                  //因为菜系专区和品牌专区分组的名称不一样，需要统一
                  var group = {
                    groupName: res.data.content[i].groupName,
                    subCategoryList: res.data.content[i].subBrandList
                  }
                  temData.groups.push(group)
                }
                var brandsData = []
                brandsData.push(temData)

                that.setData({ brandsData: brandsData })
              }

            } else {
              var message = ''
              if (res != null) {
                message = res.data.message
                wx.showToast({
                  title: message,
                  mask: true,
                  duration: 2000
                })
              }
            }
          },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false })
            wx.hideNavigationBarLoading()
          })
  },

  /**
   *获取商品列表 
   */
  getProductList:function(){
    this.setData({ isRefresh: true, isProductRefresh:true })
    wx.showNavigationBarLoading()
    var sortIndex = this.data.sortIndex
    var that = this
    var merchantTypeIdStr = ''
    var brandIdStr = ''
    var categoryIdStr = ''
    var saleSortId = ''
    var priceSortId = ''
    if(sortIndex && sortIndex >= 0){
      if (sortIndex == 0 || sortIndex == 1){
        saleSortId = this.data.sortData[sortIndex].id
      }
      if (sortIndex == 2 || sortIndex == 3){
        priceSortId = this.data.sortData[sortIndex].id
      }
    }
    if (this.data.categoryType == 'merchantTypeId'){
      merchantTypeIdStr = this.data.groupId
    }
    if (this.data.categoryType == 'brandId') {
      brandIdStr = this.data.groupId
    }
    if (this.data.categoryType == 'categoryId') {
      categoryIdStr = this.data.groupId
    }
    that.toastShow()
    that.setData({ isCategoryGroupShow: false})
    HttpRequst.HttpRequst(app.data.HOST + 'products', 'GET', 
          {
            'cityId': wx.getStorageSync('cityId'),
            'pageIndex': that.data.pageIndex + '',
            'pageSize': that.data.pageSize + '',
            'merchantTypeId': merchantTypeIdStr,
            'brandId': brandIdStr,
            'categoryId': categoryIdStr,
            'saleSortDirection': saleSortId,
            'priceSortDirection': priceSortId
          }, 
          function(res){
            that.toastHide()

            that.setData({ isRefresh: false, isProductRefresh: false })
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            if (res != null && res.data.code == 100) {
              var oldProducts = that.data.productList
              var productList = res.data.content
              var pageIndex = that.data.pageIndex
              
              if (pageIndex > 0) {
                //当页数大于0（也就是至少是第二页）
                if (productList && productList.length > 0) {
                  productList = oldProducts.concat(productList)
                  // if (productList.length >= that.data.pageSize) {
                  //   that.setData({ pageIndex: pageIndex + 1 })
                  // }
                }
                if (!productList || productList.length <= 0) {
                  that.setData({ pageIndex: pageIndex - 1 })
                  return
                }
              } else {
                // if (productList.length >= that.data.pageSize) {
                //   that.setData({ pageIndex: pageIndex + 1 })
                // }
              }
              if (productList != null && productList.length > 0) {
                var localShoppingCartProducts = that.data.localShoppingCartProducts
                console.log(localShoppingCartProducts)
                var merchantCollect = that.data.localMerchantCollectProducts
                for (var i = 0; i < productList.length; i++) {
                  
                  //查找已经加入了购物车的商品 Math.floor(15.7784514000 * 100) / 100
                  productList[i].productSpecificationList = 
                        that.findInShoppingCartProducts(localShoppingCartProducts,productList[i].productSpecificationList)
                  //查找加入收藏的商品
                  productList[i].isCollected = that.findCollectProducts(productList[i].id, merchantCollect)
                  for (var j = 0; j < productList[i].productSpecificationList.length; j++) {
                    if (!baseUtils.isTowDecimalPlacesNum(productList[i].productSpecificationList[j].price)){
                      productList[i].productSpecificationList[j].price = (productList[i].productSpecificationList[j].price).toFixed(2)
                    }
                    
                  }
                  var priceStr = baseUtils.getMinMaxPrice(productList[i].productSpecificationList)
                  productList[i].priceStr = priceStr
                }
              }
              
              that.setData({ productList: productList })
              
            } else {
              that.setData({ isCategoryGroupShow: true })
              var message = ''
              if (res && res.data && res.data.message) {
                message = res.data.message
                wx.showToast({
                  icon: 'none',
                  title: message,
                  mask: true,
                  duration: 2000
                })
              }
              
            }
          },
          function(res){
            that.toastHide()
            that.setData({ isRefresh: false, isCategoryGroupShow: true, isProductRefresh: false})
            wx.hideNavigationBarLoading()
          })
  },

  /**
   * 匹配购物车中的商品和列表中的商品
   */
  findInShoppingCartProducts: function (localShoppingCartProducts,productSpecificationList){
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
   * 左边分类列表被点击
   */
  clickLeftList:function(e){
    //如果正在刷新，则不让点击
    if(this.data.isRefresh){
      return;
    }
    var id = e.currentTarget.dataset.id
    var categoryType = ''
    switch(id){
      case -2:
        categoryType = 'merchantTypeId'
        break
      case -1:
        categoryType = 'brandId'
        break
      default:
        categoryType = 'categoryId'
    }
    this.setData({
      selectedCategoryListId: id,
      categoryListIndex: e.currentTarget.dataset.index,
      categoryType: categoryType,
      isCategoryGroupShow: true,
      sortIndex:-1,
      sortTitle: '排序',
      pageIndex:0,
    })
    
  },

  groupItemClick:function(e){
    var id = e.currentTarget.dataset.id
    this.setData({ groupId:id})
    // this.getShoppingCartProducts()
    // this.getMerchantCollect()
    this.getProductList();
  },

  /**
   * 当点击商品列表分类上的埋点返回上一级
   */
  goBack:function(){
    this.setData({ isCategoryGroupShow: true, sortIndex: -1, sortTitle: '排序', pageIndex: 0 })
  },

/**
 * 刷新
 */
  refresh:function(){
    if(this.data.isCategoryGroupShow){
      this.getData();
    }else{
      if (this.data.isProductRefresh){
        return;
      }
      this.setData({ pageIndex: 0 });
      //this.getData( )
      this.getShoppingCartProducts()
      this.getMerchantCollect()
      this.getProductList();
    }
    
  },
  loadMore:function(){
    if (!this.data.isCategoryGroupShow && !this.data.isProductRefresh) {
      var index = this.data.pageIndex + 1
      this.setData({ pageIndex: index });
      this.getProductList();
    }
  },

  /**
   * 跳转到商品详情
   */
  gotoProductDetail:function(e){
    var product = this.data.productList[e.currentTarget.dataset.index]
    var productData = JSON.stringify(product)
    wx:wx.navigateTo({
      url: '../productDetail/productDetail?data=' + productData ,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 获取本地的购物车商品列表
   */
  getLocalShoppingCartProducts:function(){
    var that = this
    wx.getStorage({
      key: 'localProductInfo',
      success: function(res) {
        that.setData({ localShoppingCartProducts:res.data})
      },
      fail:function(res){
        if (wx.getStorageSync('isLogin')){
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
      'Content-Type':'application/json'
    }
    HttpRequst.HttpRequst(url, 'GET', params, function (res) {
      
      if (res && res.data && res.data.code == 100) {
        var localProductInfo = []
        var products = res.data.content
        for (var i = 0; i < products.length; i++) {
          localProductInfo.push({ 'shoppingCartId': products[i].id, 'quantity': products[i].quantity, 'activityCode': products[i].activityCode, 'specificationId': products[i].specificationId, 'specificationPrice': products[i].specificationPrice })
        }
        that.setData({ localShoppingCartProducts: localProductInfo})
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
      }
    }, function (res) {
    })
  },

  /**
   * 根据本地购物车商品列表计算总数量
   */
  getShoppingCartTotalNum(shoppingCartProducts){
    var num = 0
    if (shoppingCartProducts){
      for(var i=0;i<shoppingCartProducts.length;i++){
        num = num + shoppingCartProducts[i].quantity
      }
    }
    return num
  },
  /**
   * 增加数量按钮被点击
   */
  addNum:function(e){
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex
    
    if(num > 0){
      num = num + 1
      this.addShoppingCart(id, num, productIndex, specificationIndex)
    }else{
      this.insertShoppingCart(id, 1, productIndex, specificationIndex)
    }
  },

  /**
   * 减少数量按钮被点击
   */
  subNum:function(e){
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex

    if(num <= 1){
      this.deleteShoppingCart(id, 0, productIndex, specificationIndex)
    }else{
      num = num -1
      this.addShoppingCart(id, num, productIndex, specificationIndex)
    }
  },

  /**
   * 添加到购物车
   */
  insertShoppingCart: function (specificationId, num, productIndex, specificationIndex){
    var that = this
    var url = app.data.HOST + 'shoppingCart'
    var params = { 'specificationId': specificationId,'quantity':num,'activityCode':'' }
    var header = {
      'Authorization': app.data.token,
      'Content-Type': 'application/json'
    }
    HttpRequst.HttpRequst(url,'POST',params,
      function(res){
        if(res && res.data && res.data.code==100){
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

          that.setData({ productList: products})
          that.getShoppingCartProducts()
        }else{
          var message = ''
          if(res && res.data && res.data.message){
            message = res.data.message
            wx.showToast({
              icon: 'none',
              title: message,
            })
          }
        }
      },
      function(res){
      })
  },
  /**
   * 增加购物车里的数量
   */
  addShoppingCart: function (specificationId, num, productIndex, specificationIndex){
    var localShoppingCartProducts = this.data.localShoppingCartProducts
    var shoppingCartId = -1
    for (var i = 0; i < localShoppingCartProducts.length;i++){
      var shoppingCartProduct = localShoppingCartProducts[i]
      if (specificationId == shoppingCartProduct.specificationId ){
        shoppingCartId = shoppingCartProduct.shoppingCartId
        break
      }
    }
    if (shoppingCartId >= 0){
      var that = this
      var url = app.data.HOST + 'shoppingCart/' + shoppingCartId + '?quantity=' + num + '&version=2.0.7+'
      var params = {}
      var header = {
        'Authorization': app.data.token
      }
      HttpRequst.HttpRequst(url,'POST',params,
        function(res){
          if(res && res.data && res.data.code == 100){
            var resultNum = res.data.content
            if (resultNum != num){
              wx.showToast({
                icon:'none',
                title: '库存不足，库存剩余' + resultNum + '件',
              })
            }else{
              var products = that.data.productList
              var product = products[productIndex]
              var specification = product.productSpecificationList[specificationIndex]
              specification.shoppingCartNum = resultNum
              specification.hasInShoppingCart = true
              product.productSpecificationList[specificationIndex] = specification
              products[productIndex] = product

              var localShoppingCartList = that.data.localShoppingCartProducts
              for(var i=0;i<localShoppingCartList.length;i++){
                if (localShoppingCartList[i].shoppingCartId == shoppingCartId){
                  localShoppingCartList[i].quantity = resultNum
                }
              }
              that.setData({ productList: products, localShoppingCartProducts: localShoppingCartList})
              wx.setStorage({
                key: 'localProductInfo',
                data: localShoppingCartList,
              })
              var total = that.getShoppingCartTotalNum(localShoppingCartList)
              wx.setStorage({
                key: "totalShoppinCartCount",
                data: total
              })
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
            }
          }else{
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
        function(res){
        })
    }

  },
  /**
   * 从购物车中删除
   */
  deleteShoppingCart: function (specificationId, num, productIndex, specificationIndex){
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
      HttpRequst.HttpRequst(url,'DELETE',params,
        function(res){
          if(res && res.data && res.data.code == 100){
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
                localShoppingCartList.splice(i,1)
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
        function(res){
        })
    }
  },
  /**
   * 点击显示已加入购物车数量的输入框
   */
  editNum:function(e){
    var num = e.currentTarget.dataset.hi
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var specificationIndex = e.currentTarget.dataset.sindex
    this.setData({ showQuantityModal:true})
    //获取当前的
    var productInfo = {
      productIndex: productIndex,
      specificationIndex: specificationIndex,
      specificationId:id,
      num:num
    }
    this.setData({ selecteEditProductInfo: productInfo})
  },
  /**
   * 编辑数量
   */
  editInput:function(e){
    var num = e.detail.value
    var productInfo = this.data.selecteEditProductInfo
    productInfo.num = num
    this.setData({ selecteEditProductInfo: productInfo })
  },
  /**
   * 点击model的取消按钮
   */
  modalCancel:function(){
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
    if(!num){
      wx.showToast({
        icon: 'none',
        title: '内容不能为空',
      })
      return
    }
    if ((num+'').indexOf('.') != -1){
      wx.showToast({
        icon:'none',
        title: '请输入正整数',
      })
      return
    }
    if(num == 0){
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
   * 获取本地的商户收藏列表，如果获取失败则从后台获取
   */
  getLocalCollectProducts:function(){
    var that = this
    wx.getStorage({
      key: 'localCollect',
      success: function(res) {
        that.setData({ localMerchantCollectProducts: res.data })
      },
      fail:function(res){
        this.getMerchantCollect()
      }
    })
  },
  /**
   * 匹配商品列表中已经加入收藏的商品
   */
  findCollectProducts:function(productId,merchantCollect){
    if (merchantCollect && merchantCollect.length > 0){
      for(var i=0;i<merchantCollect.length;i++){
        if (merchantCollect[i].id == productId){
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
          that.setData({ localMerchantCollectProducts: res.data.content })
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
  collectClick:function(e){
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.hi
    if(this.data.productList[index]){
      if (this.data.productList[index].isCollected){
        //点击前是收藏的状态
        this.delectCollectProduct(this.data.productList[index],index)
      }else{
        //点击前是未收藏的状态
        this.collectProduct(this.data.productList[index], index)
      }
    }else{
      wx.showToast({
        title: '商品不存在',
      })
    }
  },
  /**
   * 将商品收藏
   */
  collectProduct:function(product,index){
    var that = this
    var url = app.data.HOST + 'collectionProduct/' + product.id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json'}
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          product.isCollected = true
          var merchantCollected = that.data.localMerchantCollectProducts
          if (merchantCollected){
            merchantCollected.push(product)
          }else{
            merchantCollected = []
            merchantCollected.push(product)
          }
          var products = that.data.productList
          products[index] = product
          that.setData({ localMerchantCollectProducts: merchantCollected, productList:products})
          wx.setStorage({
            key: 'localCollect',
            data: merchantCollected,
          })
          wx.showToast({
            icon: 'none',
            title: '加入常购清单',
          })
        }else{
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
  delectCollectProduct:function(product,index){
    var that = this
    var url = app.data.HOST + 'collectionProduct/' + product.id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url, 'DELETE', params,
      function(res){
        that.toastHide()
        if (res && res.data && res.data.code == 100) {
          product.isCollected = false
          var merchantCollected = that.data.localMerchantCollectProducts
          var collectedIndex = -1
          //获取此商品再收藏列表中的index
          for(var i=0;i<merchantCollected.length;i++){
            if (product.id == merchantCollected[i].id){
              collectedIndex = i
            }
          }
          //从收藏列表中删除此商品
          if (collectedIndex >= 0){
            merchantCollected.splice(collectedIndex, 1)
          }
          var products = that.data.productList
          products[index] = product
          that.setData({ localMerchantCollectProducts: merchantCollected, productList: products })
          wx.setStorage({
            key: 'localCollect',
            data: merchantCollected,
          })
          wx.showToast({
            icon: 'none',
            title: '移出常购清单',
          })
        }else{
          wx.showToast({
            icon: 'none',
            title: '移出常购清单失败',
          })
        }
      },
      function(res){
        that.toastHide()
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
    if (wx.getStorageSync('isLogin')) {
      this.getRelatedData()
    }
    //this.setIsShowPrice()
    
    if (app.globalData.currentSelectedId != undefined) {
      this.setData({ isCategoryGroupShow:true})
    }
    var that = this
    wx.getStorage({
      key: 'localCollect',
      success: function (res) {
        that.setData({ localMerchantCollectProducts: res.data })
      },
      fail: function (res) {
        this.getMerchantCollect()
      }
    })
    wx.getStorage({
      key: 'localProductInfo',
      success: function (res) {
        console.log(res.data)
        that.setData({ localShoppingCartProducts: res.data })
      },
      fail: function (res) {
        this.getShoppingCartProducts()
      }
    })
    if (this.data.isCategoryGroupShow) {
      this.getData();
    } else {
      this.getProductList();
    }
    if (app.globalData.currentSelectedId != undefined){
      var id = app.globalData.currentSelectedId
      app.globalData.currentSelectedId = undefined
      var categoryType = ''
      switch (id) {
        case -2:
          categoryType = 'merchantTypeId'
          break
        case -1:
          categoryType = 'brandId'
          break
        default:
          categoryType = 'categoryId'
      }
      this.setData({
        selectedCategoryListId: id,
        categoryListIndex: app.globalData.currentSelectedIndex,
        categoryType: categoryType,
        sortIndex: -1,
        sortTitle: '排序',
        pageIndex: 0,
      })
    }
  },

  /**
   * 搜索商品
   */
  goToSearch:function(){
    wx.navigateTo({
      url: '../productSearch/productSearch',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 加入到货通知
   */
  insertSubscribeStock:function(e){
    var id = e.currentTarget.dataset.id
    //这个是商品列表的index
    var productIndex = e.currentTarget.dataset.pindex;
    var products = this.data.productList
    var that = this
    var url = app.data.HOST + 'subscribeStockUser/save?productId=' + products[productIndex].id + '&specificationId=' + id
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json'  }
    var params = { }
    that.toastShow()
    HttpRequst.HttpRequst(url, 'POST', params,
      function (res) {
        that.toastHide()
        if(res && res.data && res.data.message){
          wx.showToast({
            icon: 'none',
            title: res.data.message,
          })
        }
      },
      function (res) {
        that.toastHide()
      })
  },
  sort:function(){
    this.setData({flag:false})
  },
  hide:function(){
    this.setData({ flag: true })
  },
  sortProductList:function(e){
    var index = e.currentTarget.dataset.index
    var titil = this.data.sortData[index].name
    this.setData({ sortIndex: index, sortTitle: titil, pageIndex:0})
    this.getProductList()
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
    //this.refresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //this.loadMore
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})