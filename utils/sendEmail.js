const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Your OTP Code',
        html: `
            <h2>Password Reset OTP</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
        `
    });
};

module.exports = { sendOtpEmail };