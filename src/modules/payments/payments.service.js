const db = require('../../config/database');
exports.createPendingPayment = async ({
  userId,
  provider,
  transactionId,
  amount,
  currency
}) => {
  await db.execute(
    `INSERT INTO payments (
        user_id,
        provider,
        transaction_id,
        amount,
        currency,
        status
     )
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [userId, provider, transactionId, amount, currency]
  );
};

exports.markPaymentSuccess = async (transactionId) => {
  await db.execute(
    `UPDATE payments
     SET status = 'success'
     WHERE transaction_id = ?`,
    [transactionId]
  );
};

exports.getUserPayments = async (userId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM payments
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};
