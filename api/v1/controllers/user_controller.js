const bcrypt = require("bcryptjs");
const authService = require("../services/auth_services");
const deviceService = require("../services/device_services");
const linkedDeviceService = require("../services/linked_device_services");
const AccountConstants = require("../utils/constants").account;
const { HTTP_OK, HTTP_CREATED, HTTP_BAD_REQUEST, HTTP_NOT_FOUND } = require("../utils/constants").code_status;
const QRCode = require('qrcode');
const Totp = require("totp-generator");
const { createCanvas, loadImage } = require("canvas");
const imageToBase64 = require('image-to-base64');



module.exports = {

    // User Device Link
    verifyLinkDeviceToken: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            let deviceQuery = {
                device_id: trimedBodyData.device_id,
                _userId: trimedBodyData._userId,
                status: 'active'
            }
            let deviceExist = await linkedDeviceService.getOne(deviceQuery);
            if (!deviceExist) {
                let tokenQuery = {
                    device_id: trimedBodyData.device_id,
                    token: trimedBodyData.token
                }
                let tokenData = await linkedDeviceService.getOne(tokenQuery);
                if (!tokenData) {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                'token': [
                                    req.t('TOKEN_NOT_MATCHED')
                                ]
                            },
                            message: req.t('TOKEN_NOT_MATCHED'),
                            result: {}
                        }
                    )
                } else {
                    let deviceUpdated = await linkedDeviceService.findOneAndUpdate(
                        {
                            device_id: trimedBodyData.device_id
                        },
                        {
                            _userId: trimedBodyData._userId,
                            status: 'active',
                        },
                        { useFindAndModify: false }
                    );
                    if (deviceUpdated) {
                        return res.status(HTTP_OK).json(
                            {
                                response_code: HTTP_OK,
                                key_errors: {},
                                message: req.t('DEVICE_LINKED'),
                                result: {}
                            })
                    } else {
                        return res.status(HTTP_BAD_REQUEST).json(
                            {
                                response_code: HTTP_BAD_REQUEST,
                                key_errors: {},
                                message: req.t('DEVICE_NOT_LINKED'),
                                result: {}
                            })
                    }
                }
            } else {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            device_id: [
                                req.t('DEVICE_ALREADY_LINKED')
                            ]
                        },
                        message: req.t('DEVICE_ALREADY_LINKED'),
                        result: {}
                    }
                )
            }


        } catch (error) {
            console.log("Error", error)
            return new Error('Error', error);
        }

    },
    // Logout User 
    logout: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            const authUser = await authService.getOne({ username: trimedBodyData.username.toLowerCase() });
            if (!authUser) {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'username': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
            await authService.findOneUpdateData({
                _id: authUser._id
            },
                { refresh_token: '', oauth_token: '' },
                { useFindAndModify: false }
            );
            await deviceService.delete(authUser._id)
            return res.status(HTTP_OK).json({
                response_code: HTTP_OK,
                key_errors: {},
                message: req.t('LOGOUT_SUCCESS'),
                result: {}
            });

        } catch (error) {
            console.log("Error in logout", error)
            return new Error('Error in logout', error);
        }
    },
    /* Update account's password
        - check if user exists  
        - [ERROR] if not found, send an error response
        - compare passwords
        - [ERROR] passwords do not match, send an error response
        - [ERROR] old and new passwords are same, send an error response
        - hash new password
        - update password
    */
    updatePassword: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            const authUser = await authService.getOne({ username: trimedBodyData.username.toLowerCase() });
            if (!authUser) {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'username': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            }
            const newPassword = await _hashThePassword(trimedBodyData.password)
            let passwordMatched = await _comparePasswords(trimedBodyData.current_password, authUser.password)
            if (!passwordMatched) {
                return res.status(HTTP_BAD_REQUEST).json({
                    response_code: HTTP_BAD_REQUEST,
                    key_errors: {
                        'password': [
                            req.t('INCORRECT_PASSWORD')
                        ]
                    },
                    message: req.t('INCORRECT_PASSWORD'),
                    result: {}
                });
            } else {
                await authService.findOneUpdateData({
                    _id: authUser._id
                },
                    { password: newPassword },
                    { useFindAndModify: false }
                );
                return res.status(HTTP_CREATED).json({
                    response_code: HTTP_CREATED,
                    key_errors: {},
                    message: req.t('PASSWORD_UPDATED'),
                    result: {}
                });
            }

        } catch (error) {
            console.log("Error in passwordChange", error)
            return new Error('Error in passwordChange', error);
        }

    },
    // Update User Download Settings
    editGlobalSetting: async function (req, res) {
        try {
            const authUser = await authService.getOne({ _id: req.body.userId });
            if (!authUser) {
                return res.status(HTTP_NOT_FOUND).json(
                    {
                        response_code: HTTP_NOT_FOUND,
                        key_errors: {
                            'username': [
                                req.t('USER_NOT_EXISTS')
                            ]
                        },
                        message: req.t('USER_NOT_EXISTS'),
                        result: {}
                    }
                )
            } else {
                indexId = req.body;
                const setting = authUser.global_setting;
                const checkIdx = setting.findIndex(
                    (settingId) => settingId._id == indexId.settingId
                );
                if (checkIdx != -1) {
                    if (indexId.wifi === undefined) {
                        setting[checkIdx].wifi = setting[checkIdx].wifi
                    } else if (indexId.wifi) {
                        setting[checkIdx].wifi = indexId.wifi
                    } else {
                        setting[checkIdx].wifi = indexId.wifi
                    }
                    if (indexId.download_next_episode === undefined) {
                        setting[checkIdx].download_next_episode = setting[checkIdx].download_next_episode

                    } else if (indexId.download_next_episode) {
                        setting[checkIdx].download_next_episode = indexId.download_next_episode
                    } else {
                        setting[checkIdx].download_next_episode = indexId.download_next_episode
                    }
                    if (indexId.video_quality) {
                        setting[checkIdx].video_quality = indexId.video_quality
                    } else {
                        setting[checkIdx].video_quality = setting[checkIdx].video_quality
                    }
                }
                const updatedData = await authService.findOneUpdateData({
                    _id: req.body.userId
                },
                    { global_setting: setting },
                    { useFindAndModify: false }
                );
                if (updatedData) {
                    return res.status(HTTP_CREATED).json({
                        response_code: HTTP_CREATED,
                        key_errors: {},
                        message: req.t('SETTING_UPDATED'),
                        result: {}
                    });
                } else {
                    return res.status(HTTP_BAD_REQUEST).json({
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            '_id': [
                                req.t('SETTING_FAILED')
                            ]
                        },
                        message: req.t('SETTING_FAILED'),
                        result: {}
                    });
                }

            }
        } catch (error) {
            console.log("Error in globalSetting", error)
            return new Error('Error in globalSetting', error);
        }
    },



}
// Helper method
async function trimObjValues(obj) {
    return Object.keys(obj).reduce((acc, curr) => {
        acc[curr] = obj[curr].trim();
        return acc;
    }, {});
}

//Encrypt password and return the hashed password
async function _hashThePassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
}

//Compare encrypted password and plain password
async function _comparePasswords(password, hashedPassword) {
    const validPass = await bcrypt.compare(password, hashedPassword);
    return validPass;
}

module.exports.trimObjValues = trimObjValues;
module.exports._hashThePassword = _hashThePassword;