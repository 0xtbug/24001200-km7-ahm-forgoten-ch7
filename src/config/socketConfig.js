const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    if (io) {
        return io;
    }

    io = new Server(server, {
        pingTimeout: 60000,
        pingInterval: 25000,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        connectTimeout: 45000,
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        socket.on("disconnect", (reason) => {
            console.log("Client disconnected:", socket.id, "Reason:", reason);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
