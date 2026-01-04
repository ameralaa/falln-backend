const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const controller = require('./payments.controller');

router.post('/initiate', auth, controller.initiatePayment);
router.get('/', auth, controller.listPayments);
router.post('/webhook/paymob',auth , controller.paymobWebhook);

module.exports = router;
