import { ClientEvents } from "discord.js";
import { Behavour, Bot } from "../..";

export class EventBehavour extends Behavour {
    constructor(bot : Bot, event : keyof ClientEvents, callback : (...args : any[]) => {}) {
        super(bot);
        this.event = event;
        this.callback = callback;
    }

    public async load(): Promise<void> {
        this.bot.on(this.event, this.callback);
    }

    public async unload(): Promise<void> {
        this.bot.off(this.event, this.callback);
    }
    
    private event : keyof ClientEvents;
    private callback : (...args : any[]) => {};
}
