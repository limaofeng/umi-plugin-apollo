import { HttpLink } from '@apollo/client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import * as options from '{{{optionsFile}}}';

const uri = '{{{uri}}}';
const batch = {{batch}};
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
    remoteLink = batch ? new BatchHttpLink({ uri: '/graphql', ...httpLinkOptions }) : new HttpLink({ uri, ...httpLinkOptions });
  }
  return remoteLink;
};

const httpLink = options.makeHttpLink
  ? options.makeHttpLink({ uri, httpLinkOptions })
  : createDefaultHttpLink();

export default httpLink;
