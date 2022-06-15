const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Product name is required.."],
        trim: true,
        maxlength: [200, "Product name max length is 200"]
    },
    price:{
        type:Number,
        required: [true, "Price is required"],
        maxlength:[5, "price is limited to 5 digits"]
    },
    description:{
        type:String,
        required:[true, "Product description is Mandatory"],
    },
    photos:[
        {
            id:{
                type:String,
                required:true
            },
            secure_url: {
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required: [true, "Category is required"],
        enum:{
            values: [
                'gift',
                'flowers',
                'handmadegifts'
            ],
            message: "Select from any of these Gifts, flowers,Handmade gifts "
        }
    },
    stock:{
        type:Number,
        required:[true,"please add stock available"]
    },
    brand:{
        type:String,
        required:[true,"Please add a brand name"]
    },
    rating:{
        type:Number,
        default:0,
    },
    noOfReviews: {
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    city:{
        type:String,
        required:true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now()
    }
})


module.exports = mongoose.model('Product', productSchema)