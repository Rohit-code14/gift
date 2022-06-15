const express = require("express")
const { 
    adminAddProduct,
    getProductByCategory,
    getAllProduct,
    getOneProduct,
    adminUpdateOneProduct,
    adminDeleteProduct,
    getReviewsOfOneProduct,
    addReview,
    deleteReview,
    getProductByLocation
 } = require("../controller/productController")
const router = express.Router()
const {isLoggedIn,roleCheck} = require("../middleware/user")



router.route("/admin/product/add").post(isLoggedIn,roleCheck("admin"),adminAddProduct)
router.route("/product/category").get(getProductByCategory)
router.route("/product/all").get(getAllProduct)
router.route("/product/city/:city").get(getProductByLocation)
router.route("/product/:id").get(getOneProduct)
router.route("/product/review/add/:id").put(isLoggedIn, addReview)
router.route("/product/review/delete/:id").delete(isLoggedIn, deleteReview)
router.route("/product/get/:id").get(getReviewsOfOneProduct)
router.route('/product/getbycategory/:cat').get(getProductByCategory)
router.route("/admin/product/update/:id").post(isLoggedIn,roleCheck("admin"),adminUpdateOneProduct)
router.route("/admin/product/delete/:id").delete(isLoggedIn,roleCheck("admin"),adminDeleteProduct)


module.exports = router