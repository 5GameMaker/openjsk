import { DMChannel, GuildMember, Message, Permissions, Team, TextChannel, User } from 'discord.js';
import { CommandHandler, PrefixManager, Module, Context, Command, CommandPermissionsLevel, CommandTerminationReason } from '../';

export class DefaultHandler extends CommandHandler {
    private split(text : string) : string[] {
        const arr = new Array<string>();

        let backslash = false;
        let str = "";
        let strch : string | null = null;

        for (const ch of text) {
            if (backslash) {
                str += ch;
                backslash = false;
            }
            else if (ch == ' ' && !strch) {
                if (strch || str.length > 0) arr.push(str);
                str = "";
            }
            else if ("'\"`".includes(ch) && (!strch || ch == strch)) {
                if (strch || str.length > 0) arr.push(str);
                str = "";

                strch = strch ? null : ch;
            }
            else if (ch == '\\') {
                backslash = true;
            }
            else str += ch;
        }

        if (strch || str.length > 0) arr.push(str);

        return arr;
    }

    private async checkPermissions(command : Command, message : Message) : Promise<null | CommandTerminationReason> {
        if (!(message.channel instanceof DMChannel) && message.guild) {
            if (
                !(
                    (message.channel.permissionsFor(message.author) as Readonly<Permissions>)
                    .has(command.permissions.user)
                )
            ) return CommandTerminationReason.NO_USER_PERMISSION;

            if (
                !(
                    (message.channel.permissionsFor(message.guild.me as GuildMember) as Readonly<Permissions>)
                    .has(command.permissions.bot)
                )
            ) return CommandTerminationReason.NO_BOT_PERMISSION;

            switch (command.permissions.level) {
                case CommandPermissionsLevel.DM:
                    return CommandTerminationReason.DM_NOT_SUPPORTED;

                case CommandPermissionsLevel.DEFAULT:
                case CommandPermissionsLevel.SERVER_MEMBER:
                    break;

                case CommandPermissionsLevel.SERVER_OWNER:
                    if (
                        message.guild.ownerID == (message.guild.me as GuildMember).id
                    ) return CommandTerminationReason.NOT_SERVER_OWNER;
                    break;

                case CommandPermissionsLevel.BOT_DEVELOPER:
                    {
                        const owner = (await message.client.fetchApplication()).owner;
                        
                        if (owner instanceof Team) {
                            if (!owner.members.has(message.author.id)) return CommandTerminationReason.NOT_BOT_DEVELOPER;
                        }
                        else if (owner instanceof User) {
                            if (owner.id != message.author.id) return CommandTerminationReason.NOT_BOT_DEVELOPER;
                        }
                    }
                    break;

                case CommandPermissionsLevel.BOT_OWNER:
                    {
                        const owner = (await message.client.fetchApplication()).owner;
                        
                        if (owner instanceof Team) {
                            if (owner.ownerID != message.author.id) return CommandTerminationReason.NOT_BOT_OWNER;
                        }
                        else if (owner instanceof User) {
                            if (owner.id != message.author.id) return CommandTerminationReason.NOT_BOT_OWNER;
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
                case CommandPermissionsLevel.BOT_DEVELOPER:
                    if (owner instanceof Team) {
                        if (!owner.members.has(message.author.id)) return CommandTerminationReason.NOT_BOT_DEVELOPER;
                    }
                    else if (owner instanceof User) {
                        if (owner.id != message.author.id) return CommandTerminationReason.NOT_BOT_DEVELOPER;
                    }
                    break;

                case CommandPermissionsLevel.BOT_OWNER:
                    if (owner instanceof Team) {
                        if (owner.ownerID != message.author.id) return CommandTerminationReason.NOT_BOT_OWNER;
                    }
                    else if (owner instanceof User) {
                        if (owner.id != message.author.id) return CommandTerminationReason.NOT_BOT_OWNER;
                    }
                    break;
            
                default:
                    break;
            }
        }

        return null;
    }

    private async getCommand(commands : Command[], args : string[], message : Message) : Promise<Command | CommandTerminationReason> {
        if (args.length == 0) return CommandTerminationReason.NO_COMMAND_USED;

        const command = commands
            .filter(a => a.name == args[0] || a.aliases.includes(args[0]))[0];
        
        if (!command) return CommandTerminationReason.UNKNOWN_COMMAND;

        const terminate = await this.checkPermissions(command, message);

        if (terminate) return terminate;

        args.shift();

        if (args.length > 0) {
            const subcommand = await this.getCommand(
                [...command.subcommands.values()],
                args,
                message,
            );

            if (
                subcommand != CommandTerminationReason.UNKNOWN_COMMAND
            ) return subcommand;
        }

        return command;
    }

    protected async processCommands(message: Message): Promise<void> {
        if (message.partial) await message.fetch();
        if (message.author.partial) await message.author.fetch();
        if (
            message.member &&
            message.channel instanceof TextChannel &&
            message.member.partial
        ) await message.member.fetch();

        if (message.author.bot) return;

        await message.channel.fetch();
        await message.author.fetch();

        const prefixManager = this.parent.getPluginsOfType<PrefixManager>(PrefixManager)[0];
        const prefix = await prefixManager.getPrefix(message);

        if (!message.content.startsWith(prefix)) return;

        const args = this.split(message.content.substr(prefix.length));

        const command = await this.getCommand(
            this.parent.getPluginsOfType<Module>(Module)
                .map(a => a.commands)
                .flat(),
            args,
            message
        );

        if (!(command instanceof Command)) {
            switch (CommandTerminationReason[command]) {
                case CommandTerminationReason[CommandTerminationReason.NOT_SERVER_MEMBER]:
                case CommandTerminationReason[CommandTerminationReason.DM_NOT_SUPPORTED]:
                    {
                        message.channel.send("This command cannot be executed in DMs");
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_BOT_DEVELOPER]:
                    {
                        message.channel.send("You're not a bot developer");
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_BOT_OWNER]:
                    {
                        message.channel.send("You're not a bot owner");
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_SERVER_OWNER]:
                    {
                        message.channel.send("You're not owning current server");
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_BOT_PERMISSION]:
                    {
                        message.channel.send(`Not enough permissions to execute this command`);
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_USER_PERMISSION]:
                    {
                        message.channel.send(`You have no permission to execute this command`);
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.UNKNOWN_COMMAND]:
                    {
                        message.channel.send(`Unknown command`);
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.UNKNOWN_SUBCOMMAND]:
                    {
                        message.channel.send(`Unknown subcommand`);
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_COMMAND_USED]:
                    break;
            
                default:
                    message.channel.send(`Command execution failed: ${CommandTerminationReason[command]}`);
                    break;
            }

            return;
        }

        const context = new Context({
            message,
        });

        try {
            await command.executable(context, ...args);
        } catch (err) {
            console.error(err);
        }
    }
}

