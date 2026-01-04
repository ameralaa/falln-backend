const db = require('../../config/database');

exports.getMe = async (userId) => {
    const [rows] = await db.execute(
    `SELECT 
        id,
        phone_number,
        email,
        full_name,
        bio,
        gender,
        profile_photo_url,
        relationship_status,
        partner_user_id,
        created_at
        FROM users
        WHERE id = ?`,
    [userId]
    );

    if (!rows.length) {
    throw new Error('User not found');
    }

    return rows[0];
};

exports.updateMe = async (userId, data) => {
    const {
    fullName,
    bio,
    gender,
    profilePhotoUrl,
    email
    } = data;

    const toNull = (v) => (v === undefined ? null : v);

    await db.execute(
    `UPDATE users SET
        full_name = COALESCE(?, full_name),
        bio = COALESCE(?, bio),
        gender = COALESCE(?, gender),
        profile_photo_url = COALESCE(?, profile_photo_url),
        email = COALESCE(?, email),
        updated_at = NOW()
    WHERE id = ?`,
    [
        toNull(fullName),
        toNull(bio),
        toNull(gender),
        toNull(profilePhotoUrl),
        toNull(email),
        userId
    ]
    );

  return exports.getMe(userId);
};
