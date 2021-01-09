import { Message } from 'discord.js';
import { CommandHandler } from '../';
export declare class DefaultHandler extends CommandHandler {
    private split;
    private checkPermissions;
    private getCommand;
    protected processCommands(message: Message): Promise<void>;
}
//# sourceMappingURL=DefaultHandler.d.ts.map