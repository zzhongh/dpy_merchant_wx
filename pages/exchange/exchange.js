// pages/exchange/exchange.js
const app = getApp()
let winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
let winHei = wx.getSystemInfoSync().windowHeight; //获取当前屏幕的宽度
var qiniuUploader = require('../../utils/qiniuUploader.js')
// var uploadedImagesIndex = 0
var isUploadding = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[],
    image1: '../../images/user/takePhoto.png',
    image2:'',
    image3:'',
    hideReasonListModal: true,
    modalMarginTop: 0 + "px",
    listHeight: 40 +"px",
    currentSelectedIndex:-1,
    currentSelectedReasonItem:{},
    totalPrice:0,
    selectedProducts:[],
    currentSelectedReason:'请选择',
    isShowNeedImageFlag:false,
    descriptionInput:'',
    imageKeyArr:[],
    tempFilePaths:[],
    uploadedImagesIndex:0,
    isUploadding: isUploadding,
    imagePathArr:[]
  },
  toastShow: function () {
    // console.log("触发了点击事件，弹出toast")
    isUploadding = false
    this.setData({ isUploadding: isUploadding })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    // console.log("触发bindchange，隐藏toast")
    isUploadding = true
    this.setData({ isUploadding: isUploadding })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    console.log(JSON.parse(options.selectedProducts))
    var totalNum = 0
    var selectedProducts = JSON.parse(options.selectedProducts)
    var refundOrderProductSnapshotList = []
    this.setData({ selectedProducts: selectedProducts, totalPrice: parseFloat(options.totalPrice).toFixed(2), uploadedImagesIndex:0})
    for (var i = 0; i < selectedProducts.length; i++) {
      totalNum += selectedProducts[i].chooseRefundNum
      refundOrderProductSnapshotList.push({
        "productId": selectedProducts[i].productId,
        "productName": selectedProducts[i].productName,
        "productPreviewImageURL": selectedProducts[i].productPreviewImageURL,
        "specificationUnitPrice": selectedProducts[i].specificationUnitPrice,
        "activityCode": "",
        "specificationId": selectedProducts[i].specificationId,
        "specificationName": selectedProducts[i].specificationName,
        "cost": selectedProducts[i].cost,
        "id": selectedProducts[i].id,
        "unit": selectedProducts[i].unit,
        "weight": selectedProducts[i].weight,
        "refundNum": selectedProducts[i].chooseRefundNum,
        "orderNo": selectedProducts[i].orderNo
      })
    }
    this.setData({ totalNum: totalNum, refundOrderProductSnapshotList: refundOrderProductSnapshotList})
    
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
    this.getConfigList()
    this.getImageToken()
    this.getRefundReasonList()
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
   * 点击model的取消按钮
   */
  hideReasonListModal: function () {
    this.setData({ hideReasonListModal: true })
  },
  /**
   * 选择退换货原因
  */
  chooseReason:function(){
    var that = this
    that.setData({ hideReasonListModal: false })
  },
  /**
   * 获取退货原因列表
  */
  getRefundReasonList:function(){
    var that = this
    var url = app.data.HOST + 'listReturnCause'
    var params = {}
    app.request.requestPostApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ refundReasonList: res, listHeight: res.length * 30 + 40 + "px", modalMarginTop: (winHei - res.length * 30 + 14) + "px",})
      }
    }, function (res) {
    }, function (res) {

    })
  },
  /**
   * 获取图片token token/uploadImage?bucket=temp
  */
  getImageToken:function(){
    var that = this
    var url = app.data.HOST + 'token/uploadImage?bucket=temp'
    var params = {}
    app.request.requestGetApi(url, params, that, function (res) {
      if (res != null) {
        that.setData({ imageToken: res })
      }
    }, function (res) {
    }, function (res) {
      
    })
  },
  /**
   * 获取配置信息
  */
  getConfigList: function () {
    var that = this
    wx.getStorage({
      key: 'configList',
      success: function (res) {
        that.setData({ configList: res.data })
        for (var i = 0; i < that.data.configList.length; i++) {
          if (that.data.configList[i].key == "REFUND_NOTICE") {
            that.setData({ refundNotice: that.data.configList[i].value })
            break
          }
        }
      },
      fail: function (res) {

      }
    })
  },
  /**
   * 监听退货说明输入框
  */
  descriptionInput: function (e) {
    this.setData({ descriptionInput: e.detail.value })
  },
  /**
   * 选择退货原因
  */
  chooseReasonItem:function(e){
    var that = this
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    that.setData({ currentSelectedIndex: index, currentSelectedReasonItem: item, currentSelectedReason: item.returnCauseDescription, hideReasonListModal:true})
    if (that.data.currentSelectedReasonItem.isNeedImage == "1"){
      that.setData({ isShowNeedImageFlag:true })
    }else{
      that.setData({ isShowNeedImageFlag: false })
    }
  },
  /**
   * 照片来源
  */
  chooseWxImage: function (type,index) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      count:1,
      success: function (res) {
        console.log(index)
        console.log(res);
        if(index == 1){
          that.setData({
            image1: res.tempFilePaths[0],
          })
          if(that.data.image2 == ""){
            that.setData({
              image2: '../../images/user/takePhoto.png',
            })
          }
        } else if (index == 2) {
          that.setData({
            image2: res.tempFilePaths[0],
          })
          if (that.data.image3 == "") {
            that.setData({
              image3: '../../images/user/takePhoto.png',
            })
          }
        } else if (index == 3) {
          that.setData({
            image3: res.tempFilePaths[0],
          })
        }
        
      }
    })
  },
  /**
   * 选择/删除照片
  */
  chooseOrDeletePhoto:function(e){
    let index = e.currentTarget.dataset.index
    var that = this;
    //触摸时间距离页面打开的毫秒数
    var touchTime = that.data.touch_end - that.data.touch_start;
    console.log(touchTime);
    //如果按下时间大于350为长按
    if (touchTime > 350) {
      switch (index) {
        case 1:
          if (that.data.image1 != "" && that.data.image1 != "../../images/user/takePhoto.png") {
            that.showDeletePhotoModal(index)
          }else{
            that.showChoosePhoto(index)
          }
          break;
        case 2:
          if (that.data.image2 != "" && that.data.image2 != "../../images/user/takePhoto.png") {
            that.showDeletePhotoModal(index)
          } else {
            that.showChoosePhoto(index)
          }
          break;
        case 3:
          if (that.data.image3 != "" && that.data.image3 != "../../images/user/takePhoto.png") {
            that.showDeletePhotoModal(index)
          } else {
            that.showChoosePhoto(index)
          }
          break;
        default:
          break;
      }
    }else{
      that.showChoosePhoto(index)
    }
    
  },
  /**
   * 选择照片
  */
  showChoosePhoto:function(index){
    var that = this
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#00c4f9",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album', index)
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera', index)
          }
        }
      }
    })
  },
  /**
   * 提交退货申请数据
  */
  submitExchangeInfo:function(){
    var that = this
    var url = app.data.HOST + 'refundOrderByMerchant'
    var params = {
      "description": that.data.descriptionInput,
      "imageURLs": that.data.imageKeyArr.join(','),
      "returnCause": that.data.currentSelectedReasonItem.returnCauseNo,
      "type": "1",
      "orderNo": that.data.selectedProducts[0].orderNo,
      "refundOrderProductSnapshotList": that.data.refundOrderProductSnapshotList
    }
    app.request.requestPostApi(url, params, that, function (res) {
      that.toastHide()
      wx.showToast({
        title: "提交成功",
        icon: 'success',
        duration: 1000
      })
      setTimeout(function () {
        // flage = true
        wx.navigateBack({delta:2});
      }, 1000)
    }, function (res) {
      that.toastHide()
    }, function (res) {
      that.toastHide()
    })
  },
  /**
   * 图片上传至七牛
  */
  upLoadToQiniu: function (){
    var that = this
    let token = that.data.imageToken;
    if (that.data.uploadedImagesIndex > that.data.tempFilePaths.length - 1) {
      that.submitExchangeInfo();
    } else {
      that.toastShow()
      wx.uploadFile({
        url: 'http://up-z2.qiniu.com',
        name: 'file',
        filePath: that.data.tempFilePaths[that.data.uploadedImagesIndex],
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          token: token,
        },
        success: function (res) {
          let data = JSON.parse(res.data)
          // console.log(data)
          var newImageKeyArr = that.data.imageKeyArr
          newImageKeyArr.push(data.key)
          that.setData({ imageKeyArr: newImageKeyArr, uploadedImagesIndex: that.data.uploadedImagesIndex + 1})
          that.upLoadToQiniu()
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
  },
  /**
   * 提交退货申请按钮
  */
  uploadExchangeInfo:function(){
    var that = this
    var imagePathArr = []
    if (that.data.image1 != "" && that.data.image1 != "../../images/user/takePhoto.png") {
      imagePathArr.push(that.data.image1)
    }
    if (that.data.image2 != "" && that.data.image2 != "../../images/user/takePhoto.png") {
      imagePathArr.push(that.data.image2)
    }
    if (that.data.image3 != "" && that.data.image3 != "../../images/user/takePhoto.png") {
      imagePathArr.push(that.data.image3)
    }

    that.setData({ tempFilePaths: imagePathArr})

    if (that.data.currentSelectedReason == '请选择'){
      wx.showToast({
        title: '选择退货原因',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (that.data.descriptionInput == '' || that.data.descriptionInput == null || that.data.descriptionInput == undefined){
      wx.showToast({
        title: '请填写退货说明',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (that.data.isShowNeedImageFlag && imagePathArr.length == 0) {
      wx.showToast({
        title: '请至少选择一张图片',
        icon: 'none',
        duration: 2000
      })
      return
    }

    that.upLoadToQiniu()
  },
  //按下事件开始
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },
  /**
   * 删除照片提示
  */
  showDeletePhotoModal:function(index){
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: "是否删除该图片？",
      success: function (res) {
        if (res.confirm) {
          switch (index) {
            case 1:
              that.setData({ image1: "../../images/user/takePhoto.png" })
              break;
            case 2:
              that.setData({ image2: "../../images/user/takePhoto.png" })
              break;
            case 3:
              that.setData({ image3: "../../images/user/takePhoto.png" })
              break;
            default:
              break;
          }
        }
      },
      fail: function () {
        if (res.confirm) {

        }
      }
    })
  }
})