import React from "react";

import gql from "graphql-tag";
import { print } from "graphql/language/printer";
import { merge } from "lodash";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";

import remoteLink from "./remote-link";
import pageTypeDefs from "./pageSchema";
import {
  defaults as pageDefaults,
  resolvers as pageResolvers,
} from "./pageResolvers";

import * as options from "{{{OptionsFile}}}";

const mainTypeDefs = gql`
  type Query {
    _void: String
  }

  type Mutation {
    _void: String
  }
`;

const mainDefaults = {
  _void: "_void",
};

const mainResolvers = {};

const typeDefs = [print(mainTypeDefs), print(pageTypeDefs)];
const defaults = merge(mainDefaults, pageDefaults);
const resolvers = merge(mainResolvers, pageResolvers);

const cacheOptions = options.cacheOptions || {};
const stateLinkOptions = options.stateLinkOptions || {};
const clientOptions = options.clientOptions || {};
const providerOptions = options.providerOptions || {};
const extraLinks = options.extraLinks || [];

const cache = options.makeCache
  ? options.makeCache({ cacheOptions })
  : new InMemoryCache({ ...cacheOptions });

const link = options.makeLink
  ? options.makeLink({ remoteLink, extraLinks })
  : ApolloLink.from([...extraLinks, remoteLink]);

export const apolloClient = options.makeClient
  ? options.makeClient({ link, cache, clientOptions })
  : new ApolloClient({ link, cache, ...clientOptions });

export const apolloProvider = options.makeProvider
  ? options.makeProvider({ client: apolloClient, providerOptions })
  : ({ children }: any) => (
      <ApolloProvider client={apolloClient} {...providerOptions}>
        {children}
      </ApolloProvider>
    );

export { default as tokenHelper } from './TokenHelper'