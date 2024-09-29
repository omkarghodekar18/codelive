const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const ACTIONS = require('./src/Actions'); // Ensure actions are correctly imported

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));

// Room management: each room ID maps to an array of user objects
const rooms = {}; // { roomId: [{ userName, socketId }, ...] }

// Helper function to get all connected clients in a room
function getAllConnectedClients(roomId) {
    return rooms[roomId] || [];
}

io.on('connection', (socket) => {
    // console.log('Socket connected:', socket.id);

    // Handle user joining a room
    socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
        // Initialize room array if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        // Check if the user is already connected in the room to prevent duplicates
        const existingUser = rooms[roomId].find((user) => user.userName === userName);
        if (existingUser) {
            // If the user already exists, disconnect the previous socket
            io.to(existingUser.socketId).emit(ACTIONS.DISCONNECTED, {
                message: 'You have been disconnected due to a new connection.',
            });
            io.sockets.sockets.get(existingUser.socketId)?.disconnect();
            // Remove the existing user from the room
            rooms[roomId] = rooms[roomId].filter((user) => user.socketId !== existingUser.socketId);
        }

        // Add the user to the room array
        rooms[roomId].push({ userName, socketId: socket.id });

        // Join the socket to the specified room
        socket.join(roomId);

        // Get updated list of clients in the room
        const clients = getAllConnectedClients(roomId);
        // console.log(`Clients in room ${roomId}:`, clients); 

        // Notify all clients in the room about the new user joining
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                userName,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code})=> {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code,
        })
    })

    socket.on(ACTIONS.SYNC_CODE,({code, socketId})=> {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
            code,
        });
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            const userIndex = rooms[roomId].findIndex((user) => user.socketId === socket.id);
            if (userIndex !== -1) {
                // Remove the user from the room
                
                const clients = getAllConnectedClients(roomId);
                console.log(clients);
                const [disconnectedUser] = rooms[roomId].splice(userIndex, 1);
                // const disconnectedUsername = disconnectedUser.filter((user) => user.sockeId === socket.id);
                // Notify other clients about the disconnection
                io.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    clients,
                    userName: disconnectedUser.username,
                    socketId: disconnectedUser.socketId,
                });
                console.log(clients);
                io.to(roomId).emit(ACTIONS.LEAVE, {
                    clients,
                    userName: disconnectedUser.userName,
                    socketId: disconnectedUser.socketId,
                });
            }
        }
    });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('*', (req, res, next) =>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})