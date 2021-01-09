import { Plugin } from ".";

export class Behavour {
    public constructor(plugin : Plugin) {
        this.plugin = plugin;
    }

    public plugin : Plugin;
}
