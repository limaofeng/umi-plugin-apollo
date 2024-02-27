import { basename, join, relative, resolve } from "path";
import { readFileSync } from "fs";

import { Mustache } from "@umijs/utils";
import _ from "lodash";
import type { IApi } from "umi";
import globby from "globby";

import { IBag, IOptions } from "..";

export const capitalizeFirstLetter = (x: string) =>
  `${x.charAt(0).toUpperCase()}${x.slice(1)}`;
export const getPath = (fullPath: string) =>
  fullPath.endsWith("/index") ? fullPath.replace(/\/index$/, "") : fullPath;
export const getName = (path: string) =>
  _.lowerFirst(_.startCase(path).replace(/\s/g, ""));
export const getPageTypeName = (name: string) =>
  `${capitalizeFirstLetter(name)}Page`;
export const getPageVarName = (name: string) => `${name}Page`;
export const getPagePathFromSchema = (schemaPath: string) =>
  schemaPath.replace(/\/(schema|resolvers)\.(js|jsx|ts|tsx)$/, "");
export const getPageSchemaName = (name: string) => `${name}PageSchema`;
export const getPageResolversName = (name: string) => `${name}PageResolvers`;

export const apolloPath = (api: IApi) => join(api.paths.absTmpPath!, "apollo");
export const joinApolloPath = (api: IApi, path: string) =>
  join(apolloPath(api), path);

const FILE_TYPES: {
  [key: string]: string;
} = {
  "schema.js": "Schema",
  "schema.ts": "Schema",
  "resolvers.js": "Resolvers",
  "resolvers.ts": "Resolvers",
};

export const parseApolloFiles = (api: IApi) =>
  globby
    .sync("**/{schema,resolvers}.{ts,tsx,js,jsx}", {
      cwd: api.paths.absPagesPath,
    })
    .filter(
      (p) =>
        !p.endsWith(".d.ts") &&
        !p.endsWith(".test.js") &&
        !p.endsWith(".test.jsx") &&
        !p.endsWith(".test.ts") &&
        !p.endsWith(".test.tsx"),
    )
    .map((path) => {
      const fileName = basename(path);
      const fileType = FILE_TYPES[fileName];
      const pagePath = getPagePathFromSchema(path);

      const name = getName(pagePath);
      const pageTypeName = getPageTypeName(name);
      const pageVarName = getPageVarName(name);
      const pageSchemaName = getPageSchemaName(name);
      const pageResolversName = getPageResolversName(name);

      const absApolloPath = apolloPath(api);
      const absPath = join(api.paths.absPagesPath!, path);
      const relativePath = relative(absApolloPath, absPath)
        .replace(/\\/g, "/")
        .replace(/\.(js|jsx|ts|tsx)$/, "");

      return {
        name,
        path,
        relativePath,
        fileName,
        fileType,
        pageTypeName,
        pageVarName,
        pageSchemaName,
        pageResolversName,
      };
    });

export const getOptionsFileInternal = (
  { joinAbsApolloPath, joinApolloTemplatePath, joinAbsSrcPath }: IBag,
  api: IApi,
) => {
  const { config } = api;
  const apolloPath = joinAbsApolloPath("");
  const srcPath = joinAbsSrcPath("");
  const opts: IOptions = config.apollo;

  let generateOptionsFile = (): void => undefined;
  let optionsFilename;

  if (opts.options) {
    optionsFilename = relative(apolloPath, resolve(srcPath, opts.options));
    return {
      optionsFilename,
      generateOptionsFile,
    };
  }

  const defaultOptionsPath = joinAbsApolloPath("options");
  optionsFilename = "./" + relative(apolloPath, defaultOptionsPath);

  generateOptionsFile = (): void => {
    const defaultOptionsTemplatePath =
      joinApolloTemplatePath("default-options.ts");
    const defaultOptionsContent = readFileSync(
      defaultOptionsTemplatePath,
      "utf-8",
    );
    console.error("defaultOptionsTemplatePath", defaultOptionsTemplatePath);
    api.writeTmpFile({
      path: "options.ts",
      content: Mustache.render(defaultOptionsContent, {
        logging: opts.logging,
      }),
    });
  };

  return {
    optionsFilename,
    generateOptionsFile,
  };
};

export const getOptionsFile = (bag: IBag, api: IApi) => {
  if (!api.config.apollo) {
    throw new Error("未读取到配置");
  }
  const { optionsFilename, generateOptionsFile } = getOptionsFileInternal(
    bag,
    api,
  );
  return {
    optionsFilename,
    generateOptionsFile,
  };
};
