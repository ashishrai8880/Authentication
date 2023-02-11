/*
 * if you want to add a custom role
 * 1. Add the entry in accRoles
 * 2. Write custom auth middlewares to check if role matches
 */
const getValuesArrayFromMap = require("../../../../core/helpers")
  .getValuesArrayFromMap;

const accountDetails = {
  accountName: "platform8",
  accountId: "60508372dabf5464540a2460"
}

const viewerRating = {
  default: ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A"],
  // default: ["U"],
  children: ["U", "U/A 7+"]
}

const paginationList = {
  page: 1,
  size: 10
}


const redisExpiration = {
  tab: 120, // In sec
  tabBanner: 120,
  tabList: 120,
  tabCategoryList: 120,
  tabSubCategoryList: 120,
  tabSubSubCategoryList: 120 ,
  asset : 120
}

const platformTypes = {
  web: "web",
  android: "android",
  ios: "ios",
  fireTv: "fire_tv",
  androidTv: "android_tv",
  appleTv: "apple_tv",
  rokuTv: "roku_tv"
};

const countries = {
  IN: "IN",
  US: "US",
  PK: "PK",
  BD: "BD",
};

const accRoles = {
  normalUser: "normal_user",
  admin: "admin",
};

const accountStatus = {
  // operations allowed by users
  emailVerificationPending: "email_verification_pending",
  deactivated: "deactivated",

  // automatically applied by API
  //  if the type of user is normal_user and he verifies his email, then status will be set to active
  active: "active",
  //  if the type of user is admin or any custom role and he verifies his email, then status will be set to pending for review by admin
  //  once the admin approves, then status will be set to approved
  pending: "pending",

  // operations allowed by admin
  adminApproved: "approved",
  adminRejected: "rejected",
  suspended: "suspended",
  disabled: "disabled",
};
const status = {
  pending: "0",
  active: "1",
  suspended: "2",
};
const tokenTypes = {
  accVerification: "acc_verification",
  pwdReset: "pwd_reset",
  loginOTP: "login_otp",
};

const defaultLanguage = "en";
const smsCount = 4;
const tokensList = getValuesArrayFromMap(tokenTypes);
const rolesList = getValuesArrayFromMap(accRoles);
const accountStatusesList = getValuesArrayFromMap(accountStatus);
const tokenOTPDigit = 6;
const tokenOTPExpiry = 120; //seconds
const baseUrl = 'http://localhost:3000/'
const logoImagePath = baseUrl + 'images/platform8_favicon.png'
const urlData = 'https://stage.platform8.tv/'
const avatar = {
  parent: baseUrl + 'avatar/parent.png',
  kids: baseUrl + 'avatar/kids.png',
  default: baseUrl + 'avatar/default.jpg'
}
const videoQuality = {
  standard_definition: "SD",
  high_definition: "HD"
}

module.exports.accountDetails = accountDetails;
module.exports.redisExpiration = redisExpiration;
module.exports.viewerRating = viewerRating;
module.exports.paginationList = paginationList;
module.exports.platformTypes = platformTypes;
module.exports.countries = countries;
module.exports.tokensList = tokensList;
module.exports.accRolesList = rolesList;
module.exports.accountStatusList = accountStatusesList;
module.exports.accRoles = accRoles;
module.exports.accountStatus = accountStatus;
module.exports.tokenTypes = tokenTypes;
module.exports.status = status;
module.exports.defaultLanguage = defaultLanguage;
module.exports.smsCount = smsCount;
module.exports.tokenOTPDigit = tokenOTPDigit;
module.exports.tokenOTPExpiry = tokenOTPExpiry;
module.exports.logoImagePath = logoImagePath;
module.exports.urlData = urlData;
module.exports.avatar = avatar;
module.exports.videoQuality = videoQuality;
