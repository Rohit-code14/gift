const bigPromise = require("../middleware/bigPromise")

exports.home = bigPromise(
    (req, res) => {
        res.status(200).json({
            success: 200,
            message: "Success home"
        })
    }
)