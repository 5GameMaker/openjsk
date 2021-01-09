import { Collection, PermissionResolvable, Permissions } from "discord.js";
import { Context } from ".";
export declare type CommandExecutable = (ctx: Context, ...params: any[]) => Promise<void>;
export declare enum CommandPermissionsLevel {
    DEFAULT = 1,
    DM = 0,
    SERVER_MEMBER = 1,
    SERVER_OWNER = 2,
    BOT_DEVELOPER = 3,
    BOT_OWNER = 4
}
export interface CommandPermissions {
    user?: PermissionResolvable;
    bot?: PermissionResolvable;
    level?: CommandPermissionsLevel;
}
export interface CommandOptions {
    name?: string;
    aliases?: string[];
    category?: string;
    executable?: CommandExecutable;
    subcommands?: Command[];
    permissions?: CommandPermissions;
}
export declare class Command {
    constructor(options: CommandOptions);
    aliases: Array<string>;
    name: string;
    category: string;
    executable: CommandExecutable;
    subcommands: Collection<string, Command>;
    permissions: {
        user: Permissions;
        bot: Permissions;
        level: CommandPermissionsLevel;
    };
}
//# sourceMappingURL=Command.d.ts.map