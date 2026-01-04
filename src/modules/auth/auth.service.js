const db = require('../../config/database');
const { generateOtp, getOtpExpiry } = require('../../utils/otp.util');
const { generateAccessToken, generateRefreshToken } = require('../../utils/token.util');

exports.sendOtp = async (phoneNumber) => {
  const otp = generateOtp();
  const expiresAt = getOtpExpiry();

  await db.execute(
    `INSERT INTO otp_requests (phone_number, otp_code, expires_at)
     VALUES (?, ?, ?)`,
    [phoneNumber, otp, expiresAt]
  );

  return {otp}; // TEMP: return OTP for mobile testing
};

exports.verifyOtp = async (phoneNumber, otp, deviceId) => {
  const [rows] = await db.execute(
    `SELECT * FROM otp_requests
     WHERE phone_number = ? AND otp_code = ? AND verified_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [phoneNumber, otp]
  );

  if (!rows.length) {
    throw new Error('Invalid OTP');
  }

  const otpRow = rows[0];

  if (new Date(otpRow.expires_at) < new Date()) {
    throw new Error('OTP expired');
  }

  await db.execute(
    `UPDATE otp_requests SET verified_at = NOW() WHERE id = ?`,
    [otpRow.id]
  );

  // Find or create user
  let [users] = await db.execute(
    `SELECT * FROM users WHERE phone_number = ?`,
    [phoneNumber]
  );

  let user;
  if (!users.length) {
    const [result] = await db.execute(
      `INSERT INTO users (phone_number, last_login_at)
       VALUES (?, NOW())`,
      [phoneNumber]
    );

    [users] = await db.execute(
      `SELECT * FROM users WHERE id = ?`,
      [result.insertId]
    );
  }

  user = users[0];

  // Tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await db.execute(
    `INSERT INTO auth_tokens (user_id, refresh_token, expires_at, device_id)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), ?)`,
    [user.id, refreshToken, deviceId]
  );

  return { user, accessToken, refreshToken };
};

exports.refreshToken = async (refreshToken) => {
  const [rows] = await db.execute(
    `SELECT * FROM auth_tokens WHERE refresh_token = ? AND is_revoked = FALSE`,
    [refreshToken]
  );

  if (!rows.length) {
    throw new Error('Invalid refresh token');
  }

  const tokenRow = rows[0];
  const accessToken = generateAccessToken({ id: tokenRow.user_id });

  return { accessToken };
};
