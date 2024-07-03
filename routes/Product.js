const express = require('express')
const { fetchAllProducts, createProduct, fetchProductById, updateProduct } = require('../controller/Product');
const { Brand } = require('../model/Brand');

const router = express.Router()

router
.post('/',createProduct)
.get('/',fetchAllProducts)
.get('/:id',fetchProductById)
.patch('/:id',updateProduct)

   


exports.router = router