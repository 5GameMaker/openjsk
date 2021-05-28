import { DMChannel, Message, NewsChannel, TextChannel } from "discord.js";
import { Bot, Languager, LanguagerInstance } from ".";

export interface ContextData {
    message : Message;
}

export class Context {
    constructor(data : ContextData) {
        this.message = data.message;
        this.channel = this.message.channel;
        this.bot = this.message.client as Bot;

        const languager = this.bot.getPluginsOfType(Languager)[0];

        this.languager = languager.instantiate(this);
    }

    public readonly message : Message;
    public readonly channel : TextChannel | DMChannel | NewsChannel;
    public readonly bot : Bot;
    public readonly languager : Promise<LanguagerInstance>;
}

