const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const subscription = require('../../middlewares/subscription.middleware');
const controller = require('./conversations.controller')
router.post(
  '/:id/take-break',
  auth,
  subscription,
  controller.takeBreak
);
router.get('/me', auth, controller.getMyConversation);
module.exports = router;