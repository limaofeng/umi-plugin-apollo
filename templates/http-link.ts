import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { createUploadLink } from 'apollo-upload-client';
import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import axios from 'axios';

import * as options from '{{{optionsFile}}}';

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
          const loginCredentials = JSON.parse(localStorage.getItem('loginCredentials')!);
          if (!loginCredentials) {
            return;
          }
          if (!loginCredentials.token) {
            return;
          }
          return `bearer ${loginCredentials.token}`;
        },
      },
    });
    remoteLink = new WebSocketLink(client);
  } else {
    remoteLink = createUploadLink({
      uri,
      fetch: buildAxiosFetch(axios, (config, input, init) => ({
        ...config,
        onUploadProgress: init.onUploadProgress,
      })),
    });
  }
  return remoteLink;
};

const httpLink = options.makeHttpLink ? options.makeHttpLink({ uri, httpLinkOptions }) : createDefaultHttpLink();

export default httpLink;
