const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
require('./config/passport');


const app = express();
app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: { message: 'Too many attempts, please try again after 15 minutes' }
});

app.use('/login', authLimiter);

app.use('/forgetpassword', authLimiter);

app.use('/verifyotp', authLimiter);

app.use(authRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});