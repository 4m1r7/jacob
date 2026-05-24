import { GraphQLClient } from "graphql-request";

const endpoint =
  process.env.WORDPRESS_GRAPHQL_ENDPOINT ??
  "https://cms.jacobcarpet.com/graphql";

export function createWpGraphqlClient(headers?: HeadersInit) {
  return new GraphQLClient(endpoint, { headers, fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) });
}

export const wpGraphqlClient = createWpGraphqlClient();
