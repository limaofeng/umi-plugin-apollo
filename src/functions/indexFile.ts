import { readFileSync } from "fs";

import type { IApi } from "umi";
import { Mustache } from "@umijs/utils";
import { winPath } from "@umijs/utils";

import { IBag, IOptions } from "..";

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const indexPath = "index.tsx";
    const templatePath = bag.joinApolloTemplatePath("index.tsx");
    const optionsFile = winPath(bag.optionsFile!);
    const options: IOptions = api.config.apollo;

    const indexTemplate = readFileSync(templatePath, "utf-8");

    api.writeTmpFile({
      path: indexPath,
      content: Mustache.render(indexTemplate, {
        OptionsFile: optionsFile,
        tokenFile: winPath(bag.tokenFile!),
        logging: options.logging,
      }),
    });
  });
