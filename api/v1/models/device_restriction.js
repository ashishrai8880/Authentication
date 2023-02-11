const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DEVICE_RESTRICTION_COLLECTION } = require("../utils/constants").collections;

const modelSchema = new Schema(
  {
    device_id: String,
    catalogue: String,
    allowed_device: Number,
    allowed_os: Array,
    api_duration: Number,
    status: String,
    created_date: String,
    updated_date: Date,
    update_date: Date,
  },
  {
    timestamps: false,
  }
);
modelSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, {_id, ...rest }, options) => rest
})
modelSchema.index({ catalogue:1 });
module.exports = mongoose.model(DEVICE_RESTRICTION_COLLECTION, modelSchema);
