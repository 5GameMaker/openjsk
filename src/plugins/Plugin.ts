import { Bot, Behavour } from "../";

export abstract class Plugin {
    constructor(bot : Bot) {
        this.parent = bot;
        this.behavours = [];
    }

    public onLoad() {
        this.__loaded = true;

        this.behavours.forEach(b => b.load());
    }

    public onUnload() {
        this.__loaded = false;

        this.behavours.forEach(b => b.unload());
    }

    public name : string = `plugin-${Math.floor(Math.random() * 10000)}`;
    public parent : Bot;

    private __loaded : boolean = false;

    public behavours : Behavour[];

    protected addBehavour(behavour : Behavour) {
        this.behavours.push(behavour);
        if (this.__loaded) behavour.load();
        return behavour;
    }
}

