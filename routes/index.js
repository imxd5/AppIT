const express = require('express');
const router = express.Router();

// import api
const registerApi = require('../api/register');
const loginApi = require('../api/login');

// useapi
router.use('/register', registerApi);
router.use('/login', loginApi);

module.exports = router;
