/* eslint-disable */
const sgMail = require('@sendgrid/mail')
require('dotenv/config')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const mailController = {
  sendMail: async (req, res) => {
    const { MerchantTradeNo, PaymentDate, RtnCode, CustomField1 } = req.body
    const msg = {
      to: CustomField1, // Change to your recipient
      from: 'yukun0620@gmail.com', // Change to your verified sender
      subject: '訂單完成通知信',
      text: '您的訂單已完成，可至【官網】 => 【查詢訂單】，進行查詢，感謝您的購買！ ',
      html: `<strong>您的訂單已完成，可<a href="${process.env.URL}/order-history/${MerchantTradeNo}">點選此連結</a>或至【官網】 => 【查詢訂單】，進行查詢，感謝您的購買！</strong>`,
    }
    try {
      if (RtnCode == 1) {
        await sgMail.send(msg)
        res.send('3Q')
      } else {
        res.send('No Q')
      }
    } catch (err) {
      res.json({
        message: err
      })
    }
  }
}

module.exports = mailController
