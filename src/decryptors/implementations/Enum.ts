import { Decryptor, Decryptable, DecryptorResult } from "..";

class EnumDecryptor extends Decryptor {
    public constructor(private keys : string[]) {
        super();
    }

    public async decrypt(text: Decryptable): Promise<DecryptorResult> {
        let str = "";
        let strch : string | null = null;
        let start = false;

        while (!text.end) {
            const char = text.get();

            if ("\n\t ".includes(char) && !strch) {
                if (!start) {
                    text.shift();
                    continue;
                }
                return {
                    success: this.keys.includes(str),
                    value: str,
                }
            }

            start = true;

            if (`\`'"`.includes(char) && (!strch || strch == char)) {
                if (!strch) strch = char;
                else {
                    return {
                        success: this.keys.includes(str),
                        value: str,
                    }
                }
                text.shift();
                continue;
            }

            str += char;
            text.shift();
        }

        return {
            success: this.keys.includes(str),
            value: str,
        };
    }

    public toString(): string {
        return `${this.keys.join(' | ')}`;
    }
}

export const ENUM = (...keys : (string | string[])[]) => new EnumDecryptor(keys.flat());
