/* eslint-disable */
const Lottery = require('../models/lottery')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const lotteryController = {
  createLottery: async (req, res) => {
    const { name, description, rate}  = req.body
    const lottery = new Lottery({
      name: name,
      description: description,
      rate: rate,
      picture: res.locals.key
    })
    try {
      const data = await lottery.save()
      res.redirect('/backstage/lottery')
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  getLotteries: async (req, res) => {
    try {
      const data = await Lottery.find()
      res.json(data)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
  editLottery: async (req, res) => {
    const picture = req.file ? res.locals.newkey : undefined
    const { id, name, description, rate }  = req.body
    if(!name || !description || !rate) {
      req.flash('errorMessage', '品名與價格皆為必填，且中獎率不可為 0')
      res.redirect('back')
      return
    }
    try {
      const data = await Lottery.updateOne({
        _id: id
      }, {
        $set: {
          name: name,
          description: description,
          rate: rate,
          picture: picture,
          updated_at: Date.now()
        }
      }, {
        omitUndefined: true
      })
      res.redirect('/backstage/lottery')
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('/backstage/lottery')
    }
  },
  deleteLottery: async (req, res) => {
    const id = req.params.id
    try {
      const result = await Lottery.deleteOne({
        _id: id
      })
      res.redirect('/backstage/lottery')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('/backstage/lottery')
    }
  },
  checkRate: async (req, res, next) => {
    try {
      const data = await Lottery.aggregate([{
        $group: {
          _id: null,
          sum: {
            $sum: "$rate"
          }
        }
      }])
      let currentTotal = data.length !== 0 ? parseFloat(data[0].sum) : 0
      let total = parseFloat(req.body.rate) + currentTotal - parseFloat(req.body.old_rate)
      if (total > 100.1) {
        if(req.file) {
          await unlinkFile(req.file.path)
        }
        req.flash('errorMessage', '總中獎率超過100%，請修改')
        res.redirect('/backstage/lottery')
      } else {
        next()
      }
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('/backstage/lottery')
    }
  },
  draw: async (req, res) => {
    try {
      const data = await Lottery.find()
      let drawingList = []
      for (d of data) {
        drawingList.push({
          prize: d.name,
          description: d.description,
          rate: d.rate,
          picture: d.picture
        })
      }

      function draw(list) {
        let p = [0]
        let win = Math.floor(Math.random() * 1000 + 1)
        let result = false

        list.sort((a, b) => {
          if (parseFloat(a.rate) * 10 < parseFloat(b.rate) * 10) {
            return -1
          }
          if (parseFloat(a.rate) * 10 > parseFloat(b.rate) * 10) {
            return 1
          }
          return 0
        })

        for (let i = 0; i < list.length; i++) {
          p.push(p[i] + parseFloat(list[i].rate) * 10)
        }
        for (let j = 1; j < p.length; j++) {
          if (p[j - 1] < win && win <= p[j]) {
            return result = {
              prize: list[j - 1].prize,
              description: list[j - 1].description,
              picture: list[j - 1].picture
            }
          }
        }
        return result
      }
      let result = draw(drawingList)
      res.json(result)
    } catch (err) {
      res.json({
        message: err
      })
    }
  }
}

module.exports = lotteryController
