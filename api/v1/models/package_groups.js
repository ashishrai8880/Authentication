const mongoose = require("mongoose");
const { GROUPPACKAGE_COLLECTION } = require("../utils/constants").collections;
const { db_name, asset_db } = require("../utils/constants/catalogue");

const packageGroupSchema = new mongoose.Schema(
    {
        "name": {
          type: String
        },
        "os": {
          type: String
        },
        "group_id": {
          type: String
        },
        "catalogue_settings": {
          type: Object
        },
        "group_description": {
          type: Array
        },
        "packs": {
          type: Array
        },
        "code": {
          type: String
        },
        "country_code": {
          type: String,
          default:"ROW"
        },
        "catalogue": {
          type: String,
          default:''
        },
        "channel_description": {
          type: String,
          default:''
        }
      },
  { timestamps: true }
);
packageGroupSchema.set('toJSON',{
  versionKey :false,
  transform : (doc,{ _id, group_id, createdAt, updatedAt, os, catalogue, country_code, code,  ...rest},options) => rest
})
 const myDB = mongoose.connection.useDb(db_name);
module.exports = myDB.model(GROUPPACKAGE_COLLECTION, packageGroupSchema);
