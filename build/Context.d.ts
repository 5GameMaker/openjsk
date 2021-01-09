import { Message } from "discord.js";
export interface ContextData {
    message: Message;
}
export declare class Context {
    constructor(data: ContextData);
    readonly message: Message;
}
//# sourceMappingURL=Context.d.ts.map