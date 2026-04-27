import { notFound } from 'next/navigation';
import { getDictionary } from '@/app/dictionaries/dictionaries';
import { fetchProductBySlug } from '@/lib/graphql/fetchProduct';
import type { Languages } from '@/types';
import type { Metadata } from 'next';
import ProductDetail from './ProductDetail';

type Params = { lang: Languages; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    const dict = getDictionary(lang);
    return { title: `${dict.productPage.notFound} | Jacob Carpet` };
  }
  return {
    title: `${product.title} | Jacob Carpet`,
    description:
      lang === 'fa'
        ? (product.productDetail?.farsiDescription ?? product.title)
        : (product.productDetail?.englishDescription ?? product.title),
    openGraph: product.featuredImage?.node.sourceUrl
      ? { images: [{ url: product.featuredImage.node.sourceUrl }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetail product={product} lang={lang} dict={dict} />;
}
