import { Bot, CommandExecutable, Context } from "..";

export interface DecryptorResult {
    value : any;
    success : boolean;
};

export abstract class Decryptor {
    constructor(bot : Bot) {
        this.bot = bot;
    }

    public abstract decrypt(text : string) : DecryptorResult;

    private bot : Bot;
};

export class Declaration {
    constructor(executable : CommandExecutable, decryptors : Decryptor[] = [], optionalDecryptors : Decryptor[] = []) {
        this.decryptors = decryptors;
        this.optionalDecryptors = optionalDecryptors;
        this.executable = executable;
    }

    private decryptors;
    private optionalDecryptors;
    private executable;

    public async checkAndExecute(ctx : Context, ...args : string[]) : Promise<boolean> {
        if (
            args.length < this.decryptors.length ||
            args.length > (
                this.decryptors.length &&
                this.optionalDecryptors.length
            )
            ) return false;

        const results = await Promise.all(
            args.map(
                (a, i) => i < this.decryptors.length
                ? this.decryptors[i].decrypt(a)
                : this.optionalDecryptors[this.decryptors.length - i].decrypt(a)
            )
        );

        if (!results.every(a => a.success)) return false;

        await this.executable(ctx, ...[results.map(a => a.value)]);

        return true;
    }
}

export class ParamList {
    constructor(declarations : Declaration[]) {
        this.declarations = declarations;
    }

    private declarations;
}

