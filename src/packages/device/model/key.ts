import { index, prop, Ref } from "@typegoose/typegoose";
import { DeviceClass } from ".";
import { BaseModel, model } from "../../core/model";

@model("device-key")
@index({ key: 1, device: 1 })
export class DeviceKeyClass extends BaseModel {
  @prop({ required: true, select: false })
  private key?: string;

  @prop({ required: true, ref: () => DeviceClass, index: true, unique: true })
  public device!: Ref<DeviceClass>;
}
