# Descripción General del Proyecto "TAMAGOCHIS"

Este proyecto basicamente es un juego en tiempo real basado en navegador, donde se simula una partida interactiva entre jugadores. 

El proyecto se divide en dos partes: el cliente y el servidor, este proyecto sigue la arquitectura de modelo, vista, controlador.

En este proyecto el:

## El cliente

Se encarga de la interfaz gráfica y la interacción del usuario con el juego. 

En el cliente podemos encontrar

- **UIv1:**
 Se encarga de gestionar el renderizado del tablero y la visualización de los jugadores. Aquí he implementado la funcionalidad de moverse, rotar y disparar, así como el principio y fin de la partida.

- **Gestión del Juego:**
  - El GameController del cliente es el que actúa como intermediario entre las comunicaciones del servidor y el UIv1, envia las acciones al GameService del cliente.
  - En el board del cliente coloco los arbustos.
  - En el Player le doy las propiedades para la posición, dirección, estado y visibilidad del jugador.

- **ConnectionHanler:**
  - Se encarga de establecer la conexión con el servidor a través de Socket.IO, se encarga de enviar y recir mensajes sobre eventos de juego.

## El servidor

Se encarga de la lógica del juego y de la comunicación entre los clientes.

En el servidor podemos encontrar:

- **ServerService:**
  - Se encarga de inicializar el servidor y de configurar Socket.IO para escuchar eventos como conexión, desconexión y mensajes de acciones.
  - Se implementa la lógica para emitir mensajes a todos los clientes conectados a una sala.

- **GameService:**
  - Se encarga de administrar la lógica del juego, asi como la creacion de jugadores, la validación de las acciones de los jugadores, etc.

- **BoardBuilder:**
  - Se encarga de la construcción del tablero, se encarga de asignar el tamaño del tablero y la colocación aleatoria de los arbustos.

- **RoomSevice:**
  - Se encarga de administrar las salas del juego. Asignar los jugadores a una sala y validar que no se pase del numero maximo de jugadores.

## Rubrica de Evaluación

1. Diseño del Tablero y Mecánicas de Juego (20 puntos)
- (5 pts) Implementación de un tablero de tamaño NxN correctamente generado. **SI** ✅
- (5 pts) Configuración inicial de los jugadores en las esquinas del tablero. **SI** ✅
- (5 pts) Implementación de ataques entre jugadores con reglas de distancia. **SI** ✅
- (5 pts) Implementación de casillas de escondite con normas de posicionamiento adecuadas. **SI** ✅

2. Comunicación Cliente-Servidor con WebSockets (20 puntos)
- (5 pts) Configuración del servidor para manejar conexiones de clientes vía WebSockets. **SI** ✅
- (5 pts) Envío y recepción de mensajes de manera eficiente entre cliente y servidor. **SI** ✅
- (5 pts) Sincronización en tiempo real del estado del juego en todos los clientes conectados. **SI** ✅
- (5 pts) Manejo de desconexiones y reconexiones de jugadores sin afectar la partida. **SI** ✅

3. Implementación del Cliente y Eventos del Juego (20 puntos)
- (5 pts) Representación visual dinámica del tablero y los jugadores según datos del servidor. **SI** ✅
- (5 pts) Implementación de eventos de juego: desplazamiento, rotación y disparo. **SI** ✅
- (5 pts) Diseño de una interfaz intuitiva para la interacción del jugador. **SI** ✅
- (5 pts) Adaptabilidad del cliente a posibles rediseños o mejoras futuras. **Puede mejorarse**. 

4. Gestión de Salas y Control de Juego (20 puntos)
- (5 pts) Implementación de salas para gestionar partidas independientes. **SI** ✅
- (5 pts) Control centralizado del estado del juego en el servidor. **SI** ✅
- (5 pts) Compartición eficiente de datos del mapa entre todos los clientes. **SI** ✅
- (5 pts) Manejo de finalización de partidas y asignación de ganadores. **A medias**, el mensaje de inicio y fin de partida **SI**, pero he intentado añadir un boton de reinicio de partida pero no me salia bien.

5. Uso de Buenas Prácticas de Programación y Patrones de Diseño (10 puntos)
- (5 pts) Uso adecuado de clases, objetos JSON y patrones de diseño. **Puede mejorar**
- (5 pts) Código modular y bien estructurado que facilite la escalabilidad. **Lo he mejorado lo que he podido, pero se puede mejorar algo más**

6. Nivel Avanzado: Adaptación a Angular (10 puntos)
- (5 pts) Refactorización del cliente para adaptarlo a Angular. **NO** ❌
- (5 pts) Implementación de servicios y componentes en Angular para la gestión del juego. **NO** ❌

Puntuación Total: 100 puntos
