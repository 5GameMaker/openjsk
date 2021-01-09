import { Message } from "discord.js";
import { Plugin } from ".";

export abstract class PrefixManager extends Plugin {
    public abstract getPrefix(message : Message) : Promise<string>;
}
