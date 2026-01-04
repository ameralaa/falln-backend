const db = require('../../config/database');
const { loadPrompt } = require('../../services/ai/ai.prompts.loader');
const { runSingleVibe } = require('../../services/ai/use-cases/singleVibe');
const { runGenericAI } = require('../../services/ai/use-cases/aiGeneric');

const { createAIRequest } = require('../../services/ai/ai.repository');
const { assertWithinLimits } = require('../../services/ai/ai.limiter');

async function singleVibe(req, res) {
  const userId = req.user.id;
  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  await assertWithinLimits(userId, 'single_vibe');

  const [[message]] = await db.query(
    `SELECT content FROM messages WHERE id = ?`,
    [messageId]
  );

    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }


  const systemPrompt = loadPrompt('system.md');

  const { result, usage } = await runSingleVibe({
    systemPrompt,
    messageText: message.content
  });

  await createAIRequest({
    userId,
    conversationId: null,
    requestType: 'single_vibe',
    inputMessageCount: 1,
    model: 'gpt-4o-mini',
    status: 'success',
    inputTokens: usage?.prompt_tokens,
    outputTokens: usage?.completion_tokens
  });


  return res.json({ result });
}


async function multiPattern(req, res) {
  const userId = req.user.id;
  const { conversationId, messageIds } = req.body;

  if (
    !conversationId ||
    !Array.isArray(messageIds) ||
    messageIds.length < 2 ||
    messageIds.length > 5
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  await assertWithinLimits(userId, 'multi_pattern');

  const [messages] = await db.query(
    `
    SELECT sender_type, content
    FROM messages
    WHERE id IN (?)
    ORDER BY created_at ASC
    `,
    [messageIds]
  );

  if (!messages.length) {
    return res.status(404).json({ error: 'Messages not found' });
  }

  const formattedMessages = messages
    .map(m => `[${m.sender_type}]: ${m.content}`)
    .join('\n');

  const systemPrompt = loadPrompt('system.md');

  const { result, usage } = await runGenericAI({
    systemPrompt,
    promptFile: 'multi.md',
    variables: {
      SELECTED_MESSAGES_LIST: formattedMessages
    },
    useCase: 'multi_pattern',
    expectsJson: false
  });

  await createAIRequest({
    userId,
    conversationId,
    requestType: 'multi_pattern',
    inputMessageCount: messageIds.length,
    model: 'gpt-4o',
    status: 'success',
    inputTokens: usage?.prompt_tokens,
    outputTokens: usage?.completion_tokens
  });

  return res.json({ result });
}


async function conversationReport(req, res) {
  const userId = req.user.id;
  const { conversationId } = req.body;

  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }

  await assertWithinLimits(userId, 'full_report');

  const [messages] = await db.query(
    `
    SELECT sender_type, content
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    `,
    [conversationId]
  );

  if (!messages.length) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const fullHistory = messages
    .map(m => `[${m.sender_type}]: ${m.content}`)
    .join('\n');

  const systemPrompt = loadPrompt('system.md');

  const { result, usage } = await runGenericAI({
    systemPrompt,
    promptFile: 'report.md',
    variables: {
      FULL_CHAT_HISTORY: fullHistory
    },
    useCase: 'full_report',
    expectsJson: true
  });

  let parsed;
  try {
    parsed = JSON.parse(result);
  } catch (err) {
    console.error('Invalid AI JSON:', result);
    return res.status(500).json({ error: 'Invalid AI JSON response' });
  }

  await createAIRequest({
    userId,
    conversationId,
    requestType: 'full_report',
    inputMessageCount: messages.length,
    model: 'gpt-4o',
    status: 'success',
    inputTokens: usage?.prompt_tokens,
    outputTokens: usage?.completion_tokens
  });

  return res.json(parsed);
}

module.exports = {
  singleVibe,
  multiPattern,
  conversationReport
};
