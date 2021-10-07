/* eslint-disable */
const Item = require('../models/item')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const itemController = {
  createItem: async (req, res) => {
    const { name, price }  = req.body
    if(!name || !price || !res.locals.key) {
      req.flash('errorMessage', '品名與價格及圖片皆為必填')
      res.redirect('back')
      return
    }
    const item = new Item({
      name,
      price,
      picture: res.locals.key
    })
    try {
      const data = await item.save()
      res.redirect('/backstage/menu')
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  getItems: async (req, res) => {
    try {
      const data = await Item.find()
      res.json(data)
    } catch (err) {
      res.json({ message : err })
    }
  },
  editItem: async (req, res) => {
    const picture = req.file ? res.locals.newkey : undefined
    const { id, name, price }  = req.body
    if(!name || !price) {
      req.flash('errorMessage', '品名與價格皆為必填')
      res.redirect('back')
      return
    }
    try {
      const data = await Item.updateOne({
        _id: id
      }, {
        $set: {
          name,
          price,
          picture: picture,
          updated_at: Date.now()
        }
      }, {
        omitUndefined: true
      })
      res.redirect('/backstage/menu')
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  deleteItem: async (req, res) => {
    const id = req.params.id
    try {
      const result = await Item.deleteOne({
        _id: id
      })
      res.redirect('/backstage/menu')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  }
}
module.exports = itemController
