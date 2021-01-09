export interface Param {
    type: typeof Params;
    optional?: boolean;
    name?: string;
}
export declare class Params<T> {
    constructor(data: T);
    readonly data: T;
    static Params(...paramType: Param[]): MethodDecorator;
}
//# sourceMappingURL=Params.d.ts.map