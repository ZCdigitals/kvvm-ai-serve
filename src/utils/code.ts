import { randomInt } from "crypto";

const CODE_DICT =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * generate code
 * @param length code length
 * @returns code
 */
export function generateCode(length = 6): string {
  return Array.from(
    { length },
    () => CODE_DICT[randomInt(0, CODE_DICT.length)],
  ).join("");
}
