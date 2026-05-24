import { wpGraphqlClient } from './client';
import type { GetProductsQuery } from './generated';

export type ProductNode = NonNullable<
  NonNullable<GetProductsQuery['products']>['edges'][number]['node']
>;

export type ProductFilters = {
  priceMin?: number;
  priceMax?: number;
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  type?: string;
  condition?: string;
  availableOnly?: boolean;
  originIds?: number[];
};


type MetaEntry = { key: string; compare: string; value: string; type?: string };

function serializeMetaEntry(e: MetaEntry): string {
  const typePart = e.type ? ` type: ${e.type},` : '';
  return `{ key: "${e.key}", compare: ${e.compare}, value: "${e.value}",${typePart} }`;
}

function buildWhereClause(filters: ProductFilters, first: number): string {
  const parts: string[] = [];

  parts.push(`first: ${first}`);

  const metaArray: MetaEntry[] = [];

  if (filters.priceMin !== undefined)
    metaArray.push({ key: 'price', compare: 'GREATER_THAN_OR_EQUAL_TO', value: String(filters.priceMin), type: 'NUMERIC' });
  if (filters.priceMax !== undefined)
    metaArray.push({ key: 'price', compare: 'LESS_THAN_OR_EQUAL_TO', value: String(filters.priceMax), type: 'NUMERIC' });
  if (filters.widthMin !== undefined)
    metaArray.push({ key: 'width', compare: 'GREATER_THAN_OR_EQUAL_TO', value: String(filters.widthMin), type: 'NUMERIC' });
  if (filters.widthMax !== undefined)
    metaArray.push({ key: 'width', compare: 'LESS_THAN_OR_EQUAL_TO', value: String(filters.widthMax), type: 'NUMERIC' });
  if (filters.heightMin !== undefined)
    metaArray.push({ key: 'length', compare: 'GREATER_THAN_OR_EQUAL_TO', value: String(filters.heightMin), type: 'NUMERIC' });
  if (filters.heightMax !== undefined)
    metaArray.push({ key: 'length', compare: 'LESS_THAN_OR_EQUAL_TO', value: String(filters.heightMax), type: 'NUMERIC' });
  if (filters.type)
    metaArray.push({ key: 'type', compare: 'EQUAL_TO', value: filters.type });
  if (filters.condition)
    metaArray.push({ key: 'condition', compare: 'EQUAL_TO', value: filters.condition });
  if (filters.availableOnly)
    metaArray.push({ key: 'sold_out', compare: 'NOT_EXISTS', value: '' });

  const whereParts: string[] = [];

  if (metaArray.length > 0) {
    const metaEntries = metaArray.map(serializeMetaEntry).join(', ');
    whereParts.push(`metaQuery: { relation: AND, metaArray: [${metaEntries}] }`);
  }

  if (filters.originIds && filters.originIds.length > 0) {
    const ids = filters.originIds.join(', ');
    whereParts.push(`originIn: [${ids}]`);
  }

  const whereClause = whereParts.length > 0 ? ` where: { ${whereParts.join(', ')} }` : '';

  return `${parts.join(', ')}${whereClause}`;
}

const PRODUCT_FIELDS = `
  edges {
    node {
      id
      databaseId
      title
      slug
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      productDetail {
        price
        condition
        soldOut
        type
        width
        length
      }
      origin {
        edges {
          node {
            id
            databaseId
            name
            slug
            parent {
              node {
                id
                databaseId
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchProducts(
  filters: ProductFilters,
  first = 100,
): Promise<ProductNode[]> {
  const args = buildWhereClause(filters, first);
  const query = `query { products(${args}) { ${PRODUCT_FIELDS} } }`;

  const data = await wpGraphqlClient.request<{
    products: { edges: { node: ProductNode }[] } | null;
  }>(query);

  return data.products?.edges.map((e) => e.node) ?? [];
}
