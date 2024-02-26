import { readFileSync } from "fs";

import type { IApi } from "umi";

import { IBag } from "..";

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const writeTmpFilePath = "apollo/runtime.ts";
    const templatePath = bag.joinApolloTemplatePath("runtime.ts");
    const template = readFileSync(templatePath, "utf-8");
    api.writeTmpFile({
      noPluginDir: true,
      path: writeTmpFilePath,
      content: template,
    });
  });
