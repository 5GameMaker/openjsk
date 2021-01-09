import { Message } from "discord.js";

export interface ContextData {
    message : Message;
}

export class Context {
    constructor(data : ContextData) {
        this.message = data.message;
    }

    public readonly message : Message;
}

