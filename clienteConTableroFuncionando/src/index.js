import { GameController } from "./GameController.js";
import { UIv1 } from "./UIv1.js";
import { Board } from "./entities/Board.js";


const game = new GameController("http://localhost:3000", UIv1);

const board = new Board();
board.build({ size: 10, elements: [] });
UIv1.drawBoard(board.map);
