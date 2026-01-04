const db = require('../../config/database');

async function createAIRequest({
  userId,
  conversationId,
  requestType,
  inputMessageCount,
  model,
  status,
  inputTokens,
  outputTokens,
  errorCode
}) {
  const [result] = await db.query(
    `
    INSERT INTO ai_requests
    (user_id, conversation_id, request_type, input_message_count, model, status, input_tokens, output_tokens, error_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      conversationId,
      requestType,
      inputMessageCount,
      model,
      status,
      inputTokens,
      outputTokens,
      errorCode || null
    ]
  );

  return result.insertId;
}

module.exports = { createAIRequest };
