/* eslint-disable */
const Order = require('../models/order')
const uid = require('uid').uid
const pad = (v) => {
  return (v < 10) ? '0' + v : v
}
const getDateString = (d) => {
  let year = d.getFullYear()
  let month = pad(d.getMonth() + 1)
  let day = pad(d.getDate())
  let hour = pad(d.getHours())
  let min = pad(d.getMinutes())
  let sec = pad(d.getSeconds())

  return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec
}

const orderController = {
  getOrder: async (req, res) => {
    const uid = req.params.uid
    try {
      const data = await Order.findOne({
        uid
      })
      res.json(data)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
  orderResult: async (req, res) => {
    const uid = req.body.MerchantTradeNo
    const success = req.body.RtnCode
    try {
      const data = await Order.findOne({
        uid
      })
      res.render('order-history-one-for-result', {
        data,
        success
      })
    } catch (err) {
      req.flash('errorMessage', '讀取錯誤，請至歷史訂單再查詢一次')
      res.render('order-history-one-for-result')
    }
  },
  getOrders: async (req, res) => {
    try {
      const data = await Order.find()
      res.json(data)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
  createOrder: async (req, res, next) => {
    const { name, tel, email, address, count, total, itemData } = req.body
    if(!name || !tel || !email || !address) {
      req.flash('errorMessage', '基本資料將作為運送資訊，請勿空白')
      res.redirect('back')
      return
    }
    if(!count || !itemData) {
      req.flash('errorMessage', '請選購商品再送出')
      res.redirect('back')
      return
    }
    const uidid = uid(20)
    const order = new Order({
      uid: uidid,
      items: itemData,
      count: count,
      total: total,
      contact: {
        name,
        tel,
        email,
        address
      },
      paid: 0,
    })
    try {
      const data = await order.save()
      res.locals.alterDate = getDateString(data.created_at)
      res.locals.uid = uidid
      next()
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請再試一次')
      res.redirect('back')
    }
  },
  modifyOrder: async (req, res, next) => {
    const { MerchantTradeNo, PaymentDate, RtnCode } = req.body
    try {
      const data = await Order.updateOne({
        uid: MerchantTradeNo
      }, {
        $set: {
          paid: (RtnCode == 1) ? 1 : 0,
          updated_at: PaymentDate
        }
      })
      next()
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
}
module.exports = orderController
