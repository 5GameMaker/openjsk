export * from './Behavour';
export * from './Bot';
export * from './Command';
export * from './Params';
export * from './Plugin';
export * from './Context';
export * from './Module';
export * from './CommandHandler';
export * from './PrefixManager';
import * as defhandle from './plugins/DefaultHandler';
import * as defpm from './plugins/DefaultPrefixManager';
export declare const plugins: {
    DefaultPrefixManager: typeof defpm.DefaultPrefixManager;
    DefaultHandler: typeof defhandle.DefaultHandler;
};
export declare const behaviours: {};
//# sourceMappingURL=index.d.ts.map