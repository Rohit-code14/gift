const bigPromise = require("../middleware/bigPromise")
const cloudinary = require("cloudinary").v2
const Product  = require("../models/product")
const whereClause = require("../utils/whereClause")

exports.adminAddProduct = bigPromise(
    async(req,res,next) => {
        const imageArray = []

        if(!req.files){
            return next(new Error("Image is required"))
        }
        if(req.files){
            for (let index = 0; index < req.files.photos.length; index++) {
                const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath,{
                    folder:"products"
                });
                imageArray.push({
                    id:result.public_id,
                    secure_url: result.secure_url
                })
            }
        }
        const {name, price, description, category, brand,stock,city} = req.body;
        const user = req.user._id
        // const user = "61b485ff1276d063e4f24f43"

        const product = await Product.create({
            name,
            price,
            description,
            category,
            brand,
            stock,
            user,
            city,
            photos:imageArray
        })

        res.status(200).json({
            success:true,
            message:"Product created",
            product
        })
    }
)


exports.getProductByCategory = bigPromise(
    async(req,res,next) =>{
        const {category} = req.body;
        const category2 = JSON.stringify(category);
        const products = await Product.find({category:category2});
        console.log("category - "+category);
        res.status(200).json({
            sucess:200,
            products
        })
    }
)

exports.getAllProduct = bigPromise(
    async(req,res,next) => {
        const resultPerPage = 6

        const productsObj =new whereClause(Product.find(),req.query).search().filter()

        const products = await productsObj.base
        const filteredProductNumber = products.length

        productsObj.pager(resultPerPage)
        // console.log(products);
        res.status(200).json({
            success: true,
            products,
            filteredProductNumber
        })
    }
)

exports.getOneProduct = bigPromise(
    async(req,res,next) => {
        const productId = req.params.id
        if(!productId){
            return next(new Error("No product ID provided"))
        }
        const product = await Product.findById(productId)
        return res.status(200).json({
            success:true,
            product
        })
    }
)


exports.adminUpdateOneProduct = bigPromise(
    async(req,res,next) =>{
        const productId = req.params.id
        let product = Product.findById(productId)
        if(!productId){
            return next(new Error("Invalid Product Id"))
        }

        const imagesArray = []
        if(req.files){
            if (product.photos){

                for(let index=0;index<product.photos.length;index++){
                    const res = await cloudinary.uploader.destroy(product.photos[index].id)
                    console.log("resss = ",res)
                }
            }
            console.log("length = ",req.files.photos.length)
            for (let index = 0; index < req.files.photos.length; index++) {
                console.log("into loop")
                const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath,{
                    folder:"products"
                });
                console.log(result);
                imagesArray.push({
                    id:result.public_id,
                    secure_url: result.secure_url
                })
            }
            
            const photos = imagesArray
            const {name,price,description,category,brand} = req.body
            const prod = {
                name,
                price,
                description,
                brand,
                category,
                photos 
            }
            product = await Product.findByIdAndUpdate(productId,prod,{
                new:true,
                runValidators:true,
                useFindAndModify:false
            })
            return res.status(200).json({
                success:true,
                product
            })
        }
        else{
            const {name,price,description,category,brand} = req.body
            const prod = {
                name,
                price,
                description,
                brand,
                category
            }
            product = await Product.findByIdAndUpdate(productId,prod,{
                new:true,
                runValidators:true,
                useFindAndModify:false
            })
            res.status(200).json({
                success:true,
                product
            })
        }
        
    }
    )
    
    exports.adminDeleteProduct = bigPromise(
        async(req,res,next) =>{
            const prodId = req.params.id
            if (!prodId){
                return next(new Error("Product Not passed"))
            }
            
            const product = Product.findById(prodId)
            
            if (!product){
                return next(new Error("Product does not exist"))
            }
            
            if (product.photos){
                for(let index=0;index<product.photos.length;index++){
                    const res = await cloudinary.uploader.destroy(product.photos[index].id)
                    console.log("resss = ",res)
                }
            }

            const resss = await product.remove()
            console.log(resss)

            res.status(200).json({
                success:true
            })


    }
)

exports.addReview = bigPromise(
    async(req,res,next) => {
        const productId = req.params.id

        if(!productId){
            return next(new Error("Invalid product"))
        }

        const product = await Product.findById(productId)

        if(!product){
            return next(new Error("product does not exist"))
        }
        if(product.reviews){
            for(i=0;i<product.reviews.length;i++){
                if (product.reviews[i].user.toString() == req.user._id){
                    return res.status(200).json({
                        success:true,
                        message:"Already Reviewed !"
                    })
                }
            }
        }
        const {rating,comment} = req.body
        const review = {
            user:req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        }
        
        // product.update({...product.reviews,review})
        if(!product.reviews){
            product.reviews = [review]
        }
        else{
            product.reviews.push(review)
        }
        product.noOfReviews = product.reviews.length

        product.rating = product.reviews.reduce((initial,current) => (current.rating + initial),0)/product.noOfReviews

        await product.save({
            validateBeforeSave:false
        })

        res.status(200).json({
            success:true,
            message:"review added successfully"
        })

    }
)

exports.deleteReview = bigPromise(
    async(req,res,next) => {
        const prodId = req.params.id
        
        if(!prodId){
            return next(new Error("Invalid product"))
        }
        
        const product = await Product.findById(prodId)
        
        if(!product){
            return next(new Error("product does not exist"))
        }

        const reviews = product.reviews.filter(
            (rev) => rev.user.toString() === req.user._id
        )

        const noOfReviews = reviews.length
        var rating;
        if (!product.reviews){
            rating = 0
        }
        else{
            rating = product.reviews.reduce((init,curr) => (Number(curr.rating) + Number(init)),0)/noOfReviews
        }
        if (!rating){
            rating = 0
        }
        await Product.findByIdAndUpdate(prodId,
            {
                reviews,
                rating:Number(rating),
                noOfReviews
            },{
                runValidators:true,
                useFindAndModify:false,
                new:true
            }
            )
        res.status(200).json({
            success:true,
            message:"review deleted successfully"
        })
        
    }
)


exports.getReviewsOfOneProduct = bigPromise(
    async(req,res,next) =>{
        const prodId = req.params.id

        if(!prodId){
            return next(new Error("Product ID not passed"))
        }
        const product = Product.findById(prodId)

        if (!product){
            return next(new Error("Product does not exist"))
        }

        res.status(200).json({
            success:true,
            reviews:product.reviews
        })
    }
)

exports.getProductByLocation = bigPromise(
    async(req,res,next)=>{
        const city2 = req.params.city;

        const products = await Product.find({city:{$eq:city2}});

        res.status(200).json({
            products
        });
    }
)