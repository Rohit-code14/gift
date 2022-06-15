const express = require("express");
const app = express();
require("dotenv").config()
const cookieParser = require("cookie-parser");
const morgan = require("morgan")
const fileupload = require("express-fileupload");
const cors = require("cors")

const ejs = require("ejs")

app.set("view engine","ejs")

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(fileupload({
    useTempFiles:true,
    tempFileDir: "/temp",
}))
app.use(cookieParser())
app.use(morgan("tiny"))


const home = require("./routes/home")
const user = require("./routes/user")
const product = require("./routes/product")
const payment = require("./routes/payment")
const order = require("./routes/order")

app.use("/api/v1",home)
app.use("/api/v1",user)
app.use("/api/v1",product)
app.use("/api/v1",payment)
app.use("/api/v1",order)

app.get("/register",(req,res)=>{
    res.render("signup")
})

module.exports = app;