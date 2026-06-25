
const {sendOtpEmail} = require('../utils/sendEmail');
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req,res,next) => {
    const {email,password} = req.body;
    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({email, password: hashedPassword});
        await newUser.save();
        res.status(201).json({message: 'User registered successfully'});
    } catch (err) {
        next(err);
    }
}

const login = async (req,res,next) =>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        if (user.authProvider === 'github') {
            return res.status(400).json({ message: 'This account uses GitHub login. Please use the GitHub button.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.cookie('token', token, {
            httpOnly: true,    
            secure: false,     
            sameSite: 'lax',  
            maxAge: 60 * 60 * 1000 
        });
        res.status(200).json({message: 'Login successful'});
    } catch (err) {
        next(err);
    }
}

const getProfile = async (req,res,next) => {
    try{
        const user = await User.findById(req.user.userId).select('-password');
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({user});
    }
    catch(err){
        next(err);
    }
};

const forgetPassword = async (req,res,next) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email' });
        }
        if(user.authProvider === 'github'){
            return res.status(400).json({
                message:
                'This account uses GitHub login'
            });
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');
        await OTP.deleteMany({ email });
        
        await OTP.create({
            email,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email' });
    }
    catch(err){
        
        next(err);
    }
}

const verifyOtp = async (req,res,next) => {
    const {email, otp} = req.body;
    try{
        const otpRecord = await OTP.findOne({email});
        if (!otpRecord) {
            return res.status(400).json({ message: 'No OTP found for this email' });
        }
        if (otpRecord.isVerified) {
            return res.status(400).json({
                message: 'OTP already used'
            });
        }
        if (otpRecord.attempts >= 5) {
            return res.status(400).json({
                message: 'Too many attempts'
            });
        }
        
        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        if (otpRecord.otp !== hashedOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedResetToken =
            crypto.createHash('sha256')
                .update(resetToken)
                .digest('hex');

        otpRecord.isVerified = true;
        otpRecord.resetToken = hashedResetToken;

        otpRecord.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await otpRecord.save();

        res.status(200).json({
            message: 'OTP verified successfully',
            resetToken
        });
        
    }
    catch(err){
        next(err);
    }
}

const resetPassword = async (req,res,next) => {
    const {resetToken, newPassword} = req.body;
    
    try{
        const hashedResetToken =
            crypto.createHash('sha256')
                .update(resetToken)
                .digest('hex');
        const otpRecord = await OTP.findOne({resetToken: hashedResetToken});
        if (!otpRecord) {
            return res.status(400).json({
                message: 'Invalid reset token'
            });
        }
        const user = await User.findOne({
            email: otpRecord.email
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const isSame =
            await bcrypt.compare(
                newPassword,
                user.password
            );

        if (isSame) {
            return res.status(400).json({
                message:
                'New password must be different'
            });
        }

        if (otpRecord.resetTokenExpiry < new Date()) {
            return res.status(400).json({
                message: 'Reset token expired'
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        await OTP.deleteMany({
            email: otpRecord.email
        });
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch(err){
        next(err);
    }
}

const logout = (req, res,next) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {register, login, getProfile, forgetPassword, verifyOtp, resetPassword, logout};

