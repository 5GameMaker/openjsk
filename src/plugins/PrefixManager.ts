import { Message } from "discord.js";
import { Plugin } from ".";

export type PrefixBinding = 'USER' | 'GUILD' | 'ALL';

export abstract class PrefixManager extends Plugin {
    public abstract getPrefixInContext(message : Message) : Promise<string[]>;
    public abstract addPrefix(binding : PrefixBinding, id : string, ...prefix : (string | string[])[]) : Promise<void>;
    public abstract clearPrefix(binding : PrefixBinding, id : string) : Promise<void>;
    public abstract getPrefix(binding : PrefixBinding, id : string) : Promise<string[]>;
}
