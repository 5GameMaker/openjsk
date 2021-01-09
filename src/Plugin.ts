import { Bot, Behavour } from ".";

export abstract class Plugin {
    constructor(bot : Bot) {
        this.parent = bot;
        this.behavours = [];
    }

    public onLoad() {}
    public onUnload() {}

    public name : string = `plugin-${Math.floor(Math.random() * 10000)}`;
    public parent : Bot;

    public behavours : Behavour[];

    protected addBehavour(behavour : typeof Behavour | Behavour) {
        this.behavours.push(behavour instanceof Behavour ? behavour : new behavour(this));
    }
}
