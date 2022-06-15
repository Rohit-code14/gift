const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40, "Name should be under 40 characters"]
    },
    email: {
        type: String,
        required: [true, "Please Provide a email"],
        validate: [validator.isEmail, "Please enter email in correct format"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please Provide a Password"],
        minlength: [6, "Password should be atleast 6 characters long"],
        select: false
    },
    role: {
        type: String,
        default: "user",
    },
    photo: {
        id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    city:{
        type:String,
        required:[true,"Please Provide your city"]
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
})
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordValid = async function(inpPassword){
    return await bcrypt.compare(inpPassword,this.password)
}

userSchema.methods.getJwtToken = async function(){
    return jwt.sign({ id:this._id },process.env.SECRET, {
        expiresIn:process.env.EXP,
    })
}

userSchema.methods.getForgotPasswordToken = async function(){
    const ftoken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto.createHash("sha256").update(ftoken).digest("hex")
    this.forgotPasswordExpiry = await Date.now() + 10*60*1000

    return ftoken
}
module.exports = mongoose.model("User", userSchema)