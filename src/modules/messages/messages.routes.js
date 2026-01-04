const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const subscription = require('../../middlewares/subscription.middleware');
const controller = require('./messages.controller');
const upload = require('../../config/upload');

router.post('/upload/image', auth, subscription, upload.chatImageUpload.single('file'), controller.uploadMedia);
router.post('/upload/audio', auth, subscription, upload.chatAudioUpload.single('file'), controller.uploadMedia);
router.post('/upload/video', auth, subscription, upload.chatVideoUpload.single('file'), controller.uploadMedia);
router.get(
  '/:conversationId',
  auth,
  subscription,
  controller.getMessages
);

router.post(
  '/',
  auth,
  subscription,
  controller.sendMessage
);

router.post(
  '/read',
  auth,
  subscription,
  controller.markRead
);

module.exports = router;
