import { getModelForClass } from "@typegoose/typegoose";
import { FlattenMaps } from "mongoose";
import { InputId, RoleClass } from "../model";

const RoleModel = getModelForClass(RoleClass);

export async function readRole(id: InputId) {
  return await RoleModel.findById(id);
}

export async function readAdminRole() {
  return await RoleModel.findOne({ name: "admin" });
}

export let adminRole: FlattenMaps<RoleClass> | undefined = undefined;

export async function initAdminRole() {
  try {
    let ar = await readAdminRole();

    if (!ar) {
      ar = new RoleModel({
        name: "admin",
        desc: "超级管理员",
      });

      await ar.save();
      console.log("create admin role", ar._id.toString());

      adminRole = ar.toJSON();
    } else {
      console.log("admin role exists", ar._id.toString());

      adminRole = ar.toJSON();
    }
  } catch (err) {
    console.error("init admin role error", err);
  }
}
