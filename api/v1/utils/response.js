const { SERVER_ERROR_CODE } = require("./constants").code_status;

// sends internal server error response
module.exports.internalServerError = (res,req, error) => {
  console.log(error);
  res.status(500).json({
    response_code: SERVER_ERROR_CODE,
    key_errors: error,
    message:req.t('INTERNAL_SERVER_ERROR'),
    result: {}    

  });
  
};
