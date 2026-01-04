const client = require('./ai.client');
const config = require('./ai.config');
const { normalizeAIError } = require('./ai.errors');

async function executeAI({ systemPrompt, userPrompt, useCase }) {
  try {
    const response = await client.chat.completions.create({
      model: config.models[useCase],
      temperature: config.temperature[useCase],
      max_tokens: config.maxTokens[useCase],
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (err) {
    throw normalizeAIError(err);
  }
}

module.exports = { executeAI };
