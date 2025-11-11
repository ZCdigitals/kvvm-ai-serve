import { RequestHandler } from "../lib";

export const cookie: RequestHandler = (req, res, next) => {
  const c = req.headers.cookie;
  if (!c) {
    next();
    return;
  }

  const cs = c.split(";");

  const cd: Record<string, string> = {};

  for (const c of cs) {
    const [k, v] = c.split("=", 2);
    cd[k.trim()] = v.trim();
  }

  req.cookies = cd;

  next();
};
