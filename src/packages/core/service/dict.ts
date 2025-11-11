import { getModelForClass } from "@typegoose/typegoose";
import { DictClass } from "../model";

const DictModel = getModelForClass(DictClass);

export async function readDict(name: string) {
  return await DictModel.findOne({ name: name });
}

async function initDict() {
  try {
    let d = await DictModel.findOne({ name: "test" });
    d?.toJSON();
    if (!d) {
      d = new DictModel({
        name: "test",
        options: [
          { label: "test", value: 1, order: 0 },
          { label: "test2", value: 2, order: 1 },
        ],
      });
      await d.save();
      console.log("create test dict", d._id.toString());
    } else {
      console.log("test dict exitst", d._id.toString());
    }
  } catch (err) {
    console.error("init dict error", err);
  }
}

setTimeout(() => {
  void initDict();
}, 4000);
