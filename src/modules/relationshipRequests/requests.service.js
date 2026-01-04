const db = require('../../config/database');

exports.sendRequest = async ({ senderId, receiverPhone, message }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // get sender
    const [[sender]] = await conn.execute(
      `SELECT relationship_status FROM users WHERE id = ?`,
      [senderId]
    );

    if (sender.relationship_status !== 'single') {
      throw new Error('You are already taken');
    }

    // get receiver
    const [[receiver]] = await conn.execute(
      `SELECT id, relationship_status FROM users WHERE phone_number = ?`,
      [receiverPhone]
    );

    if (!receiver) {
      throw new Error('User not found');
    }

    if (receiver.relationship_status !== 'single') {
      throw new Error('User already taken');
    }

    // check pending request
    const [existing] = await conn.execute(
      `SELECT id FROM relationship_requests
       WHERE sender_user_id = ? AND receiver_user_id = ? AND status = 'pending'`,
      [senderId, receiver.id]
    );

    if (existing.length) {
      throw new Error('Request already sent');
    }

    await conn.execute(
      `INSERT INTO relationship_requests
       (sender_user_id, receiver_user_id, message)
       VALUES (?, ?, ?)`,
      [senderId, receiver.id, message || null]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.listRequests = async (userId) => {
  const [sent] = await db.execute(
    `SELECT * FROM relationship_requests
     WHERE sender_user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  const [received] = await db.execute(
    `SELECT * FROM relationship_requests
     WHERE receiver_user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return { sent, received };
};

exports.acceptRequest = async ({ requestId, userId }) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[req]] = await conn.execute(
      `
      SELECT * FROM relationship_requests
      WHERE id = ? AND receiver_user_id = ? AND status = 'pending'
      `,
      [requestId, userId]
    );

    if (!req) throw new Error('Request not found');

    const senderId = req.sender_user_id;
    const receiverId = req.receiver_user_id;

    // 1️⃣ accept this request
    await conn.execute(
      `
      UPDATE relationship_requests
      SET status = 'accepted', responded_at = NOW()
      WHERE id = ?
      `,
      [requestId]
    );

    // 2️⃣ cancel ALL other pending requests for both users
    await conn.execute(
      `
      UPDATE relationship_requests
      SET status = 'cancelled'
      WHERE status = 'pending'
        AND (
          sender_user_id IN (?, ?)
          OR receiver_user_id IN (?, ?)
        )
      `,
      [senderId, receiverId, senderId, receiverId]
    );

    // 3️⃣ update users
    await conn.execute(
      `
      UPDATE users
      SET relationship_status = 'taken', partner_user_id = ?
      WHERE id = ?
      `,
      [receiverId, senderId]
    );

    await conn.execute(
      `
      UPDATE users
      SET relationship_status = 'taken', partner_user_id = ?
      WHERE id = ?
      `,
      [senderId, receiverId]
    );

    // 4️⃣ create conversation if not exists
    const userOne = Math.min(senderId, receiverId);
    const userTwo = Math.max(senderId, receiverId);

    let conversationId;

    const [[existingConv]] = await conn.execute(
      `
      SELECT id FROM conversations
      WHERE user_one_id = ? AND user_two_id = ?
      `,
      [userOne, userTwo]
    );

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const [insertConv] = await conn.execute(
        `
        INSERT INTO conversations (user_one_id, user_two_id)
        VALUES (?, ?)
        `,
        [userOne, userTwo]
      );

      conversationId = insertConv.insertId;

      // 🔥 5️⃣ CREATE AI STATE (THIS WAS MISSING)
      await conn.execute(
        `
        INSERT INTO conversation_ai_state
        (conversation_id, mood_score, tension_level, ai_mode, interventions_today)
        VALUES (?, 0, 0, 'observer', 0)
        `,
        [conversationId]
      );
    }

    await conn.commit();

    return { conversationId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


exports.rejectRequest = async ({ requestId, userId }) => {
  const [result] = await db.execute(
    `UPDATE relationship_requests
     SET status = 'rejected', responded_at = NOW()
     WHERE id = ? AND receiver_user_id = ? AND status = 'pending'`,
    [requestId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Request not found or already handled');
  }
};


exports.cancelRequest = async ({ requestId, userId }) => {
  const [result] = await db.execute(
    `UPDATE relationship_requests
     SET status = 'cancelled'
     WHERE id = ? AND sender_user_id = ? AND status = 'pending'`,
    [requestId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Request not found or already handled');
  }
};
