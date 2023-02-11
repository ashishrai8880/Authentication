const router = require("express").Router();
const { internalServerError } = require("../utils/response");
const UserMiddlewares = require("../middlewares/user");
const PackageGroupMiddlewares = require("../middlewares/package_groups");
const PackageGroupControllers = require("../controllers/package_groups");

/* 
  user profile details through access_token
*/
router.get(
  "/get_packs_by_group", 
  UserMiddlewares.validateTokenField, 
  PackageGroupMiddlewares.validatePackageField, 
  async (req, res) => {
    try {
      await PackageGroupControllers.getPacks(req, res);
    } catch (error) {
      internalServerError(res,req, error);
    }
});

module.exports = router;
