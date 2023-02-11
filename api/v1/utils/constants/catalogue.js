const { NODE_ENV } = process.env;
let suffix = NODE_ENV.includes("dev") ? `-${NODE_ENV}` : ''

module.exports = Object.freeze({
  "session_collection": "SESSIONNEXG",
  "billing_collection": "billing_IBCTV",
  "name": "nexgtvwhitelabeled",
  "catalogue_id": "5f48bc1eb9124f41a16c5712",
  get db_name() {
    return this.name.toLowerCase() + suffix;
  },
  "service_code": "IBCTV",
  "asset_db": "nexgtv_16"
})
