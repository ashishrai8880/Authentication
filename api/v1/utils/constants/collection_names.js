const AccountConstants = require("./account").accountDetails
module.exports = Object.freeze({
  CLIENT_COLLECTION: "clients",
  DEVICE_RESTRICTION_COLLECTION: "device_restrictions",
  CATLOGUES_COLLECTION: "catlogues",
  LANGUAGE_COLLECTION: "language",
  AUTH_COLLECTION: AccountConstants.accountName + '_' + "auth",
  TOKEN_COLLECTION: AccountConstants.accountName + '_' + "token",
  USER_COLLECTION: AccountConstants.accountName + '_' + "user",
  PROFILE_COLLECTION: AccountConstants.accountName + '_' + "profile",
  DEVICE_COLLECTION: AccountConstants.accountName + '_' + "device",
  GROUPPACKAGE_COLLECTION: AccountConstants.accountName + '_' + "group_package",
  ASSETS_COLLECTION: AccountConstants.accountName + '_' + "contents",
  LINKEDDEVICE_COLLECTION: AccountConstants.accountName + '_' + "linked_device",
  TAB_COLLECTION: AccountConstants.accountName + '_' + "tabs",
  TAB_BANNER_COLLECTION: AccountConstants.accountName + '_' + "tab_banners",
  TAB_LIST_COLLECTION: AccountConstants.accountName + '_' + "tab_lists",
  TAB_CATEGORY_LIST_COLLECTION: AccountConstants.accountName + '_' + "tab_category_lists",
  TAB_SUB_CATEGORY_LIST_COLLECTION: AccountConstants.accountName + '_' + "tab_sub_category_lists",
  TAB_SUB_SUB_CATEGORY_LIST_COLLECTION: AccountConstants.accountName + '_' + "tab_sub_sub_category_lists",

});
