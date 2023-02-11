const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { CLIENT_COLLECTION } = require("../utils/constants").collections;

const modelSchema = new Schema(
  {
    client_id: String,
    _csrf: String,
    client_name: String,
    client_email: String,
    client_code: String,
    catlogue: String,
    client_slug: String,
    applicationtypes: Object,
    transcodings: Object,
    CDNS: Object,
    input_bucket: String,
    INPUTBUCKETS:Object,
    downloadingprofiles: Object,
    cdn: String,
    OUTPUTBUCKETS: Object,
    backup_bucket: String,
    BACKUPBUCKETS: Object,
    output_bucket: String,
    searchtypes: String,
    SEARCHTYPES: Object,
    status: String,
    template: String,
    audio_profile:Object,
    download_audio: Object,
    mailer_credentials: Object,
    image_cloudfront: Object,
    image_cloudinary: Object,
  },
  {
    timestamps: false,
  }
);
modelSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, {_id, ...rest }, options) => rest
})
modelSchema.index({ catlogue:1 });
module.exports = mongoose.model(CLIENT_COLLECTION, modelSchema);
