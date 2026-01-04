const db = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const [rows] = await db.execute(
      `SELECT id
       FROM subscriptions
       WHERE user_id = ?
         AND status = 'active'
         AND starts_at <= NOW()
         AND ends_at >= NOW()
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required'
      });
    }

    // optional: attach subscription info later
    req.subscription = rows[0];

    next();
  } catch (err) {
    next(err);
  }
};
