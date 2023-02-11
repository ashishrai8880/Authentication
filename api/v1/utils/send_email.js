const nodemailer = require("nodemailer");
const pug = require("pug");
const TokenConstants = require("./constants").account;

class Mail {

  static doSendEmail = async (user, otp, type) => {
    let accVerification = TokenConstants.tokenTypes.accVerification;
    let pwdReset = TokenConstants.tokenTypes.pwdReset;
    let loginOTP = TokenConstants.tokenTypes.loginOTP;

    let data = {
      body: `Your one time password to verify your account is ${otp}`,
      subject: "Verify With OTP",
      footer: "",
      template: "/templates/platform8/layout.pug",
    };

    switch (type) {
      case accVerification:
        await Mail.send(user, data);
        break;
      case pwdReset:
        await Mail.send(user, data);
        break;
      case loginOTP:
        await Mail.send(user, data);
        break;
    }
  }

  // Send Email
  static send = async (user, data) => {
    const {
      SENDGRID_MAIL_HOST,
      SENDGRID_API_KEY,
      SENDGRID_EMAIL,
      SENDGRID_USERNAME,
      SENDGRID_MAIL_PORT,
    } = process.env;

    const msg = {
      to: user,
      from: SENDGRID_EMAIL,
      subject: data.subject || "",
      text: data.body || "",
      html: data.template
        ? pug
          .renderFile(__dirname + data.template)
          .replace("[[CONTENT]]", data.body)
        : pug
          .renderFile(__dirname + "/templates/platform8/layout.pug")
          .replace("[[CONTENT]]", data.body),
    };

    const cred = {
      host: SENDGRID_MAIL_HOST,
      port: parseInt(SENDGRID_MAIL_PORT),
      auth: {
        user: SENDGRID_USERNAME,
        pass: SENDGRID_API_KEY,
      },
      //   debug: true,
      //    logger: true
    };
    // console.log(cred)

    let transporter = nodemailer.createTransport(cred);

    transporter.sendMail(msg, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Message Sent: " + info.response);
      }
    });
  };
}
module.exports = Mail;
