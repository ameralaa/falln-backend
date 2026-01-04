const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const subscription = require('../../middlewares/subscription.middleware');
const controller = require('./requests.controller');

router.post('/', auth, subscription, controller.send);
router.get('/', auth, subscription, controller.list);

router.post('/:id/accept', auth, subscription, controller.accept);
router.post('/:id/reject', auth, subscription, controller.reject);
router.post('/:id/cancel', auth, subscription, controller.cancel);

module.exports = router;
