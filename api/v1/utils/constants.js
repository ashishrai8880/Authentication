require("dotenv").config();

module.exports = Object.freeze({
  headers: require("./constants/headers"),
  errors: require("./constants/error_messages"),
  successMessages: require("./constants/success_messages"),
  collections: require("./constants/collection_names"),
  account: require("./constants/account"),
  code_status: require("./constants/response_status_codes"),
});
