"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.behaviours = exports.plugins = void 0;
__exportStar(require("./Behavour"), exports);
__exportStar(require("./Bot"), exports);
__exportStar(require("./Command"), exports);
__exportStar(require("./Params"), exports);
__exportStar(require("./Plugin"), exports);
__exportStar(require("./Context"), exports);
__exportStar(require("./Module"), exports);
__exportStar(require("./CommandHandler"), exports);
__exportStar(require("./PrefixManager"), exports);
const defhandle = __importStar(require("./plugins/DefaultHandler"));
const defpm = __importStar(require("./plugins/DefaultPrefixManager"));
exports.plugins = {
    ...defhandle,
    ...defpm,
};
exports.behaviours = {};
//# sourceMappingURL=index.js.map