import { DefaultEventsMap, Server, Socket } from "socket.io";
import http from "http";
import { GameService } from "../game/GameService";
import { Directions } from "../player/entities/Player";

export class ServerService {
  private io: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > | null;
  private active: boolean;
  static messages = {
    out: {
      new_player: "NEW_PLAYER",
    },
  };

  public inputMessage = [];

  private static instance: ServerService;
  private constructor() {
    this.io = null;
    this.active = false;
  }

  static getInstance(): ServerService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ServerService();
    return this.instance;
  }

  public init(
    httpServer: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.active = true;

    this.io.on("connection", (socket) => {
      socket.emit("connectionStatus", { status: true });
      GameService.getInstance().addPlayer(
        GameService.getInstance().buildPlayer(socket)
      );

      socket.on("message", (data) => {});

      socket.on("movePlayer", (direction: Directions) => {
        console.log(`Movimiento recibido de ${socket.id}: ${direction}`);
        GameService.getInstance().movePlayer(socket, direction);
      });

      socket.on("rotatePlayer", (data: any) => {
        GameService.getInstance().rotatePlayer(data);
      });

      socket.on("shootPlayer", (data: any) => {
        console.log(data);
        GameService.getInstance().shootPlayer(data);
      });

      socket.on("disconnect", () => {
        console.log("Un cliente se ha desconectado:", socket.id);
        GameService.getInstance().removePlayer(socket);
      });
      
    });
  }

  public addPlayerToRoom(player: Socket, room: String) {
    player.join(room.toString());
  }

  public sendMessage(room: String | null, type: String, content: any) {
    console.log(content);
    if (this.active && this.io != null) {
      if (room != null) {
        this.io?.to(room.toString()).emit("message", {
          type,
          content,
        });
      }
    }
  }

  public gameStartMessage() {
    //
  }

  public isActive() {
    return this.active;
  }
}
