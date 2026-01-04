const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');

router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/refresh', controller.refresh);

module.exports = router;
