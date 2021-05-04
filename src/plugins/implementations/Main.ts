import { ClientUser, EmbedFieldData, MessageEmbed, NewsChannel, Team, User, version as dsversion } from "discord.js";
import { Bot, BotOptions, Command, CommandPermissionsLevel, version as ojversion} from "../..";
import { Module, PrefixManager } from "..";
import { Paginator } from '.';
import { platform, release } from "os";

export class Main extends Module { // this module probably will be added to the next release of openjsk. And it was
    constructor(bot : Bot) {
        super(bot);

        this.name = "main-module";

        this.addCommand(new Command({
            name: 'commands',
            aliases: ['help'],
            category: 'main',
            permissions: {
                level: CommandPermissionsLevel.DM,
            },
            executable: async (ctx, nameOfSmthOrPage : string | undefined, page : string | undefined) => {
                if (ctx.message.channel instanceof NewsChannel) return;

                const mods = bot.getPluginsOfType<Module>(Module);
                let commands = mods.map(a => a.commands).flat();

                let actualPage = (
                    a => isNaN(a) ? 1 : a
                )(
                    parseInt(nameOfSmthOrPage && !isNaN(parseInt(nameOfSmthOrPage)) ? nameOfSmthOrPage : page || '1')
                ) - 1;

                if (nameOfSmthOrPage && isNaN(parseInt(nameOfSmthOrPage))) {
                    commands = commands.filter(
                        a =>
                        a.category == nameOfSmthOrPage ||
                        a.name.includes(nameOfSmthOrPage) ||
                        a.aliases.filter(b => b.includes(nameOfSmthOrPage)).length > 0
                    );
                }

                const pages = Math.ceil(commands.length / 5);

                if (pages == 0) {
                    ctx.message.channel.send("Found 0 commands from search query");
                    return;
                }

                bot.getPluginsOfType<Paginator>(Paginator)[0].paginate(
                    ctx.message.channel,
                    new Array(pages).fill(1).map((_, i) => new MessageEmbed({
                        title: "Commands list",
                        description: "List of commands. Maybe useful",
                        fields: commands
                            .slice(i * 5, i * 5 + 5)
                            .map(a => {
                                const value = new Array<string>();
    
                                value.push(`> No description`.replace(/\n/g, "\n> "));
                                value.push(``);
                                if (a.aliases.length > 0) value.push(`**Aliases**: ${a.aliases.join(', ')}`);
                                if (a.category) value.push(`**Category**: ${a.category}`);
    
                                return {
                                    name: a.name,
                                    value: value.join('\n'),
                                    inline: true,
                                }
                            }),
                    })),
                    ctx.message.author,
                    actualPage,
                );
            }
        }));

        this.addCommand(new Command({
            name: 'ping',
            category: 'main',
            permissions: {
                level: CommandPermissionsLevel.DM,
            },
            executable: async (ctx) => {
                ctx.message.channel.send(new MessageEmbed({
                    title: "Bot ping",
                    description: `:ping_pong: **Ping**: ${ctx.message.client.ws.ping}ms`,
                }));
            }
        }));

        this.addCommand(new Command({
            name: 'info',
            category: 'main',
            aliases: [ 'about' ],
            permissions: {
                level: CommandPermissionsLevel.DM,
            },
            executable: async (ctx) => {
                const user = ctx.message.client.user as ClientUser;

                if (!user.bot) { //why?
                    ctx.message.channel.send("this client is a selfbot. why?");
                    return;
                }

                const app = await ctx.message.client.fetchApplication();

                ctx.message.channel.send(new MessageEmbed({
                    title: app.name,
                    description: app.description,
                    author: {
                        name: user.username,
                        iconURL: user.avatarURL({ size: 1024, format: 'webp', dynamic: true })
                            || 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png',
                    },
                    thumbnail: {
                        url: app.iconURL({
                            format: 'webp',
                            size: 4096,
                        })
                    },
                    fields: [
                        {
                            name: "Owner",
                            value: app.owner instanceof User
                                ? `👑 <@${app.owner.id}>`
                                : (
                                    app.owner instanceof Team
                                    ? `👥 **${app.owner.name}**\n` +
                                    app.owner.members.map(
                                        (a, id) => `${
                                            (app.owner as Team).ownerID == id
                                            ? '👑'
                                            : '🔧'
                                        } <@${a.id}>`
                                    ).join('\n')
                                    : `No owner`
                                ),
                            inline: true,
                        },
                        {
                            name: "Information",
                            value: [
                                `Host: ${platform()} ${release()}`,
                                `Node.js: ${process.version}`,
                                `Discord.js: ${dsversion}`,
                                `OpenJSK: ${ojversion}`,
                            ].join('\n'),
                            inline: true,
                        },
                        ...(() => {
                            const fields = new Array<EmbedFieldData>();

                            if (!app.botPublic) fields.push({
                                name: "🔒 Private bot",
                                value: "This bot is private and can only be added by its developer",
                            });

                            if (app.botRequireCodeGrant) fields.push({
                                name: "📜 Bot requires code grant",
                                value: [
                                    "While adding this bot to your server you will be",
                                    "redirected to an external website provided by bot",
                                    "developer"
                                ].join(' '),
                            });

                            if (app.botPublic) {
                                if (!app.botRequireCodeGrant) {
                                    fields.push({
                                        name: "➕ Add bot to your server",
                                        value: [
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=0&scope=bot](Without permissions)`,
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=8&scope=bot](Admin permissions)`,
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=-1&scope=bot](Custom setup)`,
                                        ].join('\n'),
                                    });
                                }
                                else {
                                    fields.push({
                                        name: "➕ Add bot to your server",
                                        value: "**Ask developer for a link**",
                                    });
                                }
                            }

                            return fields;
                        })(),
                    ],
                }));
            }
        }));

        this.addCommand(new Command({
            name: 'prefix',
            aliases: [],
            category: 'main',
            executable: async (ctx) => {
                const pm = bot.getPluginsOfType<PrefixManager>(PrefixManager)[0];
                const prefix = await pm.getPrefixInContext(ctx.message);
                const uprefix = await pm.getPrefix('USER', ctx.message.author.id);
                const gprefix = ctx.message.guild ? await pm.getPrefix('GUILD', ctx.message.guild.id) : null;

                ctx.message.channel.send(new MessageEmbed({
                    author: {
                        name: ctx.message.author.username,
                        icon_url: ctx.message.author.avatarURL({ dynamic: true }) || undefined,
                    },
                    title: "Prefix",
                    description: [
                        `Bot prefix: ${[(bot.options as BotOptions).prefix]
                            .flat()
                            .map(a => `\`\`${a.replace(/`/g, "\u200b`\u200b").replace(/\u200b+/, "\u200b")}\`\``)}`,
                        `Custom prefix: ${uprefix.map(a => `\`\`${a.replace(/`/g, "\u200b`\u200b").replace(/\u200b+/, "\u200b")}\`\``)}`,
                        ...(() => gprefix ? [
                            `Guild prefix: ${gprefix.map(a => `\`\`${a.replace(/`/g, "\u200b`\u200b").replace(/\u200b+/, "\u200b")}\`\``)}`,
                        ] : [])().flat(),
                        `Current prefix: \`\`${prefix}\`\``,
                    ].join('\n'),
                    footer: {
                        text: `Use ${prefix}prefix add guild/self <prefix> to change your prefix`,
                    },
                }));
            },
            subcommands: [
                new Command({
                    name: 'add',
                    executable: async (ctx, scope, prefix) => {
                        if (typeof prefix != 'string' || !['guild', 'self'].includes(scope)) {
                            ctx.message.channel.send("Usage: prefix add <scope> <prefix>");
                            return;
                        }

                        if (!prefix.match(/^[a-zA-Z!@#$%^&*~()\[\]\{\}\-+=*\/\?.,:;'"`<>]{1,16}$/)) {
                            ctx.message.channel.send("Invalid prefix");
                            return;
                        }

                        if (scope == 'guild') {
                            if (!ctx.message.guild) {
                                await ctx.message.channel.send("Can only change guild prefix inside a guild");
                                return;
                            }
                            if (!ctx.message.member) {
                                await ctx.message.channel.send("You are not a member of this guild");
                                return;
                            }
                            if (!ctx.message.member.hasPermission('MANAGE_GUILD')) {
                                await ctx.message.channel.send("MANAGE_GUILD permission is required for changing guild's prefix");
                                return;
                            }
                        }


                        const pm = bot.getPluginsOfType<PrefixManager>(PrefixManager)[0];

                        await pm.addPrefix(scope == 'self' ? 'USER' : 'GUILD', ctx.message.author.id, prefix);

                        ctx.message.channel.send("Prefix has been changed");
                    }
                }),
            ]
        }));

        // TODO: Add language command when it will be possible
    }
}
