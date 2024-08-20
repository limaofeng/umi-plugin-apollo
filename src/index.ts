import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

import type { IApi } from "umi";
import { Mustache } from "@umijs/utils";

import { parseApolloFiles } from "./functions/utils";
import generateIndexFile from "./functions/indexFile";
import generatePageResolversFile from "./functions/pageResolversFile";
import generatePageSchemaFile from "./functions/pageSchemaFile";
import generateRuntimeFile from "./functions/runtimeFile";
import generateLinkFile from "./functions/linkFile";
import { getOptionsFile, getTokenFile } from "./functions/utils";

const joinApolloPath = (api: IApi) => (path: string) =>
  join(api.paths.absTmpPath!, "plugin-apollo", path);
const joinAbsApolloPath = (api: IApi) => (path: string) =>
  join(api.paths.absTmpPath!, "plugin-apollo", path);
const joinApolloTemplatePath = () => (path: string) =>
  join(__dirname, "../../templates", path);
const joinSrcPath = (api: IApi) => (path: string) =>
  join(api.paths.absSrcPath!, path);
const joinAbsSrcPath = (api: IApi) => (path: string) =>
  join(api.paths.absSrcPath!, path);

export interface IOptions {
  url: string;
  wsUrl?: string;
  mock: boolean;
  logging: boolean;
  options: string;
  token: string;
}

const joinTemplatePath = (path: string) =>
  join(__dirname, "../../templates", path);

const cenerateFile = (api: IApi, fileName: string) =>
  api.onGenerateFiles(() => {
    const indexPath = `${fileName}`;

    const templatePath = joinTemplatePath(fileName);
    const indexTemplate = readFileSync(templatePath, "utf-8");
    api.writeTmpFile({
      path: indexPath,
      content: Mustache.render(indexTemplate, api.config.app),
    });
  });

export interface IBag {
  generateOptionsFile: () => void;
  generateTokenFile: () => void;
  schemas: any;
  resolvers: any;
  joinApolloPath: (path: string) => string;
  joinAbsApolloPath: (path: string) => string;
  joinApolloTemplatePath: (path: string) => string;
  joinSrcPath: (path: string) => string;
  joinAbsSrcPath: (path: string) => string;
  optionsFile: string;
  tokenFile: string;
}

class Bag {
  schemas: any;
  resolvers: any;
  private api: IApi;
  private _optionsFile: any;
  private _generateOptionsFile: any;
  private _tokenFile: any;
  private _generateTokenFile: any;
  constructor({ api, ...data }: any) {
    for (const key of Object.keys(data)) {
      (this as any)[key] = data[key];
    }
    this.api = api;
  }
  private queryOptionsFile() {
    const { optionsFilename, generateOptionsFile } = getOptionsFile(
      this as any,
      this.api,
    );
    this._optionsFile = optionsFilename;
    this._generateOptionsFile = generateOptionsFile;
  }
  private queryTokenFile() {
    const { tokenFilename, generateTokenFile } = getTokenFile(
      this as any,
      this.api,
    );
    this._tokenFile = tokenFilename;
    this._generateTokenFile = generateTokenFile;
  }
  get optionsFile() {
    if (this._optionsFile) {
      return this._optionsFile;
    }
    this.queryOptionsFile();
    return this._optionsFile;
  }
  get tokenFile() {
    if (this._tokenFile) {
      return this._tokenFile;
    }
    this.queryTokenFile();
    return this._tokenFile;
  }
  get generateOptionsFile() {
    if (this._generateOptionsFile) {
      return this._generateOptionsFile;
    }
    this.queryOptionsFile();
    return this._generateOptionsFile;
  }
  get generateTokenFile() {
    if (this._generateTokenFile) {
      return this._generateTokenFile;
    }
    this.queryTokenFile();
    return this._generateTokenFile;
  }
}

export default function (api: IApi) {
  const apolloFiles = parseApolloFiles(api);
  const schemas = apolloFiles.filter((x) => x.fileType === "Schema");
  const resolvers = apolloFiles.filter((x) => x.fileType === "Resolvers");

  api.logger.info("use @asany/umi-plugin-apollo");

  api.describe({
    key: "apollo",
    config: {
      default: {
        url: process.env.GRAPHQL_URL || "http://localhost:3000/graphql",
        wsUrl:
          process.env.GRAPHQL_WS_URL || "ws://localhost:3000/subscriptions",
        mock:
          ["true", "1", "yes"].indexOf(
            (process.env.MOCK || "false").toLowerCase(),
          ) !== -1,
        logging: process.env.NODE_ENV === "development",
      },
      schema(joi) {
        return joi.object({
          url: joi.string(),
          wsUrl: joi.string(),
          mock: joi.boolean(),
          logging: joi.boolean(),
          options: joi.string(),
        });
      },
    },
  });

  const bag: IBag = new Bag({
    schemas,
    resolvers,
    joinApolloPath: joinApolloPath(api),
    joinAbsApolloPath: joinAbsApolloPath(api),
    joinApolloTemplatePath: joinApolloTemplatePath(),
    joinSrcPath: joinSrcPath(api),
    joinAbsSrcPath: joinAbsSrcPath(api),
    api: api,
  }) as any;

  api.chainWebpack((memo) => {
    const GQL_REG = /\.(graphql|gql)$/

    memo.module.rule('asset').exclude.add(GQL_REG).end();
    
    memo.module
      .rule('graphql')
      .test(GQL_REG)
      .exclude.add(/node_modules/)
      .end()
      .use('graphql-tag')
      .loader('graphql-tag/loader')
      .end()
    return memo;
  });

  api.onGenerateFiles(() => {
    const apolloPath = joinApolloPath(api)("");
    if (!existsSync(apolloPath)) {
      mkdirSync(apolloPath);
    }
    bag.generateTokenFile();
    bag.generateOptionsFile();
  });

  generateIndexFile(api, bag);
  generatePageSchemaFile(api, bag);
  generatePageResolversFile(api, bag);
  generateLinkFile(api, bag);
  generateRuntimeFile(api, bag);

  api.addRuntimePlugin(() => join(api.paths.absTmpPath!, "plugin-apollo/runtime"));

}
