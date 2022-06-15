const express = require("express")
const router = express.Router()
const {isLoggedIn,roleCheck} = require("../middleware/user")

const {createOrder, findOneOrder, adminGetAllOrders, getMyOrders, adminUpdateOrder, adminDeleteOrder} = require("../controller/orderController");


router.route("/order/create").post(isLoggedIn,createOrder);
router.route("/order/get/:id").get(isLoggedIn,findOneOrder);
router.route("/order/my/all").get(isLoggedIn,getMyOrders)

router.route("/admin/order/all").get(isLoggedIn,roleCheck("admin"),adminGetAllOrders)
router.route("/admin/order/update").post(isLoggedIn,roleCheck("admin"),adminUpdateOrder)
router.route("/admin/order/delete/:id").delete(isLoggedIn,roleCheck("admin"),adminDeleteOrder)

module.exports = router