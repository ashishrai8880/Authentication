const tokenService = require("../services/token_services");
const authService = require("../services/auth_services");
const mail = require("../utils/send_email");
const sendOtp = require("../utils/send_otp");
const Totp = require("totp-generator");
const AccountConstants = require("../utils/constants").account;
const { isEmail, isPhone } = require("../utils/validators");


module.exports = {
  /* Send OTP 
      - check if already a token exists
      - creates a new otp
      - saves the document in db
      - send new OTP on mobile
      - return true
  */
  sendOTP: async function (userId, username, type) {
    try {
      await tokenService.deleteToken({ _userId: userId, type: type });
      const oldToken = await tokenService.getOne(userId);
      if (oldToken) {
        return false;
      }

      let tokenExpPeriod = AccountConstants.tokenOTPExpiry
      let otp = Totp("JBSWY3DPEHPK3PXP", {
        digits: AccountConstants.tokenOTPDigit,
        algorithm: "SHA-512",
        period: tokenExpPeriod, // seconds
      });

      // gen verification token and saving that token in db, which will expire in an hour
      await tokenService.create({ _userId: userId, token: otp, type: type });
      await authService.findOneUpdateData(
        { username: username, _id: userId },
        {
          otp: otp.toString(),
          $inc: { otp_attempts: 1 },
          last_otp_time: Number(Date.now()),
        },
        { useFindAndModify: false }
      );

      if (isPhone(username)) {
        await sendOtp.sendSMS(username, otp);
      } else if (isEmail(username)) {
        await mail.doSendEmail(username, otp, type);
      }
      return true;
    } catch (error) {
      console.log("Error in sendOTP", error)
      return new Error(error);
    }

  },

}