const bigPromise = require("../middleware/bigPromise")
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = bigPromise ( 
    async(req,res,next) =>{
        res.status(200).json({
            stripeKey: process.env.STRIPE_API_KEY
        })
    }
)
exports.sendRazorPayKey = bigPromise ( 
    async(req,res,next) =>{
        res.status(200).json({
            stripeKey: process.env.RAZOR_KEY
        })
    }
)

exports.captureStripePayment = bigPromise(
    async(req,res,next) =>{
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'inr',
            metadata:{integration_check: "accept-a-payment"}
          });
          res.status(200).json({
              success:true,
              client_secret:paymentIntent.client_secret
          })
    }

)

exports.captureRazorpayPayment = bigPromise(
    async (req,res,next) =>{
        var instance = new Razorpay({ key_id: process.env.RAZOR_KEY, key_secret: process.env.RAZOR_SECRET })

        options = {
        amount: 50000,
        currency: "INR",
        receipt: "receipt#1",
        }

        const respo = await instance.orders.create(options)
        res.status(200).json({
            success:true,
            orders:respo
        })
    }
)