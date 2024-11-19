const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sentry = require("@sentry/node");

class loginController {

  static async login(req, res) {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            Sentry.captureMessage("Login attempt without email or password");
            return res.status(400).json({
            message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
            email: email,
            },
        });

        if (!user) {
            Sentry.captureException(new Error(`Login attempt with non-existent email: ${email}`));
            return res.status(404).json({
            message: "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password is incorrect",
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login success",
            userId: user.id,
            token: token
        });


    } catch (error) {
        Sentry.captureException(error);
        console.error('Login error:', error);
        res.status(500).json({
            message: error.message
        });
    }
  }
}

module.exports = loginController;
