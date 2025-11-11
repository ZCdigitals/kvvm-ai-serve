import { cache } from "../../../db";
import { generateCode } from "../../../utils/code";
import { NotImplemented, TooManyRequests } from "../../core";

const VERIFY_CODE_ENABLE = process.env.VERIFY_CODE_ENABLE === "true";

// expire after 15 min
const EFFECTIVE_TIME = 15 * 60;
const COUNT_DOWN_TIME = 55;

export async function sendVerifyCodeNull() {
  // check
  console.log(`send verify code ${process.env.VERIFY_CODE}`);
}

export async function checkVerifyCodeNull(code: string) {
  return code === process.env.VERIFY_CODE;
}

function buildKey(to: string) {
  return `verify-code-${to}`;
}

function buildCountDownKey(to: string) {
  return `verify-code-count-down-${to}`;
}

/**
 * send random verify code to phone
 * @param phone phone
 * @returns sms response
 */
export async function sendVerifyCodePhone(phone: string) {
  if (!VERIFY_CODE_ENABLE) return await sendVerifyCodeNull();

  const cKey = buildCountDownKey(phone);
  const key = buildKey(phone);

  // check count down
  const c = await cache.get(cKey);
  if (c) throw TooManyRequests("Verify code has been sent, try later.");

  const code = generateCode();
  await cache.set(key, code, { ex: EFFECTIVE_TIME });
  await cache.set(cKey, "1", { ex: COUNT_DOWN_TIME });

  throw NotImplemented();
}

export async function checkVerifyCodePhone(phone: string, code: string) {
  if (!VERIFY_CODE_ENABLE) return await checkVerifyCodeNull(code);

  // set key
  const key = buildKey(phone);
  const cc = await cache.getDel(key);

  throw NotImplemented();
}

/**
 * send random verify code to email
 * @param email email
 * @returns email response
 */
export async function sendVerifyCodeEmail(email: string) {
  if (!VERIFY_CODE_ENABLE) return await sendVerifyCodeNull();

  const cKey = buildCountDownKey(email);
  const key = buildKey(email);

  // check count down
  const c = await cache.get(cKey);
  if (c) throw TooManyRequests("Verify code has been sent, try later.");

  const code = generateCode();
  await cache.set(key, code, { ex: EFFECTIVE_TIME });
  await cache.set(cKey, "1", { ex: COUNT_DOWN_TIME });

  throw NotImplemented();
}

/**
 * check verify code for email
 * @param email email
 * @param code code
 * @returns check result
 */
export async function checkVerifyCodeEmail(
  email: string,
  code: string,
): Promise<boolean> {
  if (!VERIFY_CODE_ENABLE) return await checkVerifyCodeNull(code);

  const key = buildKey(email);
  const cc = await cache.get(key);

  return cc === code;
}
