const mongoose = require("mongoose");
const { LANGUAGE_COLLECTION } = require("../utils/constants").collections;

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true
    },

  },
  { timestamps: false, versionKey: false }
);
module.exports = mongoose.model(LANGUAGE_COLLECTION, languageSchema);
