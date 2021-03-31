const express = require("express");
const socket = require("socket.io");

// Setting up express server
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Serving static frontend files
app.use(express.static("frontend"));

// Setting up socket
const io = socket(server);

// we will keep track of connected users right here in the server's memory
const activeUsers = new Set();

// upon connection, we receive the new socket and set up all listeners on it
io.on("connection", function (socket) {
  console.log("Made new socket connection");

  // when new user connects, we add the user to the list and emit the updated list
  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  // when a socket gets disconnected, we remove the user from list and emit the event
  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  // when someone adds a new message to the chat, we emit it to everyone (including the user)
  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  
  // when someone starts or stops typing, we broadcast to all others
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});