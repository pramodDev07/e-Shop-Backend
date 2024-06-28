const express = require('express')
const { fetchCartByUser, addToCart, updateCart, deleteCart, clearCartItem } = require('../controller/Cart')

const router = express.Router()

router
.get('/:id',fetchCartByUser)
.post('/addToCart',addToCart)
.patch('/updateCart/:id',updateCart)
.delete('/deleteCart/:id',deleteCart)
.delete('/clearCart/:id',clearCartItem)

exports.router = router