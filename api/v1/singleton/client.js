const clientServices = require('../services/client_services')
const deviceRestrictionServices = require('../services/device_restriction_services')
const catlogueServices = require('../services/catlogue_services')
const catlogueId = require("../utils/constants").account.accountDetails.accountId


class ClientSingleton {
    
    constructor(client, catlogue, deviceRestriction) {
        this.name = client.client_name;
        this.email = client.client_email;
        this.code = client.client_code;
        this.catlogue = client.catlogue;
        this.slug = client.client_slug;
        this.applicationtypes = client.applicationtypes;
        this.mailer_credentials = client.mailer_credentials;
        this.image_cloudfront = client.image_cloudfront;
        this.image_cloudinary = client.image_cloudinary;
        this.layout_type = catlogue.layout_type ? catlogue.layout_type : "";
        this.is_sdk = catlogue.is_sdk;
        this.Service_key = catlogue.service_id ? catlogue.service_id : "";
        this.sms_template = client.template;
        this.device_restriction = deviceRestriction;
    }
}
class Singleton {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static async getInstance() {
        if (!Singleton.instance) {
            const catlogueDetails = await catlogueServices.getOne({ "catalogue_id": catlogueId })
            const clientDetails = await clientServices.getOne({ "catlogue": catlogueId })
            const deviceRestriction = await deviceRestrictionServices.getOne({ "catalogue": catlogueId })
            Singleton.instance = new ClientSingleton(clientDetails,catlogueDetails,deviceRestriction)
        }
        return Singleton.instance;
    }
}

module.exports.Singleton = Singleton;
