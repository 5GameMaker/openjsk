"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const _1 = require(".");
class CommandHandler extends _1.Plugin {
    constructor() {
        super(...arguments);
        this.botCallback = (message) => this.processCommands(message);
    }
    onLoad() {
        this.parent.on('message', this.botCallback);
    }
    onUnload() {
        this.parent.off('message', this.botCallback);
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map