const express = require('express')
const { createCategory, fetchCategories } = require('../controller/Category')

const router = express.Router()

router
.get('/',fetchCategories)
.post('/',createCategory)

exports.router = router