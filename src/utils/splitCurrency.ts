export interface SplitCurrencyParam {
  splitNum?: number;
  splitRateList?: number[];
}

/**
 * split currency
 * @param amount amount
 * @param param split param
 * @returns split result
 */
export function splitCurrency(
  amount: number,
  param: SplitCurrencyParam,
): number[] {
  const { splitNum, splitRateList } = param;
  const amountWithoutDecimal = Math.floor(amount);
  if (amountWithoutDecimal !== amount) {
    console.warn("splitCurrency: amount is not integer.");
  }
  if (splitNum) {
    const amount1 = Math.floor(amountWithoutDecimal / splitNum);
    const amount2 = Math.round(amountWithoutDecimal - amount1 * (splitNum - 1));
    return Array(splitNum - 1)
      .fill(amount1)
      .concat(amount2);
  } else if (splitRateList && splitRateList.length > 0) {
    const totalRate = splitRateList.reduce((a, b) => a + b, 0.0);
    const list = Array(splitRateList.length - 1);
    for (let i = 0; i < splitRateList.length; i += 1) {
      if (i !== splitRateList.length - 1) {
        list[i] = Math.floor(
          (amountWithoutDecimal * splitRateList[i]) / totalRate,
        );
      } else {
        list.push(
          Math.round(amountWithoutDecimal - list.reduce((a, b) => a + b, 0.0)),
        );
      }
    }
    return list;
  }
  return [amountWithoutDecimal];
}
