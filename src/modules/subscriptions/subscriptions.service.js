const db = require('../../config/database');

exports.activateSubscription = async ({
  userId,
  planName,
  durationDays = 30
}) => {
  // expire old active subscriptions
  await db.execute(
    `UPDATE subscriptions
     SET status = 'expired'
     WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  await db.execute(
    `INSERT INTO subscriptions (
        user_id,
        plan_name,
        status,
        starts_at,
        ends_at
     )
     VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [userId, planName, durationDays]
  );
};

exports.getUserSubscriptions = async (userId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};
