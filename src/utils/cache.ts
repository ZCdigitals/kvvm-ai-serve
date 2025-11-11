export interface CacheItem {
  value: string;
  timer?: NodeJS.Timeout;
}

export interface BaseOptions {
  /**
   * expire time in seconds
   */
  ex?: number;
  EX?: number;
}

/**
 * cache
 */
export class Cache {
  /**
   * cache items
   */
  public items: Map<string, CacheItem> = new Map();

  /**
   * set
   * @param key key
   * @param value value
   * @param options option
   */
  public async set(
    key: string,
    value: string,
    options: BaseOptions = {},
  ): Promise<void> {
    const ex = options.ex ?? options.EX;
    if (ex) {
      const timer = setTimeout(() => {
        this.items.delete(key);
      }, ex * 1000);
      this.items.set(key, { value, timer });
    } else {
      this.items.set(key, { value });
    }
  }

  /**
   * get
   * @param key key
   * @returns value
   */
  public async get(key: string): Promise<string | undefined> {
    return this.items.get(key)?.value;
  }

  /**
   * delete
   * @param key key
   */
  public async del(key: string): Promise<void> {
    const t = this.items.get(key)?.timer;
    if (t) clearTimeout(t);
    this.items.delete(key);
  }

  public async getDel(key: string): Promise<string | undefined> {
    const value = this.items.get(key)?.value;
    this.del(key);
    return value;
  }
}
