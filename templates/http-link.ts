import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { createUploadLink } from 'apollo-upload-client';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import axios from 'axios';

import * as options from '{{{optionsFile}}}';
import tokenHelper from './TokenHelper';

const uri = '{{{uri}}}';
const httpLinkOptions = options.httpLinkOptions || {};

const createDefaultHttpLink = () => {
  let remoteLink;
  if (uri.startsWith('ws')) {
    const client = new SubscriptionClient(uri, {
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
    });
    remoteLink = new WebSocketLink(client);
  } else {
    remoteLink = createUploadLink({
      uri,
      fetch: buildAxiosFetch(axios, (config, input, init) => ({
        ...config,
        signal: init.signal,
        onUploadProgress: init.onUploadProgress,
      })),
    });
  }
  return remoteLink;
};

const httpLink = options.makeHttpLink ? options.makeHttpLink({ uri, httpLinkOptions }) : createDefaultHttpLink();

export default httpLink;
