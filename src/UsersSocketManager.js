"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersSocketManager = void 0;
const RoomManger_1 = require("./RoomManger");
class UsersSocketManager {
    constructor() {
        this.usersWithSocketInfo = [];
        this.socketIdsQueue = [];
        this.roomManger = new RoomManger_1.RoooManger();
    }
    registerUserAndSocket(name, socket) {
        this.usersWithSocketInfo.push({
            name,
            socket,
        });
        this.socketIdsQueue.push(socket.id);
        this.matchUsersAndClearSocketIdsQueue();
        this.initSocketHandlers(socket);
    }
    matchUsersAndClearSocketIdsQueue() {
        // check if more one socket available
        // if available then create room for two sockets
        if (this.socketIdsQueue.length > 1) {
            const firstSocketId = this.socketIdsQueue.pop();
            const secondSocketId = this.socketIdsQueue.pop();
            // find users based on sockets id
            const firstUser = this.usersWithSocketInfo.find((useWithSocket) => useWithSocket.socket.id === firstSocketId);
            const secondUser = this.usersWithSocketInfo.find((useWithSocket) => useWithSocket.socket.id === secondSocketId);
            // if both the users avaialbe then create room
            if (firstUser && secondUser) {
                // create room
                this.roomManger.createRoomForSocketUsers(firstUser, secondUser);
            }
            console.log("clear queues");
            // matchUsersAndClearSocketIdsQueue again till queue is empty
            this.matchUsersAndClearSocketIdsQueue();
        }
    }
    initSocketHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("offer form", socket.id);
            // on socket request
            this.roomManger.onOfferReceived({ sdp, roomId, socket });
        });
        socket.on("answer", ({ sdp, roomId }) => {
            console.log("answer", socket.id);
            // on socket request
            this.roomManger.onOfferAckReceived({ sdp, roomId, socket });
        });
        socket.on("add-ice-candidate", ({ roomId, candidate, type, }) => {
            console.log("add-ice-candidate", socket.id, roomId);
            // on socket request
            this.roomManger.onIceCandidates({ roomId, socket, candidate, type });
        });
    }
    removeUser(socketId) {
        this.usersWithSocketInfo = this.usersWithSocketInfo.filter((x) => x.socket.id !== socketId);
        this.socketIdsQueue = this.socketIdsQueue.filter((x) => x === socketId);
    }
}
exports.UsersSocketManager = UsersSocketManager;
