import React from 'react';

import { provider } from './index';

export function rootContainer(container: React.ReactNode) {
  return React.createElement(provider, null, container);
}
