export interface Param {
    type : typeof Params,
    optional? : boolean,
    name? : string,
}

export class Params<T> {
    public constructor(data : T) {
        this.data = data;
    }

    public readonly data : T;

    public static Params(...paramType : Param[]) : MethodDecorator {
        return function decorator(_, __, descriptor) {
            if (descriptor.value instanceof Function) {
                descriptor.value.apply(
                    arguments[0],
                    ...Array.from(arguments).slice(1).map((arg, i) => {
                        const param = paramType[i];
        
                        return (new param.type(arg)).data;
                    })
                );
            }
        }
    }
}

