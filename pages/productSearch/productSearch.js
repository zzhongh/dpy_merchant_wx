// pages/login/login.js
const app = getApp()
var HttpRequst = require('../../utils/request.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchHistory:[],
    hotSearch:[],
    inputStr:'',
    timer:null,
    //是否显示搜索的关键字列表
    isShowKeyWordList:false,
    keyWordList:[],
    toastStatus: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    this.getSearchHistory()
    this.getHotSearch()
  },
  /**
   * 获取历史搜索数据
   */
  getSearchHistory:function(){
    var that = this
    wx.getStorage({
      key: 'searchHistory',
      success: function(res) {
        that.setData({ searchHistory:res.data})
      },
      fail:function(){
        wx.setStorage({
          key: 'searchHistory',
          data: [],
        })
      }
    })
  },
  /**
   * 搜索框输入监听
   */
  input:function(e){
    var that = this
    var word = e.detail.value
    this.setData({ inputStr: word})
    clearTimeout(this.data.timer)
    var t = setTimeout(function(){
      that.getKeyWordList(word)
    },500)
    this.setData({timer:t})
  },
  /**
   * 根据关键字搜索关键字列表
   */
  getKeyWordList: function (keyword){
    if(!keyword){
      this.setData({isShowKeyWordList: false })
      return
    }
    var that = this
    var url = app.data.HOST + 'products'
    var header = { 'Authorization': app.data.token }
    var params = { 'cityId': wx.getStorageSync('cityId'), 'pageSize': '10','keyword':keyword}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          if (res.data.content){
            var keyWordList = []
            for(var i=0;i<res.data.content.length;i++){
              keyWordList.push(res.data.content[i].name)
            }
            that.setData({ keyWordList: keyWordList, isShowKeyWordList:true})
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
        that.toastHide
      })
  },
  /**
   * 点击搜索按钮
   */
  search:function(){
    var that = this
    var str = this.data.inputStr
    this.setData({ isShowKeyWordList: false })
    wx.getStorage({
      key: 'searchHistory',
      success: function (res) {
        if (str){
          var list = res.data
          var isNewWord = true
          if(list){
            for(var i=0;i<list.length;i++){
              if(str == list[i]){
                isNewWord = false
              }
            }
          }
          if(isNewWord){
            list.push(str)
            that.setData({ searchHistory: list })
          }
          
          wx.setStorage({
            key: 'searchHistory',
            data: list,
          })

          wx.navigateTo({
            url: '../searchProductList/searchProductList?key=' + str,
          })
        }
      },
      
    })
  },
  /**
   * 
   */
  itemClick:function(e){
    var keyWord = e.currentTarget.dataset.hi
    this.setData({ inputStr: keyWord, isShowKeyWordList: false})
    this.search()
  },
  /**
   * 清除历史搜索数据
   */
  clearHistory:function(){
    this.setData({ searchHistory: [] })
    wx.setStorage({
      key: 'searchHistory',
      data: [],
    })
  },
  /**
   * 获取热搜关键字
   */
  getHotSearch:function(){
    var that = this
    var url = app.data.HOST + 'productHotKeyword/listHotKeywordForSearchPage'
    var header = { 'Authorization': app.data.token, 'Content-Type': 'application/json' }
    var params = {}
    that.toastShow()
    HttpRequst.HttpRequst(url,'GET',params,
      function(res){
        that.toastHide()
        if(res && res.data && res.data.code == 100){
          that.setData({ hotSearch: res.data.content})
        }
      },
      function(res){
        that.toastHide()
      })
  },
  /**
   * 历史搜索关键字被点击
   */
  historyClick:function(e){

  },
  /**
   * 热搜关键字被点击
   */
  hotClick:function(e){

  },

  toastShow: function () {
    var toastStatus = false
    this.setData({ toastStatus: toastStatus })　　　　//setData方法可以建立新的data属性，从而起到跟视图实时同步的效果
  },
  toastHide: function () {
    var toastStatus = true
    this.setData({ toastStatus: toastStatus })
  },
  login:function(){

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