const Vendor = require("../models/vendor")
const BigPromise = require("../middleware/bigPromise");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary").v2;
const emailHelper = require("../utils/emailHelper");
const crypto = require("crypto")

exports.signUp = BigPromise(
    async(req,res,next) => {

        if(req.files){
            let file = req.files.photo
            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                folder: "vendor",
                crop:"scale",
                width:150
            })
            console.log(result);
            const {name,email,password, city} = req.body
            // if(!email || !name || !password || !city){
            //     return next(new Error("Name,Email,password,city are required"))
            // }
            if(!email || !name || !password || !city || !shopname){
                // return next(new Error("Name,Email,password,city are required"))
                return res.status(400).json({err:"Please fill all the fields"})
            }
            const existing = await Vendor.findOne({email})
            if(existing){
                console.log("exist");
                return res.status(401).json({err:"Already registered"})
            }
            
            const vendor = await Vendor.create({
                name,
                email,
                password,
                city,
                photo:{
                    id:result.public_id,
                    secure_url:result.secure_url
                }
            })
            cookieToken(vendor, res);
        }



        const {name,email,password, city} = req.body
        console.log(name,email,password,city)
        if(!email || !name || !password || !city){
            // return next(new Error("Name,Email,password,city are required"))
            return res.status(400).json({err:"Please fill all the fields"})
        }
        const existing = await Vendor.findOne({email})
        if(existing){
            console.log("exist");
            return res.status(401).json({err:"Already registered"})
        }

        const vendor = await Vendor.create({
            name,
            email,
            password,
            city
        })
        cookieToken(vendor, res);
    }
)

exports.login = BigPromise(
    async(req,res,next) => {
        const {email,password} = req.body;
        console.log(email,password);
        if(!email || !password){
            // return next(new Error("Email and Password are Mondatory fields"))
            return res.status(400).json({err:"Fill all the fields"})
        }
        const vendor = await Vendor.findOne({email}).select("+password")   

        if(!vendor){
            // return next(new Error("vendor does not exist...!"))
            return res.status(400).json({err:"Account does not exist"})
        }
        const valid = await vendor.isPasswordValid(password);
        if(!valid){
            // return next(new Error("Email or Password does not match or exist"))
            return res.status(400).json({err:"Email or Password does not match or exist"})
        }
        cookieToken(vendor,res);
    }
)

exports.logout = BigPromise(
    async(req,res,next) => {
        res.status(200).cookie('token',null,{
            expires: new Date(Date.now()),
            httpOnly:true
        }).json({
            "success":"true",
            "message":"Logout Successfull"
        })
    }
)

exports.forgotPassword = BigPromise(
    async(req,res,next) => {
        const {email} = req.body;
        const vendor = await Vendor.findOne({email})
        if(!vendor){
            return next(new Error("vendor does not exist"))
        }
        const forgotToken = await vendor.getForgotPasswordToken()
        await vendor.save({ validateBeforeSave:false })

        const url = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
        const message = `Here's the reset link..${url}.Goto the link to reset password `;
        try {
            await emailHelper({
                email:vendor.email,
                message,
                subject: "Password Reset email"
            })
            res.status(200).json({
                success:true,
                message:"reset mail sent"
            })
            
        } catch (error) {
            vendor.forgotPasswordToken = undefined
            vendor.forgotPasswordExpiry = undefined
            await vendor.save({ validateBeforeSave:false })
            return next(new Error(`Unable to send reset mail ${error}`))
        }
    }
)


exports.resetPassword = BigPromise(
    async(req,res,next) => {
        const token = req.params.token;
        const {password,confirmPassword} = req.body;

        const encryToken = crypto.createHash("sha256").update(token).digest("hex")

        const vendor = await Vendor.findOne({
            forgotPasswordToken:encryToken,
            forgotPasswordExpiry: {$gt: Date.now()}
        })

        if(!vendor){
            return next(new Error("vendor does not exist or link expired"))   
        }

        if(password !== confirmPassword){
            return next(new Error("Password and confirm password does not match"))   
        }
        vendor.password = password;
        vendor.forgotPasswordToken = undefined;
        vendor.forgotPasswordExpiry = undefined;
        await vendor.save({ validateBeforeSave:false })
        cookieToken(vendor,res);
    }
)

exports.getLoggedInvendorDetails = BigPromise(
    async(req,res,next) => {
        const vendor = await Vendor.findById(req.vendor._id);

        res.status(200).json({
            success:true,
            vendor
        })
    }
)

exports.changePassword = BigPromise(
    async(req, res, next) => {
        const vendorId = req.vendor._id;
        const vendor = await Vendor.findById(vendorId).select("+password")
        const {oldPassword,newPassword} = req.body

        const checkOldPassword = await vendor.isPasswordValid(oldPassword)

        if(!checkOldPassword){
            return next(new Error("Current Password is incorrect"))
        }

        vendor.password = newPassword
        await vendor.save()

        cookieToken(vendor,res);
    }
)

exports.updatvendorDetails = BigPromise(
    async(req,res,next) => {

        const newData = {
            name: req.body.name
        }
        if(req.files){
            const vendorImg = req.vendor;
            const file = req.files.photo
            const rep = await cloudinary.uploader.destroy(vendorImg.photo.id);
            console.log(rep);

            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                folder: "vendor",
                crop:"scale",
                width:150
            })
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }

        }



        const vendor = await Vendor.findByIdAndUpdate(req.vendor._id, newData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        res.status(200).json({
            succcess:true,
            vendor
        })
    }
)
