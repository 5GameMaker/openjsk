import { Bot, Command, CommandPermissionsLevel, version, RAW } from "../..";
import { Module } from "..";
import { MessageAttachment, MessageEmbed, version as dsversion } from 'discord.js';

export class Jishaku extends Module {
    constructor(bot : Bot) {
        super(bot);

        this.name = "jishaku";
        this.tasks = [];

        this.addCommand(new Command({
            name: "jishaku",
            category: "main",
            aliases: ["jsk"],
            permissions: {
                level: CommandPermissionsLevel.BOT_DEVELOPER,
            },
            executable: async (ctx) => {
                const f = (v : number) => Math.round(v / 10000) / 100;
                const u = process.memoryUsage();
                ctx.channel.send(`
OpenJSK v${version}, discord.js \`${dsversion}\`, \`Node.JS ${process.version}\` on \`${process.platform}\`

Using ${f(u.arrayBuffers)}MB on arrayBuffers and ${f(u.heapUsed)}MB on heap

This bot is ${bot.shard ? 'not ' : ''}sharded and can see ${bot.guilds.cache.size} guild(s) and ${bot.users.cache.size} user(s).

Average socket latency: ${ctx.bot.ws.ping}ms
                `);
            },
            subcommands: [
                new Command({
                    name: 'node',
                    aliases: ['js'],
                    executable: [
                        {
                            params: [
                                {
                                    type: RAW,
                                    name: 'script',
                                    required: true,
                                }
                            ],
                            executable: async (ctx, script : string) => {
                                const code = script
                                    .replace(/^```(?:(?:js)|(?:ts))?\n?(.*)\n?```$/su, "$1");

                                try {
                                    const gen = eval(`(async function* interpreter() {${code}})()`) as AsyncGenerator;
                                    while (true) {
                                        const res = await gen.next();

                                        try {
                                            if (res.value instanceof MessageEmbed) {
                                                await ctx.channel.send({ embed: res.value });
                                            }
                                            if (res.value instanceof MessageAttachment) {
                                                await ctx.channel.send({ files: [ res.value ] });
                                            }
                                            await ctx.channel.send(res.value);
                                        } catch (err) {
                                            ctx.channel.send(new MessageEmbed({
                                                title: "Somthing went wrong...",
                                                description: `\`\`\`js\n${err ? err.stack || err : undefined}\n\`\`\``,
                                            })).catch(() => {});
                                        }

                                        if (res.done) return;
                                    }
                                } catch (err) {
                                    ctx.channel.send(new MessageEmbed({
                                        title: "Somthing went wrong...",
                                        description: `\`\`\`js\n${err ? err.stack || err : undefined}\n\`\`\``,
                                    })).catch(() => {});
                                }
                            }
                        }
                    ]
                }),
            ],
        }));
    }

    public tasks : Array<Worker>;
}
