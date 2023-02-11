const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { AUTH_COLLECTION } = require("../utils/constants").collections
const AccountConstants = require("../utils/constants").account;

const authSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      max: 1024,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    first_name: {
      type: String,
      default: "",
    },
    middle_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
    age: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: true,
    },
    other_profile_information: {
      type: String,
      default: "",
    },
    is_additional_profile_field_skipped: {
      type: String,
      enum: ["0", "1"],
      default: "0",
    },
    is_profile_complete: {
      type: String,
      enum: ["0", "1"],
      default: "0",
    },
    catalogue_id: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      enum: ["0", "1"],
      default: "0",
      required: true
    },
    parental_control: {
      type: String,
      enum: ["0", "1"],
      default: "0",
    },
    otp: {
      type: String,
      default: "",
    },
    otp_attempts: {
      type: Number,
      default: 0,
    },
    last_otp_time: {
      type: Date,
      default: "",
    },
    block_sms: {
      type: String,
      enum: ["0", "1"],
      default: "0",
    },
    customer_enquiry: {
      type: Object,
      default: {},
    },
    is_payment_url_invoked: {
      type: String,
      enum: ["0", "1"],
      default: "0",
    },
    payment_url_invoked_time: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
    },
    last_active_time: {
      type: Date,
      default: "",
    },
    last_month_last_active_time: {
      type: Date,
      default: "",
    },
    refresh_token: {
      type: String,
      default: "",
    },
    oauth_token: {
      type: String,
      default: "",
    },
    global_setting: {
      type: [
        {
          wifi: {
            type: Boolean,
            default: true,
          },
          download_next_episode: {
            type: Boolean,
            require: true,
          },
          video_quality: {
            type: String,
            default: AccountConstants.videoQuality.standard_definition,
          }
        }
      ]
    }

  },
  { timestamps: true }
);
authSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, { password, email, mobile, is_additional_profile_field_skipped, otp, otp_attempts, last_otp_time, block_sms, customer_enquiry, is_payment_url_invoked, payment_url_invoked_time, provider, last_active_time, last_month_last_active_time, createdAt, updatedAt, ...rest }, options) => rest
})
authSchema.index({ username: 1, status: 1 });
module.exports = mongoose.model(AUTH_COLLECTION, authSchema);