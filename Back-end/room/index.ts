import { Socket } from 'socket.io';
const rooms: Record<string, Record<string, IUser>> = {};
interface IRoomParams {
  roomId: string
  peerId: string

}
interface IUser {
  peerId: string;
}

interface IJoinRoomParams extends IRoomParams {
  userName: string;
  role: string
}

export const roomHandler = (socket: Socket) => {
  const joinRoom = ({ roomId, peerId }: IJoinRoomParams) => {
    setTimeout(() => {
      if (!rooms[roomId]) rooms[roomId] = {};
      if (Object.keys(rooms[roomId]).length >= 2) {
        setTimeout(() => {
          socket.emit('room-full', { peerId });
          console.log('Room is full, cannot join', roomId);
          return;
        }, 1500);
      }
      console.log('User joined room', roomId, peerId);
      rooms[roomId][peerId] = { peerId };
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { peerId });
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });
      socket.to(roomId).emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });

      socket.on("disconnect", () => {
        leaveRoom({ roomId, peerId });
      });
    }, 1500);
  }
  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    setTimeout(() => {
      console.log("user left the room", peerId);
      if (rooms[roomId] && rooms[roomId][peerId]) {
        socket.to(roomId).emit("user-disconnected", peerId);
        delete rooms[roomId][peerId];
        if (Object.keys(rooms[roomId]).length === 0) {
          socket.to(roomId).emit("room-ended", peerId);
          delete rooms[roomId];
        }
      }
      socket.leave(roomId);
    }, 1500);
  };
  const endRoom = ({ peerId, roomId }: IRoomParams) => {
    setTimeout(() => {
      console.log("user end the room", peerId);
      socket.to(roomId).emit("room-ended", peerId);
      delete rooms[roomId];
      socket.leave(roomId);
    }, 1500);
  };

  socket.on('join-room', joinRoom)
  socket.on('leave-room', leaveRoom)
  socket.on('end-room', endRoom)
}