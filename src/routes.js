const express = require('express');
const router = express.Router();

// AUTH
router.use('/auth', require('./modules/auth/auth.routes'));

// USERS
router.use('/users', require('./modules/users/users.routes'));

router.use('/payments', require('./modules/payments/payments.routes'));

router.use('/subscriptions', require('./modules/subscriptions/subscriptions.routes'));

// RELATIONSHIP REQUESTS
router.use('/relationship-requests', require('./modules/relationshipRequests/requests.routes'));

// CONVERSATIONS
router.use('/conversations', require('./modules/conversations/conversations.routes'));

// MESSAGES
router.use('/messages', require('./modules/messages/messages.routes'));

// AI
router.use('/ai', require('./modules/ai/ai.routes'));

module.exports = router;
