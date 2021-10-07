/* eslint-disable */
const Question = require('../models/Question')
const questionController = {
  getAll: async (req, res) => {
    try {
      const data = await Question.find().sort({ order : 1})
      res.json(data)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
  createQuestion: async (req, res) => {
    const { title, answer } = req.body
    if(!title || !answer) {
      req.flash('errorMessage', '問題與答案皆為必填')
      res.redirect('back')
      return
    }
    const question = new Question({
      title,
      answer,
    })
    try {
      const data = await question.save()

      res.redirect('/backstage/questions')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  editQuestion: async (req, res) => {
    const { title, answer } = req.body
    if(!title || !answer) {
      req.flash('errorMessage', '問題與答案皆為必填')
      res.redirect('back')
      return
    }
    const id = req.params.id
    try {
      const data = await Question.updateOne({
        _id: id
      }, {
        $set: {
          title,
          answer,
          updated_at: Date.now()
        }
      })
      res.redirect('/backstage/questions')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  deleteQuestion: async (req, res) => {
    const id = req.params.id
    try {
      const result = await Question.deleteOne({
        _id: id
      })
      res.redirect('/backstage/questions')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  },
  changeQuestions: (req, res) => {
    const idList = req.body.id
    try {
       idList.map( async id => {
        const order = idList.findIndex(i => i == String(id))
         await Question.updateOne({
          _id: id
        },{
          $set: {
            order: order
          }
        })
      })
      res.redirect('/backstage/questions')
    } catch (err) {
      req.flash('errorMessage', '連線錯誤，請重試')
      res.redirect('back')
    }
  }
}
module.exports = questionController
