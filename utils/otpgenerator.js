function generateOTP() { 
  const length = 6
  let OTP = 0; 
  for (let i = 0; i < length; i++ ) { 
      OTP = OTP * 10 + Math.floor(Math.random() * 10); 
  } 
  return OTP; 
}

module.exports = {
  generateOTP
};