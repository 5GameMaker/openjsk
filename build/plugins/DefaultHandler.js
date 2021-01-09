"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHandler = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../");
class DefaultHandler extends __1.CommandHandler {
    split(text) {
        const arr = new Array();
        let backslash = false;
        let str = "";
        let strch = null;
        for (const ch of text) {
            if (backslash) {
                str += ch;
                backslash = false;
            }
            else if (ch == ' ' && !strch) {
                if (strch || str.length > 0)
                    arr.push(str);
                str = "";
            }
            else if ("'\"`".includes(ch) && (!strch || ch == strch)) {
                if (strch || str.length > 0)
                    arr.push(str);
                str = "";
                strch = strch ? null : ch;
            }
            else if (ch == '\\') {
                backslash = true;
            }
            else
                str += ch;
        }
        if (strch || str.length > 0)
            arr.push(str);
        return arr;
    }
    async checkPermissions(command, message) {
        if (!(message.channel instanceof discord_js_1.DMChannel) && message.guild) {
            if (!(message.channel.permissionsFor(message.author)
                .has(command.permissions.user)))
                return __1.CommandTerminationReason.NO_USER_PERMISSION;
            if (!(message.channel.permissionsFor(message.guild.me)
                .has(command.permissions.bot)))
                return __1.CommandTerminationReason.NO_BOT_PERMISSION;
            switch (command.permissions.level) {
                case __1.CommandPermissionsLevel.DM:
                    return __1.CommandTerminationReason.DM_NOT_SUPPORTED;
                case __1.CommandPermissionsLevel.DEFAULT:
                case __1.CommandPermissionsLevel.SERVER_MEMBER:
                    break;
                case __1.CommandPermissionsLevel.SERVER_OWNER:
                    if (message.guild.ownerID == message.guild.me.id)
                        return __1.CommandTerminationReason.NOT_SERVER_OWNER;
                    break;
                case __1.CommandPermissionsLevel.BOT_DEVELOPER:
                    {
                        const owner = (await message.client.fetchApplication()).owner;
                        if (owner instanceof discord_js_1.Team) {
                            if (!owner.members.has(message.author.id))
                                return __1.CommandTerminationReason.NOT_BOT_DEVELOPER;
                        }
                        else if (owner instanceof discord_js_1.User) {
                            if (owner.id != message.author.id)
                                return __1.CommandTerminationReason.NOT_BOT_DEVELOPER;
                        }
                    }
                    break;
                case __1.CommandPermissionsLevel.BOT_OWNER:
                    {
                        const owner = (await message.client.fetchApplication()).owner;
                        if (owner instanceof discord_js_1.Team) {
                            if (owner.ownerID != message.author.id)
                                return __1.CommandTerminationReason.NOT_BOT_OWNER;
                        }
                        else if (owner instanceof discord_js_1.User) {
                            if (owner.id != message.author.id)
                                return __1.CommandTerminationReason.NOT_BOT_OWNER;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        else {
            const owner = (await message.client.fetchApplication()).owner;
            switch (command.permissions.level) {
                case __1.CommandPermissionsLevel.BOT_DEVELOPER:
                    if (owner instanceof discord_js_1.Team) {
                        if (!owner.members.has(message.author.id))
                            return __1.CommandTerminationReason.NOT_BOT_DEVELOPER;
                    }
                    else if (owner instanceof discord_js_1.User) {
                        if (owner.id != message.author.id)
                            return __1.CommandTerminationReason.NOT_BOT_DEVELOPER;
                    }
                    break;
                case __1.CommandPermissionsLevel.BOT_OWNER:
                    if (owner instanceof discord_js_1.Team) {
                        if (owner.ownerID != message.author.id)
                            return __1.CommandTerminationReason.NOT_BOT_OWNER;
                    }
                    else if (owner instanceof discord_js_1.User) {
                        if (owner.id != message.author.id)
                            return __1.CommandTerminationReason.NOT_BOT_OWNER;
                    }
                    break;
                default:
                    break;
            }
        }
        return null;
    }
    async getCommand(commands, args, message) {
        if (args.length == 0)
            return __1.CommandTerminationReason.NO_COMMAND_USED;
        const command = commands
            .filter(a => a.name == args[0] || a.aliases.includes(args[0]))[0];
        if (!command)
            return __1.CommandTerminationReason.UNKNOWN_COMMAND;
        const terminate = await this.checkPermissions(command, message);
        if (terminate)
            return terminate;
        args.shift();
        if (args.length > 0) {
            const subcommand = await this.getCommand([...command.subcommands.values()], args, message);
            if (subcommand != __1.CommandTerminationReason.UNKNOWN_COMMAND)
                return subcommand;
        }
        return command;
    }
    async processCommands(message) {
        if (message.partial)
            await message.fetch();
        if (message.author.partial)
            await message.author.fetch();
        if (message.member &&
            message.channel instanceof discord_js_1.TextChannel &&
            message.member.partial)
            await message.member.fetch();
        if (message.author.bot)
            return;
        await message.channel.fetch();
        await message.author.fetch();
        const prefixManager = this.parent.getPluginsOfType(__1.PrefixManager)[0];
        const prefix = await prefixManager.getPrefix(message);
        if (!message.content.startsWith(prefix))
            return;
        const args = this.split(message.content.substr(prefix.length));
        const command = await this.getCommand(this.parent.getPluginsOfType(__1.Module)
            .map(a => a.commands)
            .flat(), args, message);
        if (!(command instanceof __1.Command)) {
            switch (__1.CommandTerminationReason[command]) {
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NOT_SERVER_MEMBER]:
                case __1.CommandTerminationReason[__1.CommandTerminationReason.DM_NOT_SUPPORTED]:
                    {
                        message.channel.send("This command cannot be executed in DMs");
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NOT_BOT_DEVELOPER]:
                    {
                        message.channel.send("You're not a bot developer");
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NOT_BOT_OWNER]:
                    {
                        message.channel.send("You're not a bot owner");
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NOT_SERVER_OWNER]:
                    {
                        message.channel.send("You're not owning current server");
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NO_BOT_PERMISSION]:
                    {
                        message.channel.send(`Not enough permissions to execute this command`);
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.NO_USER_PERMISSION]:
                    {
                        message.channel.send(`You have no permission to execute this command`);
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.UNKNOWN_COMMAND]:
                    {
                        message.channel.send(`Unknown command`);
                    }
                    break;
                case __1.CommandTerminationReason[__1.CommandTerminationReason.UNKNOWN_SUBCOMMAND]:
                    {
                        message.channel.send(`Unknown subcommand`);
                    }
                    break;
                default:
                    message.channel.send(`Command execution failed: ${__1.CommandTerminationReason[command]}`);
                    break;
            }
            return;
        }
        const context = new __1.Context({
            message,
        });
        try {
            await command.executable(context, ...args.slice(1));
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.DefaultHandler = DefaultHandler;
//# sourceMappingURL=DefaultHandler.js.map