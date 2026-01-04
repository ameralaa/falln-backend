exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.getOtpExpiry = () => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 5);
  return expires;
};
