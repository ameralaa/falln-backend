const service = require('./messages.service');
require('dotenv').config();
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await service.getConversationMessages(
      req.params.conversationId,
      req.user.id
    );

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.body.conversationId; 

    const message = await service.sendMessage({
      conversationId,
      senderId: req.user.id,
      messageType: req.body.messageType,
      content: req.body.content,
      mediaUrl: req.body.mediaUrl,
      mediaType: req.body.mediaType,
      duration: req.body.duration,
    });
        // ✅ EMIT USER MESSAGE
    req.io
      .to(`conversation_${conversationId}`)
      .emit('message:new', message);

    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};


exports.markRead = async (req, res, next) => {
  try {
    await service.markRead(req.body.conversationId, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const baseUrl = process.env.BASE_URL;

    // req.file.destination example: uploads/chats/images
    const relativePath = req.file.destination.replace('uploads/', '');

    const fileUrl = `${baseUrl}/uploads/${relativePath}/${req.file.filename}`;

    return res.json({
      success: true,
      url: fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
    });
  }
};
