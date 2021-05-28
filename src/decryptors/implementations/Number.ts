import { Decryptor, Decryptable, DecryptorResult } from "..";

class NumberDecryptor extends Decryptor {
    public constructor(private options : Partial<NumberDecryptorOptions>) { super(); }

    public async decrypt(text: Decryptable): Promise<DecryptorResult> {
        let str = "";
        let start = false;

        const regexp = new RegExp(`[0-9${this.options.integer ? '' : ',.'}${this.options.unsigned ? '' : '\\-'}]`, 'gum');

        while (!text.end) {
            const char = text.get();

            if ("\n\t ".includes(char)) {
                if (!start) {
                    text.shift();
                    continue;
                }
                return {
                    success: true,
                    value: Number.parseFloat(str.replace(",", ".")),
                }
            }
            else if (!char.match(regexp)) {
                return {
                    success: false,
                    value: NaN,
                }
            }

            if (",.".includes(char) && str.match(/[,.]/g)) {
                return {
                    success: false,
                    value: NaN,
                }
            }

            start = true;

            str += char;
            text.shift();
        }

        return {
            success: str.length > 0,
            value: str.length > 0 ? Number.parseFloat(str.replace(",", ".")) : NaN,
        };
    }

    public toString(): string {
        return [
            'float',  // 00
            'ufloat', // 01
            'int',    // 10
            'uint',   // 11
        ][(this.options.integer as any || 0) * 2 + (this.options.unsigned as any || 0)];
    }
}

export interface NumberDecryptorOptions {
    ubound: number;
    bbound: number;

    unsigned: boolean;
    integer: boolean;
}

export const NUMBER = (options : NumberDecryptorOptions) => new NumberDecryptor(options);

export const INT = new NumberDecryptor({
    integer: true,
});

export const FLOAT = new NumberDecryptor({});

export const UINT = new NumberDecryptor({
    integer: true,
    unsigned: true,
});

export const UFLOAT = new NumberDecryptor({
    unsigned: true,
});
