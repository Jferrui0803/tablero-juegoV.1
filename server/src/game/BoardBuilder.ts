import { Board } from "./entities/Board";

export class BoardBuilder {
    private board: Board;
    
        constructor() {
        this.board = {
            size: 10,
            elements: []
        }
    
 // Se crea un mapa de 10x10 lleno de ceros.
        // Este mapa se usará para marcar posiciones especiales en el tablero.
        const map: number[][] = [];
        for (let i = 0; i < this.board.size; i++) {
            map[i] = [];
            for (let j = 0; j < this.board.size; j++) {
                map[i][j] = 0;
            }
        }
    
        // Se calcula las posiciones disponibles en el tablero, excluyendo las cuatro esquinas.
        // Estas posiciones son candidatas para colocar elementos con un valor especial (5).
        interface Pos { i: number, j: number }
        const availablePositions: Pos[] = [];
        for (let i = 0; i < this.board.size; i++) {
            for (let j = 0; j < this.board.size; j++) {
                // Se omiten las esquinas:
                // esquina superior izquierda, superior derecha, inferior izquierda e inferior derecha.
                if ((i === 0 && j === 0) ||
                    (i === 0 && j === this.board.size - 1) ||
                    (i === this.board.size - 1 && j === 0) ||
                    (i === this.board.size - 1 && j === this.board.size - 1)) {
                    continue;
                }
                availablePositions.push({ i, j });
            }
        }
    
        // Se define la cantidad de posiciones que se deben marcar con el valor 5.
        const numFives = 6;
        let count = 0;
        while (count < numFives) {
            // Se filtran las posiciones disponibles para asegurarse que no
            // tengan ya un 5 adyacente (se evita que dos 5 estén demasiado juntos).
            const validPositions = availablePositions.filter(pos => {
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = pos.i + di;
                        const nj = pos.j + dj;
                        // Se omiten posiciones fuera de los límites del tablero.
                        if (ni < 0 || nj < 0 || ni >= this.board.size || nj >= this.board.size) continue;
                        if (map[ni][nj] === 5) return false;
                    }
                }
                return true;
            });
        
            // Si no quedan posiciones válidas, se termina el ciclo.
            if (validPositions.length === 0) break;
        
            // Se selecciona aleatoriamente una posición válida.
            const randomIndex = Math.floor(Math.random() * validPositions.length);
            const pos = validPositions[randomIndex];
        
            // Se marca la posición seleccionada en el mapa con el valor 5.
            map[pos.i][pos.j] = 5;
            // Se elimina la posición seleccionada de la lista de posiciones disponibles.
            const removeIndex = availablePositions.findIndex(p => p.i === pos.i && p.j === pos.j);
            if (removeIndex > -1) {
                availablePositions.splice(removeIndex, 1);
            }
            count++;
        }
        
        // Se recorren todas las posiciones del mapa y se agregan a 'board.elements'
        // aquellas que tengan el valor 5, ya que representan elementos especiales.
        for (let i = 0; i < this.board.size; i++) {
            for (let j = 0; j < this.board.size; j++) {
                if (map[i][j] === 5) {
                    this.board.elements.push({ x: i, y: j });
                }
            }
        }
    }

    // Método público para obtener el tablero construido.
    public getBoard() : Board {
        return this.board;
    }
}