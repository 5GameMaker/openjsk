"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
class Bot extends discord_js_1.Client {
    constructor(options) {
        super({
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
        } && options);
        this.plugins = new Array();
        this.db = null;
    }
    getPluginsOfType(type) {
        return this.plugins.filter(a => a instanceof type);
    }
    loadPlugin(plugin) {
        try {
            plugin.onLoad();
            this.plugins.push(plugin);
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map