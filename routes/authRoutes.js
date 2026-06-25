const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const {register, login, getProfile, forgetPassword, verifyOtp, resetPassword, logout} = require("../controllers/authController");
const {verifyToken} = require('../middleware/verifyToken');
const { 
    registerValidator, 
    loginValidator, 
    forgotPasswordValidator,
    verifyOtpValidator,
    resetPasswordValidator
} = require('../middleware/validators');




router.get('/profile', verifyToken, getProfile);

router.post('/signup', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/forgetpassword', forgotPasswordValidator, forgetPassword);
router.post('/verifyotp', verifyOtpValidator, verifyOtp);
router.post('/resetpassword', resetPasswordValidator, resetPassword);
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.post('/logout', logout);

router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:5000/login.html' }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
        });
        res.redirect('http://localhost:5000/profile.html');
    }
);

module.exports = router;