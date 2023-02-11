const PACKAGEGROUPS = require("../models/package_groups");
const ASSET = require("../models/asset");
const mongoose = require("mongoose");
const { db_name, asset_db } = require("../utils/constants/catalogue");
const { HTTP_OK } = require("../utils/constants/response_status_codes");

module.exports.getPacks = async (req, res) => {
  // check if user exists
const {country_code, platform, code}=req.body;
//log(ASSET.)
if(code){
    const a=await ASSET.findByCode(code).select('-country')
    return res.status(HTTP_OK).json({
    response_code: HTTP_OK,
    message: '',
    key_errors: {},
    result: a
  });

}
const a= await PACKAGEGROUPS.find({country_code:country_code,os:platform})
return res.status(HTTP_OK).json({
    response_code: HTTP_OK,
    message: '',
    key_errors: {},
    result: a
  });

  
  }


  function log(...str){
      str.forEach(item=>console.log(item))
    
  }