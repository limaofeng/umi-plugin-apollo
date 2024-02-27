import { readFileSync } from "fs";

import type { IApi } from "umi";

import type { IBag } from "../index";

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const writeTmpFilePath = "runtime.ts";
    const templatePath = bag.joinApolloTemplatePath("runtime.ts");
    const template = readFileSync(templatePath, "utf-8");
    api.writeTmpFile({
      path: writeTmpFilePath,
      content: template,
    });
  });
