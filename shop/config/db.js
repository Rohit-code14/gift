const mongoose = require("mongoose")

const connectDB = () => {
    mongoose.connect(process.env.DB,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>{
        console.log("Connected to DB")
    })
    .catch((error) => {
        console.log("connection failed...due to  \n ",error)
        process.exit(1)
    })
}
module.exports = connectDB;