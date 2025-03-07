import { Socket } from "socket.io";

export enum Directions {
    Up = 0, 
    Down = 1,
    Left = 2,
    Right = 3
}

export enum PlayerStates {
    No_Connected, Idle, Moving, Hidden, Dead
}

export interface Player {
    id: Socket;
    x: number;
    y: number;
    state: PlayerStates;
    direction: Directions;
    visibility: Boolean;
}
