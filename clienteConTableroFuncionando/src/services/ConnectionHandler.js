import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";
import { GameService } from "./GameService.js";

export const ConnectionHandler = {
  connected: false,
  socket: null,
  url: null,
  controller: null,

  // Inicializa la conexión y configura los eventos
  init(url, controller, onConnectedCallBack, onDisconnectedCallBack) {
    this.url = url;
    this.controller = controller;
    this.socket = io(url);

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("Conectado al servidor. Socket ID:", this.socket.id);
      onConnectedCallBack();
    });

    this.socket.on("message", (payload) => {
      this.controller.actionController(payload);
    });

    this.socket.on("disconnect", () => {
      this.connected = false;
      console.log("Desconectado del servidor.");
      onDisconnectedCallBack();
    });
  },

  // Método para obtener el socket ID
  getSocketId() {
    return this.socket && this.socket.connected ? this.socket.id : null;
  },

  

  //Espera hasta obtener el socket ID (si aún no está disponible)
  async getClientSocketId() {
    return new Promise((resolve) => {
      const checkSocket = setInterval(() => {
        const id = this.getSocketId();
        if (id) {
          clearInterval(checkSocket);
          resolve(id);
        }
      }, 100); 
    });
  }
};
