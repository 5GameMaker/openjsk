import { DMChannel, Message, NewsChannel, TextChannel } from "discord.js";
import { Bot, LanguagerInstance } from ".";

export interface ContextData {
    message : Message;
    languager : LanguagerInstance;
}

export class Context {
    constructor(data : ContextData) {
        this.message = data.message;
        this.channel = this.message.channel;
        this.bot = this.message.client as Bot;

        this.languager = data.languager;
    }

    public readonly message : Message;
    public readonly channel : TextChannel | DMChannel | NewsChannel;
    public readonly bot : Bot;
    public readonly languager : LanguagerInstance;
}

