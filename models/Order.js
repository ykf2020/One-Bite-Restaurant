/* eslint-disable */
const mongoose = require('mongoose')
const OrderSchema = mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  items: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  contact: {
    type: Object,
    required: true
  },
  paid: {
    type: Number,
    require: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Orders', OrderSchema)
