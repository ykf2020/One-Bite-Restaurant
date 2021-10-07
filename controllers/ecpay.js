/* eslint-disable */
const ecpay_payment = require('../node_modules/ECPAY_Payment_node_js')
require('dotenv/config')
let inv_params = {}
const options = require('../node_modules/ECPAY_Payment_node_js/conf/config-example')
const ecpayController = {
  payByCreditCard: (req, res) => {
    const { name, tel, email, address, total, itemstring } = req.body
    const { uid, alterDate } = res.locals
    const desc = "感謝您的購買，您的訂單號碼為： " + uid
    const param = {
      MerchantTradeNo: uid,
      MerchantTradeDate: alterDate,
      TotalAmount: total,
      TradeDesc: desc,
      ItemName: itemstring,
      ReturnURL: process.env.URL + '/catch-result',
      OrderResultURL: process.env.URL + '/action-result',
      CustomField1: email
    }
    create = new ecpay_payment(options)
    htm = create.payment_client.aio_check_out_credit_onetime(parameters = param, invoice = inv_params)
    res.send(htm)
  },
}
module.exports = ecpayController
