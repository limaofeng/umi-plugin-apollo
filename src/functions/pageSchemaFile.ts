import { readFileSync, writeFileSync } from "fs";

import type { IApi } from "umi";

import { IBag } from "..";

const buildImportSchemas = (schemas: any[]) =>
  schemas.reduce(
    (
      acc,
      act,
    ) => `${acc}import ${act.pageSchemaName} from '${act.relativePath}';
`,
    "",
  );

const buildPrintSchemas = (schemas: any[]) =>
  schemas.reduce(
    (acc, act) => `${acc}  \${print(${act.pageSchemaName})}
`,
    "",
  );

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const tplPath = bag.joinApolloTemplatePath("pageSchema.ts");

    const importSchemas = buildImportSchemas(bag.schemas);
    const printSchemas = buildPrintSchemas(bag.schemas);

    const template = readFileSync(tplPath, "utf-8");
    const content = template
      .replace("// <% LoadImportPageSchemas %>", importSchemas)
      .replace("# <% LoadPrintPageSchemas %>", printSchemas);

    api.writeTmpFile({
      path: "pageSchema.ts",
      content,
    })
  });
