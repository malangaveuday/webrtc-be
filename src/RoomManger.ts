import { Socket } from "socket.io";
import { UserSocket } from "./UsersSocketManager";

interface Room {
  firstUser: UserSocket;
  secondUser: UserSocket;
}

export class RoooManger {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map();
  }

  createRoomForSocketUsers(firstUser: UserSocket, secondUser: UserSocket) {
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

  onOfferReceived({
    sdp,
    roomId,
    socket,
  }: {
    sdp: string;
    roomId: string;
    socket: Socket;
  }) {
    console.log("onOfferReceived");
    // get room => room consist of users name and socket
    const room = this.rooms.get(`${roomId}`);

    // figure out user by room socket id
    const receivingUser =
      room?.firstUser.socket.id === socket.id
        ? room?.secondUser
        : room?.firstUser;

    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onOfferAckReceived({
    sdp,
    roomId,
    socket,
  }: {
    sdp: string;
    roomId: string;
    socket: Socket;
  }) {
    // get room => room consist of users name and socket
    const room = this.rooms.get(`${roomId}`);

    // figure out user by room socket id
    const receivingUser =
      room?.firstUser.socket.id === socket.id
        ? room?.secondUser
        : room?.firstUser;

    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidates({
    roomId,
    socket,
    candidate,
    type,
  }: {
    roomId: string;
    socket: Socket;
    candidate: any;
    type: "sender" | "receiver";
  }) {
    const room = this.rooms.get(`${roomId}`);

    console.log("ice candidate room", room, [...this.rooms.keys()]);

    if (!room) {
      return;
    }

    try {
      const receivingUser =
        room.firstUser.socket.id === socket.id
          ? room?.secondUser
          : room?.firstUser;

      console.log("ice candidate room", roomId, receivingUser);
      receivingUser.socket.emit("add-ice-candidate", {
        candidate,
        type,
        roomId,
      });
    } catch (error) {
      console.log("error in ice candidate", error);
    }
  }
}
