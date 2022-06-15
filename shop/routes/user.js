const express = require("express")
const router = express.Router()
const {
    signUp,
    login, 
    logout, 
    forgotPassword,resetPassword, 
    getLoggedInUserDetails, 
    changePassword, 
    updatUserDetails, 
    adminAllUsers, 
    managerAllUsers,
    adminOneUser,
    adminUpdateUser,
    adminDeleteUser
} = require("../controller/userController")
const { isLoggedIn,roleCheck,verify } = require("../middleware/user")

router.route("/signup").post(signUp)
router.route("/login").post(login)
router.route("/verify").post(verify)
router.route("/logout").get(logout)
router.route("/forgotpassword").post(forgotPassword)
router.route("/password/reset/:token").post(resetPassword)
router.route("/dashboard").get(isLoggedIn,getLoggedInUserDetails)
router.route("/password/update").post(isLoggedIn, changePassword)
router.route("/userdashboard/update").post(isLoggedIn, updatUserDetails)


router.route("/admin/users").get(isLoggedIn,roleCheck('admin'), adminAllUsers)
router.route("/manager/users").get(isLoggedIn,roleCheck('manager'), managerAllUsers)
router.route("/admin/user/:id")
    .get(isLoggedIn,roleCheck('admin'),adminOneUser)
    .put(isLoggedIn,roleCheck('admin'),adminUpdateUser)
    .delete(isLoggedIn,roleCheck('admin'),adminDeleteUser)

module.exports = router