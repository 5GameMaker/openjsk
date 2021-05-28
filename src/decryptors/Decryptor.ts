import { Context } from "..";

export interface DecryptorResult {
    value : any;
    success : boolean;
};

export abstract class Decryptor {
    public abstract decrypt(text : Decryptable) : Promise<DecryptorResult>;
    public abstract toString() : string;
};

export interface Declaration {
    params: ({
        type: Decryptor;
        required?: boolean;
        name?: string;
    } | [Decryptor, string?, boolean?])[];
    executable: (ctx : Context, ...args : any[]) => Promise<any>;
};

export class Decryptable {
    private constructor(public text : string) {}

    public get() {
        return this.text[0] || '';
    }

    public get end() {
        return this.text.length == 0;
    }

    public shift() {
        this.text = this.text.substr(1);
    }

    public static normalizeParam(param : {
        type: Decryptor;
        required?: boolean;
        name?: string;
    } | [Decryptor, string?, boolean?]) {
        if (Array.isArray(param)) {
            return {
                type: param[0],
                name: param[1],
                required: param[2],
            } as { type: Decryptor, name?: string, required?: boolean }
        }
        else return param;
    }

    public static async decrypt(rawargs : string, declaration : Declaration) : Promise<{ result: DecryptorResult[], declaration: Declaration } | false> {
        const decr = new this(rawargs);
        const res = [];

        for (const param of declaration.params) {
            const prm = Decryptable.normalizeParam(param);

            // const text = decr.text;

            const decrr = await prm.type.decrypt(decr);
            
            if (!decrr.success && prm.required) {
                // if (!prm.required) {
                //     decr.text = text;
                // }
                // else
                return false;
            }

            res.push(decrr);
        }

        return {
            result: res,
            declaration,
        };
    }
};
