import { Bot, Context } from "..";
import { Plugin } from ".";

export interface LanguagerSettings {
    defaultLanguage: string,
    langpath: string,
}

export interface LanguagerTarget {
    user: string,
    guild: string,
}

export interface LanguagerInstanceSettings {
    lang: string,
}

export abstract class LanguagerInstance {
    public constructor(public settings : Partial<LanguagerSettings & LanguagerInstanceSettings>, public context : Context) {}

    public abstract string(name : string, data? : { [key : string] : string }, lang? : string) : string;
}

export abstract class Languager extends Plugin {
    public constructor(bot : Bot, public settings : LanguagerSettings) { super(bot); }

    public abstract getLanguageIn(context : Context) : Promise<string>;
    public abstract getLanguage(target : LanguagerTarget) : Promise<string>;
    public abstract setLanguage(target : LanguagerTarget, lang : string) : Promise<void>;

    public abstract instantiate(context : Context) : Promise<LanguagerInstance>;
    public static format(text : string, data : { [key : string] : string }) {
        Object.entries(data).forEach(([key, value]) => text = text.replace(
                new RegExp(
                    `:${key.replace(/[\-\[\](){}.+?*\/]/g, a => `\\${a}`)}:`,
                    'gum'
                ),
                value
            )
        );

        return text;
    }
}
