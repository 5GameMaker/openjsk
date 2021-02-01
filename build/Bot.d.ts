import { Client, ClientOptions } from "discord.js";
import { Behavour, Plugin } from ".";
import { Sequelize } from 'sequelize';
export interface BotOptions extends ClientOptions {
    prefix?: string;
}
export declare class Bot extends Client {
    constructor(options: BotOptions);
    private plugins;
    db: Sequelize | null;
    getPluginsOfType<T extends Plugin>(type: typeof Plugin): T[];
    getBehavoursOfType<T extends Behavour>(type: typeof Behavour): T[];
    loadPlugin(plugin: Plugin): void;
}
//# sourceMappingURL=Bot.d.ts.map