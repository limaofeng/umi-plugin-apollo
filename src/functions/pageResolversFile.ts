import { readFileSync, writeFileSync } from "fs";

import type { IApi } from "umi";

import { IBag } from "..";

const buildImportResolvers = (resolvers: any[]) =>
  resolvers.reduce(
    (
      acc,
      act,
    ) => `${acc}import * as ${act.pageResolversName} from '${act.relativePath}';
`,
    "",
  );

const buildMergeDefaults = (resolvers: any[]) =>
  resolvers.reduce(
    (acc, act) => `${acc}, ${act.pageResolversName}.defaults
`,
    "",
  );

const buildMergeResolvers = (resolvers: any[]) =>
  resolvers.reduce(
    (acc, act) => `${acc}, ${act.pageResolversName}.resolvers
`,
    "",
  );

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const path = bag.joinApolloPath("pageResolvers.ts");
    const tplPath = bag.joinApolloTemplatePath("pageResolvers.ts");

    const importResolvers = buildImportResolvers(bag.resolvers);
    const mergeDefaults = buildMergeDefaults(bag.resolvers);
    const mergeResolvers = buildMergeResolvers(bag.resolvers);

    const template = readFileSync(tplPath, "utf-8");
    const content = template
      .replace("// <% LoadImportPageResolvers %>", importResolvers)
      .replace("// <% LoadMergeDefaults %>", mergeDefaults)
      .replace("// <% LoadMergeResolvers %>", mergeResolvers);

    writeFileSync(path, content);
  });
