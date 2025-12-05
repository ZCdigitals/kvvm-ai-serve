import { getModelForClass } from "@typegoose/typegoose";
import { FlattenMaps } from "mongoose";
import { InputId, RoleClass } from "../model";

const RoleModel = getModelForClass(RoleClass);

export async function readRole(id: InputId) {
  return await RoleModel.findById(id);
}

let adminRole: FlattenMaps<RoleClass> | undefined = undefined;

export async function useAdminRole(): Promise<FlattenMaps<RoleClass>> {
  if (adminRole) return adminRole;

  const ar = await RoleModel.findOne({ name: "admin" });

  if (!ar) {
    const nar = new RoleModel({
      name: "admin",
      desc: "超级管理员",
    });
    await nar.save();
    console.log("create admin role", nar._id.toString());

    adminRole = nar.toJSON();
  } else {
    adminRole = ar.toJSON();
  }

  return adminRole;
}
