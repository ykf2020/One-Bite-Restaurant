/* eslint-disable */
const mongoose = require('mongoose')

const QuestionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 99
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

module.exports = mongoose.model('Questions', QuestionSchema)
