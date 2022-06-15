const nodemailer = require("nodemailer")
const bigPromise = require("../middleware/bigPromise")

const emailHelper = bigPromise(
    async(options)=>{
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: '"rohit@rohit.in', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
    }
    // send mail with defined transport object
    await transporter.sendMail(message);

    }
)

module.exports = emailHelper;