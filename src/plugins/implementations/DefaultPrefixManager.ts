import { Guild, Message, TextChannel } from 'discord.js';
import { BIGINT, Model, TEXT } from 'sequelize';
import { PrefixManager, PrefixBinding } from '..';
import { BotOptions } from '../..';

export class DefaultPrefixManager extends PrefixManager {
    private UserPrefix = class extends Model {
        public get prefix() : string[] {
            return this.getDataValue('prefix');
        }
    };
    private GuildPrefix = class extends Model {};

    public async onLoad() {
        if (this.parent.db) {
            this.UserPrefix.init(
                {
                    id: {
                        type: BIGINT,
                        allowNull: false,
                        primaryKey: true,
                    },
                    prefix: {
                        type: TEXT,
                        allowNull: false,
                        primaryKey: true,
                    }
                },
                {
                    sequelize: this.parent.db,
                    modelName: 'UserPrefix',
                }
            );

            await this.UserPrefix.sync();

            this.GuildPrefix.init(
                {
                    id: {
                        type: BIGINT,
                        allowNull: false,
                        primaryKey: true,
                    },
                    prefix: {
                        type: TEXT,
                        allowNull: false,
                        primaryKey: true,
                    }
                },
                {
                    sequelize: this.parent.db,
                    modelName: 'GuildPrefix',
                }
            );

            await this.GuildPrefix.sync();
        }
    }

    private __cache = new Map<string, string[]>();

    private cache(binding : PrefixBinding, id : string, ...prefix : (string | string[])[]) : string[] | null {
        const key = `${binding}-${id}`;

        if (prefix.length > 0) {
            const value = prefix.flat();

            this.__cache.set(key, value);
        }

        return this.__cache.get(key) || null;
    }

    public async getPrefix(binding : PrefixBinding, id : string) : Promise<string[]> {
        if (this.cache(binding, id)) return this.cache(binding, id) || [];
        if (binding == 'ALL') {
            const a = this.cache('USER', id) || this.cache('GUILD', id);
            if (a) return a;
        }

        function getp(r : any[]) : string[] | null {
            if (!r) return null;

            return (a => a.length == 0 ? null : a)(r.map(a => a.prefix as string) || []);
        }

        const uprefix = binding == 'ALL' || binding == 'USER'
            ? getp(await this.UserPrefix.findAll({
                where: {
                    id,
                }
            }))
            : null;

        const gprefix = binding == 'ALL' || binding == 'GUILD'
            ? getp(await this.GuildPrefix.findAll({
                where: {
                    id,
                }
            }))
            : null;

        const prefix = uprefix || gprefix || [];

        if (binding == 'USER') {
            this.cache('USER', id, uprefix || []);
        }
        if (binding == 'GUILD') {
            this.cache('GUILD', id, gprefix || []);
        }

        return prefix;
    }

    public async addPrefix(binding : PrefixBinding, id : string, ...prefix : (string | string[])[]) : Promise<void> {
        if (binding == 'ALL') return;

        function getp(r : any[]) : string[] | null {
            if (!r) return null;

            return (a => a.length == 0 ? null : a)(r.map(a => a.prefix as string) || []);
        }

        const gb = () => {
            if (binding == 'GUILD') return this.GuildPrefix;
            else return this.UserPrefix;
        }

        const _prefix = (getp(await gb().findAll({
            where: {
                id,
            }
        })) || []).concat(prefix.flat());

        await Promise.all(prefix.flat().map(prefix => gb().findOrCreate({
            where: {
                prefix,
                id,
            }
        })));

        this.cache(binding, id, _prefix);
    }

    public async clearPrefix(binding : PrefixBinding, id : string) : Promise<void> {
        if (binding == 'ALL') return;

        const gb = () => {
            if (binding == 'GUILD') return this.GuildPrefix;
            else return this.UserPrefix;
        }

        Promise.all((await gb().findAll({
            where: {
                id,
            }
        })).map(a => a.destroy()));

        this.cache(binding, id, []);
    }

    public async getPrefixInContext(message: Message): Promise<string[]> {
        const id = `${(message.guild || { id: 'DM' }).id}-${message.author.id}`;

        const prefix = await this.getPrefix(
            'USER',
            message.author.id,
        );

        if (prefix.length > 0) {
            return prefix;
        }

        if (message.guild) {
            const prefix = await this.getPrefix(
                'GUILD',
                message.guild.id,
            );

            if (prefix.length > 0) return prefix;
        }

        return (a => typeof a == 'string' ? [a] : a)((this.parent.options as BotOptions).prefix || "!");
    }
}
