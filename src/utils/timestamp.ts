export enum TimeStampUnit {
  Second,
  Millisecond,
}

/**
 * 生成当前时间戳
 */
export function timestamp(unit: TimeStampUnit = TimeStampUnit.Second): string {
  switch (unit) {
    case TimeStampUnit.Second:
      return Math.round(Date.now() / 1000.0).toFixed(0);
    case TimeStampUnit.Millisecond:
      return Date.now().toString();
  }
}
