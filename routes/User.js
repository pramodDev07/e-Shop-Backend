const express = require('express')
const { fetchUserById, updateUser, profileUpdate, roleUpdate } = require('../controller/User')
const { authenticateToken } = require('../services/common')

const router = express.Router()

router
.get('/own',authenticateToken,fetchUserById)
.post('/updateUser/:id',updateUser)
.patch('/profile/:id',profileUpdate)
.patch('/:id/switch-role',roleUpdate)

exports.router = router