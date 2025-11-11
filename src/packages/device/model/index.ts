import { index, prop, Ref } from "@typegoose/typegoose";
import { BaseModel, model } from "../../core/model";
import { UserClass } from "../../user/model";

export enum DeviceStatus {
  Unknown,
  Offline,
  Online,
}

@model("device")
@index({ status: 1, heartbeatAt: 1 })
export class DeviceClass extends BaseModel {
  @prop({ required: true, index: true, ref: () => UserClass })
  public user!: Ref<UserClass>;

  @prop({ required: true })
  public name!: string;

  @prop()
  public desc?: string;

  @prop({ default: DeviceStatus.Unknown, index: true })
  public status!: DeviceStatus;

  @prop({ index: true })
  public heartbeatAt?: Date;
}

export * from "./key";
