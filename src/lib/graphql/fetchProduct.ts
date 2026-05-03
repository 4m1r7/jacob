import { wpGraphqlClient } from './client';
import {
  GetProductBySlugDocument,
  type GetProductBySlugQuery,
  type GetProductBySlugQueryVariables,
} from './generated';

export type SingleProduct = NonNullable<
  NonNullable<NonNullable<GetProductBySlugQuery['products']>['edges'][number]>['node']
>;

export async function fetchProductBySlug(slug: string): Promise<SingleProduct | null> {
  const data = await wpGraphqlClient.request<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  >(GetProductBySlugDocument, { slug });
  return data.products?.edges[0]?.node ?? null;
}
