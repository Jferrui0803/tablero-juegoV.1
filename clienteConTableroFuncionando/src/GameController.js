import { ConnectionHandler } from "./services/ConnectionHandler.js";
import { GameService } from "./services/GameService.js";

export class GameController {
  #states = {
    RIGHT: 0,
    BAD: 1,
  };
  #state = null;
  #gameService = null;

  constructor(url, ui) {
    ui.initUI();
    this.#gameService = new GameService(ui);
    ConnectionHandler.init(
      url,
      this,
      () => {
        this.#state = this.#states.RIGHT;
      },
      () => {
        this.#state = this.#states.BAD;
      }
    );
  }

  // Método que actúa como controlador de acciones basado en el tipo de mensaje recibido.
  actionController(payload) {
    if (payload.type === "NEW_PLAYER") {
      this.#gameService.do_newPlayer(payload.content);
    } else if (payload.type === "BOARD") {
      this.#gameService.do_newBoard(payload.content);
    }
  }
}
