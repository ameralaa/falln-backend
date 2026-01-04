const authService = require('./auth.service');

const { generateOTP } = require('../../services/otp/otp.generator');
const {
  createOTP,
  getActiveOTP,
  incrementAttempts,
  markVerified,
  MAX_ATTEMPTS
} = require('../../services/otp/otp.repository');

const { sendOTP } = require('../../services/otp/otp.dispatcher');

/**
 * POST /auth/send-otp
 */
async function sendOtp(req, res) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const otp = generateOTP();

    await createOTP(phoneNumber, otp);
    await sendOTP({ phoneNumber, otp });

    return res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');


const db = require('../../config/database');

/**
 * POST /auth/verify-otp
 */
async function verifyOtp(req, res) {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // 1️⃣ Validate OTP
    const record = await getActiveOTP(phoneNumber);

    if (!record) {
      return res.status(401).json({ error: 'OTP expired or invalid' });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts' });
    }

    if (record.otp_code !== otp) {
      await incrementAttempts(record.id);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // 2️⃣ Mark OTP as verified
    await markVerified(record.id);

    // 3️⃣ Check if user exists
    const [[existingUser]] = await db.query(
      `
      SELECT id, phone_number, full_name, profile_photo_url
      FROM users
      WHERE phone_number = ?
      LIMIT 1
      `,
      [phoneNumber]
    );

    let user = existingUser;
    let firstLogin = false;

    // 4️⃣ Create user if first login
    if (!user) {
      const [result] = await db.query(
        `
        INSERT INTO users (phone_number, is_active, created_at)
        VALUES (?, 1, NOW())
        `,
        [phoneNumber]
      );

      const [[newUser]] = await db.query(
        `
        SELECT id, phone_number, full_name, profile_photo_url
        FROM users
        WHERE id = ?
        `,
        [result.insertId]
      );

      user = newUser;
      firstLogin = true;
    }

    // 5️⃣ Issue tokens (aligned with existing JWT config)
    const accessToken = jwt.sign(
      { userId: user.id },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );

    // 6️⃣ Return response
    return res.json({
      accessToken,
      refreshToken,
      firstLogin,
      user
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ error: 'OTP verification failed' });
  }
}



/**
 * POST /auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ✅ SINGLE EXPORT (THIS FIXES EVERYTHING)
 */
module.exports = {
  sendOtp,
  verifyOtp,
  refresh
};
