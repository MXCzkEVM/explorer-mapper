// apolloClient.js
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { graphNode } from './Network'

export const mxczkevmClient = new ApolloClient({
  link: new HttpLink({
    uri: `${graphNode}/subgraphs/name/mxczkevm/mxc-graph`,
  }),
  cache: new InMemoryCache(),
})
