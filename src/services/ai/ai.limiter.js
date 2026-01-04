const db = require('../../config/database');

async function assertWithinLimits(userId, requestType) {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS cnt
    FROM ai_requests
    WHERE user_id = ?
      AND request_type = ?
      AND created_at >= NOW() - INTERVAL 24 HOUR
    `,
    [userId, requestType]
  );

  const limits = {
    single_vibe: 100,
    multi_pattern: 30,
    full_report: 5
  };

  if (rows[0].cnt >= limits[requestType]) {
    const err = new Error('AI limit exceeded');
    err.status = 429;
    throw err;
  }
}

module.exports = { assertWithinLimits };
