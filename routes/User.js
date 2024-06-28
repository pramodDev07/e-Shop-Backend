const express = require('express')
const { fetchUserById, updateUser, profileUpdate } = require('../controller/User')
const { authenticateToken } = require('../services/common')

const router = express.Router()

router
.get('/own',authenticateToken,fetchUserById)
.post('/updateUser/:id',updateUser)
.patch('/profile/:id',profileUpdate)

exports.router = router