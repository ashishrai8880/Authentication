const {HTTP_INTERNAL_SERVER_ERROR, HTTP_OK, HTTP_BAD_REQUEST} = require("../utils/constants").code_status;
const Validators = require("../utils/validators");


/* access token field validation middleware
    
*/
module.exports.validatePackageField = async(req,res,next) => {
  // const token = req.body.token || req.query.token || req.headers['authorization']
  const { error,value } = Validators.packageValidation(req, req.body);

  if (error) return sendError(error.details[0].message, error, res, HTTP_BAD_REQUEST);

  req.body.country_code=value.country_code
    next();
 
}

function sendError(message, error, res, code=HTTP_BAD_REQUEST) {
  console.log(message, error)
  return res.status(code).json({
    response_code: code.toString(),
    key_errors: {[error.details[0].context.key||'error']:[error.details[0].message||message]},
    message:error.details[0].message,
    result:{}
  });
}
