import { ClientUser, EmbedFieldData, MessageEmbed, NewsChannel, Team, User, version as dsversion } from "discord.js";
import { Bot, BotOptions, Command, CommandPermissionsLevel, version as ojversion, Decryptor, UINT, STRING } from "../..";
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
            executable: [
                {
                    params: [
                        {
                            type: UINT,
                            name: "page",
                            required: false,
                        }
                    ],
                    executable: async (ctx, page? : number) => {
                        if (!page || isNaN(page)) page = 0;
                        else page--;

                        const commands = ctx.bot.getPluginsOfType(Module).map(a => a.commands).flat();
                        const paginator = ctx.bot.getPluginsOfType(Paginator)[0];
                        const languager = await ctx.languager;

                        const lp = Math.floor(commands.length / 10);

                        if (page < 0) page = lp - page;
                        if (page > lp) page = page % lp;

                        const pages = new Array(lp).fill(1).map((_, i) => commands.slice(i * 10, i * 10 + 10))
                            .map(a => {
                                return new MessageEmbed({
                                    title: languager.string("modules.main.help.nosearch.title", {
                                        page: `${page}`,
                                        lp: `${lp}`,
                                    }),
                                    description: languager.string("modules.main.help.nosearch.description", {
                                        page: `${page}`,
                                        lp: `${lp}`,
                                    }),
                                    fields: a.map(a => {
                                        return {
                                            name: a.name,
                                            value: languager.string(`meta.commands.${a.name}.description`),
                                            inline: true,
                                        }
                                    }),
                                });
                            });

                        if (ctx.channel instanceof NewsChannel) return;

                        await paginator.paginate(ctx.channel, pages, ctx.message.author, page);
                    }
                },
                {
                    params: [
                        {
                            type: STRING,
                            name: "module or command",
                            required: true,
                        },
                        {
                            type: UINT,
                            name: "page",
                            required: false,
                        },
                    ],
                    executable: async (ctx, modorcmd : string, page? : number) => {
                        const languager = await ctx.languager;
                        const paginator = ctx.bot.getPluginsOfType(Paginator)[0];
                        const commands = ctx.bot.getPluginsOfType(Module).filter(a => a.commands.find(
                            a => a.name.includes(modorcmd) ||
                                a.aliases.find(b => b.includes(modorcmd))
                        ) || a.name.includes(modorcmd)).map(
                            a => a.name.includes(modorcmd)
                                ? a.commands
                                : a.commands.filter(a =>
                                    a.name.includes(modorcmd) ||
                                    a.aliases.find(a => a.includes(modorcmd))
                                )
                        ).flat();

                        if (commands.length == 0) {
                            ctx.channel.send(languager.string("modules.main.help.search.nothing", {
                                query: modorcmd,
                            }));
                            return;
                        }
                        else if (commands.length == 1) {
                            const a = commands[0];
                            const info = new Array<string>();

                            if (a.category) info.push(
                                `${languager.string(`modules.main.help.cmdinfo.category`)}: **${a.category}**`
                            );
                            if (a.aliases.length > 0) info.push(
                                `${languager.string(`modules.main.help.cmdinfo.aliases`)}: ${a.aliases.map(a => `**${a}**`).join(', ')}`
                            );
                            if (a.subcommands.size > 0) info.push(
                                `${
                                    languager.string(`modules.main.help.cmdinfo.subcommands`)
                                }: ${a.subcommands.keyArray().map((a) => `**${a}**`).join(', ')}`
                            );
                            if (Array.isArray(a.executable)) info.push(
                                `${
                                    languager.string(`modules.main.help.cmdinfo.usage`)
                                }:${a.executable.length == 1 ? ' ' : '\n'}\`\`\`${
                                    a.executable.map(b => `${a.name} ${b.params.map(c => {
                                        const param = (() => {
                                            if (Array.isArray(c)) {
                                                return {
                                                    type: c[0],
                                                    required: c[1],
                                                    name: c[2],
                                                } as { type : Decryptor, required? : boolean, name? : string }
                                            }
                                            else return c;
                                        })();

                                        const insides = `${param.name && param.name.length > 0 ? `${param.name} : ` : ''}${param.type.toString()}`;

                                        return param.required ? `<${insides}>` : `[${insides}]`;
                                    }).join(' ')}`).join('\n')
                                }\`\`\``
                            );
                            info.push(`> ${languager.string(`meta.commands.${a.name}.description`).replace(/\n/g, "\n> ")}`);

                            ctx.channel.send(new MessageEmbed({
                                title: a.name,
                                description: info.join('\n'),
                            }));
                        }
                        else {
                            if (!page || isNaN(page)) page = 0;
                            else page--;

                            const lp = Math.floor(commands.length / 10);

                            if (page < 0) page = lp - page;
                            if (page > lp) page = page % lp;

                            const pages = new Array(lp).fill(1).map((_, i) => commands.slice(i * 10, i * 10 + 10))
                                .map(a => {
                                    return new MessageEmbed({
                                        title: languager.string("modules.main.help.nosearch.title", {
                                            page: `${page}`,
                                            lp: `${lp}`,
                                        }),
                                        description: languager.string("modules.main.help.nosearch.description", {
                                            page: `${page}`,
                                            lp: `${lp}`,
                                        }),
                                        fields: a.map(a => {
                                            return {
                                                name: a.name,
                                                value: languager.string(`meta.commands.${a.name}.description`),
                                                inline: true,
                                            }
                                        }),
                                    });
                                });

                            if (ctx.channel instanceof NewsChannel) return;

                            await paginator.paginate(ctx.channel, pages, ctx.message.author, page);
                        }
                    }
                },
            ]
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

                const languager = await ctx.languager;

                if (!user.bot) { //why?
                    ctx.message.channel.send("this is a selfbot. why?");
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
                            name: languager.string('modules.main.info.owner'),
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
                                    : languager.string('modules.main.info.noowner')
                                ),
                            inline: true,
                        },
                        {
                            name: languager.string('modules.main.info.info'),
                            value: [
                                `${languager.string('modules.main.info.info.host')}: ${platform()} ${release()}`,
                                `Node.js: ${process.version}`,
                                `Discord.js: ${dsversion}`,
                                `OpenJSK: ${ojversion}`,
                            ].join('\n'),
                            inline: true,
                        },
                        ...(() => {
                            const fields = new Array<EmbedFieldData>();

                            if (!app.botPublic) fields.push({
                                name: `🔒 ${languager.string('modules.main.info.info.additional.private.title')}`,
                                value: languager.string('modules.main.info.info.additional.private.description'),
                            });

                            if (app.botRequireCodeGrant) fields.push({
                                name: `📜 ${languager.string('modules.main.info.info.additional.oauthgrant.title')}`,
                                value: languager.string('modules.main.info.info.additional.oauthgrant.description'),
                            });

                            if (app.botPublic) {
                                if (!app.botRequireCodeGrant) {
                                    fields.push({
                                        name: `➕ ${languager.string('modules.main.info.info.additional.public.title')}`,
                                        value: [
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=0&scope=bot](Without permissions)`,
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=8&scope=bot](Admin permissions)`,
                                            `[https://discord.com/api/oauth2/authorize?client_id=${app.id}&permissions=-1&scope=bot](Custom setup)`,
                                        ].join('\n'),
                                    });
                                }
                                else {
                                    fields.push({
                                        name: `➕ ${languager.string('modules.main.info.info.additional.public.title')}`,
                                        value: `**${languager.string('modules.main.info.info.additional.public.oauthgrant')}**`,
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
