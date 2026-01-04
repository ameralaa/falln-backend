const service = require('./conversations.service');

exports.takeBreak = async (req, res, next) => {
  try {
    await service.takeBreak({
      userId: req.user.id,
      conversationId: req.params.id
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getMyConversation = async (req, res) => {
  try {
    const data = await service.getUserConversationState(
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation state',
    });
  }
};


