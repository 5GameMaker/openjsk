import { Behavour } from '..';
import { Bot, Context } from "../..";

const cache = new Array<Bot>();

export class TypeBehavour extends Behavour {
    public async load(): Promise<void> {
        if (!cache.includes(this.bot)) {
            cache.push(this.bot);
        }
    }

    public async unload(): Promise<void> {}

    public invoke(commandid : string, ms : number) : MethodDecorator {
        return function(target : any, key : string | symbol, descriptor : PropertyDescriptor) {
            const fn = descriptor.value as ((ctx : Context, ...args : any[]) => Promise<any>);
            descriptor.value = async (ctx : Context, ...args : any[]) => {
                return await fn(ctx, ...args);
            }
            return descriptor;
        }
    }
}
