const service = require('./subscriptions.service');

exports.list = async (req, res, next) => {
  try {
    const subscriptions = await service.getUserSubscriptions(req.user.id);

    res.json({
      success: true,
      subscriptions
    });
  } catch (err) {
    next(err);
  }
};
