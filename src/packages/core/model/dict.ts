import { pre, prop } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { BaseModel, model } from ".";

/**
 * @openapi
 * components:
 *   schemas:
 *     DictOption:
 *      type: object
 *      properties:
 *        label:
 *          type: string
 *          description: Option label
 *        value:
 *          type: number
 *          description: Option value
 *        order:
 *          type: number
 *          description: Option order
 *      required:
 *        - label
 *        - value
 *     Dict:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: Dictionary name
 *        options:
 *          type: array
 *          description: Dictionary options
 *          items:
 *            $ref: "#/components/schemas/DictOption"
 *      required:
 *        - name
 *        - options
 */
@model("dict")
@pre<DictClass>("save", function (next) {
  this.options.sort((a, b) => a.order - b.order);
  next();
})
export class DictClass extends BaseModel {
  /**
   * 字典名称
   */
  @prop({ required: true, index: true, unique: true })
  public name!: string;

  /**
   * 选项
   */
  @prop({ type: () => [DictOptionClass], default: [] })
  public options!: DictOptionClass[];
}

export class DictOptionClass {
  public _id?: Types.ObjectId;

  /**
   * 标签
   */
  @prop({ required: true })
  public label!: string;

  /**
   * 值
   */
  @prop({ required: true })
  public value!: number;

  /**
   * 排序
   */
  @prop({ default: 0 })
  public order!: number;
}
