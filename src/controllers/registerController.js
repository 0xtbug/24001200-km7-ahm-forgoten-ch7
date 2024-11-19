const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const transporter = require("../config/mailerConfig");
const notificationService = require('../services/notificationService');
const Sentry = require("@sentry/node");

class registerController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        Sentry.captureMessage("Registration attempt with missing required fields");
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      console.log('User created successfully:', user.id);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to Our Platform",
        html: `
          <h1>Welcome!</h1>
          <p>Thank you for registering with us.</p>
          <p>Your account has been successfully created.</p>
        `
      });

      await notificationService.sendWelcomeNotification(user.name);

      res.status(201).json({
        message: "Register success",
        userId: user.id,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error('Registration error:', error);
      res.status(500).json({
        message: "Error creating user"
      });
    }
  }
}

module.exports = registerController;
