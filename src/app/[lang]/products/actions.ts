'use server';

import { fetchProducts, type ProductFilters, type FetchProductsResult } from '@/lib/graphql/fetchProducts';

export async function fetchProductsAction(
  filters: ProductFilters,
  first: number,
  after?: string,
): Promise<FetchProductsResult> {
  return fetchProducts(filters, first, after);
}
