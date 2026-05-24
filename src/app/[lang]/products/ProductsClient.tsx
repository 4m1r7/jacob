'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { Languages, Dictionary } from '@/types';
import type { ProductNode } from '@/lib/graphql/fetchProducts';
import type { GetOriginsQuery } from '@/lib/graphql/generated';
import SectionDivider from '@/components/SectionDivider';

type OriginNode = NonNullable<GetOriginsQuery['allOrigin']>['edges'][number]['node'];

type Props = {
  lang: Languages;
  dict: Dictionary;
  initialProducts: ProductNode[];
  origins: OriginNode[];
};

type FilterState = {
  priceMin: string;
  priceMax: string;
  widthMin: string;
  widthMax: string;
  heightMin: string;
  heightMax: string;
  type: string;
  condition: string;
  availableOnly: boolean;
  originIds: number[];
};

const INITIAL_FILTERS: FilterState = {
  priceMin: '',
  priceMax: '',
  widthMin: '',
  widthMax: '',
  heightMin: '',
  heightMax: '',
  type: '',
  condition: '',
  availableOnly: false,
  originIds: [],
};

function applyLocalFilters(products: ProductNode[], f: FilterState): ProductNode[] {
  return products.filter((p) => {
    const d = p.productDetail;
    if (f.priceMin !== '' && (d?.price ?? 0) < Number(f.priceMin)) return false;
    if (f.priceMax !== '' && (d?.price ?? Infinity) > Number(f.priceMax)) return false;
    if (f.widthMin !== '' && (d?.width ?? 0) < Number(f.widthMin)) return false;
    if (f.widthMax !== '' && (d?.width ?? Infinity) > Number(f.widthMax)) return false;
    if (f.heightMin !== '' && (d?.length ?? 0) < Number(f.heightMin)) return false;
    if (f.heightMax !== '' && (d?.length ?? Infinity) > Number(f.heightMax)) return false;
    if (f.type && d?.type !== f.type) return false;
    if (f.condition && d?.condition !== f.condition) return false;
    if (f.availableOnly && Array.isArray(d?.soldOut) && d.soldOut.length > 0) return false;
    if (f.originIds.length > 0) {
      const productOriginIds = p.origin?.edges.map((e) => e.node.databaseId) ?? [];
      if (!f.originIds.some((id) => productOriginIds.includes(id))) return false;
    }
    return true;
  });
}

function buildOriginTree(origins: OriginNode[]) {
  const roots = origins.filter(
    (o) => !o.parentDatabaseId || o.parentDatabaseId === 0,
  );
  function children(parentId: number): OriginNode[] {
    return origins.filter((o) => o.parentDatabaseId === parentId);
  }
  return { roots, children };
}

function hasFilterValue(filters: FilterState, key: keyof FilterState): boolean {
  const v = filters[key];
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  return v !== '';
}

function filterIsActive(filters: FilterState, keys: (keyof FilterState)[]): boolean {
  return keys.some((k) => hasFilterValue(filters, k));
}

export default function ProductsClient({
  lang,
  dict,
  initialProducts,
  origins,
}: Props) {
  const t = dict.productsPage;

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const products = useMemo(() => applyLocalFilters(initialProducts, filters), [initialProducts, filters]);
  const [openTile, setOpenTile] = useState<string | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);

  const { roots: rootOrigins, children: originChildren } = buildOriginTree(origins);

  const conditions = useMemo(() => {
    const vals = new Set(initialProducts.map((p) => p.productDetail?.condition).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [initialProducts]);

  const types = useMemo(() => {
    const vals = new Set(initialProducts.map((p) => p.productDetail?.type).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [initialProducts]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenTile(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOrigin(id: number) {
    setFilters((prev) => ({
      ...prev,
      originIds: prev.originIds.includes(id)
        ? prev.originIds.filter((x) => x !== id)
        : [...prev.originIds, id],
    }));
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS);
  }

  const isSoldOut = (p: ProductNode) =>
    Array.isArray(p.productDetail?.soldOut) && p.productDetail!.soldOut!.length > 0;

  const filterTiles = [
    { id: 'price',        label: t.filterPrice,        keys: ['priceMin', 'priceMax']   as (keyof FilterState)[] },
    { id: 'width',        label: t.filterWidth,        keys: ['widthMin', 'widthMax']   as (keyof FilterState)[] },
    { id: 'height',       label: t.filterHeight,       keys: ['heightMin', 'heightMax'] as (keyof FilterState)[] },
    { id: 'type',         label: t.filterType,         keys: ['type']                   as (keyof FilterState)[] },
    { id: 'condition',    label: t.filterCondition,    keys: ['condition']              as (keyof FilterState)[] },
    { id: 'availability', label: t.filterAvailability, keys: ['availableOnly']          as (keyof FilterState)[] },
    ...(origins.length > 0 ? [{ id: 'origin', label: t.filterOrigin, keys: ['originIds'] as (keyof FilterState)[] }] : []),
  ];

  return (
    <div className="min-h-screen py-20 relative">

      <SectionDivider title={dict.menu.products} classes="px-4 md:px-40 my-10" />

      {/* Products */}
      <div className="px-2 md:px-10 pb-16">
        {products.length === 0 ? (
          <div className="h-screen flex flex-col justify-center items-center text-stone-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-40">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-lg">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} soldOut={isSoldOut(product)} lang={lang} dict={dict} />
            ))}
          </div>
        )}

      </div>

      {/* Filter bar */}
      <div ref={filterBarRef} className="sticky bottom-1 w-[calc(100vw-.5rem)] md:w-[calc(100vw-2rem)] mx-auto">
        <div className="flex border border-stone-800 rounded-4xl md:rounded-full bg-customLightSand">
          {filterTiles.map((tile, idx) => {
            const active = filterIsActive(filters, tile.keys);
            const isOpen = openTile === tile.id;
            const LIST_FILTER = new Set(['type', 'condition', 'origin']);
            const padded = !LIST_FILTER.has(tile.id);
            return (
              <div key={tile.id} className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => setOpenTile(isOpen ? null : tile.id)}
                  className={`w-full h-full flex flex-col items-center justify-center gap-3 py-3 px-2
                    ${(idx != 0 && lang == "en") ? "border-l" : ""} border-stone-800 relative
                    ${(idx != 0 && lang == "fa") ? "border-r" : ""}
                    text-xs font-medium text-black cursor-pointer`}
                >
                  <TileIcon id={tile.id} />
                  <span className="font-semibold leading-none uppercase">{tile.label}</span>
                  {active && !isOpen && (
                    <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-stone-800" />
                  )}
                </button>

                {isOpen && (
                  <div
                    className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 ${POPOVER_WIDTH[tile.id] ?? 'w-56'}
                      bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 ${padded ? 'p-4' : ''}`}
                  >
                    {tile.id === 'price' && (
                      <DualRangeSlider
                        min={0} max={10000} step={100}
                        committed={{ min: filters.priceMin !== '' ? Number(filters.priceMin) : 0, max: filters.priceMax !== '' ? Number(filters.priceMax) : 10000 }}
                        onConfirm={(min, max) => setFilters((p) => ({ ...p, priceMin: min === 0 ? '' : String(min), priceMax: max === 10000 ? '' : String(max) }))}
                        formatValue={(v) => `$${v.toLocaleString()}`}
                      />
                    )}
                    {tile.id === 'width' && (
                      <DualRangeSlider
                        min={50} max={3000} step={10}
                        committed={{ min: filters.widthMin !== '' ? Number(filters.widthMin) : 500, max: filters.widthMax !== '' ? Number(filters.widthMax) : 3000 }}
                        onConfirm={(min, max) => setFilters((p) => ({ ...p, widthMin: min === 500 ? '' : String(min), widthMax: max === 3000 ? '' : String(max) }))}
                        formatValue={(v) => `${v} cm`}
                      />
                    )}
                    {tile.id === 'height' && (
                      <DualRangeSlider
                        min={50} max={3000} step={10}
                        committed={{ min: filters.heightMin !== '' ? Number(filters.heightMin) : 500, max: filters.heightMax !== '' ? Number(filters.heightMax) : 3000 }}
                        onConfirm={(min, max) => setFilters((p) => ({ ...p, heightMin: min === 500 ? '' : String(min), heightMax: max === 3000 ? '' : String(max) }))}
                        formatValue={(v) => `${v} cm`}
                      />
                    )}
                    {tile.id === 'type' && (
                      <ListOptions
                        value={filters.type}
                        onChange={(v) => setFilters((p) => ({ ...p, type: v }))}
                        options={[
                          { value: '', label: t.all },
                          ...types.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
                        ]}
                      />
                    )}
                    {tile.id === 'condition' && (
                      <ListOptions
                        value={filters.condition}
                        onChange={(v) => setFilters((p) => ({ ...p, condition: v }))}
                        options={[
                          { value: '', label: t.all },
                          ...conditions.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
                        ]}
                      />
                    )}
                    {tile.id === 'availability' && (
                      <label className="flex items-center gap-3 text-sm text-stone-600 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={filters.availableOnly}
                          onChange={(e) => setFilters((p) => ({ ...p, availableOnly: e.target.checked }))}
                          className="w-4 h-4 rounded accent-stone-800"
                        />
                        {t.availableOnly}
                      </label>
                    )}
                    {tile.id === 'origin' && (
                      <OriginTree
                        roots={rootOrigins}
                        getChildren={originChildren}
                        selectedIds={filters.originIds}
                        onToggle={toggleOrigin}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Apply / Reset */}
          <button
            type="button"
            onClick={resetFilters}
            className={`text-sm text-black/60 hover:text-black/90 font-medium uppercase transition duration-200 px-1 md:px-5 
              ${lang === 'en' ? 'border-l' : 'border-r'} border-black cursor-pointer
            `}
          >
            {t.resetFilters}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- popover shell ----------
const POPOVER_WIDTH: Record<string, string> = {
  price:        'w-64',
  width:        'w-64',
  height:       'w-64',
  type:         'w-52',
  condition:    'w-52',
  availability: 'w-44',
  origin:       'w-96',
};

// ---------- dual range slider ----------
function DualRangeSlider({
  min, max, step,
  committed,
  onConfirm,
  formatValue,
}: {
  min: number; max: number; step: number;
  committed: { min: number; max: number };
  onConfirm: (min: number, max: number) => void;
  formatValue: (v: number) => string;
}) {
  const [draft, setDraft] = useState({ min: committed.min, max: committed.max });

  const minPct = ((draft.min - min) / (max - min)) * 100;
  const maxPct = ((draft.max - min) / (max - min)) * 100;
  // Midpoint between thumbs — each input's clip region stops here
  const midPct = (minPct + maxPct) / 2;

  const dirty = draft.min !== committed.min || draft.max !== committed.max;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center text-xs text-stone-500">
        <span>{formatValue(draft.min)}</span>
        {dirty && (
          <button
            type="button"
            onClick={() => onConfirm(draft.min, draft.max)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-800 text-white hover:bg-stone-600 transition-colors cursor-pointer animate-bounce"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </button>
        )}
        <span>{formatValue(draft.max)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* track */}
        <div className="absolute w-full h-1.5 rounded-full bg-stone-200" />
        {/* fill */}
        <div
          className="absolute h-1.5 rounded-full bg-stone-800"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* min thumb — clipped to left half so it never intercepts clicks meant for max */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - midPct}% 0 0)` }}>
          <input
            type="range" min={min} max={max} step={step} value={draft.min}
            onChange={(e) => { const v = Number(e.target.value); if (v <= draft.max) setDraft((d) => ({ ...d, min: v })); }}
            className="absolute w-full h-full appearance-none bg-transparent cursor-pointer range-thumb"
          />
        </div>
        {/* max thumb — clipped to right half */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${midPct}%)` }}>
          <input
            type="range" min={min} max={max} step={step} value={draft.max}
            onChange={(e) => { const v = Number(e.target.value); if (v >= draft.min) setDraft((d) => ({ ...d, max: v })); }}
            className="absolute w-full h-full appearance-none bg-transparent cursor-pointer range-thumb"
          />
        </div>
      </div>
    </div>
  );
}

// ---------- list options (type / condition) ----------
function ListOptions({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col divide-y divide-stone-100">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors first:rounded-t-lg last:rounded-b-lg
              ${selected ? 'bg-stone-800 text-white' : 'text-stone-700 hover:bg-stone-50'} cursor-pointer`}
          >
            <span>{o.label}</span>
            {selected && (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m5 13 4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- hierarchical origin tree ----------
function OriginTree({
  roots,
  getChildren,
  selectedIds,
  onToggle,
}: {
  roots: OriginNode[];
  getChildren: (parentId: number) => OriginNode[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(roots.map((r) => r.databaseId)));

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col max-h-72 overflow-y-auto">
      {roots.map((root) => {
        const kids = getChildren(root.databaseId);
        const isExpanded = expanded.has(root.databaseId);
        const rootSelected = selectedIds.includes(root.databaseId);

        return (
          <div key={root.id}>
            {/* parent row */}
            <div className={`flex items-center border-b border-stone-100 transition-colors
              ${rootSelected ? 'bg-stone-800 text-white' : 'text-stone-700 hover:bg-stone-50'}`}
            >
              <button
                type="button"
                onClick={() => onToggle(root.databaseId)}
                className="flex-1 flex items-center justify-between px-3 py-2.5 text-sm text-left"
              >
                <span className="font-medium">{root.name}</span>
                {rootSelected && (
                  <svg className="w-3.5 h-3.5 shrink-0 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </button>
              {kids.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleExpand(root.databaseId)}
                  className={`px-2 py-2.5 transition-colors ${rootSelected ? 'text-white/70 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              )}
            </div>

            {/* children */}
            {kids.length > 0 && isExpanded && (
              <div className="flex flex-col">
                {kids.map((child) => {
                  const childSelected = selectedIds.includes(child.databaseId);
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => onToggle(child.databaseId)}
                      className={`flex items-center justify-between pl-6 pr-3 py-2 text-sm border-b border-stone-100 text-left transition-colors
                        ${childSelected ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                      <span>{child.name}</span>
                      {childSelected && (
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- tile icon ----------
function TileIcon({ id }: { id: string }) {
  const cls = 'w-6 h-6';
  if (id === 'price') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v1m0 10v1M9 9.5A2.5 2.5 0 0 1 12 7a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 3-2.5" />
    </svg>
  );
  if (id === 'width') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" />
    </svg>
  );
  if (id === 'height') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v16M12 4l-3 3M12 4l3 3M12 20l-3-3M12 20l3-3" />
    </svg>
  );
  if (id === 'type') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
  if (id === 'condition') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
  if (id === 'availability') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
  if (id === 'origin') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
  return null;
}

// ---------- product card ----------
function ProductCard({
  product,
  soldOut,
  lang,
  dict,
}: {
  product: ProductNode;
  soldOut: boolean;
  lang: Languages;
  dict: Dictionary;
}) {
  const t = dict.productsPage;
  const img = product.featuredImage?.node;
  const detail = product.productDetail;

  const originNames = product.origin?.edges
    .map((e) => e.node.name)
    .filter(Boolean)
    .join(', ');

  return (
    <Link href={`/${lang}/products/${product.slug}`} className="group relative border border-transparent hover:border-black/40 transition-colors duration-200 block">
      <div className="relative aspect-[3/2.1] overflow-hidden">
        {img?.sourceUrl ? (
          <img
            src={img.sourceUrl}
            alt={img.altText || product.title || ''}
            className="w-full h-full object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        {soldOut && (
          <span className="absolute top-0 right-0 text-amber-800 text-xs font-semibold m-3 px-2 py-1 uppercase bg-white/80 rounded-full">
            {t.soldOut}
          </span>
        )}
      </div>

      <div className="absolute bottom-0 w-full h-24 flex justify-between items-end gap-2 p-4 bg-black/70 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-1">
          {detail?.width && detail?.length && (
            <span className="text-lg text-stone-200 font-light leading-none mb-1">
              {detail.width}×{detail.length}cm
            </span>
          )}
          {originNames && (
            <p className="text-stone-100 font-extralight leading-none">
              {originNames}
            </p>
          )}
          {detail?.condition && (
            <span className="text-stone-100 font-extralight leading-none capitalize">
              {detail.condition}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {detail?.price && (
            <span className="text-2xl text-stone-200 text-right font-extralight leading-none tracking-wider">
              ${detail.price.toLocaleString()}
            </span>
          )}
          <h3 className="text-xs text-right text-stone-100 font-light tracking-wider">
            sku #{product.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

// ---------- skeleton ----------
