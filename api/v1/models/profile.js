const mongoose = require("mongoose");
const { PROFILE_COLLECTION, AUTH_COLLECTION } = require("../utils/constants").collections;

const modelSchema = new mongoose.Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: AUTH_COLLECTION,
      required: true,
    },
    profile_name: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default: ''
    },
    language: {
      type: Array,
      default: ['en']
    },
    viewing_restriction: {
      type: Array,
      default: []   // U, U/A 7+, U/A 13+, U/A 16+, A, ''-All
    },
    profile_lock: {
      type: Boolean,
      default: false,
    },
    profile_password: {
      type: String,
      default: '',
    },
    is_child: {
      type: Boolean,
      default: true  // Parent OR Child
    },
    delete_status: {
      type: Boolean,
      default: true  // account will delete or not (true/false)
    }

  },
  { timestamps: true, versionKey: false }
);

modelSchema.index({ _userId: 1 });
module.exports = mongoose.model(PROFILE_COLLECTION, modelSchema);
