const db = require('../../config/database');

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

async function createOTP(phoneNumber, otp) {
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await db.query(
    `
    INSERT INTO otp_requests
    (phone_number, otp_code, expires_at, attempts)
    VALUES (?, ?, ?, 0)
    `,
    [phoneNumber, otp, expiresAt]
  );
}

async function getActiveOTP(phoneNumber) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM otp_requests
    WHERE phone_number = ?
      AND verified_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [phoneNumber]
  );

  return rows[0] || null;
}

async function incrementAttempts(id) {
  await db.query(
    `
    UPDATE otp_requests
    SET attempts = attempts + 1
    WHERE id = ?
    `,
    [id]
  );
}

async function markVerified(id) {
  await db.query(
    `
    UPDATE otp_requests
    SET verified_at = NOW()
    WHERE id = ?
    `,
    [id]
  );
}

module.exports = {
  createOTP,
  getActiveOTP,
  incrementAttempts,
  markVerified,
  MAX_ATTEMPTS
};
