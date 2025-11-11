export interface UserInfo extends Record<string, unknown> {
  uid?: string;
  username?: string;
  role?: string;
  scope?: string[];
}

export * from "./cookie";
export * from "./cors";
export * from "./locale";
export * from "./model";
export * from "./options";
export * from "./role";
