const mongoose = require("mongoose");
const Schema = mongoose.Schema
const { LINKEDDEVICE_COLLECTION } = require("../utils/constants").collections

const linkedDeviceSchema = new Schema(
  {
    device_id: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    _userId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'inactive'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(LINKEDDEVICE_COLLECTION, linkedDeviceSchema);