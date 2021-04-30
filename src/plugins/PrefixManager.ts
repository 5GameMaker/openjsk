import { Message } from "discord.js";
import { Plugin } from ".";

export abstract class PrefixManager extends Plugin {
    public abstract getPrefixInContext(message : Message) : Promise<string>;
    public abstract setPrefix(binding : string, user : string, prefix : string) : Promise<void>;
    public abstract getPrefix(binding : string, user : string) : Promise<string | null>;
}
