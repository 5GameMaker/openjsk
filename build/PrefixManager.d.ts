import { Message } from "discord.js";
import { Plugin } from ".";
export declare abstract class PrefixManager extends Plugin {
    abstract getPrefix(message: Message): Promise<string>;
}
//# sourceMappingURL=PrefixManager.d.ts.map