import { modelOptions } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { IModelOptions } from "@typegoose/typegoose/lib/types";
import { Types } from "mongoose";
import { mongo } from "../../../db";

export function model(name: string, options?: IModelOptions): ClassDecorator {
  return modelOptions({
    ...options,
    schemaOptions: {
      ...options?.schemaOptions,
      collection: name,
      versionKey: "__v",
      // auto create indexes
      autoIndex: process.env.NODE_ENV !== "production",
      timestamps: true,
    },
    existingConnection: mongo,
    options: {
      ...options?.options,
      customName: name,
    },
  });
}

export abstract class BaseModel extends TimeStamps implements Base {
  public _id!: Types.ObjectId;
  public id!: string;
}

export type InputId = Types.ObjectId | string;

export * from "./dict";
export * from "./gender";
export * from "./role";
