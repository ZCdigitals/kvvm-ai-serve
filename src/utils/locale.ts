export class Locale {
  public readonly languageCode: string;
  public readonly scriptCode?: string;
  public readonly countryCode?: string;

  constructor(languageCode: string, scriptCode?: string, countryCode?: string) {
    this.languageCode = languageCode;
    this.scriptCode = scriptCode;
    this.countryCode = countryCode;
  }

  /**
   * @example Locale.fromString("zh-Hans-CN")
   * @example Locale.fromString("en-US")
   * @param locale language tag
   * @returns locale object
   */
  static fromString(locale: string): Locale {
    const ls = locale.trim();

    if (ls === "*") return Locale.defaultLocale;

    const ss = ls.split("-");
    switch (ss.length) {
      case 0:
        console.warn("empty locale");
        return Locale.defaultLocale;
      case 1:
        // only language code
        return new Locale(ss[0]);
      case 2:
        // language and country code
        return new Locale(ss[0], ss[1]);
      case 3:
        // language, script and country code
        return new Locale(ss[0], ss[1], ss[2]);
      default:
        console.warn("unknown locale format: " + locale);
        return new Locale(ss[0]);
    }
  }

  public toString(): string {
    const ls = [this.languageCode];
    if (this.scriptCode) ls.push(this.scriptCode);
    if (this.countryCode) ls.push(this.countryCode);
    return ls.join("-");
  }

  // default locale is [en]
  static defaultLocale = new Locale("en");
}

/**
 * Parse locale quantifier
 * @example parseLocaleQuantifier("fr;q=0.9")
 * @param quantifier locale quantifier
 * @returns [locale, count]
 */
export function parseLocaleQuantifier(quantifier: string): [Locale, number] {
  const qs = quantifier.split(";q=");
  switch (qs.length) {
    case 0:
      return [Locale.defaultLocale, 1];
    case 1:
      return [Locale.fromString(qs[0]), 1];
    case 2:
      return [Locale.fromString(qs[0]), parseFloat(qs[1])];
    default:
      console.warn("unknown locale quantifier format: " + quantifier);
      return [Locale.fromString(qs[0]), 1];
  }
}

/**
 * Parse locale quantifier list
 * @example parseLocaleQuantifierList("fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5")
 * @param quantifierList locale quantifier list
 * @returns [locale, count][]
 */
export function parseLocaleQuantifierList(
  quantifierList: string,
): [Locale, number][] {
  return quantifierList
    .split(",")
    .map(parseLocaleQuantifier)
    .sort((a, b) => b[1] - a[1]);
}
