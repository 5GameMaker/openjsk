import { Client, ClientOptions } from "discord.js";
import { Plugin } from ".";
import { Options, Sequelize } from 'sequelize';

export interface BotOptions extends ClientOptions {
    prefix: string | string[],
    database: Options,
}

export class Bot extends Client {
    constructor(options : Partial<BotOptions> = {}) {
        super
        (
            {
                prefix: "!",
                restTimeOffset: 0,
                restRequestTimeout: 0,
                partials: [
                    "CHANNEL",
                    "GUILD_MEMBER",
                    "MESSAGE",
                    "REACTION",
                    "USER",
                ]
            } as BotOptions && options
        );

        if (options.database) this.db = new Sequelize(options.database);
    }

    private plugins = new Array<Plugin>();
    public db : Sequelize | null = null;

    declare public options : BotOptions;

    public getPluginsOfType<T extends Plugin>(type : typeof Plugin) : T[] {
        return this.plugins.filter(a => a instanceof type) as T[];
    }

    public loadPlugin(plugin : Plugin) {
        try {
            plugin.onLoad();
            this.plugins.push(plugin);
        } catch (err) {
            console.error(err);
        }
    }
}
