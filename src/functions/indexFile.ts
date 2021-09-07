import { readFileSync } from 'fs';

import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';

import { IBag, IOptions } from '..';

export default (api: IApi, bag: IBag) =>
  api.onGenerateFiles(() => {
    const indexPath = 'apollo/index.tsx';
    const templatePath = bag.joinApolloTemplatePath('index.tsx');
    const optionsFile = winPath(bag.optionsFile!);
    const options: IOptions = api.config.apollo;

    const indexTemplate = readFileSync(templatePath, 'utf-8');
    api.writeTmpFile({
      path: indexPath,
      content: api.utils.Mustache.render(indexTemplate, {
        OptionsFile: optionsFile,
        logging: options.logging,
      }),
    });
  });
