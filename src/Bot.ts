import { Client, ClientOptions } from "discord.js";
import { Behavour, Plugin } from ".";
import { Sequelize } from 'sequelize';

export interface BotOptions extends ClientOptions {
    prefix? : string,
}

export class Bot extends Client {
    constructor(options : BotOptions) {
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
    }

    private plugins = new Array<Plugin>();
    public db : Sequelize | null = null;

    public getPluginsOfType<T extends Plugin>(type : typeof Plugin) : T[] {
        return this.plugins.filter(a => a instanceof type) as T[];
    }

    public getBehavoursOfType<T extends Behavour>(type : typeof Behavour) : T[] {
        return this.plugins.map(a => a.behavours).flat().filter(a => a instanceof type) as T[];
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
