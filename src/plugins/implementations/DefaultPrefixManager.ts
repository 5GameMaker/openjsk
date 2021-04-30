import { Guild, Message, TextChannel } from 'discord.js';
import { BIGINT, Model, JSON as tJSON } from 'sequelize';
import { PrefixManager } from '..';
import { BotOptions } from '../..';

export class DefaultPrefixManager extends PrefixManager {
    private Prefixes = class extends Model {};

    public async onLoad() {
        if (this.parent.db) {
            this.Prefixes.init(
                {
                    id: {
                        type: BIGINT,
                        allowNull: false,
                        primaryKey: true,
                    },
                    prefix: {
                        type: tJSON,
                    }
                },
                {
                    sequelize: this.parent.db,
                    modelName: 'prefix',
                }
            );

            await this.Prefixes.sync();
        }
    }

    private __cache = new Map<string, string>();

    public async getPrefix(binding : string, user : string) : Promise<string> {
        if (typeof this.__cache.get(`${binding}-${user}`) == 'string')
            return this.__cache.get(`${binding}-${user}`) || '';

        function getp(r : any) : any | null {
            if (!r) return null;

            return r.prefix || null;
        }

        const prefixObject = getp(await this.Prefixes.findOne({
            where: {
                id: user,
            }
        })) || {};

        const prefix = prefixObject[binding] || (this.parent.options as BotOptions).prefix || "!";

        for (const binding in prefixObject) this.__cache.set(`${binding}-${user}`, prefixObject[binding]);

        this.__cache.set(`${binding}-${user}`, prefix);

        return prefix;
    }

    public async setPrefix(binding : string, user : string, prefix : string) : Promise<void> {
        function getp(r : any) : any | null {
            if (!r) return null;

            return r.prefix || null;
        }

        const _prefix = getp(await this.Prefixes.findOne({
            where: {
                id: user,
            }
        }));

        await this.Prefixes.update({
            _prefix,
        }, {
            where: {
                user,
            }
        });

        this.__cache.set(`${binding}-${user}`, prefix);
    }

    public getPrefixInContext(message: Message): Promise<string> {
        return this.getPrefix(
            message.channel instanceof TextChannel ? `GUILD-${(message.guild as Guild).id}` : "USER",
            message.author.id,
        );
    }
}
