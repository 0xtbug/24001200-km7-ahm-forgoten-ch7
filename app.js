require('dotenv').config();
require('./src/config/sentryConfig');
const express = require('express');
const { createServer } = require('http');
const app = express();
const httpServer = createServer(app);
const port = 3000;
const router = require('./src/routes/index');
const { initSocket } = require('./src/config/socketConfig');
const NotificationService = require('./src/services/notificationService');

const io = initSocket(httpServer);
const cookieParser = require('cookie-parser');

NotificationService.initialize();

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', router);

const cleanup = () => {
    if (io) {
        io.close(() => {
            console.log('Socket.IO server closed');
        });
    }
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
