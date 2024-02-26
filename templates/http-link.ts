import { getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client";
import { buildAxiosFetch } from "@lifeomic/axios-fetch";
import { split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import axios from "axios";

import tokenHelper from "./TokenHelper";

import * as options from "{{{optionsFile}}}";

const url = "{{{url}}}";
const wsUrl = "{{{wsUrl}}}";
const httpLinkOptions = options.httpLinkOptions || {};

const createDefaultHttpLink = () => {
  const remoteLink = createUploadLink({
    uri: url,
    fetch: buildAxiosFetch(axios, (config, input, init) => ({
      ...config,
      signal: init.signal,
      onUploadProgress: init.onUploadProgress,
    })),
  });
  if (!wsUrl) {
    return remoteLink;
  }
  const wsLink = new WebSocketLink(
    new SubscriptionClient(wsUrl, {
      lazy: true,
      reconnect: true,
      connectionParams: {
        get authorization() {
          const token = tokenHelper.withToken();
          if (!token) {
            return undefined;
          }
          return `bearer ${token}`;
        },
      },
    }),
  );
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    remoteLink,
  );
};

const httpLink = options.makeHttpLink
  ? options.makeHttpLink({ url, wsUrl, httpLinkOptions })
  : createDefaultHttpLink();

export default httpLink;
