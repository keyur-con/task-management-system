const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: errors.array()[0].msg 
        });
    }
    next();
};

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must include one uppercase letter and one number'),
    validate
];

const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

const forgotPasswordValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    validate
];

const verifyOtpValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    validate
];

const resetPasswordValidator = [
    body('resetToken')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must include one uppercase letter and one number'),
    validate
];

module.exports = { 
    registerValidator, 
    loginValidator, 
    forgotPasswordValidator,
    verifyOtpValidator,
    resetPasswordValidator
};