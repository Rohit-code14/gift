const cookieToken = async (user, res) => {
    const token = await user.getJwtToken()
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 10000
        ),
        httpOnly:true
    }
    user.password = null
    res.status(200).cookie('token',token,options).json({
        success:true,
        user,
        token
    })
}

module.exports = cookieToken