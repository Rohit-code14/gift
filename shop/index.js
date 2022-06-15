const app = require("./app");
const connectDB = require("./config/db")
const fileupload = require("express-fileupload")
const cloudinary = require("cloudinary").v2


connectDB()

cloudinary.config({
    cloud_name: process.env.CLOUD,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

app.listen(process.env.PORT, ()=>{
    console.log("Listening at port "+process.env.PORT);
})
