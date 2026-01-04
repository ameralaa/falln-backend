const paymentsService = require('./payments.service');
const paymobService = require('./paymob.service');
const subscriptionService = require('../subscriptions/subscriptions.service');
const db = require('../../config/database');
const paymob = require('./paymob.service');
require('dotenv').config();
exports.initiatePayment = async (req, res) => {
  try {
    const user = req.user;
    const amountCents = Number(process.env.SUBSCRIPTION_PRICE_CENTS);

    const authToken = await paymob.getAuthToken();
    const orderId = await paymob.createOrder(
      authToken,
      user.id,
      amountCents
    );

    const paymentKey = await paymob.getPaymentKey(
      authToken,
      orderId,
      amountCents,
      user
    );

    // ✅ 1️⃣ SAVE PAYMENT AS PENDING
    await db.execute(
      `
      INSERT INTO payments (
        user_id,
        provider,
        transaction_id,
        amount,
        currency,
        status
      )
      VALUES (?, 'paymob', ?, ?, ?, 'pending')
      `,
      [
        user.id,
        orderId,                // temp transaction reference
        amountCents / 100,
        process.env.PAYMOB_CURRENCY,
      ]
    );

    res.json({
      success: true,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
    });
  }
};


const crypto = require('crypto');

function verifyPaymobHmac(req) {
  const receivedHmac = req.headers['hmac'];

  const calculatedHmac = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return receivedHmac === calculatedHmac;
}

exports.paymobWebhook = async (req, res) => {
  try {
    if (!verifyPaymobHmac(req)) {
      return res.status(401).json({ success: false });
    }

    const data = req.body.obj;

    const success = data.success === true;
    const userId = data.order.merchant_order_id;
    const paymobTxId = data.id;
    const orderId = data.order.id;
    const amount = data.amount_cents / 100;
    const currency = data.currency || 'USD';

    // 1️⃣ UPDATE PAYMENT RECORD
    await db.execute(
      `
      UPDATE payments
      SET
        transaction_id = ?,
        status = ?,
        amount = ?,
        currency = ?
      WHERE
        provider = 'paymob'
        AND transaction_id = ?
      `,
      [
        paymobTxId,
        success ? 'success' : 'failed',
        amount,
        currency,
        orderId, // match pending record
      ]
    );

    // 2️⃣ ACTIVATE SUBSCRIPTION ONLY IF SUCCESS
    if (success) {
      await db.execute(
        `
        INSERT INTO subscriptions (
          user_id,
          plan_name,
          status,
          starts_at,
          ends_at
        )
        VALUES (
          ?, 'monthly', 'active',
          NOW(),
          DATE_ADD(NOW(), INTERVAL 1 MONTH)
        )
        ON DUPLICATE KEY UPDATE
          status = 'active',
          starts_at = NOW(),
          ends_at = DATE_ADD(NOW(), INTERVAL 1 MONTH)
        `,
        [userId]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Paymob webhook error:', err);
    res.sendStatus(500);
  }
};

exports.listPayments = async (req, res, next) => {
  try {
    const payments = await paymentsService.getUserPayments(req.user.id);

    res.json({
      success: true,
      payments
    });
  } catch (err) {
    next(err);
  }
};
