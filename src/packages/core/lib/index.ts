export interface BaseRes<T = unknown> {
  code: number;
  msg: string;
  data?: T;
  [key: string]: unknown;
}

export * from "./controller";
export * from "./error";
export * from "./handler";
export * from "./middleware";

