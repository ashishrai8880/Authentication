const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { CATLOGUES_COLLECTION } = require("../utils/constants").collections;

const catlogueSchema = new Schema(
  {
    language_code: String,
    bitframeurl_play: Date,
    type: Date,
    content_availability: String,
    catlogues_status: String,
    isClone: String,
    session_collection: String,
    billing_collection: String,
    is_sdk: String,
    layout_type: String,
    mongo_catalogue_id:String,
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model(CATLOGUES_COLLECTION, catlogueSchema);
