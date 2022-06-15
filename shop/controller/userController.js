const User = require("../models/user")
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
                folder: "user",
                crop:"scale",
                width:150
            })
            console.log(result);
            const {name,email,password, city} = req.body
            // if(!email || !name || !password || !city){
            //     return next(new Error("Name,Email,password,city are required"))
            // }
            if(!email || !name || !password || !city){
                // return next(new Error("Name,Email,password,city are required"))
                return res.status(400).json({err:"Please fill all the fields"})
            }
            const existing = await User.findOne({email})
            if(existing){
                console.log("exist");
                return res.status(401).json({err:"Already registered"})
            }
            
            const user = await User.create({
                name,
                email,
                password,
                city,
                photo:{
                    id:result.public_id,
                    secure_url:result.secure_url
                }
            })
            cookieToken(user, res);
        }



        const {name,email,password, city} = req.body
        console.log(name,email,password,city)
        if(!email || !name || !password || !city){
            // return next(new Error("Name,Email,password,city are required"))
            return res.status(400).json({err:"Please fill all the fields"})
        }
        const existing = await User.findOne({email})
        if(existing){
            console.log("exist");
            return res.status(401).json({err:"Already registered"})
        }

        const user = await User.create({
            name,
            email,
            password,
            city
        })
        cookieToken(user, res);
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
        const user = await User.findOne({email}).select("+password")   

        if(!user){
            // return next(new Error("User does not exist...!"))
            return res.status(400).json({err:"Account does not exist"})
        }
        const valid = await user.isPasswordValid(password);
        if(!valid){
            // return next(new Error("Email or Password does not match or exist"))
            return res.status(400).json({err:"Email or Password does not match or exist"})
        }
        cookieToken(user,res);
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
        const user = await User.findOne({email})
        if(!user){
            return next(new Error("User does not exist"))
        }
        const forgotToken = await user.getForgotPasswordToken()
        await user.save({ validateBeforeSave:false })

        const url = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
        const message = `Here's the reset link..${url}.Goto the link to reset password `;
        try {
            await emailHelper({
                email:user.email,
                message,
                subject: "Password Reset email"
            })
            res.status(200).json({
                success:true,
                message:"reset mail sent"
            })
            
        } catch (error) {
            user.forgotPasswordToken = undefined
            user.forgotPasswordExpiry = undefined
            await user.save({ validateBeforeSave:false })
            return next(new Error(`Unable to send reset mail ${error}`))
        }
    }
)


exports.resetPassword = BigPromise(
    async(req,res,next) => {
        const token = req.params.token;
        const {password,confirmPassword} = req.body;

        const encryToken = crypto.createHash("sha256").update(token).digest("hex")

        const user = await User.findOne({
            forgotPasswordToken:encryToken,
            forgotPasswordExpiry: {$gt: Date.now()}
        })

        if(!user){
            return next(new Error("User does not exist or link expired"))   
        }

        if(password !== confirmPassword){
            return next(new Error("Password and confirm password does not match"))   
        }
        user.password = password;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave:false })
        cookieToken(user,res);
    }
)

exports.getLoggedInUserDetails = BigPromise(
    async(req,res,next) => {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success:true,
            user
        })
    }
)

exports.changePassword = BigPromise(
    async(req, res, next) => {
        const userId = req.user._id;
        const user = await User.findById(userId).select("+password")
        const {oldPassword,newPassword} = req.body

        const checkOldPassword = await user.isPasswordValid(oldPassword)

        if(!checkOldPassword){
            return next(new Error("Current Password is incorrect"))
        }

        user.password = newPassword
        await user.save()

        cookieToken(user,res);
    }
)

exports.updatUserDetails = BigPromise(
    async(req,res,next) => {

        const newData = {
            name: req.body.name
        }
        if(req.files){
            const userImg = req.user;
            const file = req.files.photo
            const rep = await cloudinary.uploader.destroy(userImg.photo.id);
            console.log(rep);

            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                folder: "user",
                crop:"scale",
                width:150
            })
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }

        }



        const user = await User.findByIdAndUpdate(req.user._id, newData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        res.status(200).json({
            succcess:true,
            user
        })
    }
)

exports.adminAllUsers = BigPromise(
    async(req,res,next) => {
        const users = await User.find()

        res.status(200).json({
            success:true,
            users
        })
    }
)

exports.managerAllUsers = BigPromise(
    async(req,res,next) => {
        const users = await User.find({role:"user"})

        res.status(200).json({
            success:true,
            users
        })
    }
)

exports.adminOneUser = BigPromise(
    async(req,res,next) => {
        const user = await User.findById(req.params.id)

        if(!user){
            return next(new Error("No such user exist!!"))
        }

        res.status(200).json({
            success:true,
            user,
        })
    }
)

exports.adminUpdateUser = BigPromise(
    async(req,res,next) => {
        const newData = {
            name: req.body.name,
            email:req.body.email,
            role:req.body.role
        }
        if(req.files){
            const userImg = req.user;
            const file = req.files.photo
            const rep = await cloudinary.uploader.destroy(userImg.photo.id);
            console.log(rep);

            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                folder: "user",
                crop:"scale",
                width:150
            })
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url
            }

        }


        const user = await User.findByIdAndUpdate(req.params.id, newData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        res.status(200).json({
            succcess:true,
            user
        })
    }

)

exports.adminDeleteUser = BigPromise(
    async(req,res,next) => {
        const user = await User.findById(req.params.id)

        if(!user){
            return next(new Error("User does not exist"))
        }

        if(user.photo.id){
            const resp = await cloudinary.uploader.destroy(user.photo.id)

        }

        const delresp = await user.remove()

        res.status(200).json({
            succcess:true,
            message: "Deleted user"
        })
    }
)
