import { prop } from "@typegoose/typegoose";

export interface FileData {
  name: string;
  size?: number;
  type?: string;
  uid: number;
  url?: string;
}

export class FileClass implements FileData {
  @prop({ required: true })
  public name!: string;

  @prop()
  public size?: number;

  @prop()
  public type?: string;

  @prop({ required: true })
  public uid!: number;

  @prop()
  public url?: string;
}
