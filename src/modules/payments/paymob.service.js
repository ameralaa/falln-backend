const axios = require('axios');
require('dotenv').config();
exports.getAuthToken = async () => {
  const res = await axios.post(
    `${process.env.PAYMOB_BASE}/auth/tokens`,
    {
      api_key: process.env.PAYMOB_API_KEY,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data.token;
};

exports.createOrder = async (token, userId, amountCents) => {
  const res = await axios.post(
    `${process.env.PAYMOB_BASE}/ecommerce/orders`,
    {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: process.env.PAYMOB_CURRENCY || 'EGP',
      merchant_order_id: userId,
      items: [
        {
          name: 'Harmony Subscription',
          amount_cents: amountCents,
          description: 'App payment',
          quantity: 1,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data.id;
};

exports.getPaymentKey = async (
  token,
  orderId,
  amountCents,
  user
) => {
  const res = await axios.post(
    `${process.env.PAYMOB_BASE}/acceptance/payment_keys`,
    {
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      currency: process.env.PAYMOB_CURRENCY || 'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
      billing_data: {
        email: user.email || 'user@harmony.app',
        phone_number: user.phone_number || '01000000000',
        first_name: user.full_name || 'User',
        last_name: 'Harmony',
        country: 'EG',
        city: 'Cairo',
        street: 'NA',
        building: 'NA',
        floor: 'NA',
        apartment: 'NA',
        postal_code: '00000',
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data.token;
};
