import { Bot } from "..";

export abstract class Behavour {
    public constructor(bot : Bot) {
        this.bot = bot;
    }

    public abstract load() : Promise<void>;
    public abstract unload() : Promise<void>;

    protected bot : Bot;
}

