"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// Import the 'express' module
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const UsersSocketManager_1 = require("./UsersSocketManager");
// Create an Express application
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
  cors: {
    origin: "*",
  },
});
// Set the port number for the server
const port = 8888;
const usersSocketManger = new UsersSocketManager_1.UsersSocketManager();
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
  const userId = Date.now();
  console.log("a user connected", socket.id, userId);
  usersSocketManger.registerUserAndSocket({ name: "abc", socket, userId });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    usersSocketManger.removeUser(socket.id);
  });
});
