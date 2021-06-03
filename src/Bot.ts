import { Client, ClientOptions } from "discord.js";
import { Plugin } from ".";
import { Options, Sequelize } from 'sequelize';
import { DefaultPrefixManager, DefaultHandler, DefaultLanguager, Paginator, Main, Jishaku } from "./plugins/implementations";
import { LanguagerSettings } from "./plugins/Languager";
import { join } from "path";

export interface BotOptions extends ClientOptions {
    prefix: string | string[],
    database: Options,
    unconfigured: boolean,
    languager: LanguagerSettings,
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
                languager: {
                    defaultLanguage: 'en',
                    langpath: [ join(__dirname, "../lang") ],
                }
            } as Partial<BotOptions> && options
        );

        this.db = new Sequelize(options.database);

        if (!this.options.unconfigured) {
            const lp = join(__dirname, "../lang");
            if (!this.options.languager) {
                this.options.languager = {
                    defaultLanguage: 'en',
                    langpath: [ lp ],
                };
            }
            else this.options.languager.langpath.push(lp);
            

            this.loadPlugin(new DefaultPrefixManager(this));
            this.loadPlugin(new DefaultHandler(this));
            this.loadPlugin(new Paginator(this));
            this.loadPlugin(new Main(this));
            this.loadPlugin(new Jishaku(this));
            this.loadPlugin(new DefaultLanguager(this, this.options.languager));
        }
    }

    private plugins = new Array<Plugin>();
    public readonly db : Sequelize; // no longer bot.db = new Sequelize

    declare public options : BotOptions;

    public getPluginsOfType<T extends Plugin>(type : abstract new (...a : any[]) => T) : T[] {
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
