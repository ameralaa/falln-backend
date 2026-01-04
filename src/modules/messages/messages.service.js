const db = require('../../config/database');
exports.getConversationMessages = async (conversationId, userId) => {
  // verify access
  const [[conv]] = await db.execute(
    `SELECT id FROM conversations
     WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)`,
    [conversationId, userId, userId]
  );

  if (!conv) throw new Error('Access denied');

  const [messages] = await db.execute(
    `SELECT *
     FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return messages;
};

exports.sendMessage = async ({
  conversationId,
  senderId,
  messageType,
  content,
  mediaUrl,
  mediaType,
  duration
}) => {
  const [[conv]] = await db.execute(
    `SELECT id FROM conversations
     WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)`,
    [conversationId, senderId, senderId]
  );

  if (!conv) throw new Error('Access denied');

  const [result] = await db.execute(
    `INSERT INTO messages (
        conversation_id,
        sender_type,
        sender_user_id,
        message_type,
        content,
        media_url,
        media_type,
        duration_seconds,
        status
     )
     VALUES (?, 'user', ?, ?, ?, ?, ?, ?, 'sent')`,
    [
      conversationId,
      senderId,
      messageType || 'text',
      content || '',
      mediaUrl || null,
      mediaType || null,
      duration || null
    ]
  );

  const [[message]] = await db.execute(
    `SELECT * FROM messages WHERE id = ?`,
    [result.insertId]
  );
  
  return message;
};

exports.markDelivered = async (messageIds, userId) => {
  if (!messageIds.length) return;

  await db.execute(
    `UPDATE messages
     SET status = 'delivered'
     WHERE id IN (${messageIds.map(() => '?').join(',')})
       AND sender_user_id != ?`,
    [...messageIds, userId]
  );
};

exports.markRead = async (conversationId, userId) => {
  await db.execute(
    `UPDATE messages
     SET status = 'read'
     WHERE conversation_id = ?
       AND sender_user_id != ?
       AND status != 'read'`,
    [conversationId, userId]
  );
};
