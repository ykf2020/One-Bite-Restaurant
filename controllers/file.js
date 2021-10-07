/* eslint-disable */
const Item = require('../models/item')
const Lottery = require('../models/lottery')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const S3 = require('aws-sdk/clients/s3')
require('dotenv/config')

// S3
const s3 = new S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
})
// upload a file to S3
function uploadFileToS3(file) {
  const fileStream = fs.createReadStream(file.path)
  const uploadParams = {
    Bucket: 'week18',
    Body: fileStream,
    Key: file.filename
  }
  return s3.upload(uploadParams).promise()
}
// downloads a file from S3
function getFileStream(key) {
  const downloadParams = {
    Key: key,
    Bucket: 'week18'
  }
  return s3.getObject(downloadParams).createReadStream()
}
// delete a file from S3
function deleteFileFromS3(key) {
  const deleteParams = {
    Bucket: 'week18',
    Key: key,
  }
  return s3.deleteObject(deleteParams).promise()
}
// find picture key in mongo by _id
async function findKey(req) {
  const url = req.url
  const urlstring = url.replace(/\//g, '').toLowerCase()
  const id = req.params.id || req.body.id
  if (urlstring.includes('item')) {
    const data = await Item.findOne({
      _id: id
    })
    return data.picture
  } else {
    const data = await Lottery.findOne({
      _id: id
    })
    return data.picture
  }
}

const fileController = {
  uploadFile: async (req, res, next) => {
    try {
      const file = req.file
      const result = await uploadFileToS3(file)
      await unlinkFile(file.path)
      res.locals.key = result.key
      next()
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', 'S3連線錯誤，請重試')
      res.redirect('back')
    }
  },
  deleteFile: async (req, res, next) => {
    try {
      const key = await findKey(req)
      await deleteFileFromS3(key)
      next()
    } catch (err) {
      req.flash('errorMessage', 'S3連線錯誤，請重試')
      res.redirect('back')
    }
  },
  putFile: async (req, res, next) => {
    try {
      const oldkey = await findKey(req)
      const file = req.file
      if (req.file) {
        const result = await uploadFileToS3(file)
        await unlinkFile(file.path)
        await deleteFileFromS3(oldkey)
        res.locals.newkey = result.key
      }
      next()
    } catch (err) {
      if(req.file) {
        await unlinkFile(req.file.path)
      }
      req.flash('errorMessage', 'S3連線錯誤，請重試')
      res.redirect('back')
    }
  },
  LoadFile: async (req, res) => {
    try {
      const key = req.params.key
      const readStream = getFileStream(key)
      readStream.pipe(res)
    } catch (err) {
      res.json({
        message: err
      })
    }
  },
}

module.exports = fileController
