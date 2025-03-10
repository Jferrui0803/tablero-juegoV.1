import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room, RoomConfig } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService";

export class GameService {
  private games: Game[];

  private static instance: GameService;
  private constructor() {
    this.games = [];
  }

  static getInstance(): GameService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new GameService();
    return this.instance;
  }

  public buildPlayer(socket: Socket): any {
    return {
      id: socket,
      x: 0,
      y: 0,
      state: PlayerStates.Idle,
      direction: Directions.Right,
      visibility: true,
    };
  }

  public movePlayer(socket: Socket, direction: Directions): void {
    const room = RoomService.getInstance().findRoomByPlayer(socket);
    if (!room || !room.game || !room.game.board) return; 

    const player = room.players.find((player) => player.id.id === socket.id);
    if (!player) {
      console.log("El jugador no existe.");
      return;
    }

    const boardSize = room.game.board.size;
    let targetX = player.x;
    let targetY = player.y;

    // Calcular las coordenadas destino según la dirección recibida
    switch (direction) {
      case Directions.Up:
        targetX = Math.max(0, player.x - 1); // Arriba
        break;
      case Directions.Right:
        targetY = Math.min(boardSize - 1, player.y + 1); // Derecha
        break;
      case Directions.Down:
        targetX = Math.min(boardSize - 1, player.x + 1); // Abajo
        break;
      case Directions.Left:
        targetY = Math.max(0, player.y - 1); // Izquierda
        break;
      default:
        console.warn(`Dirección desconocida: ${direction}`);
        return;
    }

    // Comprobar si otro jugador ocupa la casilla destino pero solo si el jugador está vivo
    const collision = room.players.some(
      (p) => p.state !== PlayerStates.Dead && p.x === targetX && p.y === targetY
    );
    if (collision) {
      console.log(
        `Colisión: la casilla (${targetX}, ${targetY}) está ocupada. No se mueve el jugador ${socket.id}`
      );
      return;
    }

    // Actualizar la posición y estado del jugador
    player.x = targetX;
    player.y = targetY;
    player.direction = direction;
    player.state = PlayerStates.Moving;

    console.log(`Jugador ${socket.id} movido a (${player.x}, ${player.y})`);

    if (
      room.game.board.elements.some((e) => e.x === targetX && e.y === targetY)
    ) {
      player.visibility = false;
      console.log(`Jugador ${socket.id} oculto por estar en un arbusto.`);
    } else {
      player.visibility = true;
    }

    // Enviar actualización de jugadores a todos los clientes de la sala y los que siguen vivos
    const playersList = room.players
      .filter((p) => p.state !== PlayerStates.Dead)
      .map((p) => ({
        id: p.id.id,
        x: p.x,
        y: p.y,
        state: p.state,
        direction: p.direction,
        visibility: p.visibility,
      }));
    ServerService.getInstance().sendMessage(
      room.name,
      Messages.NEW_PLAYER,
      playersList
    );
  }

  public rotatePlayer(data: any): void {
    const room = RoomService.getInstance().getRoomByPlayerId(data.id);
    if (!room || !room.game) return;
    const player = room.players.find((p) => p.id.id === data.id);
    if (!player) return;
    player.direction = data.direction;
    // Se envía la actualización a todos los clientes
    const playersList = room.players
      .filter((p) => p.state !== PlayerStates.Dead)
      .map((p) => ({
        id: p.id.id,
        x: p.x,
        y: p.y,
        state: p.state,
        direction: p.direction,
        visibility: p.visibility,
      }));
    ServerService.getInstance().sendMessage(
      room.name,
      Messages.NEW_PLAYER,
      playersList
    );
  }

  public shootPlayer(data: any): void {
    console.log("estoy en shootPlayer");
    const room = RoomService.getInstance().getRoomByPlayerId(data.id);

    if (!room || !room.game) return;
    console.log("room", room);
    const boardSize = room.game.board.size;
    const shooter = room.players.find((p) => p.id.id === data.id);
    if (!shooter) return;
    console.log("shooter", shooter);

    // Calcular la casilla objetivo según la dirección del jugador que dispara
    let targetX = shooter.x;
    let targetY = shooter.y;
    switch (shooter.direction) {
      case Directions.Up:
        targetX = shooter.x - 1;
        break;
      case Directions.Right:
        targetY = shooter.y + 1;
        break;
      case Directions.Down:
        targetX = shooter.x + 1;
        break;
      case Directions.Left:
        targetY = shooter.y - 1;
        break;
      default:
        // Asume que la flecha apunta a la derecha si no se detecta otra dirección.
        targetY = shooter.y + 1;
        break;
    }

    // Validar que el objetivo esté dentro del mapa
    if (
      targetX < 0 ||
      targetX >= boardSize ||
      targetY < 0 ||
      targetY >= boardSize
    )
      return;

    // Buscar si hay algún jugador en la casilla objetivo
    const targetPlayer = room.players.find(
      (p) => p.x === targetX && p.y === targetY
    );
    if (targetPlayer && targetPlayer.visibility) {
      // Se "mata" al jugador actualizando su estado
      targetPlayer.state = PlayerStates.Dead;
      console.log(
        `Jugador ${targetPlayer.id.id} fue eliminado por ${shooter.id.id}`
      );
    }

    // Enviar el estado del juego solo de los jugadores vivos
    const playersList = room.players
    .filter((p) => p.id.id === data.id || p.state !== PlayerStates.Dead)
    .map((p) => ({
      id: p.id.id,
      x: p.x,
      y: p.y,
      state: p.state,
      direction: p.direction,
      visibility: p.visibility,
    }));

    
  ServerService.getInstance().sendMessage(
    room.name,
    Messages.NEW_PLAYER,
    playersList
  );

  const livePlayers = room.players.filter((p) => p.state !== PlayerStates.Dead);
  if (livePlayers.length === 1 && room.players.length > 1) {
    ServerService.getInstance().sendMessage(room.name, "gameOver", {
      winner: livePlayers[0].id.id,
    });
  }

  }

  public removePlayer(socket: Socket): void {
    const room = RoomService.getInstance().findRoomByPlayer(socket);
    if (!room) return;

    room.players = room.players.filter((player) => player.id.id !== socket.id);

    const playersList = room.players.map((player) => ({
      id: player.id.id,
      x: player.x,
      y: player.y,
      state: player.state,
      direction: player.direction,
      visibility: player.visibility,
    }));
    ServerService.getInstance().sendMessage(
      room.name,
      Messages.NEW_PLAYER,
      playersList
    );
    console.log(
      `Jugador con id ${socket.id} eliminado de la sala ${room.name}`
    );
    console.log("objeto sala", room);
  }

  public addPlayer(player: Player): boolean {
    // Se añaden el jugador a una sala mediante el RoomService.
    const room: Room = RoomService.getInstance().addPlayer(player);

    // Define las coordenadas de las esquinas del tablero.
    const playerBoard = room.game ? room.game.board : { size: 10 };
    const corners = [
      { x: 0, y: 0 },
      { x: 0, y: playerBoard.size - 1 },
      { x: playerBoard.size - 1, y: 0 },
      { x: playerBoard.size - 1, y: playerBoard.size - 1 },
    ];

    // Obtiene las esquinas ocupadas formateando la posición de cada jugador existente en la sala.
    const takenCorners = room.players.map(
      (player) => `${player.x}_${player.y}`
    );
    // Filtra las esquinas disponibles que no estén tomadas.
    const availableCorners = corners.filter(
      (corner) => !takenCorners.includes(`${corner.x}_${corner.y}`)
    );

    // Si hay una esquina disponible, se asigna aleatoriamente una de ellas al jugador.
    if (availableCorners.length > 0) {
      const randomCorner =
        availableCorners[Math.floor(Math.random() * availableCorners.length)];
      player.x = randomCorner.x;
      player.y = randomCorner.y;
    }

    // Se crea una lista con la información de todos los jugadores para notificarles.
    const playersList = room.players.map((Player) => ({
      id: Player.id.id,
      x: Player.x,
      y: Player.y,
      state: Player.state,
      direction: Player.direction,
      visibility: Player.visibility,
    }));

    // Se notifica a todos en la sala que hay un nuevo jugador.
    ServerService.getInstance().sendMessage(
      room.name,
      Messages.NEW_PLAYER,
      playersList
    );

    // Si la sala está llena (según el valor máximo de jugadores), se crea el juego y se construye el tablero.
    if (!room.game && room.players.length === RoomConfig.maxRoomPlayers) {
      const genRanHex = (size: Number) =>
        [...Array(size)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");

      // Se crea el objeto Game con identificador, estado, sala y tablero.
      const game: Game = {
        id: "game" + genRanHex(128),
        state: GameStates.WAITING,
        room: room,
        board: new BoardBuilder().getBoard(),
      };
      // Se asocia el juego a la sala y se guarda en la lista de juegos activos.
      room.game = game;
      this.games.push(game);
    }

    // Si la sala está ocupada (por ejemplo, 4 jugadores ya están inscritos):
    if (room.occupied) {
      // Se actualiza el estado del juego a PLAYING.
      if (room.game) {
        room.game.state = GameStates.PLAYING;
        // Si el servidor se encuentra activo, se envía el tablero a la sala.
        if (ServerService.getInstance().isActive()) {
          ServerService.getInstance().sendMessage(
            room.name,
            Messages.BOARD,
            room.game.board
          );
        }
      }
      return true;
    }
    return false;
  }
}
