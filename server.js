const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const mongoose = require('mongoose'); 
const path = require('path');
const ACTIONS = require('./src/Actions'); // Ensure actions are correctly imported
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('AIzaSyCdrlNjaAMpBkI1tL41UqyK7ii1pf1vRxY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*',
}
app.use(cors(corsOptions));


// mongoose.connect('mongodb+srv://admin:omkar14@cluster0.ehlb8cz.mongodb.net/project', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.log(err));

// const DataSchema = new mongoose.Schema({
//     socketId: {
//         type: String,    // Assuming socketId is a string (ID or identifier)
//         required: true,  // Set to true if this field is mandatory
//     },
//     roomId: {
//         type: String,    // Assuming roomId is also a string (could be an alphanumeric identifier)
//         required: true,
//     },
//     code: {
//         type: String,    // Assuming code is a string (source code or a unique identifier)
//         required: true,
//     },
// });

// const Data = mongoose.model('Data', DataSchema);

// app.post('/submit', async (req, res) => {
//     const newData = new Data(req.body);
//     try {
//         await newData.save();
//         res.status(201).send('Data saved');
//     } catch (err) {
//         res.status(500).send('Server Error: Unable to save data'); // Send error response
//     }
// });


const server = http.createServer(app);
const io = new Server(server);

// If you're handling URL-encoded form data, add this as well
app.use(express.urlencoded({ extended: true }));
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

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code,
        })
    })

    socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
            code,
        });
    });


    // Emit the change to all connected clients
    socket.on('textUpdate', ({ newText, roomId }) => {
        // Emit the change to all clients in the room, except the sender
        socket.to(roomId).emit('textUpdated', { newText, roomId });

    });

    socket.on('outputUpdate', ({ ans, roomId }) => {
        // console.log(`Server received output update for room: ${roomId} with output: ${ans}`);

        // Emit the change to all clients in the room, except the sender
        socket.to(roomId).emit('outputUpdated', { ans, roomId });
    });



    // Handle socket disconnection
    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            const userIndex = rooms[roomId].findIndex((user) => user.socketId === socket.id);
            if (userIndex !== -1) {
                // Remove the user from the room

                const clients = getAllConnectedClients(roomId);
                // console.log(clients);
                const [disconnectedUser] = rooms[roomId].splice(userIndex, 1);
                // const disconnectedUsername = disconnectedUser.filter((user) => user.sockeId === socket.id);
                // Notify other clients about the disconnection
                io.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    clients,
                    userName: disconnectedUser.username,
                    socketId: disconnectedUser.socketId,
                });
                // console.log(clients);
                io.to(roomId).emit(ACTIONS.LEAVE, {
                    clients,
                    userName: disconnectedUser.userName,
                    socketId: disconnectedUser.socketId,
                });
            }
        }
    });
});



let history = [

    {
        role: "user",
        parts: [{ text: "Hello" }],
    },
    {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
    },

];


app.post('/ask', async (req, res) => {

    let message = req.body.userMessage;

    history.push({ 'role': 'user', parts: [{ text: message }] });

    try {
        const chat = model.startChat({
            history // This should refer to the chat history, ensure it's defined or passed properly
        });
        let result = await chat.sendMessage(message);

        let responseMessage = result.response.candidates[0].content.parts[0].text

        history.push({ 'role': 'model', parts: [{ text: responseMessage }] });

        res.send(responseMessage);
        // console.log(responseMessage) 
    }
    catch (err) {
        console.error(err);
        res.send(err)
    }

})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})