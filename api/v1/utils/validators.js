// validation
const Joi = require("@hapi/joi");
const { PLATFORM, COUNTRY } = require('../utils/constants/variable_constants')

const usernameValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(256).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` })
      }),
  });

  return schema.validate(data);
};

const registerValidation = (req, data) => {
  const schema = Joi.object({
    type: Joi.string().required().valid("email", "mobile").messages({
      'any.required': req.t("REQUIRED", { field_name: "type" }),
      'any.only': req.t("REQUIRED", { field_name: "type" }),
    }),
    email: Joi.alternatives().conditional(
      'type', {
      is: "email",
      then: Joi.string().email().min(3).max(256).required()
        .messages({
          "string.empty": req.t("REQUIRED", { field_name: "email" }),
          "string.base": req.t("REQUIRED", { field_name: "email", type: "text" }),
          "any.required": req.t("REQUIRED", { field_name: "email" }),
          "string.min": req.t("MIN_LENGTH", { field_name: "email", limit: `{#limit}` }),
          "string.max": req.t("MAXIMUM_LENGTH", { field_name: "email", limit: `{#limit}` }),
          "string.email": req.t("VALID_EMAIL", { field_name: "email" }),
        })
    }
    ),
    mobile: Joi.alternatives().conditional('type', {
      is: "mobile", then: Joi.string().min(10).max(12).pattern(/^[0-9]+$/).required()
        .messages({
          "string.empty": req.t("REQUIRED", { field_name: "mobile" }),
          "string.base": req.t("REQUIRED", { field_name: "mobile", type: "text" }),
          "any.required": req.t("REQUIRED", { field_name: "mobile" }),
          "string.min": req.t("MIN_LENGTH", { field_name: "mobile", limit: `{#limit}` }),
          "string.max": req.t("MAXIMUM_LENGTH", { field_name: "mobile", limit: `{#limit}` }),
          "string.mobile": req.t("VALID_MOBILE", { field_name: "mobile" }),
        })
    }),
    password: Joi.string().min(8).max(16).required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "password" }),
      "string.base": req.t("REQUIRED", { field_name: "password", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "password" }),
      "string.min": req.t("MIN_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.max": req.t("MAXIMUM_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.password": req.t("VALID_EMAIL", { field_name: "password" }),
    }),
    catalogue_id: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "catalogue_id" }),
      "string.base": req.t("REQUIRED", { field_name: "catalogue_id", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "catalogue_id" }),
    }),
    device_id: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "device_id" }),
      "string.base": req.t("REQUIRED", { field_name: "device_id", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "device_id" }),
    }),
    country: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "country" }),
      "string.base": req.t("REQUIRED", { field_name: "country", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "country" }),
    }),
    platform: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "platform" }),
      "string.base": req.t("REQUIRED", { field_name: "platform", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "platform" }),
    }),
    device_token: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "device_token" }),
      "string.base": req.t("REQUIRED", { field_name: "device_token", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "device_token" }),
    }),
    os_version: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "os_version" }),
      "string.base": req.t("REQUIRED", { field_name: "os_version", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "os_version" }),
    }),
    age: Joi.string().optional(),
    gender: Joi.string().optional(),
    app_version: Joi.string().optional(),
    build_version: Joi.string().optional()
  }).xor('email', 'mobile').label('xor failure').required().messages({
    'object.xor': req.t("REQUIRED", { field_name: "mobile or email" }),
    'object.missing': req.t("REQUIRED", { field_name: "mobile or email" }),
    "alternatives.any": req.t("REQUIRED", { field_name: "mobile or email" })
  });

  return schema.validate(data, { abortEarly: false });
};

const resendOTPValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(256).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` })
      }),
    otp_type: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "otp_type" }),
      "string.base": req.t("REQUIRED", { field_name: "otp_type", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "otp_type" }),
    }),
  });

  return schema.validate(data);
};

const loginFieldValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "number.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` }),

      }),
    password: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "password" }),
      "string.base": req.t("REQUIRED", { field_name: "password", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "password" }),
    }),
  });

  return schema.validate(data);
};

const changePassValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(256).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` })
      }),
    password: Joi.string().min(8).max(16).required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "password" }),
      "string.base": req.t("REQUIRED", { field_name: "password", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "password" }),
      "string.min": req.t("MIN_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.max": req.t("MAXIMUM_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.password": req.t("VALID_EMAIL", { field_name: "password" }),
    }),
    confirm_password: Joi.string().required().equal(Joi.ref('password'))
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "confirm password" }),
        "string.base": req.t("REQUIRED", { field_name: "confirm password", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "confirm password" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "confirm password", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "confirm password", limit: `{#limit}` }),
        "any.only": req.t("CONFIRM_PASSWORD_NOT_MATCHED", { field_name: "confirm password" }),
      }),
  })

  return schema.validate(data);
};

const otpValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(256).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` })
      }),
    otp: Joi.number().required().messages({
      "number.empty": req.t("REQUIRED", { field_name: "otp" }),
      "number.base": req.t("REQUIRED", { field_name: "otp", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "otp" }),
      "number.min": req.t("MIN_LENGTH", { field_name: "otp", limit: `{#limit}` }),
      "number.max": req.t("MAXIMUM_LENGTH", { field_name: "otp", limit: `{#limit}` }),
    }),
  });

  return schema.validate(data);
};

const updatePassValidation = (req, data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(256).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "username" }),
        "string.base": req.t("REQUIRED", { field_name: "username", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "username" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "username", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "username", limit: `{#limit}` })
      }),
    password: Joi.string().min(8).max(16).required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "password" }),
      "string.base": req.t("REQUIRED", { field_name: "password", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "password" }),
      "string.min": req.t("MIN_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.max": req.t("MAXIMUM_LENGTH", { field_name: "password", limit: `{#limit}` }),
      "string.password": req.t("VALID_EMAIL", { field_name: "password" }),
    }),
    confirm_password: Joi.string().required().equal(Joi.ref('password'))
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "confirm password" }),
        "string.base": req.t("REQUIRED", { field_name: "confirm password", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "confirm password" }),
        "string.min": req.t("MIN_LENGTH", { field_name: "confirm password", limit: `{#limit}` }),
        "string.max": req.t("MAXIMUM_LENGTH", { field_name: "confirm password", limit: `{#limit}` }),
        "any.only": req.t("CONFIRM_PASSWORD_NOT_MATCHED", { field_name: "confirm password" }),
      }),
    current_password: Joi.string().required()
  });

  return schema.validate(data);
};
const packageValidation = (req, data) => {
  const schema = Joi.object({
    platform: Joi.any().valid(...Object.values(PLATFORM)).required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "platform" }),
        "string.base": req.t("REQUIRED", { field_name: "platform", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "platform" }),
        // "any.only": req.t("REQUIRED", { field_name: "platform" }),
      }),
    country_code: Joi.any().valid(...Object.values(COUNTRY)).default("ROW")
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "country_code" }),
        "string.base": req.t("REQUIRED", { field_name: "country_code", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "country_code" }),
        "any.only": req.t("REQUIRED", { field_name: "country_code" }),
      }),
    code: Joi.string()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "code" }),
        "string.base": req.t("REQUIRED", { field_name: "code", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "code" }),
        "any.only": req.t("REQUIRED", { field_name: "code" }),
      })
  });

  return schema.validate(data);
};

const linkDeviceTokenValidation = (req, data) => {
  const schema = Joi.object({
    device_id: Joi.string().required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "device_id" }),
        "string.base": req.t("REQUIRED", { field_name: "device_id", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "device_id" }),
      }),
  })

  return schema.validate(data);
};

const verifyLinkDeviceTokenValidation = (req, data) => {
  const schema = Joi.object({
    device_id: Joi.string().required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "device_id" }),
        "string.base": req.t("REQUIRED", { field_name: "device_id", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "device_id" }),
      }),
    _userId: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "_userId" }),
      "string.base": req.t("REQUIRED", { field_name: "_userId", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "_userId" }),
    }),
    token: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "token" }),
      "string.base": req.t("REQUIRED", { field_name: "token", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "token" }),
    }),
  })

  return schema.validate(data);
};

const addProfileValidation = (req, data) => {
  const schema = Joi.object({
    _userId: Joi.string().required()
      .messages({
        "string.empty": req.t("REQUIRED", { field_name: "_userId" }),
        "string.base": req.t("REQUIRED", { field_name: "_userId", type: "text" }),
        "any.required": req.t("REQUIRED", { field_name: "_userId" }),
      }),
    profile_name: Joi.string().required().messages({
      "string.empty": req.t("REQUIRED", { field_name: "profile_name" }),
      "string.base": req.t("REQUIRED", { field_name: "profile_name", type: "text" }),
      "any.required": req.t("REQUIRED", { field_name: "profile_name" }),
    }),
    is_child: Joi.boolean().required().messages({
      "boolean.empty": req.t("REQUIRED", { field_name: "is_child" }),
      "boolean.base": req.t("REQUIRED", { field_name: "is_child" }),
      "any.required": req.t("REQUIRED", { field_name: "is_child" }),
    }),
    viewing_restriction: Joi.string().allow('').allow(null)
  })

  return schema.validate(data);
};

const emailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(256).required().email(),
  });

  return schema.validate(data);
};

const isEmail = (user) => {
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return user.toString().match(regexEmail);
};

const isPhone = (phone) => {
  var re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(phone.toString().replace(/\s+/g, ""));
};

module.exports.emailValidation = emailValidation;
module.exports.registerValidation = registerValidation;
module.exports.otpValidation = otpValidation;
module.exports.changePassValidation = changePassValidation;
module.exports.isEmail = isEmail;
module.exports.isPhone = isPhone;
module.exports.loginFieldValidation = loginFieldValidation;
module.exports.updatePassValidation = updatePassValidation;
module.exports.packageValidation = packageValidation;
module.exports.usernameValidation = usernameValidation;
module.exports.resendOTPValidation = resendOTPValidation;
module.exports.linkDeviceTokenValidation = linkDeviceTokenValidation;
module.exports.verifyLinkDeviceTokenValidation = verifyLinkDeviceTokenValidation;
module.exports.addProfileValidation = addProfileValidation;