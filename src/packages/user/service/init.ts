import { getModelForClass } from "@typegoose/typegoose";
import { adminRole, initAdminRole } from "../../core/service";
import { UserClass } from "../model";

const UserModel = getModelForClass(UserClass);

export async function initUser() {
  try {
    const uc = await UserModel.countDocuments();
    if (uc > 0) {
      console.log("users exist, skip init");
      return;
    }

    await initAdminRole();

    if (!adminRole) throw new Error("Null admin role");

    // admin user
    let admin = await UserModel.findOne({ username: "admin" });
    if (!admin) {
      admin = new UserModel({
        username: "admin",
        password: "admin12345",
        role: adminRole._id,
        email: "admin@kvvm.ai",
      });
      await admin.save();
      console.log("create admin user", admin._id.toString());
    } else {
      console.log("admin user exists", admin._id.toString());
    }

    // test user
    let test = await UserModel.findOne({ username: "test" });
    if (!test) {
      test = new UserModel({
        username: "test",
        password: "test12345",
        email: "test@kvvm.ai",
      });
      await test.save();
      console.log("create test user", test._id.toString());
    } else {
      console.log("test user exists", test._id.toString());
    }
  } catch (err) {
    console.error("init user error", err);
  }
}
