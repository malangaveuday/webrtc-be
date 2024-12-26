import { Socket } from "socket.io";
import { RoooManger } from "./RoomManger";

export interface UserSocket {
  name: string;
  socket: Socket;
}

export class UsersSocketManager {
  private usersWithSocketInfo: Map<string, UserSocket>;
  private socketIdsQueue: Array<Socket["id"]>;
  private roomManger: RoooManger;

  constructor() {
    this.usersWithSocketInfo = new Map();
    this.socketIdsQueue = [];
    this.roomManger = new RoooManger();
  }

  registerUserAndSocket({
    name,
    socket,
    sessionId,
  }: {
    name: string;
    socket: Socket;
    sessionId: string;
  }) {
    console.log(
      "registerUserAndSocket before",
      sessionId,
      this.socketIdsQueue.length,
      this.usersWithSocketInfo.size
    );
    this.usersWithSocketInfo.set(sessionId, {
      name,
      socket,
    });

    if (!this.socketIdsQueue.includes(sessionId)) {
      this.socketIdsQueue.push(sessionId);
    }

    console.log(
      "registerUserAndSocket after",
      sessionId,
      this.socketIdsQueue.length,
      this.usersWithSocketInfo.size
    );
    this.matchUsersAndClearSocketIdsQueue();
    this.initSocketHandlers(socket);
  }

  matchUsersAndClearSocketIdsQueue() {
    // check if more one socket available
    // if available then create room for two sockets
    if (this.socketIdsQueue.length > 1) {
      const firstSessionId = this.socketIdsQueue.pop();
      const secondSessionId = this.socketIdsQueue.pop();
      // console.log({ firstSessionId });
      // console.log({ secondSessionId });

      // find users based on sockets id
      if (firstSessionId && secondSessionId) {
        const firstUser = this.usersWithSocketInfo.get(firstSessionId);
        const secondUser = this.usersWithSocketInfo.get(secondSessionId);

        // if both the users avaialbe then create room
        if (firstUser && secondUser) {
          // create room
          this.roomManger.createRoomForSocketUsers(firstUser, secondUser);
        }

        console.log("clear queues", this.socketIdsQueue);

        // matchUsersAndClearSocketIdsQueue again till queue is empty
        this.matchUsersAndClearSocketIdsQueue();
      }
    }
  }

  initSocketHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      // console.log("offer form", socket.id);
      // on socket request
      this.roomManger.onOfferReceived({ sdp, roomId, socket });
    });

    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      // console.log("answer", socket.id);
      // on socket request
      this.roomManger.onOfferAckReceived({ sdp, roomId, socket });
    });

    socket.on(
      "add-ice-candidate",
      ({
        roomId,
        candidate,
        type,
      }: {
        roomId: string;
        candidate: any;
        type: "sender" | "receiver";
      }) => {
        // console.log("add-ice-candidate", socket.id, roomId);
        // on socket request
        this.roomManger.onIceCandidates({ roomId, socket, candidate, type });
      }
    );
  }

  removeUser(sessionId: string) {
    console.log("remove users before", this.usersWithSocketInfo);
    if (this.usersWithSocketInfo.size > 1) {
      this.usersWithSocketInfo.delete(sessionId);
      console.log("remove users after", this.usersWithSocketInfo);
    }
  }
}
