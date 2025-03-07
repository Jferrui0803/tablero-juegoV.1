import { UI_BUILDER } from "./Ui.js";
import { ConnectionHandler } from "./services/ConnectionHandler.js";

export const UIv1 = UI_BUILDER.init();

UIv1.initUI = () => {
  const base = document.getElementById(UIv1.uiElements.board);
  base.classList.add("board");
};

UIv1.movePlayer = (player, direction) => {
  console.log(`Enviando movimiento de ${player.id} en dirección ${direction}`);
  ConnectionHandler.socket.emit("movePlayer", direction);
};

UIv1.shootPlayer = (player) => {
  console.log(player);
  ConnectionHandler.socket.emit("shootPlayer", player);
};

function rotacionGrados(r){
  let direction;
  switch (r) {
    case 0:
      direction = 3;
      break;
    case 90:
      direction = 1;
      break;
    case 180:
      direction = 2;
      break;
    case 270:
      direction = 0;
      break;
    default:
      direction = 3
  }

  return direction
}

UIv1.drawPlayers = async (players) => {

  // Obtener el socket ID del cliente conectado
  const socketId = await ConnectionHandler.getClientSocketId();

  UIv1.players = players;
  const boardElement = document.getElementById(UIv1.uiElements.board);
  const tiles = boardElement.querySelectorAll(".tile");
  const controlsContainer = document.getElementById("controls");
  controlsContainer.innerHTML = "";

  const boardSize = Math.sqrt(tiles.length);

  // Limpiar cada casilla
  tiles.forEach((tile) => {
    tile.innerHTML = "";
  });

  players.forEach((player) => {
    // Si el jugador NO es el usuario actual y está oculto, no se dibuja
    if (player.id !== socketId && !player.visibility) return;

    const index = player.x * boardSize + player.y;
    const tile = tiles[index];
    if (tile) {
      // Crear el icono del jugador
      const playerIcon = document.createElement("div");
      playerIcon.style.backgroundImage = "url('assets/img/flecha.png')";
      playerIcon.style.backgroundSize = "contain";
      playerIcon.id = player.id;
      playerIcon.style.width = "30px";
      playerIcon.style.height = "30px";
      playerIcon.style.position = "absolute";
      playerIcon.dataset.rotation = 0;

      // cambiar switch de palabras a números
      if (player.direction !== undefined || player.direction !== 0) {
        switch (player.direction) {
          case 0:
            playerIcon.style.transform = "rotate(270deg)";
            playerIcon.dataset.rotation = 270;
            break;
          case 1:
            playerIcon.style.transform = "rotate(90deg)";
            playerIcon.dataset.rotation = 90;
            break;
          case 2:
            playerIcon.style.transform = "rotate(180deg)";
            playerIcon.dataset.rotation = 180;
            break;
          case 3:
            playerIcon.style.transform = "rotate(0deg)";
            playerIcon.dataset.rotation = 0;
            break;
          default:
            playerIcon.style.transform = "rotate(0deg)";
            playerIcon.dataset.rotation = 0;
        }
      }

      // Si el jugador es el usuario actual, agregar botones de control.
      if (player.id === socketId) {
        // Resalta al jugador actual
        playerIcon.style.border = "3px solid red";

        // Botón Avanzar
        const btnAdvance = document.createElement("button");
        btnAdvance.innerHTML = "Avanzar";
        btnAdvance.addEventListener("click", () => {
          const img = document.getElementById(player.id);
          let currentRotation = parseInt(img.dataset.rotation) || 0;
          let direction = rotacionGrados(currentRotation);
          UIv1.movePlayer(player, direction);
        });
        controlsContainer.appendChild(btnAdvance);

        // Botón Rotar
        const btnRotate = document.createElement("button");
        btnRotate.innerHTML = "Rotar";
        btnRotate.addEventListener("click", () => {
          const img = document.getElementById(player.id);
          let currentRotation = parseInt(img.dataset.rotation) || 0;
          const newRotation = (currentRotation + 90) % 360;
          img.style.transform = `rotate(${newRotation}deg)`;
          img.dataset.rotation = newRotation;
          // Actualizar la dirección en el objeto player
          player.direction =  rotacionGrados(newRotation);
          console.log(
            `Jugador ${player.id} rotado a ${newRotation}° (${player.direction})`
          );

          ConnectionHandler.socket.emit("rotatePlayer", {
            id: player.id,
            direction: player.direction,
          });
        });
        controlsContainer.appendChild(btnRotate);

        // Botón Disparar solo si el jugador es visible (no está en un arbusto)
        if (player.visibility) {
          const btnShoot = document.createElement("button");
          btnShoot.innerHTML = "Disparar";
          btnShoot.addEventListener("click", () => {
            UIv1.shootPlayer(player);
          });
          controlsContainer.appendChild(btnShoot);
        }
      }
      tile.appendChild(playerIcon);
    }
  });

  console.log("Jugadores actualizados:", players);
};

UIv1.drawBoard = (board) => {
  // Verifica que el board no sea undefined.
  if (board !== undefined) {
    const base = document.getElementById(UIv1.uiElements.board);
    base.innerHTML = "";
    base.style.gridTemplateColumns = `repeat(${board.length}, 100px)`;
    base.style.gridTemplateRows = `repeat(${board.length}, 100px)`;

    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        if (cell === 5) {
          tile.style.backgroundImage = "url('assets/img/arbusto.png')";
        }
        tile.dataset.row = i;
        tile.dataset.col = j;
        base.appendChild(tile);
      });
    });

    base.querySelectorAll(".tile").forEach((tile) => {
      anime({
        targets: tile,
        opacity: [0, 1],
      });
    });
  }
};


