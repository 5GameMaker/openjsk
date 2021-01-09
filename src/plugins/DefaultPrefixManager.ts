import { Message } from 'discord.js';
import { BIGINT, STRING, Model } from 'sequelize';
import { PrefixManager, BotOptions } from '../';

class Prefixes extends Model {};

export class DefaultPrefixManager extends PrefixManager {
    public async onLoad() {
        if (this.parent.db) {
            Prefixes.init(
                {
                    id: {
                        type: BIGINT,
                        allowNull: false,
                        primaryKey: true,
                    },
                    prefix: {
                        type: STRING,
                    }
                },
                {
                    sequelize: this.parent.db,
                    tableName: 'prefix',
                }
            );

            await Prefixes.sync();
        }
    }

    public async getPrefix(message: Message): Promise<string> {
        const userPrefix = await Prefixes.findOne({
            where: {
                id: message.author.id,
            }
        });
        const guildPrefix = await Prefixes.findOne({
            where: {
                id: (message.guild || {id: '0'}).id,
            }
        });

        if (userPrefix && (userPrefix as any).id) return (userPrefix as any).id as string;
        if (guildPrefix && (guildPrefix as any).id) return (guildPrefix as any).id as string;

        return (this.parent.options as BotOptions).prefix || "!";
    }
}
