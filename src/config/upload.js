const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const createStorage = (basePath) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, basePath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });

exports.profileUpload = multer({
  storage: createStorage('uploads/profiles'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.chatImageUpload = multer({
  storage: createStorage('uploads/chats/images'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.chatAudioUpload = multer({
  storage: createStorage('uploads/chats/audio'),
  limits: { fileSize: 20 * 1024 * 1024 },
});

exports.chatVideoUpload = multer({
  storage: createStorage('uploads/chats/video'),
  limits: { fileSize: 50 * 1024 * 1024 },
});
