import { Message } from 'discord.js';
import { PrefixManager } from '../';
export declare class DefaultPrefixManager extends PrefixManager {
    onLoad(): Promise<void>;
    getPrefix(message: Message): Promise<string>;
}
//# sourceMappingURL=DefaultPrefixManager.d.ts.map