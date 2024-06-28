const express = require('express')
const { fetchAllOrders, updateOrder, fetchOrderByUser, createOrder, fetchSuccessOrders } = require('../controller/Order')
const router = express.Router()

router
.get("/",fetchAllOrders)
.post("/",createOrder)
.patch("/updateOrder/:id",updateOrder)
.get("/userOrder/:id",fetchOrderByUser)
.get("/successOrders/:id",fetchSuccessOrders)

exports.router = router