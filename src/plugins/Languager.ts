import { Bot, Context } from "..";
import { Plugin } from ".";
import { Message } from "discord.js";

export interface LanguagerSettings {
    defaultLanguage: string,
    langpath: string[],
}

export interface LanguagerTarget {
    user: string,
    guild: string,
}

export interface LanguagerInstanceSettings {
    lang: string,
}

export abstract class LanguagerInstance {
    public constructor(public settings : Partial<LanguagerSettings & LanguagerInstanceSettings>, public message : Message) {}

    public abstract string(name : string, data? : { [key : string] : string }, lang? : string) : string;
}

export abstract class Languager extends Plugin {
    public constructor(bot : Bot, public settings : LanguagerSettings) { super(bot); }

    public abstract getLanguageIn(message : Message) : Promise<string>;
    public abstract getLanguage(target : Partial<LanguagerTarget>) : Promise<string>;
    public abstract setLanguage(target : Partial<LanguagerTarget>, lang : string) : Promise<void>;

    public abstract instantiate(message : Message) : Promise<LanguagerInstance>;
    public static format(text : string, data : { [key : string] : string }) {
        Object.entries(data).forEach(([key, value]) => text = text.replace(
                new RegExp(
                    `%${key.replace(/[\-\[\](){}.+?*\/]/g, a => `\\${a}`)}%`,
                    'gum'
                ),
                value
            )
        );

        return text;
    }
}
