"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPrefixManager = void 0;
const sequelize_1 = require("sequelize");
const __1 = require("../");
class Prefixes extends sequelize_1.Model {
}
;
class DefaultPrefixManager extends __1.PrefixManager {
    async onLoad() {
        if (this.parent.db) {
            Prefixes.init({
                id: {
                    type: sequelize_1.BIGINT,
                    allowNull: false,
                    primaryKey: true,
                },
                prefix: {
                    type: sequelize_1.STRING,
                }
            }, {
                sequelize: this.parent.db,
                tableName: 'prefix',
            });
            await Prefixes.sync();
        }
    }
    async getPrefix(message) {
        const userPrefix = await Prefixes.findOne({
            where: {
                id: message.author.id,
            }
        });
        const guildPrefix = await Prefixes.findOne({
            where: {
                id: (message.guild || { id: '0' }).id,
            }
        });
        if (userPrefix && userPrefix.id)
            return userPrefix.id;
        if (guildPrefix && guildPrefix.id)
            return guildPrefix.id;
        return this.parent.options.prefix || "!";
    }
}
exports.DefaultPrefixManager = DefaultPrefixManager;
//# sourceMappingURL=DefaultPrefixManager.js.map