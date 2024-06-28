const express = require('express')
const { loginUser, createUser, checkAuth, resetPasswordRequest, resetPassword } = require('../controller/Auth')
const { authenticateToken } = require('../services/common')
const router = express.Router()

router
.post('/Signup',createUser)
.post('/login',loginUser)
.get('/check',authenticateToken,checkAuth)
.post('/reset-password-request',resetPasswordRequest)
.post('/reset-password/:token',resetPassword)


exports.router = router