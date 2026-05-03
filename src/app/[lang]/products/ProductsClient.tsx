'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import Link from 'next/link';
import type { Languages, Dictionary } from '@/types';
import type { ProductNode, ProductsPageInfo, ProductFilters } from '@/lib/graphql/fetchProducts';
import type { GetOriginsQuery } from '@/lib/graphql/generated';
import { fetchProductsAction } from './actions';
import SectionDivider from '@/components/SectionDivider';

type OriginNode = NonNullable<GetOriginsQuery['allOrigin']>['edges'][number]['node'];

type Props = {
  lang: Languages;
  dict: Dictionary;
  initialProducts: ProductNode[];
  initialPageInfo: ProductsPageInfo;
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

function filtersToPayload(f: FilterState): ProductFilters {
  return {
    priceMin: f.priceMin ? Number(f.priceMin) : undefined,
    priceMax: f.priceMax ? Number(f.priceMax) : undefined,
    widthMin: f.widthMin ? Number(f.widthMin) : undefined,
    widthMax: f.widthMax ? Number(f.widthMax) : undefined,
    heightMin: f.heightMin ? Number(f.heightMin) : undefined,
    heightMax: f.heightMax ? Number(f.heightMax) : undefined,
    type: f.type || undefined,
    condition: f.condition || undefined,
    availableOnly: f.availableOnly || undefined,
    originIds: f.originIds.length > 0 ? f.originIds : undefined,
  };
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
  initialPageInfo,
  origins,
}: Props) {
  const t = dict.productsPage;
  const isRtl = lang === 'fa';

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [products, setProducts] = useState<ProductNode[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<ProductsPageInfo>(initialPageInfo);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openTile, setOpenTile] = useState<string | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { roots: rootOrigins, children: originChildren } = buildOriginTree(origins);

  const applyFilters = useCallback(() => {
    setOpenTile(null);
    startTransition(async () => {
      const result = await fetchProductsAction(filtersToPayload(filters), 10, undefined);
      setProducts(result.products);
      setPageInfo(result.pageInfo);
      setAppliedFilters(filters);
    });
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || isLoadingMore || isPending) return;
    setIsLoadingMore(true);
    try {
      const result = await fetchProductsAction(
        filtersToPayload(appliedFilters),
        10,
        pageInfo.endCursor ?? undefined,
      );
      setProducts((prev) => [...prev, ...result.products]);
      setPageInfo(result.pageInfo);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pageInfo, isLoadingMore, isPending, appliedFilters]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenTile(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

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

      <SectionDivider title={dict.menu.products} classes="px-40 my-10" />

      {/* Products */}
      <div className="px-10 pb-16">
        {isPending ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
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

        <div ref={sentinelRef} className="flex items-center justify-center">
          {isLoadingMore && (
            <div className="w-6 h-6 my-10 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div ref={filterBarRef} className="sticky bottom-1 w-[calc(100vw-2rem)] mx-auto">
        <div className="flex border border-stone-800 rounded-full bg-customLightSand">
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
                  className={`w-full flex flex-col items-center justify-center gap-3 py-3 px-2 ${idx != 0 ? "border-l" : ""} border-stone-800 relative
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
                        minVal={filters.priceMin ? Number(filters.priceMin) : 0}
                        maxVal={filters.priceMax ? Number(filters.priceMax) : 10000}
                        onMinChange={(v) => setFilters((p) => ({ ...p, priceMin: v === 0 ? '' : String(v) }))}
                        onMaxChange={(v) => setFilters((p) => ({ ...p, priceMax: v === 10000 ? '' : String(v) }))}
                        formatValue={(v) => `$${v.toLocaleString()}`}
                      />
                    )}
                    {tile.id === 'width' && (
                      <DualRangeSlider
                        min={0} max={1000} step={10}
                        minVal={filters.widthMin ? Number(filters.widthMin) : 0}
                        maxVal={filters.widthMax ? Number(filters.widthMax) : 1000}
                        onMinChange={(v) => setFilters((p) => ({ ...p, widthMin: v === 0 ? '' : String(v) }))}
                        onMaxChange={(v) => setFilters((p) => ({ ...p, widthMax: v === 1000 ? '' : String(v) }))}
                        formatValue={(v) => `${v} cm`}
                      />
                    )}
                    {tile.id === 'height' && (
                      <DualRangeSlider
                        min={0} max={1000} step={10}
                        minVal={filters.heightMin ? Number(filters.heightMin) : 0}
                        maxVal={filters.heightMax ? Number(filters.heightMax) : 1000}
                        onMinChange={(v) => setFilters((p) => ({ ...p, heightMin: v === 0 ? '' : String(v) }))}
                        onMaxChange={(v) => setFilters((p) => ({ ...p, heightMax: v === 1000 ? '' : String(v) }))}
                        formatValue={(v) => `${v} cm`}
                      />
                    )}
                    {tile.id === 'type' && (
                      <ListOptions
                        value={filters.type}
                        onChange={(v) => setFilters((p) => ({ ...p, type: v }))}
                        options={[
                          { value: '', label: t.all },
                          { value: 'carpet', label: t.typeCarpet },
                          { value: 'kilim', label: t.typeKilim },
                          { value: 'bag', label: t.typeBag },
                        ]}
                      />
                    )}
                    {tile.id === 'condition' && (
                      <ListOptions
                        value={filters.condition}
                        onChange={(v) => setFilters((p) => ({ ...p, condition: v }))}
                        options={[
                          { value: '', label: t.all },
                          { value: 'antique', label: t.conditionAntique },
                          { value: 'semi-antique', label: t.conditionSemiAntique },
                          { value: 'new', label: t.conditionNew },
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
            className="text-sm text-black/60 hover:text-black/90 font-medium uppercase transition duration-200 px-5 border-l border-black cursor-pointer"
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
  minVal, maxVal,
  onMinChange, onMaxChange,
  formatValue,
}: {
  min: number; max: number; step: number;
  minVal: number; maxVal: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  formatValue: (v: number) => string;
}) {
  const minPct = ((minVal - min) / (max - min)) * 100;
  const maxPct = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-xs text-stone-500">
        <span>{formatValue(minVal)}</span>
        <span>{formatValue(maxVal)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* track */}
        <div className="absolute w-full h-1.5 rounded-full bg-stone-200" />
        {/* fill */}
        <div
          className="absolute h-1.5 rounded-full bg-stone-800"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* min thumb */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={minVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= maxVal) onMinChange(v);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: minVal >= maxVal - step ? 5 : 3 }}
        />
        {/* max thumb */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={maxVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= minVal) onMaxChange(v);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: 4 }}
        />
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
          <span className="absolute top-0 right-0 text-amber-800 text-xs font-semibold m-3 uppercase">
            {t.soldOut}
          </span>
        )}
      </div>

      <div className="absolute bottom-0 w-full h-24 flex justify-between items-end gap-2 p-4 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-stone-100 bg-white">
          <div className="aspect-square bg-stone-100 animate-pulse" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-stone-100 rounded animate-pulse w-1/3 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
