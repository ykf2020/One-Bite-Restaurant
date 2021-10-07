/* eslint-disable */
const mongoose = require('mongoose')
const LotterySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    require: true
  },
  picture: {
    type:String,
    required: true
  },
  created_at:{
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Lotteries', LotterySchema)
