import { Message } from "discord.js";
import { Plugin } from ".";

export abstract class CommandHandler extends Plugin {
    onLoad() {
        this.parent.on('message', this.botCallback);
    }

    onUnload() {
        this.parent.off('message', this.botCallback);
    }

    private botCallback = (message : Message) => this.processCommands(message);
    
    protected abstract processCommands(message : Message) : Promise<void>;
}
