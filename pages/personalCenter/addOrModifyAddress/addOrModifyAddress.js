// pages/personalCenter/addOrModifyAddress/addOrModifyAddress.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressInfo:{},
    addressId:'',
    selectedProvinceId:'',
    selectedProvinceName:'',
    selectedCityId:'',
    selectedCityName:'',
    selectedDistrictId:'',
    selectedDistrictName:'',
    selectedStreetId:'',
    selectedStreetName:'',
    merchantNameInput:'',
    consigneeNameInput:'',
    consigneeTelephoneInput:'',
    descriptionInput:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let source = options.source
    that.setData({ source: options.source})
    if(options.source == "modify"){
      let addressInfo = JSON.parse(options.addressInfo)
      console.log(addressInfo)
      that.setData({ 
        addressInfo: addressInfo ,
        addressId: addressInfo.id,
        selectedProvinceId: addressInfo.provinceId,
        selectedProvinceName: addressInfo.provinceName,
        selectedCityId: addressInfo.cityId,
        selectedCityName: addressInfo.cityName,
        // selectedDistrictId: addressInfo.districtId,
        // selectedDistrictName: addressInfo.districtName,
        // selectedStreetId: addressInfo.streetId,
        // selectedStreetName: addressInfo.streetName,
        merchantNameInput: addressInfo.merchantName,
        consigneeNameInput: addressInfo.consigneeName,
        consigneeTelephoneInput: addressInfo.consigneeTelephone,
        descriptionInput: addressInfo.consigneeAddress
        })
      if (addressInfo.districtName != null) {
        that.setData({
          selectedDistrictId: addressInfo.districtId,
          selectedDistrictName: addressInfo.districtName,
        })
      }
      if (addressInfo.streetName!=null){
        that.setData({
          selectedStreetId: addressInfo.streetId,
          selectedStreetName: addressInfo.streetName,
        })
      }
      wx.setNavigationBarTitle({
        title: "修改地址"
      })
    }else{
      wx.setNavigationBarTitle({
        title: "新增地址"
      })
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
    var that = this
    console.log(that.data.selectedProvinceId + that.data.selectedProvinceName + "、")
    console.log(that.data.selectedCityId + that.data.selectedCityName + "、")
    console.log(that.data.selectedDistrictId + that.data.selectedDistrictName + "、")
    console.log(that.data.selectedStreetId + that.data.selectedStreetName + "、")
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
   * 选择收货地址
  */
  chooseArea:function(){
    wx.navigateTo({
      url: '../availableArea/availableArea',
    })
  },
  /**
   * 店铺名输入框
  */
  merchantNameInput:function(e){
    this.setData({ merchantNameInput: e.detail.value })
  },
  /**
   * 收件人输入框
  */
  consigneeNameInput: function (e) {
    this.setData({ consigneeNameInput: e.detail.value })
  },
  /**
   * 收件号码输入框
  */
  consigneeTelephoneInput: function (e) {
    this.setData({ consigneeTelephoneInput: e.detail.value })
  },
  /**
   * 详细地址
  */
  descriptionInput: function (e) {
    this.setData({ descriptionInput: e.detail.value })
  },
  /**
   * 保存地址
  */
  saveAddress:function(){
    var that = this
    if (that.data.merchantNameInput == '' || that.data.merchantNameInput == undefined || that.data.merchantNameInput == null) {
      wx.showToast({
        title: '请输入店铺名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.merchantNameInput.length > 20) {
      wx.showToast({
        title: '店铺名称不能超过20个字符',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.consigneeNameInput == '' || that.data.consigneeNameInput == undefined || that.data.consigneeNameInput == null) {
      wx.showToast({
        title: '请输入收件人姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.consigneeNameInput.length > 9) {
      wx.showToast({
        title: '收件人姓名不能超过9个字符',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.consigneeTelephoneInput == '' || that.data.consigneeTelephoneInput == undefined || that.data.consigneeTelephoneInput == null) {
      wx.showToast({
        title: '请输入收件人号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.consigneeTelephoneInput.length != 11) {
      wx.showToast({
        title: '请输入正确的收件人号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.consigneeTelephoneInput.indexOf(".") != -1) {
      wx.showToast({
        title: '请输入正确的收件人号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.selectedProvinceId == '' || that.data.selectedCityId == '') {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.descriptionInput == '' || that.data.descriptionInput == undefined || that.data.descriptionInput == null) {
      wx.showToast({
        title: '请输入详细收货地址',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.addOrUpdateAddress()
  },
  /**
   * 新增或更新地址信息
  */
  addOrUpdateAddress:function(){
    var that = this
    var url = app.data.HOST + 'deliveryAddress'
    var params = {
      "id": that.data.addressId,
      "merchantName": that.data.merchantNameInput,
      "consigneeName": that.data.consigneeNameInput,
      "consigneeTelephone": that.data.consigneeTelephoneInput,
      "consigneeAddress": that.data.descriptionInput,
      "provinceName": that.data.selectedProvinceName,
      "provinceId": that.data.selectedProvinceId,
      "cityName": that.data.selectedCityName,
      "cityId": that.data.selectedCityId,
      "streetName": that.data.selectedStreetName,
      "streetId": that.data.selectedStreetId,
      "districtName": that.data.selectedDistrictName,
      "districtId": that.data.selectedDistrictId,
      "lat": "",
      "lng": "",
      "description": ""
    }
    if (that.data.source == "modify") {
      app.request.requestPutApi(url, params, that, function (res) {
        wx.showToast({
          title: "修改成功",
          icon: 'success',
          duration: 1000
        })
        setTimeout(function () {
          // flage = true
          wx.navigateBack();
        }, 1000)
      }, function (res) {
      }, function (res) {
      })
    }else{
      app.request.requestPostApi(url, params, that, function (res) {
        wx.showToast({
          title: "添加成功",
          icon: 'success',
          duration: 1000
        })
        setTimeout(function () {
          // flage = true
          wx.navigateBack();
        }, 1000)
      }, function (res) {
      }, function (res) {
      })
    }
  }
})