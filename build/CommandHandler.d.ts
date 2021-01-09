import { Message } from "discord.js";
import { Plugin } from ".";
export declare abstract class CommandHandler extends Plugin {
    onLoad(): void;
    onUnload(): void;
    private botCallback;
    protected abstract processCommands(message: Message): Promise<void>;
}
//# sourceMappingURL=CommandHandler.d.ts.map