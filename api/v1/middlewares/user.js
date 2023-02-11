const CodeContants = require("../utils/constants").code_status;
const JWTHandler = require("../../../core/jwt");
const Auth = require("../models/auth");
const Validators = require("../utils/validators");
const {HTTP_CREATED, HTTP_BAD_REQUEST} = require("../utils/constants").code_status;

const redisClient = require('../../../core/redis')

/* access token field validation middleware
    
*/
module.exports.validateTokenField = async(req,res,next) => {
  // const token = req.body.token || req.query.token || req.headers['authorization']
  req.Auth = undefined;

  const request_header = req.headers['authorization'] || ''
  if (request_header.startsWith('Bearer')) {
    const access_token = request_header.substring(7, request_header.length);
  
    const { valid, data, error } = await JWTHandler.verifyAccessToken(access_token);
    // console.log(valid, data, error)

    if (!valid || error)
    return this.sendJWTerror('Unauthorized access.', res)

    if (data) {
      const user =  await Auth.findOne({_id:data.authId,oauth_token:access_token});
      if(user){
      req.Auth =  user;
      return next();
      }
      else{
        return  this.sendJWTerror('Invalid User', res)
      }
    }
    else{
      return  this.sendJWTerror('Something went wrong.', res)
    }

  }
  else{
    return this.sendJWTerror('No token provided.', res)

  }
}


module.exports.sendJWTerror = (error, res) => {
  return res.status(CodeContants.HTTP_BAD_REQUEST).json({
      "response_code": CodeContants.HTTP_BAD_REQUEST,
      "message": error,
      key_errors: error,
      result:{}
     });
};

function sendErrorWithCode(message, error, res, code=HTTP_BAD_REQUEST) {
  console.log(message, error)
  return res.status(code).json({
    response_code: code.toString(),
    key_errors: {[error.details[0].context.key||'error']:[error.details[0].message||message]},
    message:error.details[0].message,
    result:{}
  });
}
function sendError(message, error, res) {
  console.log(message, error)
  if(typeof error === 'string' || error instanceof String){
    return res.status(HTTP_BAD_REQUEST).json({
      response_code: HTTP_BAD_REQUEST.toString(),
      key_errors: {'error':message},
      message:message,
      result:{}
    });
  }

  return res.status(HTTP_BAD_REQUEST).json({
    response_code: HTTP_BAD_REQUEST.toString(),
    key_errors: {[error.details[0].context.key||'error']:[error.details[0].message||message]},
    message:message,
    result:{}
  });
}

module.exports.validateLinkDeviceTokenFields = (req, res, next) => {
  const { error } = Validators.verifyLinkDeviceTokenValidation(req, req.body);
  if (error) return sendErrorWithCode(error.details[0].message, error, res, HTTP_BAD_REQUEST);
    next();
};

/* password change fields validation middleware
*/
module.exports.validatePasswordUpdateFields = (req, res, next) => {
  const { error } = Validators.updatePassValidation(req,req.body);
  if (error) return sendErrorWithCode(error.details[0].message, error, res, HTTP_BAD_REQUEST);
  
  next();
};

module.exports.validateAddProfileFields = (req, res, next) => {
  const { error } = Validators.addProfileValidation(req, req.body);
  if (error) return sendErrorWithCode(error.details[0].message, error, res, HTTP_BAD_REQUEST);
    next();
};


async function profilePost(req, res, next) {
  try {
    let profileData = await redisClient.get('profile_post');
    let profilePost = JSON.parse(profileData)
    if(profilePost){
        // console.log("from Redis::::")
        return res.status(HTTP_CREATED).json(
        {
            response_code: HTTP_CREATED,
            key_errors: {},
            message:req.t('PROFILE_DETAILS_FETCHED'),
            result: {profilePost}
        })
    }else {
      next()
    }
  } catch (error) {
    console.log("profilePost Error", error)
    return new Error('Error in getProfile',error);
  }
};
module.exports.profilePost = profilePost