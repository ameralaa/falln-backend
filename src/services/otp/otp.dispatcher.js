const discordProvider = require('./providers/discord.provider');
require('dotenv').config();
async function sendOTP(payload) {
  if (process.env.OTP_PROVIDER !== 'discord') {
    throw new Error('Unsupported OTP provider');
  }

  return discordProvider.send(payload);
}

module.exports = { sendOTP };
