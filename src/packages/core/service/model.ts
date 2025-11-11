import { mongo } from "../../../db";

export const modelNameList: string[] = [];

function init() {
  try {
    const list = mongo.modelNames();
    modelNameList.push(...list);
  } catch (err) {
    console.error("model init error", err);
  }
}

export function checkModelExist(modelName: string): boolean {
  return modelNameList.includes(modelName);
}

mongo.on("open", () => {
  setTimeout(init, 3000);
});
