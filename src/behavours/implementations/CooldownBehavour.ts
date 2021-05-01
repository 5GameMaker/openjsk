import { BIGINT, Model, Sequelize, TEXT } from "sequelize";
import { Behavour } from '..';
import { Bot, Context } from "../..";

const cache = new Array<Bot>();

export class CooldownBehavour extends Behavour {
    private CooldownHandler = class extends Model {
        public static async decl(sequelize : Sequelize) {
            this.init(
                {
                    uid: {
                        type: BIGINT,
                        allowNull: false,
                    },
                    commandid: {
                        type: TEXT,
                        allowNull: false,
                    },
                    expires: {
                        type: BIGINT,
                        allowNull: false,
                    },
                },
                {
                    modelName: "CommandsCooldown",
                    sequelize,
                },
            );
            await this.sync();
        }
    }

    public async load(): Promise<void> {
        if (!cache.includes(this.bot)) {
            cache.push(this.bot);
            this.CooldownHandler.decl(this.bot.db as Sequelize);
        }
    }

    public async unload(): Promise<void> {}

    public invoke(commandid : string, ms : number) : MethodDecorator {
        const self = this;

        return function(target : any, key : string | symbol, descriptor : PropertyDescriptor) {
            const fn = descriptor.value as ((ctx : Context, ...args : any[]) => Promise<any>);
            descriptor.value = async (ctx : Context, ...args : any[]) => {
                const cooldown = await self.CooldownHandler.findOne({
                    where: {
                        uid: ctx.message.author.id,
                        commandid,
                    }
                });
                if (cooldown && cooldown.getDataValue('expires') > Date.now()) {
                    ctx.message.channel.send(`:x: ${Math.ceil((Date.now() - cooldown.getDataValue('expires')) / 1000)} seconds left`);
                    return;
                }
                if (cooldown) {
                    cooldown.set('expires', Date.now() + ms);
                    await cooldown.save();
                }
                else {
                    await self.CooldownHandler.create({
                        uid: ctx.message.author.id,
                        commandid,
                        expires: Date.now() + ms,
                    });
                }
                return await fn(ctx, ...args);
            }
            return descriptor;
        }
    }
}
