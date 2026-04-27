import { getDictionary } from '@/app/dictionaries/dictionaries';
import { getSdk } from '@/lib/graphql/generated';
import { wpGraphqlClient } from '@/lib/graphql/client';
import { fetchProducts } from '@/lib/graphql/fetchProducts';
import type { Languages } from '@/types';
import ProductsClient from './ProductsClient';

export async function generateMetadata({ params }: { params: Promise<{ lang: Languages }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return {
    title: `${dict.productsPage.title} | Jacob Carpet`,
    description: dict.productsPage.description,
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ lang: Languages }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const sdk = getSdk(wpGraphqlClient);

  const [{ allOrigin }, { products: initialProducts, pageInfo }] = await Promise.all([
    sdk.GetOrigins(),
    fetchProducts({}, 10),
  ]);

  const origins = allOrigin?.edges.map((e) => e.node) ?? [];

  return (
    <ProductsClient
      lang={lang}
      dict={dict}
      initialProducts={initialProducts}
      initialPageInfo={pageInfo}
      origins={origins}
    />
  );
}
