const profileServices = require('../services/profile_services')

class UserSingleton {
    
    constructor(user, profile) {
        this.first_name = user.first_name;
        this.middle_name = user.middle_name;
        this.last_name = user.last_name;
        this.type = user.type;
        this.email = user.email;
        this.mobile = user.mobile;
        this.username = user.username;
        this.age = user.age;
        this.gender = user.gender;
        this.status = user.status;
        this.parental_control = user.parental_control;
        this.country = user.country;
        this.global_setting = user.global_setting;
        this.profile = profile;
        this.last_active_time = user.last_active_time;
        this.last_month_last_active_time = user.last_month_last_active_time;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
class Singleton {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static async getInstance(req) {
        if (!Singleton.instance) {
            const userDetails = req.Auth
            if(userDetails){
                const profileDetails = await profileServices.getAll({ "_userId": userDetails._id })
                Singleton.instance = new UserSingleton(userDetails,profileDetails)
            }
            
        }
        return Singleton.instance;
    }
}

module.exports.Singleton = Singleton;
