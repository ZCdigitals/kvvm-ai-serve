import { Ref, pre, prop } from "@typegoose/typegoose";
import { BaseModel, model } from ".";
import { InternalServerError } from "../lib";

/**
 * @openapi
 * components:
 *  schemas:
 *    Role:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: Role name
 *        desc:
 *          type: string
 *        menu:
 *          type: array
 *          items:
 *            type: string
 *            description: Menu permissions
 *        parent:
 *          type: string
 *          description: Parent role ID
 *      required:
 *        - name
 *        - menu
 *        - parent
 */
@model("role")
@pre<RoleClass>("save", function (next) {
  if (this.name !== "admin" && !this.parent) {
    throw InternalServerError("Must input parent");
  }
  next();
})
export class RoleClass extends BaseModel {
  // 名字
  @prop({ required: true, index: true, unique: true })
  public name!: string;

  // 描述
  @prop()
  public desc?: string;

  // 菜单权限
  @prop({ type: () => [String], default: [] })
  public menu!: string[];

  @prop({ ref: () => RoleClass })
  public parent?: Ref<RoleClass>;
}
