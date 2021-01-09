"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const _1 = require(".");
class Plugin {
    constructor(bot) {
        this.name = `plugin-${Math.floor(Math.random() * 10000)}`;
        this.parent = bot;
        this.behavours = [];
    }
    onLoad() { }
    onUnload() { }
    addBehavour(behavour) {
        this.behavours.push(behavour instanceof _1.Behavour ? behavour : new behavour(this));
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Plugin.js.map