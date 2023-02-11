const authService = require("../services/auth_services");
const profileService = require("../services/profile_services");
const languageService = require("../services/language_services");
const AuthController = require("./auth_controller");
const AccountConstants = require("../utils/constants").account;
const {HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND} = require("../utils/constants").code_status;

const redisClient = require('../../../core/redis')


module.exports = {
    // Add User Profile
    addProfile: async function (req, res) {
        try {
            let authUser = await authService.getOne({ _id: req.body._userId });
            if (authUser) {
                var viewing_restriction = req.body.viewing_restriction
                if (req.body.is_child === true) {
                    viewing_restriction = ['U', 'U/A 7+']
                } else {
                    if (viewing_restriction === "A") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A']
                    } else if (viewing_restriction === "U/A 16+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+']
                    } else if (viewing_restriction === "U/A 13+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+']
                    } else if (viewing_restriction === "U/A 7+") {
                        viewing_restriction = ['U', 'U/A 7+']
                    } else if (viewing_restriction === "U") {
                        viewing_restriction = ['U']
                    }
                }

                let profileData = {
                    _userId: authUser._id,
                    profile_name: req.body.profile_name,
                    profile_image: AccountConstants.avatar.default,
                    is_child: req.body.is_child,
                    viewing_restriction: viewing_restriction

                }
                let profileCreated = await profileService.create(profileData)
                if (profileCreated) {
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('PROFILE_CREATED'),
                            result: {}
                        })
                } else {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                '_userId': [
                                    req.t('PROFILE_CREATE_FAIL')
                                ]
                            },
                            message: req.t('USER_NOT_EXISTS'),
                            result: {}
                        }
                    )
                }

            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            '_userId': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }

        } catch (error) {
            console.log("Error in addProfile", error);
            return new Error('Error in addProfile', error);
        }
    },
    // Update User Profile
    editProfile: async function (req, res) {
        try {
            let userProfile = await profileService.getOne({ _id: req.body.profile_id })

            if (userProfile) {
                var viewing_restriction = req.body.viewing_restriction
                if (req.body.is_child === true) {
                    viewing_restriction = ['U', 'U/A 7+']
                } else {
                    if (viewing_restriction === "A") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A']
                    } else if (viewing_restriction === "U/A 16+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+']
                    } else if (viewing_restriction === "U/A 13+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+']
                    } else if (viewing_restriction === "U/A 7+") {
                        viewing_restriction = ['U', 'U/A 7+']
                    } else if (viewing_restriction === "U") {
                        viewing_restriction = ['U']
                    }
                }
                let updateProfile = await profileService.findOneUpdateData({
                    _id: userProfile._id
                },
                    {
                        profile_name: req.body.profile_name,
                        is_child: req.body.is_child,
                        viewing_restriction: viewing_restriction
                    },
                    { useFindAndModify: false }
                );
                if (updateProfile) {
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('PROFILE_UPDATED'),
                            result: {}
                        })
                } else {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {},
                            message: req.t('PROFILE_UPDATE_FAIL'),
                            result: {}
                        })
                }

            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'profile_id': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }

        } catch (error) {
            console.log("Error in editProfile", error);
            return new Error('Error in editProfile', error);
        }
    },
    // Get User All Profiles
    getAllProfile: async function (req, res) {
        try {
            let profile = await profileService.getAll({ _userId: req.body._userId })

            if (profile.length > 0) {
                let profileData = []
                for (let i = 0; i < profile.length; i++) {
                    let data = {
                        _id: profile[i]._id,
                        profile_name: profile[i].profile_name,
                        profile_image: profile[i].profile_image,
                        delete_status: profile[i].delete_status
                    }
                    profileData.push(data)
                }
                return res.status(HTTP_OK).json(
                    {
                        response_code: HTTP_OK,
                        key_errors: {},
                        message: req.t('PROFILE_FETCHED'),
                        result: { profileData }
                    })
            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            '_userId': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
        } catch (error) {
            console.log("Error in getAllProfile", error);
            return new Error('Error in getAllProfile', error);
        }
    },
    // Get User Profile
    getProfile: async function (req, res) {
        try {
            // console.log("from DB::::")
            let profile = await profileService.getOne({ _id: req.body.profile_id })
            // await redisClient.set('profile_post', JSON.stringify(profile));

            if (profile) {
                // console.log("from DB::::")
                return res.status(HTTP_OK).json(
                    {
                        response_code: HTTP_OK,
                        key_errors: {},
                        message: req.t('PROFILE_DETAILS_FETCHED'),
                        result: { profile }
                    })
            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'profile_id': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
        } catch (error) {
            console.log("Error in getProfile", error);
            return new Error('Error in getProfile', error);
        }
    },
    // Delete User Profile
    deleteProfile: async function (req, res) {
        try {
            let profile = await profileService.getOne({ _id: req.body.profile_id })
            if (profile) {
                let profileDeleted = await profileService.deleteOne({ _id: req.body.profile_id, delete_status: true })
                if (profileDeleted.deletedCount > 0) {
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('PROFILE_DELETED'),
                            result: {}
                        })
                } else {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                'profile_id': [
                                    req.t('MASTER_PROFILE')
                                ]
                            },
                            message: req.t('MASTER_PROFILE'),
                            result: {}
                        }
                    )
                }

            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'profile_id': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
        } catch (error) {
            console.log("Error in deleteProfile", error);
            return new Error('Error in deleteProfile', error);
        }
    },
    // Get User Profile Sttings
    getAllProfileSetting: async function (req, res) {
        try {
            let profile = await profileService.getAll({ _userId: req.body._userId })
            if (profile) {
                return res.status(HTTP_OK).json(
                    {
                        response_code: HTTP_OK,
                        key_errors: {},
                        message: req.t('PROFILE_SETTING_FETCHED'),
                        result: { profile }
                    })
            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            '_userId': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
        } catch (error) {
            console.log("Error in getAllProfileSetting", error);
            return new Error('Error in getAllProfileSetting', error);
        }
    },
    // Update User Profile Settings
    editProfileSetting: async function (req, res) {
        try {
            let userProfile = await profileService.getOne({ _id: req.body.profile_id })
            let language = await languageService.getAll();
            let languageArray = []
            for (let i = 0; i < language.length; i++) {
                const code = language[i].code;
                languageArray.push(code)
            }
            let userLanguage = req.body.language;
            let languageExist = await multipleExist(languageArray, userLanguage); //return true

            if (languageExist == false) {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'language': [
                                req.t('LANGUAGE_NOT_MATCHED')
                            ]
                        },
                        message: req.t('LANGUAGE_NOT_MATCHED'),
                        result: {}
                    }
                )
            }
            let hashedPassword = '';
            if (req.body.profile_lock === true) {
                let password = req.body.profile_password.trim()
                hashedPassword = await AuthController._hashThePassword(password);
            }
            if (userProfile) {
                var viewing_restriction = req.body.viewing_restriction
                if (req.body.is_child === true) {
                    viewing_restriction = ['U', 'U/A 7+']
                } else {
                    if (viewing_restriction === "A") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A']
                    } else if (viewing_restriction === "U/A 16+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+']
                    } else if (viewing_restriction === "U/A 13+") {
                        viewing_restriction = ['U', 'U/A 7+', 'U/A 13+']
                    } else if (viewing_restriction === "U/A 7+") {
                        viewing_restriction = ['U', 'U/A 7+']
                    } else if (viewing_restriction === "U") {
                        viewing_restriction = ['U']
                    }
                }
                let updateProfile = await profileService.findOneUpdateData({
                    _id: userProfile._id
                },
                    {
                        language: userLanguage,
                        is_child: req.body.is_child,
                        viewing_restriction: viewing_restriction,
                        profile_lock: req.body.profile_lock,
                        profile_password: hashedPassword,
                    },
                    { useFindAndModify: false }
                );
                if (updateProfile) {
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('PROFILE_SETTING_UPDATED'),
                            result: {}
                        })
                } else {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {},
                            message: req.t('PROFILE_SETTING_UPDATE_FAIL'),
                            result: {}
                        })
                }

            } else {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'profile_id': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
        } catch (error) {
            console.log("Error in editProfileSetting", error);
            return new Error('Error in editProfileSetting', error);
        }
    },

}
// Helper method
async function multipleExist(arr, values) {
    return values.every(value => {
        return arr.includes(value);
    });
}