const Client = require('../../singleton/client')

module.exports = {
 
  getBucket: async function () {
    try {
        let client = await Client.Singleton.getInstance();
        const clientCloudfront = client.image_cloudfront.cloudfront_status
        const clientBucket = client.image_cloudfront.cloudfront_bucket
        const filterObject = {
            "is_cloudfront_enabled": clientCloudfront,
            "bucket": clientBucket
        }
        // Encode the String
        var encodedFilterData = Buffer.from(JSON.stringify(filterObject)).toString('base64')
        return encodedFilterData
    }catch (error) {
      console.log("Error", error)
      return new error;
      }  
  }
}

