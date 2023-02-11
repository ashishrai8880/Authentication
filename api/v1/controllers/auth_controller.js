const bcrypt = require("bcryptjs");
var moment = require('moment');
const JWTHandler = require("../../../core/jwt");
const authService = require("../services/auth_services");
const profileService = require("../services/profile_services");
const deviceService = require("../services/device_services");
const linkedDeviceService = require("../services/linked_device_services");
const TokenControllers = require("./token_controller");
const Headers = require("../utils/constants").headers;
const AccountConstants = require("../utils/constants").account;
const {HTTP_OK, HTTP_CREATED, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_INTERNAL_SERVER_ERROR } = require("../utils/constants").code_status;
const QRCode = require('qrcode');
const Totp = require("totp-generator");
const { createCanvas, loadImage } = require("canvas");
const imageToBase64 = require('image-to-base64');



module.exports = {

    /* User check   
        - fetch user data
        - [ERROR] if user not found in db, send response
    */
    checkUser: async function (req, res) {
        try {
            // check if user exists
            const username = req.body.username.trim().toLowerCase()
            const authUser = await authService.getOne({ username: username });
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
                        result: { user_exist: "USER_NOT_EXISTS" }
                    }
                )
            }
            switch (authUser.status) {
                case AccountConstants.status.active:
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('USER_EXISTS'),
                            result: { user_exist: "ACCOUNT_EXISTS", authUser }
                        });
                case AccountConstants.status.pending:
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                'username': [
                                    req.t('ACCOUNT_NOT_VERIFIED'),
                                ]
                            },
                            message: req.t('ACCOUNT_NOT_VERIFIED'),
                            result: { user_exist: "ACCOUNT_NOT_VERIFIED" }
                        })
                case AccountConstants.status.suspended:
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                'username': [
                                    req.t('LOGIN_NOT_ALLOWED'),
                                ]
                            },
                            message: req.t('LOGIN_NOT_ALLOWED'),
                            result: { user_exist: "ACCOUNT_SUSPENDED" }
                        })

            }

        } catch (error) {
            console.log("Error", error);
            return new Error('Error', error);
        }
    },
    /* User registration    
        - check if email/mobile is exists
        - if exists then send conflict response
        - if not exists, create a hashed password using [md5]
        - save the user in the database
        - create three default profile against of newly created user, create device information
        - send an OTP on mobile or email to the respective email to verfify the account
        - [ERROR] if failed to save user in db, send an error response
    */
    register: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            let accVerification = AccountConstants.tokenTypes.accVerification
            let platform = AccountConstants.platformTypes
            let username = trimedBodyData.email?.toLowerCase() || trimedBodyData.mobile;
            let authUser = await authService.getOne({ username: username });
            if (authUser) {
                if (authUser.status == AccountConstants.status.pending) {
                    await TokenControllers.sendOTP(authUser._id, username, accVerification);

                    let deviceInfo = await deviceService.getOne({
                        username: authUser.username, _userId: authUser._id
                    })
                    if (deviceInfo) {
                        await deviceService.findOneUpdateData({
                            username: authUser.username, _userId: authUser._id
                        },
                            {
                                login_status: '1',
                                _userId: authUser._id,
                                username: authUser.username,
                                catalogue_id: authUser.catalogue_id,
                                device_id: trimedBodyData.device_id || "",
                                device_token: trimedBodyData.device_token || "",
                                device_model: trimedBodyData.device_model || "",
                                login_response_code: "1",
                                build_version: trimedBodyData.build_version || "",
                                platform: trimedBodyData.platform || "",
                                ip_address: req.connection.remoteAddress || authUser.ip_address
                            });

                    }

                    return res.status(HTTP_OK).json({
                        response_code: HTTP_OK,
                        message: req.body.type == "email" ? req.t("VERIFY_MAIL_SENT") : req.t("VERIFY_OTP_SENT"),
                        key_errors: {},
                        result: {}
                    });
                } else {
                    return res
                        .status(HTTP_BAD_REQUEST).json({
                            response_code: HTTP_BAD_REQUEST,
                            message: req.t("USER_ALREADY_REGISTERED"),
                            key_errors: {
                                'username': [
                                    req.t('USER_ALREADY_REGISTERED')
                                ]
                            },
                            result: {}
                        });
                }
            }
            let platforExists = Object.values(platform).includes(trimedBodyData.platform.toLowerCase());
            if (platforExists == false) {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'platform': [
                                req.t('PLATFORM_NOT_MATCHED')
                            ]
                        },
                        message: req.t('PLATFORM_NOT_MATCHED'),
                        result: {}
                    }
                )
            }
            // Generate hash password
            let password = trimedBodyData.password
            let hashedPassword = await _hashThePassword(password);
            // Create user

            let downloadSetting = {
                wifi: true,
                download_next_episode: true,
                video_quality: AccountConstants.videoQuality.standard_definition
            }
            let newUser = {
                type: trimedBodyData.type,
                username: username,
                password: hashedPassword,
                age: trimedBodyData.age || '',
                gender: trimedBodyData.gender || '',
                email: trimedBodyData.email?.toLowerCase() || '',
                mobile: trimedBodyData.mobile || '',
                country: trimedBodyData.country || '',
                catalogue_id: trimedBodyData.catalogue_id,
                ip_address: req.connection.remoteAddress || '',
                global_setting: downloadSetting
            };

            // creating user in database
            let savedUser = await authService.create(newUser)
            if (savedUser) {
                let deviceData = {
                    login_status: '1',
                    _userId: savedUser._id,
                    username: savedUser.username,
                    catalogue_id: savedUser.catalogue_id,
                    device_id: trimedBodyData.device_id || "",
                    device_token: trimedBodyData.device_token || "",
                    device_model: trimedBodyData.device_model || "",
                    login_response_code: "1",
                    build_version: trimedBodyData.build_version || "",
                    platform: trimedBodyData.platform.toLowerCase() || "",
                    ip_address: req.connection.remoteAddress || savedUser.ip_address
                }
                await deviceService.create(deviceData)
                let userProfileData = {
                    _userId: savedUser._id,
                    profile_name: trimedBodyData.first_name || 'Default',
                    viewing_restriction: AccountConstants.viewerRating.default,
                    profile_image: AccountConstants.avatar.parent,
                    is_child: false,
                    delete_status: false,
                }
                await profileService.create(userProfileData)

                let childrenProfileData = {
                    _userId: savedUser._id,
                    profile_name: 'Children',
                    viewing_restriction: AccountConstants.viewerRating.children,
                    profile_image: AccountConstants.avatar.kids,
                    is_child: true,
                   
                    delete_status: false,
                }
                await profileService.create(childrenProfileData)

                let result = await TokenControllers.sendOTP(savedUser._id, savedUser.username, accVerification);
                if (result) {
                    return res.status(HTTP_CREATED).json({
                        response_code: HTTP_CREATED,
                        message: req.t("SMS_SENT_TO", { field_name: savedUser.username }),
                        key_errors: {},
                        result: {}
                    });
                } else {
                    return res.status(HTTP_BAD_REQUEST).json(
                        {
                            response_code: HTTP_BAD_REQUEST,
                            key_errors: {
                                'Registration': [
                                    req.t('REGISTER_FAILED'),
                                ]
                            },
                            message: req.t('REGISTER_FAILED'),
                            result: {}
                        })
                }
            } else {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json(
                    {
                        response_code: HTTP_INTERNAL_SERVER_ERROR,
                        key_errors: {
                            'Registration': [
                                req.t('REGISTER_FAILED'),
                            ]
                        },
                        message: req.t('REGISTER_FAILED'),
                        result: {}
                    })
            }

        } catch (error) {
            console.log("Error in registration", error);
            return new Error('Error in registration', error);
        }
    },
    resendOTP: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            let tokenTypes = AccountConstants.tokenTypes
            let otpType = trimedBodyData.otp_type
            let username = trimedBodyData.username?.toLowerCase()
            let authUser = await authService.getOne({ username: username });
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
                        result: { user_exist: "USER_NOT_EXISTS" }
                    }
                )
            }
            let otpTypeExists = Object.values(tokenTypes).includes(trimedBodyData.otp_type);
            if (otpTypeExists == false) {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'otp_type': [
                                req.t('OTP_TYPE_INCORRECT')
                            ]
                        },
                        message: req.t('OTP_TYPE_INCORRECT'),
                        result: {}
                    }
                )
            }
            switch (otpType) {
                case tokenTypes.accVerification:
                    await TokenControllers.sendOTP(authUser._id, authUser.username, tokenTypes.accVerification);
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('OTP_RESENT'),
                            result: {}
                        });
                case tokenTypes.loginOTP:
                    await TokenControllers.sendOTP(authUser._id, authUser.username, tokenTypes.loginOTP);
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('OTP_RESENT'),
                            result: {}
                        })
                case tokenTypes.pwdReset:
                    await TokenControllers.sendOTP(authUser._id, authUser.username, tokenTypes.pwdReset);
                    return res.status(HTTP_OK).json(
                        {
                            response_code: HTTP_OK,
                            key_errors: {},
                            message: req.t('OTP_RESENT'),
                            result: {}
                        })

            }

        } catch (error) {
            console.log("Error in resendOTP", error)
            return new Error('Error', error);
        }
    },
    verifyOTP: async function (req, res) {
        try {
            const username = req.body.username.trim().toLowerCase()
            const userOTP = req.body.otp.trim().toLowerCase()
            let authUser = await authService.getOne({ username: username });

            if (!authUser)
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
            if (authUser.otp == '')
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            otp: [
                                req.t('TRY_LATER')
                            ]
                        },
                        message: req.t('TRY_LATER'),
                        result: {}
                    })

            if (authUser.otp != userOTP) {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            otp: [
                                req.t('SMS_INCORRECT')
                            ]
                        },
                        message: req.t('SMS_INCORRECT'),
                        result: {}
                    })
            }
            authUser.otp = ''
            authUser.last_otp_time = ''
            authUser.otp_attempts = 0
            if (authUser.status == AccountConstants.status.pending)
                authUser.status = AccountConstants.status.active;

            await authUser.save(async (error, savedUser) => {
                if (savedUser)
                    return res.status(HTTP_OK).json({
                        response_code: req.t('SMS_VERIFIED'),
                        key_errors: {},
                        message: req.t('SMS_VERIFIED'),
                        result: {}
                    });

                // Print the error and sent back failed response
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    response_code: req.t('INTERNAL_SERVER_ERROR'),
                    message: req.t('INTERNAL_SERVER_ERROR'),
                    key_errors: error,
                    result: {}
                });
            });
        } catch (error) {
            console.log("Error", error)
            return new Error('Error', error);
        }

    },
    /* User login with username & Password   
        - fetch user data
        - [ERROR] if user not found in db, send an error response
        - compare password and hashedpassword using bcrypt
        - try login
    */
    login: async function (req, res) {
        try {
            // check if user exists
            const username = req.body.username.trim().toLowerCase()
            const authUser = await authService.getOne({ username: username });
            if (!authUser)
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
            // validate the password
            const validPass = await bcrypt.compare(req.body.password, authUser.password);
            if (!validPass)
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'username': [
                                req.t('INVALID_USERNAME_PASSWORD')
                            ]
                        },
                        message: req.t('INVALID_USERNAME_PASSWORD'),
                        result: {}
                    }
                )

            // check for account active
            if (authUser.status == AccountConstants.status.active) {
                authUser.last_active_time = Date.now();
                if (!authUser.last_month_last_active_time) {
                    authUser.last_month_last_active_time = authUser.last_active_time;
                }

                if (!authUser.oauth_token || !JWTHandler.verifyAccessToken(authUser.oauth_token).valid) {
                    authUser.oauth_token = await JWTHandler.genAccessToken(authUser._id);
                }

                if (!authUser.refresh_token || !JWTHandler.verifyRefreshToken(authUser.refresh_token).valid) {
                    authUser.refresh_token = await JWTHandler.genRefreshToken(authUser._id);
                }

                authUser.save()

                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: req.t('SUCCESS_LOGIN'),
                    result: authUser
                });
            }
            else {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'username': [
                                req.t('LOGIN_FAILED')
                            ]
                        },
                        message: req.t('LOGIN_FAILED'),
                        result: {}
                    }
                )

            }
        } catch (error) {
            console.log("Error in login", error);
            return new Error('Error in login', error);
        }
    },
    /* User login with OTP   
        - fetch user data
        - [ERROR] if user not found in db, send an error response
        - compare OTP and login
    */
    loginWithOTP: async function (req, res) {
        try {
            const loginOTP = AccountConstants.tokenTypes.loginOTP
            // check if user exists
            const username = req.body.username.trim().toLowerCase()
            const authUser = await authService.getOne({ username: username });

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

                const SendOTP = await TokenControllers.sendOTP(authUser._id, authUser.username, loginOTP);
                if (SendOTP) {
                    return res.status(HTTP_OK).json({
                        response_code: HTTP_OK,
                        key_errors: {},
                        message: req.t('SMS_SUCCESS'),
                        result: {}

                    });
                } else {
                    return res.status(HTTP_BAD_REQUEST).json({
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'username': [
                                req.t('SMS_FAIL')
                            ]
                        },
                        message: req.t('SMS_FAIL'),
                        result: {}

                    });
                }
            }


        } catch (error) {
            console.log("Error", error);
            return new Error('Error', error);
        }
    },
    verifyLoginOTP: async function (req, res) {
        try {
            const username = req.body.username.trim().toLowerCase()
            const userOTP = req.body.otp.trim().toLowerCase()
            const authUser = await authService.getOne({ username: username });

            if (!authUser)
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
            if (authUser.otp == '')
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            otp: [
                                req.t('TRY_LATER')
                            ]
                        },
                        message: req.t('TRY_LATER'),
                        result: {}
                    })

            if (authUser.otp != userOTP) {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            otp: [
                                req.t('SMS_INCORRECT')
                            ]
                        },
                        message: req.t('SMS_INCORRECT'),
                        result: {}
                    })
            }
            authUser.otp = ''
            authUser.last_otp_time = ''
            authUser.otp_attempts = 0

            // check for account active
            if (authUser.status == AccountConstants.status.active) {
                authUser.last_active_time = Date.now();
                if (!authUser.last_month_last_active_time) {
                    authUser.last_month_last_active_time = authUser.last_active_time;
                }

                if (!authUser.oauth_token || !JWTHandler.verifyAccessToken(authUser.oauth_token).valid) {
                    authUser.oauth_token = await JWTHandler.genAccessToken(authUser._id);
                }

                if (!authUser.refresh_token || !JWTHandler.verifyRefreshToken(authUser.refresh_token).valid) {
                    authUser.refresh_token = await JWTHandler.genRefreshToken(authUser._id);
                }

                authUser.save()

                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: req.t('SUCCESS_LOGIN'),
                    result: authUser
                });
            } else {
                return res.status(HTTP_BAD_REQUEST).json(
                    {
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'username': [
                                req.t('LOGIN_FAILED')
                            ]
                        },
                        message: req.t('LOGIN_FAILED'),
                        result: {}
                    }
                )
            }

        } catch (error) {
            console.log("Error in verifyLoginOTP", error)
            return new Error('Error in verifyLoginOTP', error);
        }

    },
    QRCode: async function (req, res) {
        try {
            let url = AccountConstants.urlData
            let filePath = AccountConstants.logoImagePath
            let imageString = await convertImgBase64(filePath)
            const qrCode = await createQR(url, imageString, 150, 50);
            if (qrCode) {
                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: "QR code is verified!",
                    result: { qrCode }

                });
            } else {
                return res.status(HTTP_BAD_REQUEST).json({
                    response_code: HTTP_BAD_REQUEST,
                    key_errors: {},
                    message: "QR code is not verified!",
                    result: {}
                });
            }

        } catch (error) {
            console.log("Error in qrCodeGenerate", error);
            return new Error('Error', error);
        }
    },
    linkDeviceToken: async function (req, res) {
        try {
            let trimedBodyData = await trimObjValues(req.body)
            let tokenExpPeriod = AccountConstants.tokenOTPExpiry
            let token = Totp("JBSWY3DPEHPK3PXP", {
                digits: AccountConstants.tokenOTPDigit,
                algorithm: "SHA-512",
                period: tokenExpPeriod, // seconds
            });

            let tokenExpMin = Math.floor(tokenExpPeriod / 60);
            // let expiryTime = new Date();
            // expiryTime.setMinutes(expiryTime.getMinutes() + tokenExpMin);
            // expiryTime = new Date(expiryTime); 
            // console.log("expiryTime:::::", expiryTime)

            let deviceExist = await linkedDeviceService.getOne({ device_id: trimedBodyData.device_id });
            if (deviceExist) {
                await linkedDeviceService.findOneAndUpdate({
                    _id: deviceExist._id,
                    device_id: trimedBodyData.device_id
                },
                    {
                        token: token,
                    });
                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: req.t('LINKED_DEVICE_TOKEN_REGENERATED'),
                    result: { token, tokenExpMin }
                });
            } else {
                await linkedDeviceService.create({ device_id: trimedBodyData.device_id, token: token });

                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: req.t('LINKED_DEVICE_TOKEN_GENERATED'),
                    result: { token, tokenExpMin }
                });
            }

        } catch (error) {
            console.log("Error", error)
            return new Error('Error', error);
        }
    },
    /*  Send Forgot password OTP
        - check if user exists  
        - [ERROR] if not found, send an error response
        - send new password reset otp to email/sms
    */
    sendForgotPasswordOTP: async function (req, res) {
        try {
            const pwdReset = AccountConstants.tokenTypes.pwdReset
            const username = req.body.username.trim().toLowerCase()
            const authUser = await authService.getOne({ username: username });
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
            if (authUser.otp_attempts >= AccountConstants.smsCount) {
                //reset block attempts after 1 hr
                if (authUser.last_otp_time < (Date.now() - (1000 * 60 * 60))) {
                    await authService.findOneUpdateData({
                        _id: authUser._id
                    },
                        {
                            block_sms: '0',
                            otp_attempts: 0,
                            last_otp_time: '',
                        },
                        { useFindAndModify: false }
                    );

                }
                else {
                    // block user after certain attempts  
                    await authService.findOneUpdateData({
                        _id: authUser._id
                    },
                        { block_sms: '1' },
                        { useFindAndModify: false });

                    return res.status(HTTP_BAD_REQUEST).json({
                        response_code: HTTP_BAD_REQUEST,
                        key_errors: {
                            'sms_failed': [
                                req.t('SMS_BLOCK')
                            ]
                        },
                        message: req.t('SMS_BLOCK'),
                        result: {}
                    });
                }
            }
            const sendOTP = await TokenControllers.sendOTP(authUser._id, authUser.username, pwdReset);
            if (sendOTP) {
                res.status(HTTP_OK).json({
                    result: {},
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: authUser.otp_attempts >= 3 ? req.t("SMS_SENT_TO_USER", { field_name: authUser.username }) : authUser.otp_attempts >= 1 ? req.t('SMS_SUCCESS_RESENT') : req.t('SMS_SUCCESS'),
                });
            }
            else {
                res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    result: {},
                    response_code: HTTP_INTERNAL_SERVER_ERROR,
                    key_errors: {
                        'sms_failed': [
                            req.t('SMS_BLOCK')
                        ]
                    },
                    message: req.t('INTERNAL_SERVER_ERROR'),
                });
            }
        } catch (error) {
            console.log("Error in sendForgotPasswordOTP", error)
            return new Error('Error in sendForgotPasswordOTP', error);
        }
    },
    forgotPassword: async function (req, res) {
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
            const updatedData = await authService.findOneUpdateData({
                _id: authUser._id
            },
                { password: newPassword },
                { useFindAndModify: false }
            );
            if (updatedData) {
                return res.status(HTTP_OK).json({
                    response_code: HTTP_OK,
                    key_errors: {},
                    message: req.t('PASSWORD_RESET'),
                    result: {}
                });
            } else {
                return res.status(HTTP_BAD_REQUEST).json({
                    response_code: HTTP_BAD_REQUEST,
                    key_errors: {
                        'username': [
                            req.t('PASSWORD_RESET_FAILED')
                        ]
                    },
                    message: req.t('INTERNAL_SERVER_ERROR'),
                    result: {}
                });
            }

        } catch (error) {
            console.log("Error in forgotPassword", error)
            return new Error('Error in forgotPassword', error);
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
async function verifyAccessToken(refreshToken) {
    return JWTHandler.verifyAccessToken(refreshToken);
}

async function verifyRefreshToken(refreshToken) {
    return JWTHandler.verifyRefreshToken(refreshToken);
}
// Encrypt password and return the hashed password
async function _hashThePassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
}
// Compare encrypted password and plain password
async function _comparePasswords(password, hashedPassword) {
    const validPass = await bcrypt.compare(password, hashedPassword);
    return validPass;
}

// Creates new access and refresh tokens and send back to client
async function _generateNewTokensAndSendBackToClient(authUser, res) {
    const newAccessToken = await JWTHandler.genAccessToken(authUser._id);

    authUser = await _createNewRefreshTokenIfAboutToExpire(authUser);

    await authUser.save(async (error, savedUser) => {
        if (savedUser) {
            return res
                .status(HTTP_OK)
                .header(Headers.ACCESS_TOKEN, newAccessToken)
                .header(Headers.REFRESH_TOKEN, authUser.refreshToken)
                .json({
                    response_code: Success.SUCCESS,
                    message: Success.TOKENS_REFRESHED,
                });
        }
        // Print the error and sent back failed response
        console.log(error);
        return res.status(HTTP_BAD_REQUEST).json({
            response_code: Errors.FAILED,
            message: Errors.TOKEN_REFRESH_FAILED,
        });
    });
}

/*
Verifies if the refreshToken is about to expire in less than a day
if true : creates new refreshToken
else : send the old token
*/
async function _createNewRefreshTokenIfAboutToExpire(authUser) {
    if (authUser.refreshToken) {
        const refreshTokenVerification = verifyRefreshToken(authUser.refreshToken);
        if (refreshTokenVerification.valid) {
            const refreshTokenData = refreshTokenVerification.data;
            var timeToExpiry = refreshTokenData.exp - Date.now() / 1000;

            // looks like we have still more days for our refresh token to expire
            if (timeToExpiry > 0) {
                if (timeToExpiry / 86400 > 2) {
                    return authUser;
                }
            }
        }
    }

    // token might expire soon, so creating new token
    authUser.refreshToken = await JWTHandler.genRefreshToken(authUser._id);
    return authUser;
}

async function createQR(dataForQRcode, center_image, width, cwidth) {
    const canvas = createCanvas(width, width);
    QRCode.toCanvas(
        canvas,
        dataForQRcode,
        {
            errorCorrectionLevel: "H",
            margin: 1,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        }
    );

    const ctx = canvas.getContext("2d");
    const img = await loadImage(center_image);
    const center = (width - cwidth) / 2;
    ctx.drawImage(img, center, center, cwidth, cwidth);
    return canvas.toDataURL("image/png");
}

// function to encode file data to base64 encoded string
async function convertImgBase64(file) {
    return await imageToBase64(file) // Path to the image
        .then(
            (response) => {
                // console.log(response); // "cGF0aC90by9maWxlLmpwZw=="
                return "data:image/gif;base64," + response
            }
        )
        .catch(
            (error) => {
                console.log(error); // Logs an error if there was one
            }
        )

}

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.trimObjValues = trimObjValues;
module.exports._hashThePassword = _hashThePassword;