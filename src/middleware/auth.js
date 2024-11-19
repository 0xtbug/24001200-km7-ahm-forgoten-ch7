const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.cookies.token;
        console.log(authHeader, "== authHeader");

        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        try {
            const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
            req.user = decoded;

            console.log('User authenticated:', decoded.userId);


            next();
        } catch (error) {
            Sentry.captureException(error);
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {auth};
