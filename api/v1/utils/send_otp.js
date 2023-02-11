require("dotenv").config();
const https = require("https");
const http = require("http");

//OTP configuration variable
// const _otpConfig = {
//   SENDERID: "NEXGTV",
//   TEMPLATEID: "50731",
// };

class OTP {
  static fetch = async (url) => {
    return new Promise((resolve, reject) => {
      let is_https = /(https):\/\//i.test(url) ? https : http;
      is_https
        .get(url, (resp) => {
          let data = "";
          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  };

  static sendSMS = async (msisdn, _OTP) => {
    const { WHITELABELED_URL } = process.env;
    let smsUrl = WHITELABELED_URL.replace("<MSISDN>", msisdn)
      .replace("<SENDERID>", "NEXGTV")
      .replace("<TEMPLATEID>", 50731)
      .replace("<TEMPLATEARG1>", _OTP)
      .replace("<TEMPLATEARG2>", "")
      .replace("<TEMPLATEARG3>", "");
    await OTP.fetch(smsUrl)
      .then((data) => {
        console.log(`sent to ${msisdn}`);
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };
}

module.exports = OTP;
