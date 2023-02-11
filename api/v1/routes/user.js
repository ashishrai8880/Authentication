const router = require("express").Router();
const AuthMiddlewares = require("../middlewares/auth");
const UserMiddlewares = require("../middlewares/user");
const UserController = require("../controllers/user_controller");
const ProfileController = require("../controllers/profile_controller");

router.post('/verify/linkdevicetoken', UserMiddlewares.validateTokenField, UserMiddlewares.validateLinkDeviceTokenFields, UserController.verifyLinkDeviceToken);
router.post('/logout', UserMiddlewares.validateTokenField, AuthMiddlewares.validUsername, UserController.logout);
router.put('/password/change', UserMiddlewares.validateTokenField, UserMiddlewares.validatePasswordUpdateFields, UserController.updatePassword);
router.post('/addprofile', UserMiddlewares.validateTokenField, UserMiddlewares.validateAddProfileFields, ProfileController.addProfile);
router.put('/updateprofile/id', UserMiddlewares.validateTokenField, ProfileController.editProfile);
router.post('/profile', UserMiddlewares.validateTokenField, ProfileController.getAllProfile);
router.post('/profile/id', UserMiddlewares.validateTokenField, ProfileController.getProfile);
router.delete('/profile/delete/id', UserMiddlewares.validateTokenField, ProfileController.deleteProfile);
router.post('/profile/setting', UserMiddlewares.validateTokenField, ProfileController.getAllProfileSetting);
router.put('/profile/updatesetting/id', UserMiddlewares.validateTokenField, ProfileController.editProfileSetting);
router.put('/account/updatesetting/id', UserMiddlewares.validateTokenField, UserController.editGlobalSetting);


module.exports = router;
