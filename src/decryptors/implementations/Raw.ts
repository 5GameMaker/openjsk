import { Decryptor, Decryptable, DecryptorResult } from "..";

class RawDecryptor extends Decryptor {
    public async decrypt(text: Decryptable): Promise<DecryptorResult> {
        let str = "";
        let start = false;

        while (!text.end) {
            const char = text.get();

            if ("\n\t ".includes(char) && !start) {
                text.shift();
                continue;
            }
            start = true;

            str += char;
            text.shift();
        }

        return {
            success: str.length > 0,
            value: str,
        };
    }

    public toString(): string {
        return 'raw';
    }

}

export const RAW = new RawDecryptor();
