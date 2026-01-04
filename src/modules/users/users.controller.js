const usersService = require('./users.service');
require('dotenv').config();
exports.getMe = async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.getYou = async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.body.userId);

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const user = await usersService.updateMe(req.user.id, req.body);

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};
const db = require('../../config/database');
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const baseUrl = process.env.BASE_URL;
    const avatarUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

    await db.execute(
      'UPDATE users SET profile_photo_url = ? WHERE id = ?',
      [avatarUrl, req.user.id]
    );

    res.json({
      success: true,
      url: avatarUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Avatar upload failed',
    });
  }
};
