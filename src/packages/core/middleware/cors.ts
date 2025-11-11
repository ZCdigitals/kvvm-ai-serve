import { Forbidden, RequestHandler } from "../lib";

const isDevelopment = process.env.NODE_ENV === "development";
const originList = process.env.ORIGIN?.split(",") ?? [];
console.log("origins", originList);

const cp: RequestHandler = (req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Max-Age", "600");
  next();
};

/**
 * set headers for CORS
 *
 * if you got CORS problem, check here and config
 */
export const cors: RequestHandler = isDevelopment
  ? (req, res, next) => {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      cp(req, res, next);
    }
  : (req, res, next) => {
      if (req.headers.origin && originList.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
      }
      cp(req, res, next);
    };

export const originAuth: RequestHandler = isDevelopment
  ? (req, res, next) => {
      next();
    }
  : (req, res, next) => {
      if (req.headers.origin && originList.includes(req.headers.origin)) {
        next();
      } else {
        throw Forbidden("Orgin not allowed");
      }
    };
