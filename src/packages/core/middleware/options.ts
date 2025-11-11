import { RequestHandler } from "../lib";

/**
 * send 204 for OPTIONS request
 */
export const options: RequestHandler = (req, res, next) => {
  if (req.method !== "OPTIONS") {
    next();
  } else {
    res.sendStatus(204);
  }
};
