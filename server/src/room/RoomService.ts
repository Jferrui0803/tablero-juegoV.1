import { Player } from "../player/entities/Player";
import { ServerService } from "../server/ServerService";
import { Room, RoomConfig } from "./entities/Room";
import { Socket } from "socket.io";

export class RoomService {
  private rooms: Room[];
  private static instance: RoomService;
  private constructor() {
    this.rooms = [];
  }

  static getInstance(): RoomService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new RoomService();
    return this.instance;
  }

  private getRoom(): Room {
    const room = this.rooms.find((item) => item.occupied == false);
    if (room == undefined) {
      const genRanHex = (size: Number) =>
        [...Array(size)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");
      const currentRoom: Room = {
        name: "room" + genRanHex(128),
        players: [],
        occupied: false,
        game: null,
      };
      this.rooms.push(currentRoom);
      return currentRoom;
    }
    return room;
  }

  public addPlayer(player: Player): Room {
    const room: Room = this.getRoom();
    room.players.push(player);
    ServerService.getInstance().addPlayerToRoom(player.id, room.name);
    if (room.players.length == RoomConfig.maxRoomPlayers) room.occupied = true;
    return room;
  }

  public findRoomByPlayer(socket: Socket): Room | undefined {
    return this.rooms.find((room) =>
      room.players.some((p) => p.id.id === socket.id)
    );
  }

  public getRoomByPlayerId(id: String): Room | null {
    console.log("Finding room by player id: ", id);
    const roomOfPlayer = this.rooms.find((room) =>
      room.players.find((player) => player.id.id == id)
    );
    if (roomOfPlayer) return roomOfPlayer;
    console.log("Room not found");
    return null;
  }
}
