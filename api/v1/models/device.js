const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DEVICE_COLLECTION } = require("../utils/constants").collections;

const deviceSchema = new Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    username: {
      type: String,
      required: true,
      // unique: true,
    },
    device_id: {
      type: String,
      // unique: true,
      default: ""
    },
    device_token: {
      type: String,
      default: ""
      // unique: true,
    },
    device_model: {
      type: String,
      default: ""
    },
    catalogue_id: {
      type: String,
      require: true,
    },
    login_status: {
      type: String,
      enum: ["0", "1"],
      default: "0"
    },
    os_version: {
      type: String,
      default: ""
    },
    platform: {
      type: String,
      default: ""
    },
    ip_address: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(DEVICE_COLLECTION, deviceSchema);
