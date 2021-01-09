import { Client, ClientOptions } from "discord.js";
import { Plugin } from ".";
import { Sequelize } from 'sequelize';
export interface BotOptions extends ClientOptions {
    prefix?: string;
}
export declare class Bot extends Client {
    constructor(options: BotOptions);
    private plugins;
    db: Sequelize | null;
    getPluginsOfType<T extends Plugin>(type: typeof Plugin): T[];
    loadPlugin(plugin: Plugin): void;
}
//# sourceMappingURL=Bot.d.ts.map