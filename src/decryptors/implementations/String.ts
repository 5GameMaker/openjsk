import { Decryptor, Decryptable, DecryptorResult } from "..";

class StringDecryptor extends Decryptor {
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
                    success: true,
                    value: str,
                }
            }

            start = true;

            if (`\`'"`.includes(char) && (!strch || strch == char)) {
                if (!strch) strch = char;
                else {
                    return {
                        success: true,
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
            success: str.length > 0 || !!strch,
            value: str,
        };
    }

    public toString(): string {
        return 'string';
    }
}

export const STRING = new StringDecryptor();
