const service = require('./requests.service');

exports.send = async (req, res, next) => {
  try {
    await service.sendRequest({
      senderId: req.user.id,
      receiverPhone: req.body.receiverPhone,
      message: req.body.message
    });

    res.json({ success: true });
  } catch (err) {
    // 👇 controlled business errors
    if (
      err.message === 'User not found' ||
      err.message === 'User already taken' ||
      err.message === 'You are already taken' ||
      err.message === 'Request already sent'
    ) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    next(err);
  }
};


exports.list = async (req, res, next) => {
  try {
    const data = await service.listRequests(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.accept = async (req, res, next) => {
  try {
    await service.acceptRequest({
      requestId: req.params.id,
      userId: req.user.id
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    await service.rejectRequest({
      requestId: req.params.id,
      userId: req.user.id
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    await service.cancelRequest({
      requestId: req.params.id,
      userId: req.user.id
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
