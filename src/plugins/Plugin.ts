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

    protected addBehavour<T extends typeof Behavour>(behavour : T | Behavour) {
        if (behavour == Behavour) throw new Error("Cannot create instance of abstract class");
        const obj = behavour instanceof Behavour ? behavour : new (behavour as any)(this.parent) as Behavour;
        this.behavours.push(obj);
        if (this.__loaded) obj.load();
        return obj;
    }
}

