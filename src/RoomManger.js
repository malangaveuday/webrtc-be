"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoooManger = void 0;
class RoooManger {
    constructor() {
        this.rooms = new Map();
    }
    createRoomForSocketUsers(firstUser, secondUser) {
        const roomId = Date.now();
        console.log("created");
        this.rooms.set(`${roomId}`, {
            firstUser,
            secondUser,
        });
        firstUser.socket.emit("request-sent", {
            roomId,
        });
        secondUser.socket.emit("request-sent", {
            roomId,
        });
    }
    onOfferReceived({ sdp, roomId, socket, }) {
        console.log("onOfferReceived");
        // get room => room consist of users name and socket
        const room = this.rooms.get(`${roomId}`);
        // figure out user by room socket id
        const receivingUser = (room === null || room === void 0 ? void 0 : room.firstUser.socket.id) === socket.id
            ? room === null || room === void 0 ? void 0 : room.secondUser
            : room === null || room === void 0 ? void 0 : room.firstUser;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onOfferAckReceived({ sdp, roomId, socket, }) {
        // get room => room consist of users name and socket
        const room = this.rooms.get(`${roomId}`);
        // figure out user by room socket id
        const receivingUser = (room === null || room === void 0 ? void 0 : room.firstUser.socket.id) === socket.id
            ? room === null || room === void 0 ? void 0 : room.secondUser
            : room === null || room === void 0 ? void 0 : room.firstUser;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidates({ roomId, socket, candidate, type, }) {
        const room = this.rooms.get(`${roomId}`);
        console.log("ice candidate room", room, [...this.rooms.keys()]);
        if (!room) {
            return;
        }
        try {
            const receivingUser = room.firstUser.socket.id === socket.id
                ? room === null || room === void 0 ? void 0 : room.secondUser
                : room === null || room === void 0 ? void 0 : room.firstUser;
            console.log("ice candidate room", roomId, receivingUser);
            receivingUser.socket.emit("add-ice-candidate", {
                candidate,
                type,
                roomId,
            });
        }
        catch (error) {
            console.log("error in ice candidate", error);
        }
    }
}
exports.RoooManger = RoooManger;
