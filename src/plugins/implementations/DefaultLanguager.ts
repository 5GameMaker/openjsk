import { Context, Bot } from "../..";
import { Languager, LanguagerInstance, LanguagerSettings, LanguagerTarget } from ".."
import { BIGINT, Model, TEXT } from "sequelize";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Message } from "discord.js";

export class DefaultLanguagerInstance extends LanguagerInstance {
    public string(name: string, data?: { [key: string]: string; }, lang? : string): string {
        const file = this.lfc(lang);
        if (!file) return "No language file";

        const str = file.get(name);
        if (!str) return name;

        return Languager.format(str, data || {});
    }

    private lfc(lang? : string) {
        const paths = [...this.settings.langpath || [], join(process.cwd(), "langs")];
        const result = new Map<string, string>();

        paths.reverse().forEach(p => {
            const path = join(
                p,
                join('/', `${lang || this.settings.lang || this.settings.defaultLanguage || 'en'}.json`),
            );

            if (!existsSync(path)) return null;

            const data = new Map<string, string>(Object.entries(JSON.parse(readFileSync(path, 'utf-8'))));
            data.forEach((v, k) => result.set(k, v));
        });
        
        return result;
    }
}

export class DefaultLanguager extends Languager {
    public getLanguageIn(message: Message): Promise<string> {
        return this.getLanguage({
            user: message.author.id,
            guild: (message.guild || { id : undefined }).id,
        });
    }

    constructor(bot : Bot, settings : LanguagerSettings) {
        super(bot, settings);

        this.UserLanguage.init(
            {
                uid: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: true,
                },
                language: {
                    type: TEXT,
                    defaultValue: 'en',
                }
            },
            {
                sequelize: bot.db,
                modelName: "user-language",
            }
        );
        this.UserLanguage.sync();

        this.GuildLanguage.init(
            {
                gid: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: true,
                },
                language: {
                    type: TEXT,
                    defaultValue: 'en',
                }
            },
            {
                sequelize: bot.db,
                modelName: "guild-language",
            }
        );
        this.GuildLanguage.sync();
    }

    private ulcache = new Map<string, string | null>();
    private glcache = new Map<string, string | null>();

    private UserLanguage = class extends Model {
        public get uid() : string { return this.getDataValue('uid'); }
        public get language() : string | null { return this.getDataValue('language'); }
    }

    private GuildLanguage = class extends Model {
        public get gid() : string { return this.getDataValue('uid'); }
        public get language() : string | null { return this.getDataValue('language'); }
    }

    public async getLanguage(target: Partial<LanguagerTarget>): Promise<string> {
        const uid = target.user;
        const gid = target.guild;

        if (!gid && !uid) return this.settings.defaultLanguage || 'en';

        if (uid) {
            const cached = this.ulcache.get(uid);

            if (cached) return cached;
            if (!this.ulcache.has(uid)) {
                const db = await this.UserLanguage.findOne({
                    where: {
                        uid,
                    }
                });
                if (!db || !db.language) {
                    this.ulcache.set(uid, null);
                }
                else {
                    this.ulcache.set(uid, db.language);
                    return db.language;
                }
            }
        }

        if (!gid) return this.settings.defaultLanguage || 'en';

        {
            const cached = this.glcache.get(gid);

            if (cached) return cached;
            if (this.glcache.has(gid)) {
                const db = await this.GuildLanguage.findOne({
                    where: {
                        gid,
                    }
                });
                if (!db || !db.language) {
                    this.glcache.set(gid, null);
                }
                else {
                    this.glcache.set(gid, db.language);
                    return db.language;
                }
            }
        }

        return this.settings.defaultLanguage || 'en';
    }

    public async setLanguage(target: Partial<LanguagerTarget>, lang: string): Promise<void> {
        if (target.user) {
            this.ulcache.set(target.user, lang);

            const [db] = await this.UserLanguage.findOrCreate({
                where: {
                    uid: target.user,
                }
            });

            db.setDataValue('language', lang);
            await db.save();
        }

        if (target.guild) {
            this.glcache.set(target.guild, lang);

            const [db] = await this.GuildLanguage.findOrCreate({
                where: {
                    gid: target.user,
                }
            });

            db.setDataValue('language', lang);
            await db.save();
        }
    }

    public async instantiate(message: Message): Promise<LanguagerInstance> {
        return new DefaultLanguagerInstance({
            ...this.settings,
            lang : await this.getLanguageIn(message),
        }, message);
    }
}
