import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import apolloLogger from 'apollo-link-logger';

import tokenHelper from './TokenHelper';

const logging = JSON.parse('{{logging}}');
const token = true;

export const cacheOptions = {
  dataIdFromObject: r => (r.id && `${r.__typename}:${r.id}`) || undefined,
};

export const httpLinkOptions = {};

export const stateLinkOptions = {};

const defaultExtraLinks = [];

if (logging) {
  defaultExtraLinks.push(apolloLogger);
}

if (token) {
  const withToken = setContext(async (_, { headers }) => {
    const token = tokenHelper.withToken();
    if (!token) {
      return { headers };
    }
    const authorizationHeader = { authorization: `bearer ${token}` };

    return {
      headers: {
        ...headers,
        ...authorizationHeader,
      },
    };
  });
  defaultExtraLinks.push(withToken);
}

const errorLink = onError(error => {
  const { graphQLErrors } = error;
  if (graphQLErrors?.some(err => err.extensions.code == '100401')) {
    token && tokenHelper.resetToken()
  }
});

defaultExtraLinks.push(errorLink);

export const extraLinks = defaultExtraLinks;

export const clientOptions = {
  connectToDevTools: process.env.NODE_ENV === 'development',
};

export const providerOptions = {};

export const makeCache = undefined; // : ({ cacheOptions }) => Cache
export const makeHttpLink = undefined; // : ({ clientStateLink, remoteLink, httpLinkOptions }) => ApolloLink
export const makeClientStateLink = undefined; // : ({ resolvers, defaults, cache, typeDefs, stateLinkOptions }) => ApolloLink
export const makeLink = undefined; // : ({ clientStateLink, remoteLink, extraLinks }) => ApolloLink
export const makeClient = undefined; // : ({ link, cache, clientOptions }) => ApolloClient
export const makeProvider = undefined; // : ({ client, providerOptions }) => ReactElement (eg: ({ children }) => <ApolloProvider client={client}>{children}</ApolloProvider)
