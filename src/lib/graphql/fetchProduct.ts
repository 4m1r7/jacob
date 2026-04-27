import { wpGraphqlClient } from './client';

export type ProductDetail = {
  price?: string | null;
  soldOut?: boolean | null;
  length?: number | null;
  width?: number | null;
  weight?: number | null;
  type?: string | null;
  condition?: string | null;
  englishDescription?: string | null;
  farsiDescription?: string | null;
  pile?: string | null;
  warp?: string | null;
  weft?: string | null;
  gallery?: GalleryImage[] | null;
};

export type ProductOriginNode = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  parent?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      slug: string;
    };
  } | null;
};

export type GalleryImage = {
  id: string;
  fullFileUrl: string;
};

export type SingleProduct = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  } | null;
  origin?: {
    edges: { node: ProductOriginNode }[];
  } | null;
  productDetail?: ProductDetail | null;
};

const PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($slug: String!) {
    products(first: 1, where: { name: $slug }) {
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
          productDetail {
            price
            soldOut
            length
            width
            weight
            type
            condition
            englishDescription
            farsiDescription
            pile
            warp
            weft
            gallery {
              id
              fullFileUrl
            }
          }
        }
      }
    }
  }
`;

export async function fetchProductBySlug(slug: string): Promise<SingleProduct | null> {
  const data = await wpGraphqlClient.request<{
    products: { edges: { node: SingleProduct }[] } | null;
  }>(PRODUCT_BY_SLUG_QUERY, { slug });
  return data.products?.edges[0]?.node ?? null;
}
