/* eslint-disable */
const Item = require('../models/item')
const cartController = {
  getItem: async (req, res) => {
    const currentCartData = []
    if (!req.session.cart) {
      res.json(currentCartData)
    } else {
      try {
        for (let i = 0; i < req.session.cart.length; i++) {
          let itemInfo = await Item.findOne({
            _id: req.session.cart[i].itemId
          })
          currentCartData.push({
            itemId: req.session.cart[i].itemId,
            itemName: itemInfo.name,
            image: itemInfo.picture,
            amount: req.session.cart[i].amount,
            itemPrice: itemInfo.price
          })
        }
        res.json(currentCartData)
      } catch (err) {
        res.json({
          message: err
        })
      }
    }
  },
  addItem: async (req, res) => {
    const currentCartData = []
    const itemId = req.params.itemId
    if (!req.session.cart) {
      req.session.cart = []
    }
    const index = req.session.cart.findIndex(item => item.itemId === itemId)
    if (index !== -1) {
      req.session.cart[index].amount = parseInt(req.session.cart[index].amount) + 1
    } else {
      req.session.cart.push({
        itemId,
        amount: 1
      })
    }
    try {
      for (let i = 0; i < req.session.cart.length; i++) {
        let itemInfo = await Item.findOne({
          _id: req.session.cart[i].itemId
        })
        currentCartData.push({
          itemId: req.session.cart[i].itemId,
          itemName: itemInfo.name,
          image: itemInfo.picture,
          amount: req.session.cart[i].amount,
          itemPrice: itemInfo.price
        })
      }
      res.json(currentCartData)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
  removeItem: async (req, res) => {
    const currentCartData = []
    const itemId = req.params.itemId
    req.session.cart = req.session.cart.filter(item => item.itemId != itemId)
    res.redirect('/order')
  },
  changeItem: async (req, res) => {
    const currentCartData = []
    const itemId = req.params.itemId
    const changedAmount = req.body.amount
    const index = req.session.cart.findIndex(item => item.itemId === itemId)
    if (changedAmount >= 1) {
      req.session.cart[index].amount = changedAmount
    } else {
      req.session.cart.splice(index, 1)
    }
    res.redirect('/order')
  },
  clearCart: (req, res, next) => {
    req.session.cart = null
    next()
  }
}
module.exports = cartController
