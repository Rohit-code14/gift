const bigPromise = require("../middleware/bigPromise")
const Order = require("../models/order")
const product = require("../models/product")
const Product = require("../models/product")

exports.createOrder = bigPromise(
    async(req,res,next) => {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount
        } = req.body
        const user = req.user._id

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount,
            user
        })

        res.status(200).json({
            success:true,
            order
        })
    }
)


exports.findOneOrder = bigPromise(
    async(req,res,next) => {
        const orderId = req.params.id
        if(!orderId){
            return next(new Error("No ID provided"))
        }
        const order = await Order.findById(orderId)
        if(!order){
            return next(new Error("No ID provided"))
        }

        return res.status(200).json({
            success:true,
            order
        })
    }
)


exports.adminGetAllOrders = bigPromise(
    async(req,res,next) => {
        const orders = await Order.find()

        return res.status(200).json({
            success:true,
            orders
        })
    }
)

exports.getMyOrders = bigPromise(
    async(req,res,next) =>{
        const orders = await Order.find({user:req.user._id})

        res.status(200).json({
            success:true,
            orders
        })
    }
)

exports.adminUpdateOrder = bigPromise(
    async(req,res,next)=>{
        const orderId = req.params.id
        if(!orderId){
            return next(new Error("No Id passed"))
        }
        const order = await Order.findById(orderId)
        if(order.orderStatus === "delivered"){
            return next(new Error("Order already delivered..Cannot update status"))
        }

        order.orderStatus = req.body.status

        if(req.body.status === "delivered"){
            order.orderItems.forEach(async prod =>{
                await updateStockInProduct(prod.product,prod.quantity)
            })
        }
        await order.save()

    }
)

async function updateStockInProduct(prodId,qty){
    const product = await Product.findById(prodId)

    product.stock -= qty

    await product.save({validateBeforeSave:false})

}


exports.adminDeleteOrder = bigPromise(
    async(req,res,next) =>{
        const orderId = req.params.id
        if(!orderId){
            return next(new Error("No Id provided"))
        }
        const order = await Order.findById(orderId)
        await order.remove()

        res.status(200).json({
            success:true,
            message:"deleted"
        })
    }
)