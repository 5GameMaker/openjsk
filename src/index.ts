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

export const plugins = {
    ...defhandle,
    ...defpm,
};

export const behaviours = {
};
