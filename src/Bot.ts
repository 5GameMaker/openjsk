import { Client, ClientOptions } from "discord.js";
import { Plugin } from ".";
import { Options, Sequelize } from 'sequelize';
import { DefaultPrefixManager, DefaultHandler, Paginator, Main } from "./plugins/implementations";

export interface BotOptions extends ClientOptions {
    prefix: string | string[],
    database: Options,
    unconfigured: boolean,
}

export class Bot extends Client {
    constructor(options : Partial<BotOptions> = {}) {
        super
        (
            {
                prefix: "!",
                restTimeOffset: 0,
                restRequestTimeout: 0,
                database: "sqlite::memory:",
                partials: [
                    "CHANNEL",
                    "GUILD_MEMBER",
                    "MESSAGE",
                    "REACTION",
                    "USER",
                ],
                unconfigured: false,
            } as BotOptions && options
        );

        this.db = new Sequelize(options.database);

        if (!this.options.unconfigured) {
            this.loadPlugin(new DefaultPrefixManager(this));
            this.loadPlugin(new DefaultHandler(this));
            this.loadPlugin(new Paginator(this));
            this.loadPlugin(new Main(this));
        }
    }

    private plugins = new Array<Plugin>();
    public readonly db : Sequelize; // no longer bot.db = new Sequelize

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
