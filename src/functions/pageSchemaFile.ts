import { readFileSync, writeFileSync } from 'fs';

import { IApi } from '@umijs/types';

import { IBag } from '..';

const buildImportSchemas = (schemas: any[]) =>
  schemas.reduce(
    (acc, act) => `${acc}import ${act.pageSchemaName} from '${act.relativePath}';
`,
    ''
  );

const buildPrintSchemas = (schemas: any[]) =>
  schemas.reduce(
    (acc, act) => `${acc}  \${print(${act.pageSchemaName})}
`,
    ''
  );

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const path = bag.joinApolloPath('pageSchema.ts');
    const tplPath = bag.joinApolloTemplatePath('pageSchema.ts');

    const importSchemas = buildImportSchemas(bag.schemas);
    const printSchemas = buildPrintSchemas(bag.schemas);

    const template = readFileSync(tplPath, 'utf-8');
    const content = template
      .replace('// <% LoadImportPageSchemas %>', importSchemas)
      .replace('# <% LoadPrintPageSchemas %>', printSchemas);

    writeFileSync(path, content);
  });
