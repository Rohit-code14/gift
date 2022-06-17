const bigPromise = require("./bigPromise");
const User = require("../models/user");
const jwt = require("jsonwebtoken")

exports.isLoggedIn = bigPromise(
    async(req,res,next) => {
        const token =req.body.token || req.cookies.token || req.header("Authorization").replace('Bearer ','')

        if(!token){
            // return next(new Error("Login to access"))
            return res.status(400).json({
                success:false
            })
        }

        const decode = jwt.verify(token, process.env.SECRET)

        req.user = await User.findById(decode.id)

        next();
        
    }
)
exports.verify = bigPromise(
    async(req,res,next) => {
        const token =req.body.token || req.cookies.token || req.header("Authorization").replace('Bearer ','')

        if(!token){
            return next(new Error("Login to access"))
        }

        const decode = jwt.verify(token, process.env.SECRET)

        req.user = await User.findById(decode.id)

        res.status(200).json({
            success:true,
            message:"auth"
        })
        
    }
)

exports.roleCheck = (...role) =>{

    return (req,res,next) => {
        console.log(req.user.role);
        console.log(role);
        if(!role.includes(req.user.role)){
            return next(new Error("You are Unauthorized to access this"))
        }
        next()
    }
}