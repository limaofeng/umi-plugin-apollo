import { getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client";
import { buildAxiosFetch } from "@lifeomic/axios-fetch";
import { split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import axios from "axios";

import tokenHelper from "{{{tokenFile}}}";

import * as options from "{{{optionsFile}}}";

const protocol = window.location.protocol;       // 获取当前页面的协议 (http: 或 https:)
const host = window.location.host;               // 获取当前页面的主机名和端口 (例如 localhost:3000)
// 根据协议生成 WebSocket URL
// 将 http: 替换为 ws:，将 https: 替换为 wss:
const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

const url = "{{{url}}}" || `${protocol}//${host}/graphql`;
const wsUrl = "{{{wsUrl}}}" || `${wsProtocol}//${host}/subscriptions`;
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
