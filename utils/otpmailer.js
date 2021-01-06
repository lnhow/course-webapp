const mailer = require('./mailer');
const otpGenerator = require('./otpgenerator');

module.exports = {
  sendOTPMail: async function (destEmail) {
    const subject = 'Your Online academy OTP code';
    const otpcode = otpGenerator.generateOTP();

    const htmlContent = `<p>${otpcode}</p><p>If you didn't requested the OTP, please ignore this mail.</p>`

    await mailer.sendMail(destEmail, subject, htmlContent);
    return otpcode;
  }
}