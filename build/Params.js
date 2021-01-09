"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Params = void 0;
class Params {
    constructor(data) {
        this.data = data;
    }
    static Params(...paramType) {
        return function decorator(_, __, descriptor) {
            if (descriptor.value instanceof Function) {
                descriptor.value.apply(arguments[0], ...Array.from(arguments).slice(1).map((arg, i) => {
                    const param = paramType[i];
                    return (new param.type(arg)).data;
                }));
            }
        };
    }
}
exports.Params = Params;
//# sourceMappingURL=Params.js.map