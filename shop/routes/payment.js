const express = require("express")
const { sendStripeKey, sendRazorPayKey, captureStripePayment, captureRazorpayPayment } = require("../controller/paymentController")
const router = express.Router()
const {isLoggedIn,roleCheck} = require("../middleware/user")

router.route("/stripekey").get(isLoggedIn,sendStripeKey)
router.route("/razorpaykey").get(isLoggedIn,sendRazorPayKey)

router.route("/capturestripe").post(isLoggedIn,captureStripePayment)
router.route("/capturestripe").post(isLoggedIn,captureRazorpayPayment)

module.exports = router