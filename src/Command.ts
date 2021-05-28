import { Collection, PermissionResolvable, Permissions } from "discord.js";
import { Declaration, RAW } from "./decryptors";
import { Context } from ".";

export type CommandExecutable = (ctx : Context, ...params : any[]) => Promise<void>;

export enum CommandPermissionsLevel {
    DEFAULT = 1,

    DM = 0,
    SERVER_MEMBER = 1,
    SERVER_OWNER = 2,
    BOT_DEVELOPER = 3,
    BOT_OWNER = 4,
}

export interface CommandPermissions {
    user?: PermissionResolvable,
    bot?: PermissionResolvable,
    level?: CommandPermissionsLevel,
}

export interface CommandOptions {
    name? : string,
    aliases? : string[],
    category? : string,
    executable? : CommandExecutable | Declaration[],
    subcommands? : Command[],
    permissions? : CommandPermissions,
}

export class Command {
    public constructor(options : CommandOptions) {
        const permissions =
            {
                user: 0,
                bot: 0,
                level: CommandPermissionsLevel.SERVER_MEMBER,
            } as CommandPermissions
            && (options.permissions || {});

        this.name = options.name || "";
        this.aliases = options.aliases || [];
        this.executable = options.executable;
        this.category = options.category || 'main';
        this.subcommands = new Collection();
        this.permissions = {
            bot: permissions.bot instanceof Permissions ? permissions.bot : new Permissions(permissions.bot),
            level: permissions.level as CommandPermissionsLevel,
            user: permissions.user instanceof Permissions ? permissions.user : new Permissions(permissions.user),
        }

        if (options.subcommands) options.subcommands.forEach(a => this.subcommands.set(a.name, a));
    }

    public aliases : Array<string>;

    public name : string;
    public category : string;

    public executable : CommandExecutable | Declaration[] | undefined; // handlers should look into subcommands in case theres no executable

    public subcommands : Collection<string, Command>;

    public permissions : { user : Permissions, bot : Permissions, level : CommandPermissionsLevel };

    public get mapDeclarations() : Declaration[] {
        const decs : Declaration[] = [];

        if (Array.isArray(this.executable)) {
            this.executable.forEach(a => decs.push(a));
        }
        else if (this.executable) {
            decs.push({
                executable: this.executable,
                params: [
                    {
                        type: RAW,
                        name: 'args...',
                        required: false,
                    }
                ]
            });
        }

        return decs;
    }
}

