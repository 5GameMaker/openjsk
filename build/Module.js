"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.CommandTerminationReason = void 0;
const discord_js_1 = require("discord.js");
const _1 = require(".");
var CommandTerminationReason;
(function (CommandTerminationReason) {
    CommandTerminationReason[CommandTerminationReason["DM_NOT_SUPPORTED"] = 0] = "DM_NOT_SUPPORTED";
    CommandTerminationReason[CommandTerminationReason["NO_BOT_PERMISSION"] = 1] = "NO_BOT_PERMISSION";
    CommandTerminationReason[CommandTerminationReason["NO_USER_PERMISSION"] = 2] = "NO_USER_PERMISSION";
    CommandTerminationReason[CommandTerminationReason["NO_COMMAND_USED"] = 3] = "NO_COMMAND_USED";
    CommandTerminationReason[CommandTerminationReason["NOT_SERVER_MEMBER"] = 4] = "NOT_SERVER_MEMBER";
    CommandTerminationReason[CommandTerminationReason["NOT_SERVER_OWNER"] = 5] = "NOT_SERVER_OWNER";
    CommandTerminationReason[CommandTerminationReason["NOT_BOT_DEVELOPER"] = 6] = "NOT_BOT_DEVELOPER";
    CommandTerminationReason[CommandTerminationReason["NOT_BOT_OWNER"] = 7] = "NOT_BOT_OWNER";
    CommandTerminationReason[CommandTerminationReason["UNKNOWN_COMMAND"] = 8] = "UNKNOWN_COMMAND";
    CommandTerminationReason[CommandTerminationReason["UNKNOWN_SUBCOMMAND"] = 9] = "UNKNOWN_SUBCOMMAND";
})(CommandTerminationReason = exports.CommandTerminationReason || (exports.CommandTerminationReason = {}));
class Module extends _1.Plugin {
    constructor() {
        super(...arguments);
        this.commands = new Array();
    }
    addCommand(command) {
        this.commands.push(command);
    }
    mapCommands() {
        const col = new discord_js_1.Collection();
        this.commands.forEach(cmd => {
            col.set(cmd.name, cmd);
            cmd.aliases.forEach(name => {
                col.set(name, cmd);
            });
        });
        return new discord_js_1.Collection();
    }
}
exports.Module = Module;
//# sourceMappingURL=Module.js.map