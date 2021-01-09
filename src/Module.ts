import { Collection } from "discord.js";
import { Command, Plugin } from ".";

export enum CommandTerminationReason {
    DM_NOT_SUPPORTED,

    NO_BOT_PERMISSION,
    NO_USER_PERMISSION,
    NO_COMMAND_USED,

    NOT_SERVER_MEMBER,
    NOT_SERVER_OWNER,
    NOT_BOT_DEVELOPER,
    NOT_BOT_OWNER,

    UNKNOWN_COMMAND,
    UNKNOWN_SUBCOMMAND,
}

export class Module extends Plugin {
    public readonly commands = new Array<Command>();

    protected addCommand(command : Command) {
        this.commands.push(command);
    }

    public mapCommands() : Collection<string, Command> {
        const col = new Collection<string, Command>();

        this.commands.forEach(cmd => {
            col.set(cmd.name, cmd);
            cmd.aliases.forEach(name => {
                col.set(name, cmd);
            });
        });

        return new Collection<string, Command>();
    }
}

