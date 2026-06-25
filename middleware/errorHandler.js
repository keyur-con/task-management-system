const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Server error';
    
    if (status === 500) {
        return res.status(500).json({ message: 'Server error' });
    }
    
    res.status(status).json({ message });
};

module.exports = errorHandler;