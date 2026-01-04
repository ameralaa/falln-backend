

const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const subscription = require('../../middlewares/subscription.middleware');
const aiController = require('./ai.controller');

router.post('/single-vibe', auth , subscription, aiController.singleVibe);
router.post('/multi-pattern', auth , subscription, aiController.multiPattern);
router.post('/conversation-report', auth , subscription, aiController.conversationReport);

module.exports = router;
