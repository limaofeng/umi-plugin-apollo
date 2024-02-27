import React from "react";

import { apolloProvider } from "./index";

export function rootContainer(container: React.ReactNode) {
  return React.createElement(apolloProvider, null, container);
}
