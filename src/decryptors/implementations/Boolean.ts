import { Decryptor, Decryptable, DecryptorResult } from "..";

class BooleanDecryptor extends Decryptor {
    public async decrypt(text: Decryptable): Promise<DecryptorResult> {
        let str = "";
        let start = false;

        while (!text.end) {
            const char = text.get();

            if ("\n\t ".includes(char)) {
                if (!start) {
                    text.shift();
                    continue;
                }
                return {
                    success: ["yes", "no", "true", "false", "1", "0"].includes(str),
                    value: ["yes", "true", "1"].includes(str),
                };
            }
            else if (!char.match(/[a-zA-Z]/)) {
                return {
                    success: false,
                    value: null,
                }
            }

            start = true;

            str += char;
            text.shift();
        }

        return {
            success: ["yes", "no", "true", "false", "1", "0"].includes(str),
            value: ["yes", "true", "1"].includes(str),
        };
    }

    public toString(): string {
        return "bool";
    }
}

export const BOOL = new BooleanDecryptor();
