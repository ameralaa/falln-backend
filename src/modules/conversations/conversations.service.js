const db = require('../../config/database');

exports.takeBreak = async ({ userId, conversationId }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[conv]] = await conn.execute(
      `SELECT * FROM conversations
       WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)`,
      [conversationId, userId, userId]
    );

    if (!conv) throw new Error('Conversation not found');

    // delete messages
    await conn.execute(
      `DELETE FROM messages WHERE conversation_id = ?`,
      [conversationId]
    );

    // delete conversation
    await conn.execute(
      `DELETE FROM conversations WHERE id = ?`,
      [conversationId]
    );

    // update users
    await conn.execute(
      `UPDATE users
       SET relationship_status = 'single', partner_user_id = NULL
       WHERE id IN (?, ?)`,
      [conv.user_one_id, conv.user_two_id]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.getUserConversationState = async (userId) => {
  // 1️⃣ Get conversation (if any)
  const [conversations] = await db.execute(
    `
    SELECT *
    FROM conversations
    WHERE user_one_id = ? OR user_two_id = ?
    LIMIT 1
    `,
    [userId, userId]
  );

  const conversation =
    conversations.length > 0 ? conversations[0] : null;

  let partnerUser = null;

  // 2️⃣ If conversation exists, fetch the other user
  if (conversation) {
    const partnerUserId =
      conversation.user_one_id === userId
        ? conversation.user_two_id
        : conversation.user_one_id;

    const [[user]] = await db.execute(
      `
      SELECT
        id,
        full_name,
        phone_number,
        profile_photo_url
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [partnerUserId]
    );

    partnerUser = user || null;
  }

  // 3️⃣ Check active subscription
  const [subs] = await db.execute(
    `
    SELECT 1
    FROM subscriptions
    WHERE user_id = ?
      AND status = 'active'
      AND starts_at <= NOW()
      AND ends_at >= NOW()
    LIMIT 1
    `,
    [userId]
  );

  const subscriptionActive = subs.length > 0;

  return {
    subscriptionActive,
    conversation,
    partnerUser
  };
};
