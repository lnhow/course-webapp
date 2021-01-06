const nodeMailer = require('nodemailer');
const gmailHost = 'smtp.gmail.com';
const office365Host = 'smtp.office365.com';
const mailOtp = require('../config/mailerOtp');

const mail = {
  //The account MUST enable 'Quyền truy cập của ứng dụng kém an toàn' - Less secure app access
  //Should probably put in config/keys.json and .gitignore keys.json
  account: {
    user: mailOtp.User,
    pass: mailOtp.Pass,
  },
  host: gmailHost,  //Host of the mail account 
  port: 587         //Secure SMTP port
}

const sendMail = (to, subject, htmlContent) => {
  const transporter = nodeMailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: false,  // false for TLS, default
    auth: mail.account,
    tls: {
      ciphers: 'SSLv3'
    }
  })

  const options = {
    from: mail.account.user,
    to: to,
    subject: subject,
    html: htmlContent
  }
  
  return transporter.sendMail(options); //send the mail, Promise
}

module.exports = {
  sendMail
}