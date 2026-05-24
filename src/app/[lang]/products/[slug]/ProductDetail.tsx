'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Languages, Dictionary } from '@/types';
import type { SingleProduct } from '@/lib/graphql/fetchProduct';

type Props = {
  product: SingleProduct;
  lang: Languages;
  dict: Dictionary;
};

type GalleryImage = {
  id: string;
  fullFileUrl: string;
  fullWidth: number;
  fullHeight: number;
};

function localizeType(value: string | null | undefined, t: Record<string, string>): string {
  if (!value) return '—';
  const map: Record<string, string> = {
    carpet: t.typeCarpet,
    kilim: t.typeKilim,
    bag: t.typeBag,
  };
  return map[value.toLowerCase()] ?? value;
}

function localizeCondition(value: string | null | undefined, t: Record<string, string>): string {
  if (!value) return '—';
  const map: Record<string, string> = {
    antique: t.conditionAntique,
    'semi-antique': t.conditionSemiAntique,
    'semi antique': t.conditionSemiAntique,
    new: t.conditionNew,
  };
  return map[value.toLowerCase()] ?? value;
}

type SpecRowProps = { label: string; value: string | number | null | undefined; unit?: string };
function SpecRow({ label, value, unit }: SpecRowProps) {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-stone-400 last:border-0">
      <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{label}</span>
      <span className="text-sm text-stone-600 font-medium">
        {value}{unit ? unit : ''}
      </span>
    </div>
  );
}

export default function ProductDetail({ product, lang, dict }: Props) {
  const t = dict.productPage;
  const isRtl = lang === 'fa';
  const detail = product.productDetail;

  const isSoldOut =
    Array.isArray(detail?.soldOut) ? detail!.soldOut!.length > 0 : Boolean(detail?.soldOut);

  const origins = product.origin?.edges.map((e) => e.node) ?? [];
  const topLevelOrigins = origins.filter((o) => !o.parent);
  const displayOrigins = topLevelOrigins.length > 0 ? topLevelOrigins : origins;

  const description = lang === 'fa' ? detail?.farsiDescription : detail?.englishDescription;
  const productTitle = product.title ?? 'Product image';
  const galleryImages =
    detail?.gallery?.filter(
      (img): img is GalleryImage =>
        Boolean(img?.id && img.fullFileUrl && img.fullWidth != null && img.fullHeight != null),
    ) ?? [];

  return (
    <div className={`min-h-screen pt-24 pb-16 ${isRtl ? 'font-Mirza' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>

      <div className="px-3 md:px-16">

        {/* Back link */}
        <Link
          href={`/${lang}/products`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-600 hover:text-stone-800 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isRtl ? 'rotate-180' : ''}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t.backToProducts}
        </Link>

        <div className="flex flex-col-reverse md:flex-row items-start gap-6 relative">

          {/* Gallery */}
          <div className="md:w-3/5 flex flex-col gap-4">
            {galleryImages.length > 0 ? (
              galleryImages.map((img, i) => (
                <div key={img.id} className="relative w-full overflow-hidden">
                  <Image
                    src={img.fullFileUrl}
                    alt={productTitle}
                    width={img.fullWidth}
                    height={img.fullHeight}
                    className="w-full mix-blend-darken"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))
            ) : (
              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:sticky top-24 md:w-2/5 flex flex-col gap-4 md:gap-8">

            {/* Title + price + status */}
            <div className='w-full flex items-end justify-between'>
              <div className='flex flex-col gap-1'>
                <div className='text-sm text-stone-500 capitalize'>
                  #{product.title ?? '—'}
                </div>
                <h1 className="flex items-center gap-2 text-2xl text-stone-800 uppercase">
                  {/* Condition */}
                  <span>
                    {localizeCondition(detail?.condition, t)}
                  </span>

                  {/* Origin */}
                  {displayOrigins.length > 0 && (
                    <span>
                      {displayOrigins.map((o) => o.name).join(', ')}
                    </span>
                  )}

                  {/* Type */}
                  <span>
                    {localizeType(detail?.type, t)}
                  </span>
                </h1>
              </div>

              <div className='flex flex-col gap-1'>
                {isSoldOut && (
                  <span className="text-xs text-amber-800 font-semibold uppercase">
                    {t.soldOut}
                  </span>
                )}
                {detail?.price && (
                  <span className={`text-2xl text-stone-700 text-right font-extralight leading-none tracking-wider ${isSoldOut && 'line-through'}`}>
                    ${detail.price}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className='flex flex-col gap-2'>
                <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                  {t.description}
                </p>
                <div
                  className="text-stone-600 font-extralight"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}

            {/* Specs */}
            <div className='flex items-start gap-2'>
              <div className="flex-1 border border-stone-400 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-stone-500 text-xs uppercase tracking-widest text-stone-100 font-semibold">
                  {t.dimensions}
                </div>
                <div className="px-5">
                  <SpecRow label={t.length} value={detail?.length} unit={t.cm} />
                  <SpecRow label={t.width} value={detail?.width} unit={t.cm} />
                  <SpecRow label={t.weight} value={detail?.weight} unit={t.kg} />
                </div>
              </div>

              <div className="flex-1 border border-stone-400 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-stone-500 text-xs uppercase tracking-widest text-stone-100 font-semibold">
                  {t.material}
                </div>
                <div className="px-5">
                  <SpecRow label={t.pile} value={detail?.pile} />
                  <SpecRow label={t.warp} value={detail?.warp} />
                  <SpecRow label={t.weft} value={detail?.weft} />
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="flex-1 border border-stone-400 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-stone-500 text-xs uppercase tracking-widest text-stone-100 font-semibold">
                {t.getInTouch}
              </div>
              <div
                className="p-4 text-sm text-stone-500 font-semibold"
                dangerouslySetInnerHTML={{ __html: t.getInTouchCopy }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
