import { Bot, Behavour } from ".";
export declare abstract class Plugin {
    constructor(bot: Bot);
    onLoad(): void;
    onUnload(): void;
    name: string;
    parent: Bot;
    behavours: Behavour[];
    protected addBehavour(behavour: typeof Behavour | Behavour): void;
}
//# sourceMappingURL=Plugin.d.ts.map