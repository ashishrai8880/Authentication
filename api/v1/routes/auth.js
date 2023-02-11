const router = require("express").Router();
const AuthMiddlewares = require("../middlewares/auth");
const AuthController = require("../controllers/auth_controller");


router.post('/checkuser', AuthMiddlewares.validUsername, AuthController.checkUser);
router.post('/register', AuthMiddlewares.validateRegisterFields, AuthMiddlewares.validPassword, AuthController.register);
router.post('/resend/otp', AuthMiddlewares.validateResendOTPFields, AuthController.resendOTP);
router.post('/verify/otp', AuthMiddlewares.validateOTPChangeFields, AuthController.verifyOTP);
router.post('/login', AuthMiddlewares.validateLoginFields, AuthController.login);
router.post('/password/forgot', AuthMiddlewares.validUsername, AuthController.sendForgotPasswordOTP);
router.put('/password/forgot/newpassword', AuthMiddlewares.validatePasswordResetFields, AuthController.forgotPassword);
router.post('/login/otp', AuthMiddlewares.validUsername, AuthController.loginWithOTP);
router.post('/login/verifyotp', AuthMiddlewares.validateOTPChangeFields, AuthController.verifyLoginOTP);
// Only for TV
router.get('/qrCode', AuthController.QRCode);
router.post('/linkdevicetoken', AuthMiddlewares.validateLinkDeviceFields, AuthController.linkDeviceToken);

module.exports = router;