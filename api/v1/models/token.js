const mongoose = require("mongoose");
const {
  TOKEN_COLLECTION,
  USER_COLLECTION,
} = require("../utils/constants").collections;
const account = require("../utils/constants").account;

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: USER_COLLECTION,
  },
  token: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: account.tokensList,
  },
  // tokens will expire after an hour
  // this will delete the document from collection when it is expired
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60 * 60,
  },
});

module.exports = mongoose.model(TOKEN_COLLECTION, tokenSchema);
