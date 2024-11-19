const { getIO } = require('../config/socketConfig');
const Sentry = require("@sentry/node");

class NotificationService {
    static initialize() {
        console.log('Notification service initialized');
        return true;
    }

    static async sendWelcomeNotification(userName) {
        try {
            const io = getIO();
            console.log('Sending welcome notification');

            io.emit('notification', {
                message: `Welcome ${userName}! Your account has been created successfully.`,
                type: 'success'
            });

            return true;
        } catch (error) {
            Sentry.captureException(error);
            console.error('Error sending welcome notification:', error);
            return false;
        }
    }

    static async sendPasswordResetNotification() {
        try {
            const io = getIO();
            console.log('Sending password reset notification');

            io.emit('notification', {
                message: 'Your password has been successfully reset!',
                type: 'success'
            });

            return true;
        } catch (error) {
            Sentry.captureException(error);
            console.error('Error sending password reset notification:', error);
            return false;
        }
    }
}

module.exports = NotificationService;
