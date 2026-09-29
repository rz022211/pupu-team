import React, { useState } from 'react';
import { POSDrinkItem, POSCartItem, POSCategory, CompletedOrder } from '../../types/pos';
import { POS_DRINKS } from '../../data/posData';
import { CustomizationModal } from './CustomizationModal';
import { CheckoutReceiptModal } from './CheckoutReceiptModal';
import { Search, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface POSCashierProps {
  cartItems: POSCartItem[];
  onAddToCart: (item: POSCartItem) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCompleteOrder: (order: CompletedOrder) => void;
}

const CATEGORIES: { id: POSCategory; label: string }[] = [
  { id: 'all', label: '全部飲品' },
  { id: 'milk-tea', label: '鮮奶茶/厚奶' },
  { id: 'pure-tea', label: '原葉純茶' },
  { id: 'cheese-foam', label: '芝士奶蓋' },
  { id: 'specialty', label: '職人特調' },
  { id: 'chewy-dessert', label: '慢熬咀嚼' },
  { id: 'seasonal', label: '季節限定' },
];

export const POSCashier: React.FC<POSCashierProps> = ({
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<POSCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [configuringDrink, setConfiguringDrink] = useState<POSDrinkItem | null>(null);
  const [orderType, setOrderType] = useState<'外帶' | '內用' | '外送'>('外帶');
  const [orderNote, setOrderNote] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(0); // e.g. 0 or 15 TWD
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Filter drinks
  const filteredDrinks = POS_DRINKS.filter((drink) => {
    const matchCategory = selectedCategory === 'all' || drink.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      drink.name.includes(searchQuery.trim()) ||
      drink.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drink.teaBase.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  // Financial calculations in TWD
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.itemUnitPrice * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discountRate);

  const handleCardClick = (drink: POSDrinkItem) => {
    bobaAudio.playBobaDrop();
    setConfiguringDrink(drink);
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden select-none bg-[#0F1014]">
      {/* Left 8-col: Drink Menu Catalog & Filters */}
      <div className="flex-1 flex flex-col border-r border-[#22252F] overflow-hidden">
        {/* Top Controls: Search & Category Segments */}
        <div className="p-3 sm:p-4 bg-[#14161D] border-b border-[#22252F] space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋飲品名稱、原葉基底或英文 (快捷鍵 /)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-stone-400 font-mono hidden sm:block whitespace-nowrap">
              共 {filteredDrinks.length} 款品項
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-[#1C1F29] border border-[#282C38] text-stone-300 hover:text-white hover:bg-[#252A36]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drink Cards Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredDrinks.map((drink) => (
              <div
                key={drink.id}
                onClick={() => handleCardClick(drink)}
                className="group relative bg-[#171922] hover:bg-[#1E212D] border border-[#262A37] hover:border-amber-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Drink Picture Card Header */}
                <div className="relative aspect-[4/3] w-full bg-[#1B1E29] overflow-hidden">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171922] via-transparent to-black/40" />

                  {/* Top Left Tag */}
                  {drink.tags.length > 0 && (
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-amber-200 text-[10px] px-2 py-0.5 rounded-md font-medium border border-amber-500/30">
                      {drink.tags[0]}
                    </div>
                  )}

                  {/* Top Right Price Badge */}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-amber-400 font-mono font-bold text-xs px-2 py-0.5 rounded-md border border-amber-500/30 shadow-xs">
                    NT$ {drink.basePrice}
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    {/* Drink Name */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: drink.color }}
                      />
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {drink.name}
                      </h4>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono line-clamp-1">
                      {drink.nameEn}
                    </div>

                    {/* Tea Base */}
                    <div className="text-[11px] text-stone-400 mt-1.5 line-clamp-1">
                      基底：{drink.teaBase}
                    </div>
                  </div>

                  {/* Tags and Config Prompt */}
                  <div className="mt-2.5 pt-2 border-t border-[#232734] flex items-center justify-between">
                    <span className="text-[10px] text-stone-500 truncate max-w-[80px]">
                      {drink.tags[1] || '職人手作'}
                    </span>

                    <span className="text-[10px] sm:text-[11px] text-amber-400 font-medium group-hover:text-amber-300 flex items-center gap-0.5">
                      點選配置 <Plus className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right 4-col: Cart & Order Summary */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-[#14161C] flex flex-col shrink-0 border-t lg:border-t-0 border-[#22252F]">
        {/* Cart Header */}
        <div className="p-3.5 border-b border-[#22252F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">點單購物清單 (Cart)</h3>
            <span className="text-xs font-mono text-stone-400">
              ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} 杯)
            </span>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('確定要清空所有已點飲品嗎？')) {
                  onClearCart();
                }
              }}
              className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
            >
              清空點單
            </button>
          )}
        </div>

        {/* Order Type Toggle: 外帶 / 內用 / 外送 */}
        <div className="p-3 bg-[#111318] border-b border-[#22252F] flex items-center gap-1.5">
          {(['外帶', '內用', '外送'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                orderType === type
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-[#181A22] border border-[#272B37] text-stone-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Cart Item List or Exact Empty State */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {cartItems.length === 0 ? (
            /* EXACT REQUIRED EMPTY STATE TEXT */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1F2A] border border-[#282C3C] text-stone-500 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-200">尚未加入任何飲品</h4>
                <p className="text-xs text-stone-400 max-w-[220px] leading-relaxed">
                  點擊左側飲品卡片即可配置冰塊、甜度與加料
                </p>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-[#1A1D27] border border-[#262A37] rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    {item.drink.image && (
                      <img
                        src={item.drink.image}
                        alt={item.drink.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-[#2B2F3D] shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">{item.drink.name}</span>
                        <span className="text-[10px] font-mono bg-[#252938] text-amber-300 px-1 py-0.2 rounded font-semibold">
                          {item.size === 'L' ? '大杯 700ml' : '中杯 500ml'}
                        </span>
                      </div>

                      {/* Customization Details */}
                      <div className="text-[11px] text-stone-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>{item.ice}</span>
                        <span>·</span>
                        <span>{item.sweetness.split('(')[0]}</span>
                      </div>

                      {/* Toppings list */}
                      {item.toppings.length > 0 && (
                        <div className="text-[11px] text-amber-400 mt-0.5">
                          +{item.toppings.map((t) => `${t.name}($${t.price})`).join(' + ')}
                        </div>
                      )}

                      {item.note && (
                        <div className="text-[10px] text-stone-500 italic mt-0.5">
                          備註：{item.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-amber-400 shrink-0">
                    NT$ {item.itemUnitPrice * item.quantity}
                  </span>
                </div>

                {/* Quantity Stepper & Delete Button */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#232735]">
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>刪除</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#14161E] border border-[#272B38] px-2 py-0.5 rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                      className="p-0.5 text-stone-400 hover:text-white"
                      title="減少"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      className="p-0.5 text-stone-400 hover:text-white"
                      title="增加"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary & Live Calculations */}
        <div className="p-3.5 bg-[#111318] border-t border-[#22252F] space-y-3">
          {/* Discount rate quick toggles */}
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>促銷優惠折抵</span>
            <div className="flex items-center gap-1.5">
              {[0, 10, 15].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setDiscountRate(disc)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    discountRate === disc
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-[#1C1F2A] text-stone-400 hover:text-white'
                  }`}
                >
                  {disc === 0 ? '無' : `-$${disc}`}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Calculation Lines in TWD */}
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-stone-400">
              <span>品項小計 (Subtotal)</span>
              <span>NT$ {subtotal}</span>
            </div>
            {discountRate > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>促銷折抵 (Discount)</span>
                <span>-NT$ {discountRate}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-[#232735]">
              <span>應付金額 (Total TWD)</span>
              <span className="text-amber-400 font-mono">NT$ {total}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckoutClick}
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>立即結帳收款 (Checkout) · NT$ {total}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drink Customization Modal */}
      <CustomizationModal
        drink={configuringDrink}
        onClose={() => setConfiguringDrink(null)}
        onConfirm={onAddToCart}
      />

      {/* Checkout & Thermal Receipt Modal */}
      <CheckoutReceiptModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        orderType={orderType}
        orderNote={orderNote}
        subtotal={subtotal}
        discount={discountRate}
        total={total}
        onOrderComplete={(order) => {
          onCompleteOrder(order);
          onClearCart();
        }}
      />
    </div>
  );
};
