// Import the 'express' module
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { UsersSocketManager } from "./UsersSocketManager";

// Create an Express application
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Set the port number for the server
const port = 8888;

const usersSocketManger = new UsersSocketManager();

// Define a route for the root path ('/')
app.get("/", (req, res) => {
  // Send a response to the client
  res.send("Hello, TypeScript + Node.js + Express!");
});

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  usersSocketManger.registerUserAndSocket("abc", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    usersSocketManger.removeUser(socket.id);
  });
});
