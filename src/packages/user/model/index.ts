import { hash, verify } from "@liuhlightning/bcrypt";
import { pre, prop, Ref } from "@typegoose/typegoose";
import { BaseModel, Gender, model, RoleClass } from "../../core/model";
import { FileClass } from "../../file/model";

export class UserPublicInfo {
  // 昵称
  @prop()
  public nickName?: string;

  // 头像
  @prop({ type: () => FileClass })
  public avatar?: FileClass;

  @prop()
  public desc?: string;

  @prop({ type: FileClass })
  public cover?: FileClass;
}

export class UserPrivateInfo {
  @prop({ default: Gender.Unknown })
  public gender!: Gender;
}

@model("user")
@pre<UserClass>("save", function (next) {
  if (this.isNew || this.isModified("password")) {
    this.password = hash(this.password);
  }
  next();
})
export class UserClass extends BaseModel {
  // 用户名
  @prop({ required: true, index: true, unique: true })
  public username!: string;

  // 电话号码
  @prop({ index: true })
  public phone?: string;

  // 邮箱
  @prop({ index: true })
  public email?: string;

  // 密码
  @prop({ select: false, required: true })
  public password!: string;

  // 角色
  @prop({ ref: () => RoleClass })
  public role?: Ref<RoleClass>;

  /**
   * user private info
   */
  @prop({ type: () => UserPrivateInfo })
  public privateInfo?: UserPrivateInfo;

  /**
   * user public info
   */
  @prop({ type: () => UserPublicInfo })
  public publicInfo?: UserPublicInfo;

  public comparePassword(password: string): boolean {
    return verify(password, this.password);
  }

  public get name() {
    return this.publicInfo?.nickName ?? `User ${this._id.toString().slice(-4)}`;
  }

  public toOAuthData() {
    return {
      id: this.id,
      username: this.username,
      role: this.role?.toString(),
    };
  }
}
