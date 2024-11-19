const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailerConfig");
const NotificationService = require("../services/notificationService");
const Sentry = require("@sentry/node");

class PasswordController {


  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const responseMessage = "If an account exists with this email, you will receive password reset instructions.";

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        const resetToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        console.log(resetToken, "== resetToken");

        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Password Reset Request",
          html: `
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your account.</p>
            <p>Click this <a href="${process.env.APP_URL}/reset-password/${resetToken}">link</a> to reset your password.</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `
        });

        console.log(`Reset email sent to ${email}`);
      } else {
        Sentry.captureMessage(`Password reset attempted for non-existent email: ${email}`);
        console.log(`No user found for email: ${email}`);
      }

      return res.status(200).json({
        message: responseMessage
      });

    } catch (error) {
      Sentry.captureException(error);
      console.error('Error in forgotPassword:', error);
      return res.status(500).json({
        message: "An error occurred while processing your request."
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token
        }
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired reset token"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          password: hashedPassword,
          resetToken: null
        }
      });

      await NotificationService.sendPasswordResetNotification();

      res.status(200).json({
        message: "Password reset successful",
        userId: user.id
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error('Password reset error:', error);
      res.status(500).json({
        message: "Error resetting password"
      });
    }
  }
}

module.exports = PasswordController;
