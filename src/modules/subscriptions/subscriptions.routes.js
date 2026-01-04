const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const controller = require('./subscriptions.controller');

router.get('/', auth, controller.list);

module.exports = router;
