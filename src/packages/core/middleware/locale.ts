import { Locale, parseLocaleQuantifierList } from "../../../utils/locale";
import { BaseQuery, RequestHandler } from "../lib";

export interface LocaleInfo extends Record<string, unknown> {
  locale?: Locale;
  lang?: string;
}

/**
 * use accept-language to set locale
 */
export const useLocale: RequestHandler<never, never, BaseQuery, LocaleInfo> = (
  req,
  res,
  next,
) => {
  const al: string | undefined =
    req.query.lang ?? req.headers["accept-language"];
  if (!al) {
    const l = Locale.defaultLocale;
    res.locals.locale = l;
    res.locals.lang = l.languageCode;
    res.header("Content-Language", l.toString());
  } else {
    const ls = parseLocaleQuantifierList(al);
    const l = ls[0][0];
    res.locals.locale = l;
    res.locals.lang = l.languageCode;
    res.header("Content-Language", l.toString());
  }
  next();
};
