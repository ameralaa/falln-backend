const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
let client;

async function getClient() {
  if (client) return client;

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);
  return client;
}

async function send({ phoneNumber, otp }) {
  const discord = await getClient();
  const channel = await discord.channels.fetch(
    process.env.DISCORD_OTP_CHANNEL_ID
  );

  if (!channel) {
    throw new Error('Discord OTP channel not found');
  }

  await channel.send(
    `🔐 **OTP Generated**
Phone: \`${phoneNumber}\`
OTP: **${otp}**
Env: \`${process.env.NODE_ENV}\``
  );
}

module.exports = { send };
