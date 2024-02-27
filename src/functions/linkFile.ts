import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

import globby from "globby";
import { winPath } from "@umijs/utils";
import { Mustache } from "@umijs/utils";

import type { IApi } from "umi";

import { IBag, IOptions } from "../index";

const getSchemaPath = (api: IApi) =>
  globby
    .sync("**/schema.{gql,graphql}{,.js,.ts}{,x}", {
      cwd: join(api.cwd, "mock"),
    })
    .map((path) => winPath(join(api.cwd, "mock", path)))[0];

const getResolvers = (api: IApi) =>
  globby
    .sync("**/resolvers.{js,jsx,ts,tsx}", {
      cwd: join(api.cwd, "mock"),
    })
    .filter(
      (p) =>
        !p.endsWith(".d.ts") &&
        !p.endsWith(".test.js") &&
        !p.endsWith(".test.jsx") &&
        !p.endsWith(".test.ts") &&
        !p.endsWith(".test.tsx"),
    )
    .map((path, i) => {
      const name = `resolvers${i}`;

      return {
        name,
        path: winPath(join(api.cwd, "mock", path)),
      };
    });

const getImportSchema = (path: string) =>
  path
    ? `import typeDefs from '${path}';`
    : `import typeDefs from './sample.schema.graphql';`;

const getImportResolvers = (resolvers: any[]) =>
  resolvers.reduce(
    (acc, act) => `${acc}import ${act.name} from '${act.path}';
`,
    "",
  );

const getMergeResolvers = (resolvers: any[]) =>
  resolvers.reduce(
    (acc, act) => `${acc}, ${act.name}
`,
    "",
  );

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const options: IOptions = api.config.apollo;
    const linkPath = "remote-link.ts";
    const linkTemplatePath = bag.joinApolloTemplatePath(
      options.mock ? "mock-schema-link.ts" : "http-link.ts",
    );

    const linkTemplate = readFileSync(linkTemplatePath, "utf-8");
    let linkContent = linkTemplate;
    let schemaPath;

    if (options.mock) {
      schemaPath = getSchemaPath(api);
      const resolvers = getResolvers(api);

      const loadImportSchema = getImportSchema(schemaPath);
      const loadImportResolvers = getImportResolvers(resolvers);
      const loadMergeResolvers = getMergeResolvers(resolvers);

      linkContent = linkContent
        .replace("// <% LoadImportSchema %>", loadImportSchema)
        .replace("// <% LoadImportResolvers %>", loadImportResolvers)
        .replace("// <% LoadMergeResolvers %>", loadMergeResolvers);
      writeFileSync(linkPath, linkContent);
    } else {
      const optionsFile = winPath(bag.optionsFile!);
      api.writeTmpFile({
        path: linkPath,
        content: Mustache.render(linkTemplate, {
          optionsFile: optionsFile,
          url: options.url,
          wsUrl: options.wsUrl,
        }),
      });
    }

    if (schemaPath) {
      return;
    }

    const sampleSchemaTemplatePath = bag.joinApolloTemplatePath(
      "sample.schema.graphql",
    );

    const sampleSchemaTemplate = readFileSync(
      sampleSchemaTemplatePath,
      "utf-8",
    );
    const sampleSchemaContent = sampleSchemaTemplate;

    api.writeTmpFile({
      path: "sample.schema.graphql",
      content: sampleSchemaContent,
    });
  });
