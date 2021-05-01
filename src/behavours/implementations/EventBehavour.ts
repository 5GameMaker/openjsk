import { ClientEvents } from "discord.js";
import { Behavour } from '..';
import { Bot } from "../..";

export class EventBehavour<E extends keyof ClientEvents> extends Behavour {
    constructor(bot : Bot, event : E, callback : (...args : ClientEvents[E]) => {}) {
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
    
    private event : E;
    private callback : (...args : ClientEvents[E]) => {};
}
