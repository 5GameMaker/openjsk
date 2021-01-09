import { Collection } from "discord.js";
import { Command, Plugin } from ".";
export declare enum CommandTerminationReason {
    DM_NOT_SUPPORTED = 0,
    NO_BOT_PERMISSION = 1,
    NO_USER_PERMISSION = 2,
    NO_COMMAND_USED = 3,
    NOT_SERVER_MEMBER = 4,
    NOT_SERVER_OWNER = 5,
    NOT_BOT_DEVELOPER = 6,
    NOT_BOT_OWNER = 7,
    UNKNOWN_COMMAND = 8,
    UNKNOWN_SUBCOMMAND = 9
}
export declare class Module extends Plugin {
    readonly commands: Command[];
    protected addCommand(command: Command): void;
    mapCommands(): Collection<string, Command>;
}
//# sourceMappingURL=Module.d.ts.map