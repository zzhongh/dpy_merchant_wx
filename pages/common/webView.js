// pages/commom/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
/**
   *  if(hasLanchedBefore){
            if let urlRequest = NSURL(string:url! + "?token=\(UserDefaults.standard.string(forKey: "userToken")!)&deviceType=iOS&cityId=\(UserDefaults.standard.string(forKey: "selectedCityId")!)&merchantId=\(UserDefaults.standard.string(forKey: "merchantId")!)"){
                let requestUrl = NSURLRequest(url:urlRequest as URL)
                webView.load(requestUrl as URLRequest)
            }
        }else{
            if let urlRequest = NSURL(string:url! + "?token=\(UserDefaults.standard.string(forKey: "userToken")!)&deviceType=iOS&cityId=\(UserDefaults.standard.string(forKey: "selectedCityId")!)"){
                let requestUrl = NSURLRequest(url:urlRequest as URL)
                webView.load(requestUrl as URLRequest)
            }
        }
  */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options.url)
    wx.getStorage({
      key: 'cityId',
      success: function (res) {
        wx.getStorage({
          key: 'userToken',
          success: function (resData) {
            that.setData({ url: options.url + "?token=" + resData.data + "&cityId=" + res.data + "&deviceType=miniProgram" })
          },
          fail: function (resData) {

          }
        })
      },
      fail: function (res) {
        
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