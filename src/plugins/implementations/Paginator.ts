import { APIMessageContentResolvable, DMChannel, GuildMember, Message, MessageAdditions, MessageOptions, MessageReaction, Permissions, TextChannel, User, UserResolvable } from 'discord.js';
import { Bot } from '../..';
import { Plugin } from '..';

export interface PaginatorOptions {
    emotes: {
        LEFT: string,
        STOP: string,
        RIGHT: string,
    }
}

export class Paginator extends Plugin {
    public constructor(bot : Bot, options: Partial<PaginatorOptions> = {}) {
        super(bot);

        this.options = {
            emotes: Paginator.EMOTES,
            ...options,
        }
        this.name = "paginator";
    }

    private options : PaginatorOptions;

    public static readonly EMOTES = {
        LEFT: '⬅️',
        STOP: '⏹️',
        RIGHT: '➡️',
    }

    public async paginate(channel : TextChannel | DMChannel, pages : (APIMessageContentResolvable | (
        MessageOptions & { split?: false | undefined }
    ) | MessageAdditions)[], user? : UserResolvable, page? : number, customOptions : Partial<PaginatorOptions> = {}) {
        pages = pages.filter(a => typeof a == 'string' ? a.length > 0 : true);

        const options = {
            ...this.options,
            ...customOptions,
        }

        let _page = page || 0;

        if (pages.length == 0) return;
        if (channel instanceof TextChannel && !(channel.permissionsFor(channel.guild.me as GuildMember) as Permissions).has([
            "ADD_REACTIONS",
            "SEND_MESSAGES",
            "USE_EXTERNAL_EMOJIS",
            'VIEW_CHANNEL',
        ])) return;

        function swp() {
            _page = _page >= 0 ? _page % pages.length : Math.abs(pages.length + _page) % pages.length;

            message.edit(pages[_page] as any || 'Unknown page');
        }

        try {
            var message = await channel.send(pages[0]);
        } catch (err) {
            return;
        }

        if (pages.length < 2) return;

        const collector = message.createReactionCollector((r, u) =>
            (!user || u.id == user || u.id == (user as User).id || u.id == ((user as Message).author || { id: '' }).id) &&
            [...Object.values(Paginator.EMOTES)].includes(r.emoji.name),
            {
                time: 1000 * 60 * 1.5,
                dispose: true,
            }
        );

        collector.once('end', () => {
            message.delete().catch(() => {});
        });

        function handler({emoji: { name }} : MessageReaction) {
            switch (name) {
                case options.emotes.LEFT:
                    _page--;
                    swp();
                    break;
                    
                case options.emotes.RIGHT:
                    _page++;
                    swp();
                    break;

                case options.emotes.STOP:
                    collector.stop("Closed by user");
                    break;
            
                default:
                    break;
            }
        }

        collector.on('collect', handler);
        collector.on('remove', handler);

        try {
            await message.react(options.emotes.LEFT);
            await message.react(options.emotes.STOP);
            await message.react(options.emotes.RIGHT);
        } catch (err) {}
    }
}
