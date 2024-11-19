const express = require('express');
const router = express.Router();
const PasswordController = require('../controllers/passwordController');
const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const middleware = require('../middleware/auth');

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

router.get('/reset-password/:token', (req, res) => {
    res.render('reset-password');
});

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/dashboard', middleware.auth, (req, res) => {
    res.render('dashboard');
});

// API Routes
router.post('/api/register', registerController.register);
router.post('/api/login', loginController.login);
router.post('/api/forgot-password', PasswordController.forgotPassword);
router.post('/api/reset-password/:token', PasswordController.resetPassword);

module.exports = router;
