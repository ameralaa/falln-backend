const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth.middleware');
const controller = require('./users.controller');
const { profileUpload } = require('../../config/upload');
router.get('/me', auth, controller.getMe);
router.get('/you', auth, controller.getYou);
router.put('/me', auth, controller.updateMe);
router.post(
  '/avatar',
  auth,
  profileUpload.single('avatar'),
  controller.uploadAvatar
);

module.exports = router;
