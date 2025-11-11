import { Model } from "mongoose";
import { mongo } from "../../../db";
import { buildMiddleware, InternalServerError } from "../lib";

export interface LocalModel<T = unknown> extends Record<string, unknown> {
  modelName: string;
  model: Model<T>;
}

/**
 * get model from req.params.model
 */
export const useModel = buildMiddleware((req, res, next) => {
  const modelName = req.params.model;
  if (!modelName) throw InternalServerError("null model name");
  res.locals.modelName = modelName;
  res.locals.model = mongo.model<unknown>(modelName);
  next();
});
