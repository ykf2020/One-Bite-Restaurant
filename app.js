/* eslint-disable */
const express = require('express')
const bcrypt = require('bcryptjs')
const app = express()
const mongoose = require('mongoose')
const multer = require('multer')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const port = process.env.PORT || 5000
const questionController = require('./controllers/question')
const itemController = require('./controllers/item')
const lotteryController = require('./controllers/lottery')
const cartController = require('./controllers/cart')
const ecpayController = require('./controllers/ecpay')
const fileController = require('./controllers/file')
const mailController = require('./controllers/mail')
const orderController = require('./controllers/order')
require('dotenv/config')

// middlewares
app.set('view engine', 'ejs')
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}))
app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLogin
  res.locals.cart = req.session.cart
  res.locals.errorMessage = req.flash('errorMessage')
  next()
})
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

const upload = multer({
  dest: 'uploads/',
  limit: {
    fileSize: 100000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload an image'))
    }
    cb(null, true)
  }
})

function checkPermission(req, res, next) {
  if (req.session.isLogin) {
    next()
  } else {
    res.redirect('/login')
  }
}



// getImageFromS3
app.get('/apis/get-image/:key', fileController.LoadFile)

//金流
app.post('/action-result', orderController.orderResult)
app.post('/catch-result', orderController.modifyOrder, mailController.sendMail)
app.post('/payment', orderController.createOrder, ecpayController.payByCreditCard, cartController.clearCart)

// rendering page
app.get('/', (req, res) => {
  res.render('index')
})
app.get('/menu', (req, res) => {
  res.render('menu')
})
app.get('/order', (req, res) => {
  res.render('order')
})
app.get('/order-history', (req, res) => {
  res.render('order-history')
})
app.get('/order-history/:uid', (req, res) => {
  res.render('order-history-one')
})
app.get('/questions', (req, res) => {
  res.render('questions')
})
app.get('/lottery', (req, res) => {
  res.render('lottery')
})

// rendering backstage page
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/backstage', checkPermission, (req, res) => {
  res.render('backstage_menu')
})
app.get('/backstage/questions', checkPermission, (req, res) => {
  res.render('backstage_questions')
})
app.get('/backstage/lottery', checkPermission, (req, res) => {
  res.render('backstage_lottery')
})
app.get('/backstage/menu', checkPermission, (req, res) => {
  res.render('backstage_menu')
})

//order
app.get('/apis/get-orders', orderController.getOrders)
app.get('/apis/get-order/:uid', orderController.getOrder)

//cart
app.get('/apis/get-cart', cartController.getItem)
app.get('/apis/add-cart/:itemId', cartController.addItem)
app.get('/apis/delete-cart/:itemId', cartController.removeItem)
app.post('/apis/change-cart/:itemId', cartController.changeItem)

// questionAPI
app.get('/apis/questions', questionController.getAll)
app.post('/apis/edit-question/:id', checkPermission, questionController.editQuestion)
app.get('/apis/delete-question/:id', checkPermission, questionController.deleteQuestion)
app.post('/apis/questions', checkPermission, questionController.createQuestion)
app.post('/apis/questions-order', checkPermission, questionController.changeQuestions)

// lotteryAPI
app.get('/apis/lotteries', lotteryController.getLotteries)
app.post('/apis/edit-lottery', checkPermission, upload.single('picture'), lotteryController.checkRate, fileController.putFile, lotteryController.editLottery)
app.get('/apis/delete-lottery/:id', checkPermission, fileController.deleteFile, lotteryController.deleteLottery)
app.post('/apis/create-lottery', checkPermission, upload.single('picture'), lotteryController.checkRate, fileController.uploadFile, lotteryController.createLottery)
app.get('/apis/drawing', lotteryController.draw)

// menuAPI
app.post('/apis/create-item', checkPermission, upload.single('picture'), fileController.uploadFile, itemController.createItem)
app.get('/apis/delete-item/:id', checkPermission, fileController.deleteFile, itemController.deleteItem)
app.get('/apis/items', itemController.getItems)
app.post('/apis/edit-item', checkPermission, upload.single('picture'), fileController.putFile, itemController.editItem)

//login, logout
app.post('/login', (req, res) => {
  if (req.body.username != 'admin') {
    req.flash('errorMessage', '帳密錯誤')
    return res.redirect('/login')
  }
  bcrypt.compare(req.body.password, process.env.PW, (error, result) => {
    if (error || !result) {
      req.flash('errorMessage', '帳密錯誤')
      return res.redirect('/login')
    }
    req.session.isLogin = true
    res.redirect('/backstage')
  })
})
app.get('/logout', (req, res) => {
  req.session.isLogin = null
  res.redirect('/')
})

// connect to DB
mongoose.connect(process.env.DB_CONNECTION, {
  useUnifiedTopology: true
}, () => {
  console.log('Connected to DB!')
})
// port listening
app.listen(port, () => {
  console.log(`App listening on port: ${port}`)
})
