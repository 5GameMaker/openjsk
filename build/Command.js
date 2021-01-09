"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.CommandPermissionsLevel = void 0;
const discord_js_1 = require("discord.js");
var CommandPermissionsLevel;
(function (CommandPermissionsLevel) {
    CommandPermissionsLevel[CommandPermissionsLevel["DEFAULT"] = 1] = "DEFAULT";
    CommandPermissionsLevel[CommandPermissionsLevel["DM"] = 0] = "DM";
    CommandPermissionsLevel[CommandPermissionsLevel["SERVER_MEMBER"] = 1] = "SERVER_MEMBER";
    CommandPermissionsLevel[CommandPermissionsLevel["SERVER_OWNER"] = 2] = "SERVER_OWNER";
    CommandPermissionsLevel[CommandPermissionsLevel["BOT_DEVELOPER"] = 3] = "BOT_DEVELOPER";
    CommandPermissionsLevel[CommandPermissionsLevel["BOT_OWNER"] = 4] = "BOT_OWNER";
})(CommandPermissionsLevel = exports.CommandPermissionsLevel || (exports.CommandPermissionsLevel = {}));
class Command {
    constructor(options) {
        const permissions = {
            user: 0,
            bot: 0,
            level: CommandPermissionsLevel.SERVER_MEMBER,
        }
            && (options.permissions || {});
        this.name = options.name || "";
        this.aliases = options.aliases || [];
        this.executable = options.executable || (async () => { });
        this.category = options.category || 'main';
        this.subcommands = new discord_js_1.Collection();
        this.permissions = {
            bot: permissions.bot instanceof discord_js_1.Permissions ? permissions.bot : new discord_js_1.Permissions(permissions.bot),
            level: permissions.level,
            user: permissions.user instanceof discord_js_1.Permissions ? permissions.user : new discord_js_1.Permissions(permissions.user),
        };
        if (options.subcommands)
            options.subcommands.forEach(a => this.subcommands.set(a.name, a));
    }
}
exports.Command = Command;
//# sourceMappingURL=Command.js.map