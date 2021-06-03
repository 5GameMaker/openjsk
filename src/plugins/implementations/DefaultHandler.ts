import { DMChannel, GuildMember, Message, Permissions, Team, TextChannel, User } from 'discord.js';
import { Module, Context, Command, CommandPermissionsLevel, CommandTerminationReason } from '../..';
import { CommandHandler, PrefixManager, Languager } from '..';
import { Declaration, Decryptable, DecryptorResult } from '../../decryptors';

export class DefaultHandler extends CommandHandler {
    private split(text : string) : string[] { // For legacy args (don't use)
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

    private async checkPermissions(command : Command, message : Message) : Promise<null | CommandTerminationReason> { // idk how to read this
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

    private async getCommand(commands : Command[], args : { str : string }, message : Message) : Promise<Command | CommandTerminationReason> {
        args.str = args.str.trim();
        if (args.str.length == 0) return CommandTerminationReason.NO_COMMAND_USED;

        let selected = "";

        function named(name : string) : boolean {
            if (!args.str.startsWith(name)) return false;

            if (args.str.length != name.length) {
                if (!"\n\t ".includes(args.str[name.length])) return false;
            }

            selected = name;
            return true;
        }

        const command = commands
            .filter(a => named(a.name) || a.aliases.find(named))[0];
        
        if (!command) return CommandTerminationReason.UNKNOWN_COMMAND;

        const terminate = await this.checkPermissions(command, message);

        if (terminate) return terminate;

        if (args.str.length > selected.length) args.str = args.str.substr(selected.length).trim(); // shift command name
        else args.str = "";

        if (args.str.length > 0) {
            const subcommand = await this.getCommand(
                [...command.subcommands.values()],
                args,
                message,
            );

            if (
                subcommand != CommandTerminationReason.UNKNOWN_COMMAND
            ) return subcommand;
        }

        if (!command.executable) {
            return CommandTerminationReason.UNKNOWN_SUBCOMMAND;
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
        const prefix = (await prefixManager.getPrefixInContext(message)).sort((a, b) => a.length - b.length).find(a => message.content.startsWith(a));

        if (!prefix) return;

        const args = { str : message.content.substr(prefix.length) };

        const command = await this.getCommand(
            this.parent.getPluginsOfType<Module>(Module)
                .map(a => a.commands)
                .flat(),
            args,
            message
        );

        const languager = await this.parent.getPluginsOfType(Languager)[0].instantiate(message);

        if (!(command instanceof Command)) {
            switch (CommandTerminationReason[command]) {
                case CommandTerminationReason[CommandTerminationReason.NOT_SERVER_MEMBER]:
                case CommandTerminationReason[CommandTerminationReason.DM_NOT_SUPPORTED]:
                    {
                        message.channel.send(languager.string("handler.errors.dm_not_supported"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_BOT_DEVELOPER]:
                    {
                        message.channel.send(languager.string("handler.errors.not_bot_developer"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_BOT_OWNER]:
                    {
                        message.channel.send(languager.string("handler.errors.not_bot_owner"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NOT_SERVER_OWNER]:
                    {
                        message.channel.send(languager.string("handler.errors.not_server_owner"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_BOT_PERMISSION]:
                    {
                        message.channel.send(languager.string("handler.errors.no_bot_permission"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_USER_PERMISSION]:
                    {
                        message.channel.send(languager.string("handler.errors.no_user_permission"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.UNKNOWN_COMMAND]:
                    {
                        message.channel.send(languager.string("handler.errors.unknown_command"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.UNKNOWN_SUBCOMMAND]:
                    {
                        message.channel.send(languager.string("handler.errors.unknown_subcommand"));
                    }
                    break;

                case CommandTerminationReason[CommandTerminationReason.NO_COMMAND_USED]:
                    break;
            
                default:
                    message.channel.send(`${
                        languager.string("handler.errors.unknown")
                    }: ${CommandTerminationReason[command]}`);
                    break;
            }

            return;
        }

        const context = new Context({
            message,
            languager,
        });

        try {
            if (command.executable instanceof Function) {
                await command.executable(context, ...args.str.split(/[ \n\t]/g));
            }
            else if (command.executable) {
                const declarations = command.mapDeclarations;
                const declres = (await Promise.all(declarations.map(a => Decryptable.decrypt(args.str, a)))).filter(a => a !== false) as {
                    result: DecryptorResult[],
                    declaration: Declaration,
                }[];

                if (declres.length == 0) {
                    message.channel.send(languager.string("handler.errors.no_matching_signatures"));
                    return;
                }

                // search for the best match

                const scores = declres.map(a => {
                    const paramscores = a.declaration.params.map((b, i) : number => {
                        const param = Decryptable.normalizeParam(b);
                        const result = a.result[i];

                        if (param.required) return 1;
                        else return result.success ? 1 : 0;
                    }).reduce((a, b) => a + b);

                    return {
                        paramscores,
                        decl: a,
                    };
                }).sort((a, b) => b.paramscores - a.paramscores);

                const decl = scores[0].decl;

                await decl.declaration.executable(context, ...decl.result.map(a => a.value));
            }
        } catch (err) {
            console.error(err);
        }
    }
}

