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

UIv1.drawPlayers = async (players) => {
  console.log("Dibujando jugadores:", players);

  // Obtener el socket ID del cliente conectado
  const socketId = await ConnectionHandler.getClientSocketId();
  console.log("Socket ID del jugador conectado:", socketId);

  UIv1.players = players;
  const boardElement = document.getElementById(UIv1.uiElements.board);
  const tiles = boardElement.querySelectorAll(".tile");
  const controlsContainer = document.getElementById("controls");
  const playerActual = document.getElementById(socketId);
  controlsContainer.innerHTML = "";

  const boardSize = Math.sqrt(tiles.length);

  tiles.forEach((tile) => {
    tile.innerHTML = "";
  });

  players.forEach((player) => {
    if (!player.visibility && player.id !== socketId) return;

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


      if (player.direction !== undefined && player.direction !== 0) {
        switch (player.direction) {
          case "right":
            playerIcon.style.transform = "rotate(0deg)";
            playerIcon.dataset.rotation = 0;
            break;
          case "down":
            playerIcon.style.transform = "rotate(90deg)";
            playerIcon.dataset.rotation = 90;
            break;
          case "left":
            playerIcon.style.transform = "rotate(180deg)";
            playerIcon.dataset.rotation = 180;
            break;
          case "up":
            playerIcon.style.transform = "rotate(270deg)";
            playerIcon.dataset.rotation = 270;
            break;
          default:
            playerIcon.style.transform = "rotate(0deg)";
            playerIcon.dataset.rotation = 0;
        }
      }
      

      // Si el jugador es el usuario actual, agregar botones de "Avanzar" y "Rotar"
      if (player.id === socketId) {
        playerIcon.style.border = "3px solid red";

        if (player.direction !== undefined && player.direction !== 0) {
          switch (player.direction) {
            case "right":
              playerIcon.style.transform = "rotate(0deg)";
              playerIcon.dataset.rotation = 0;
              break;
            case "down":
              playerIcon.style.transform = "rotate(90deg)";
              playerIcon.dataset.rotation = 90;
              break;
            case "left":
              playerIcon.style.transform = "rotate(180deg)";
              playerIcon.dataset.rotation = 180;
              break;
            case "up":
              playerIcon.style.transform = "rotate(270deg)";
              playerIcon.dataset.rotation = 270;
              break;
            default:
              playerIcon.style.transform = "rotate(0deg)";
              playerIcon.dataset.rotation = 0;
          }
        }

        // Botón Avanzar: mover al jugador en la dirección según la rotación actual del icono.
        const btnAdvance = document.createElement("button");
        btnAdvance.innerHTML = "Avanzar";
        btnAdvance.addEventListener("click", () => {
          const img = document.getElementById(player.id);
          let currentRotation = 0;
          const rotateValor = img.dataset.rotation;
          if (rotateValor) {
            currentRotation = parseInt(rotateValor);
          }
          let direction;
          // Considerando que la imagen apunta a la derecha por defecto:
          switch (currentRotation) {
            case 0:
              direction = "right";
              break;
            case 90:
              direction = "down";
              break;
            case 180:
              direction = "left";
              break;
            case 270:
              direction = "up";
              break;
            default:
              direction = "right";
          }
          UIv1.movePlayer(player, direction);
        });
        controlsContainer.appendChild(btnAdvance);

        // Botón Rotar: rota la imagen del jugador en la misma celda
        const btnRotate = document.createElement("button");
        btnRotate.innerHTML = "Rotar";
        btnRotate.addEventListener("click", () => {
          const img = document.getElementById(player.id);
          let currentRotation = 0;
          const rotateValor = img.dataset.rotation;
          if (rotateValor) {
            currentRotation = parseInt(rotateValor);
          }
          const newRotation = (currentRotation + 90) % 360;
          img.style.transform = `rotate(${newRotation}deg)`;
          img.dataset.rotation = newRotation;
          // Guardar la rotación en el objeto player para preservarla al redibujar
          switch (newRotation) {
            case 0:
              player.direction = "right";
              break;
            case 90:
              player.direction = "down";
              break;
            case 180:
              player.direction = "left";
              break;
            case 270:
              player.direction = "up";
              break;
          }
          console.log(
            `Jugador ${player.id} rotado a ${newRotation}° (${player.direction})`
          );
        });
        controlsContainer.appendChild(btnRotate);
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

    if (UIv1.players) {
      UIv1.drawPlayers(UIv1.players);
    }

    base.querySelectorAll(".tile").forEach((tile) => {
      anime({
        targets: tile,
        opacity: [0, 1],
      });
    });
  }
};
