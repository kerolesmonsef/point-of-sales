import React, { useState } from "react";
import {
    IconShoppingBag,
    IconPhoto,
    IconLayoutGrid,
    IconList,
    IconFilter,
    IconCheck,
} from "@tabler/icons-react";
import { getProductImageUrl } from "@/Utils/imageUrl";
import { formatCurrency } from '@/Utils/formatCurrency';
import WarehouseStockMenu from "@/Components/WarehouseStockMenu";

// Shared image block (badges/overlay differ by layout)
function ProductImage({ product, layout, hasStock }) {
    return (
        <>
            {product.image ? (
                <img
                    src={getProductImageUrl(product.image)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <IconPhoto
                        size={layout === "list" ? 18 : 20}
                        className="text-slate-300 dark:text-slate-600"
                    />
                </div>
            )}

            {!hasStock && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <span className="px-2 py-0.5 bg-danger-500 text-white text-[10px] font-semibold rounded-full">
                        {__("Out of stock")}
                    </span>
                </div>
            )}
        </>
    );
}

// Price block (shared between layouts)
function ProductPrice({ showPromo, basePrice, promoPrice, sellPrice, compact }) {
    const priceClass = compact
        ? "text-sm font-bold text-primary-600 dark:text-primary-400"
        : "text-base font-bold text-primary-600 dark:text-primary-400";

    return (
        <div>
            {showPromo && (
                <p className="text-[10px] text-slate-400 line-through">
                    {formatCurrency(basePrice)}
                </p>
            )}
            <p className={priceClass}>
                {formatCurrency(showPromo ? promoPrice : sellPrice)}
            </p>
        </div>
    );
}

// Single Product Card (supports grid + list layouts)
function ProductCard({ product, onAddToCart, isAdding, layout = "grid" }) {
    const hasStock = product.stock > 0;
    const lowStock = product.stock > 0 && product.stock <= 5;
    const promoBadge = product.pricing_badge;
    const promoPrice = Number(promoBadge?.promo_price || 0);
    const basePrice = Number(promoBadge?.base_price || product.sell_price || 0);
    const showPromo = promoBadge && promoPrice > 0 && promoPrice < basePrice;
    const showBadge = Boolean(promoBadge?.label);
    const isList = layout === "list";

    return (
        <button
            onClick={() => hasStock && onAddToCart(product)}
            disabled={isAdding}
            title={product.title}
            className={`
                group relative bg-white dark:bg-slate-900
                rounded-2xl border border-slate-200 dark:border-slate-800
                transition-all duration-200
                ${
                    isList
                        ? "flex items-center gap-3 p-2 w-full"
                        : "flex flex-col overflow-hidden"
                }
                ${
                    hasStock
                        ? "hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                }
            `}
        >
            {/* Product Image */}
            <div
                className={`
                    relative bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0
                    ${isList ? "w-16 h-16 rounded-xl" : "aspect-square w-full"}
                `}
            >
                <ProductImage
                    product={product}
                    layout={layout}
                    hasStock={hasStock}
                />

                {/* Stock / Promo Badges (grid only, cramped on list image) */}
                {!isList && (
                    <>
                        {lowStock && (
                            <span className="absolute top-1 right-1 px-1.5 py-px text-[10px] font-medium bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400 rounded-full">
                                {__("Remaining")} {product.stock}
                            </span>
                        )}
                        {showBadge && (
                            <span className="absolute left-1 top-1 max-w-[60%] truncate rounded-full bg-rose-500 px-1.5 py-px text-[10px] font-semibold text-white shadow">
                                {promoBadge.label}
                            </span>
                        )}
                    </>
                )}

                {/* Hover Add Indicator (centered on image) */}
                {hasStock && !isList && (
                    <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                        <div className="bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                            <IconShoppingBag size={15} />
                        </div>
                    </div>
                )}
            </div>

            {/* List layout: title + price beside image */}
            {isList && (
                <>
                    <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">
                            {product.title}
                        </h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <ProductPrice
                                showPromo={showPromo}
                                basePrice={basePrice}
                                promoPrice={promoPrice}
                                sellPrice={product.sell_price}
                                compact
                            />
                            {lowStock && (
                                <span className="text-[10px] font-medium text-warning-600 dark:text-warning-400">
                                    {__("Remaining")} {product.stock}
                                </span>
                            )}
                            {showBadge && (
                                <span className="text-[10px] font-semibold text-rose-500">
                                    {promoBadge.label}
                                </span>
                            )}
                            <WarehouseStockMenu
                                product={product}
                                className="bg-transparent border-transparent h-6 px-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                            />
                        </div>
                    </div>
                    {hasStock && (
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 shadow-lg">
                            <IconShoppingBag size={15} />
                        </div>
                    )}
                </>
            )}

            {/* Grid layout: title + price below image */}
            {!isList && (
                <div className="flex-1 p-2 flex flex-col justify-between min-h-[56px] gap-1">
                    <h3 className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">
                        {product.title}
                    </h3>
                    <ProductPrice
                        showPromo={showPromo}
                        basePrice={basePrice}
                        promoPrice={promoPrice}
                        sellPrice={product.sell_price}
                        compact
                    />
                    <WarehouseStockMenu
                        product={product}
                        className="bg-transparent border-transparent h-6 px-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    />
                </div>
            )}
        </button>
    );
}

// Category Tab Button
function CategoryTab({ category, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200 min-h-touch
                ${
                    isActive
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }
            `}
        >
            {category.name}
        </button>
    );
}

// Search Input
function SearchInput({
    value,
    onChange,
    onSearch,
    isSearching,
    placeholder,
    inputRef,
}) {
    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                placeholder={
                    placeholder ||
                    __("Search products or scan barcode... (/ to focus)")
                }
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500
                    transition-all text-base"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <IconShoppingBag size={20} className="text-slate-400" />
                )}
            </div>
        </div>
    );
}

// View Toggle (Grid / List)
function ViewToggle({ viewMode, onViewModeChange }) {
    const options = [
        { value: "grid", icon: IconLayoutGrid, label: __("Grid") },
        { value: "list", icon: IconList, label: __("List") },
    ];

    return (
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onViewModeChange(value)}
                    title={label}
                    aria-label={label}
                    className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === value
                            ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                >
                    <Icon size={18} />
                </button>
            ))}
        </div>
    );
}

// Filter Menu (show_zero_stock popover)
function FilterMenu({ showZeroStock, onShowZeroStockChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title={__("Filters")}
                aria-label={__("Filters")}
                aria-expanded={open}
                className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all border ${
                    open || showZeroStock
                        ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary-600 hover:border-primary-300 dark:hover:border-primary-700"
                }`}
            >
                <IconFilter size={18} />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-20 w-64 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-none">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {__("Product Filters")}
                        </p>
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <span className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showZeroStock}
                                    onChange={(e) =>
                                        onShowZeroStockChange(e.target.checked)
                                    }
                                    className="peer sr-only"
                                />
                                <span
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                        showZeroStock
                                            ? "bg-primary-500 border-primary-500 text-white"
                                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent"
                                    }`}
                                >
                                    <IconCheck size={14} strokeWidth={3} />
                                </span>
                            </span>
                            <span className="flex-1">
                                <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {__("Show zero-stock products")}
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                    {__("Include products with no stock available.")}
                                </span>
                            </span>
                        </label>
                    </div>
                </>
            )}
        </div>
    );
}

// Main ProductGrid Component
export default function ProductGrid({
    products = [],
    categories = [],
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    onSearchEnter,
    isSearching,
    onAddToCart,
    addingProductId,
    searchInputRef,
    viewMode = "grid",
    onViewModeChange,
    showZeroStock = false,
    onShowZeroStockChange,
}) {
    const normalizedSelectedCategory =
        selectedCategory === null ? null : Number(selectedCategory);

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <SearchInput
                            value={searchQuery}
                            onChange={onSearchChange}
                            onSearch={onSearchEnter}
                            isSearching={isSearching}
                            placeholder={__("Search products or scan barcode... (press / to focus)")}
                            inputRef={searchInputRef}
                        />
                    </div>
                    <FilterMenu
                        showZeroStock={showZeroStock}
                        onShowZeroStockChange={onShowZeroStockChange}
                    />
                    <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                    <CategoryTab
                        category={{ id: null, name: __("All") }}
                        isActive={normalizedSelectedCategory === null}
                        onClick={() => onCategoryChange(null)}
                    />
                    {categories.map((category) => (
                        <CategoryTab
                            key={category.id}
                            category={category}
                            isActive={
                                normalizedSelectedCategory ===
                                Number(category.id)
                            }
                            onClick={() => onCategoryChange(Number(category.id))}
                        />
                    ))}
                </div>
            </div>

            {/* Products Grid / List */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                {products.length > 0 ? (
                    viewMode === "list" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    layout="list"
                                    onAddToCart={onAddToCart}
                                    isAdding={addingProductId === product.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    isAdding={addingProductId === product.id}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <IconShoppingBag
                            size={48}
                            strokeWidth={1.5}
                            className="mb-3"
                        />
                        <p className="text-sm">
                            {searchQuery
                                ? __("Product not found")
                                : __("No products")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export sub-components
ProductGrid.Card = ProductCard;
ProductGrid.CategoryTab = CategoryTab;
ProductGrid.SearchInput = SearchInput;
ProductGrid.ViewToggle = ViewToggle;
