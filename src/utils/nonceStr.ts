import { randomInt } from "crypto";

const NONCE_DICT = "0123456789";

/**
 * 生成nonce字符串, 默认长度16
 * @param length nonce length
 * @returns nonce string
 */
export function nonceStr(length = 16): string {
  return Array.from(
    { length },
    () => NONCE_DICT[randomInt(0, NONCE_DICT.length)],
  ).join("");
}
