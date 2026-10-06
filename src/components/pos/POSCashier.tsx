import React, { useState } from 'react';
import { POSDrinkItem, POSCartItem, POSCategory, CompletedOrder, MemberAccount } from '../../types/pos';
import { POS_DRINKS } from '../../data/posData';
import { CustomizationModal } from './CustomizationModal';
import { CheckoutReceiptModal } from './CheckoutReceiptModal';
import { Search, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, AlertCircle, QrCode, User, Award, Ticket, Check, X, Phone, Smartphone } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface POSCashierProps {
  cartItems: POSCartItem[];
  members?: MemberAccount[];
  onAddToCart: (item: POSCartItem) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCompleteOrder: (order: CompletedOrder) => void;
  onOpenStoreContact?: () => void;
  onOpenPublicApplicationPage?: () => void;
  onManualVerifyEmail?: (memberId: string) => void;
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
  members = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteOrder,
  onOpenStoreContact,
  onOpenPublicApplicationPage,
  onManualVerifyEmail,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<POSCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [configuringDrink, setConfiguringDrink] = useState<POSDrinkItem | null>(null);
  const [orderType, setOrderType] = useState<'外帶' | '內用' | '外送'>('外帶');
  const [orderNote, setOrderNote] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(0); // e.g. 0 or 15 TWD
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Member Loyalty state
  const [memberPhoneInput, setMemberPhoneInput] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<MemberAccount | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

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

            {onOpenStoreContact && (
              <button
                onClick={onOpenStoreContact}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1B1D26] hover:bg-[#252837] border border-amber-500/35 hover:border-amber-500 text-amber-300 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
                title="查看門市官方 QR Code 與聯絡方式"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">門市 QR / 官方聯絡</span>
                <span className="sm:hidden">QR</span>
              </button>
            )}

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

        {/* Member Loyalty & Point Accumulation Bar */}
        <div className="p-3 bg-[#13151D] border-b border-[#22252F] space-y-2">
          {!selectedMember ? (
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">顧客報手機號碼確認會員</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-[10px]">每 $50 累積 1 點</span>
                  {onOpenPublicApplicationPage && (
                    <button
                      onClick={onOpenPublicApplicationPage}
                      className="text-[10px] text-amber-300 hover:text-white underline flex items-center gap-0.5"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>線上獨立申請 ↗</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="輸入顧客手機號碼 (例: 0912-345-678)..."
                    value={memberPhoneInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberPhoneInput(val);
                      const clean = val.replace(/[^0-9]/g, '');
                      const matched = members.find(
                        (m) =>
                          m.phone.replace(/[^0-9]/g, '').includes(clean) ||
                          m.name.includes(val)
                      );
                      if (clean.length >= 4 && matched) {
                        setSelectedMember(matched);
                        bobaAudio.playSeal();
                      }
                    }}
                    className="w-full bg-[#1A1D27] border border-[#2B2F40] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {memberPhoneInput && (
                    <button
                      onClick={() => setMemberPhoneInput('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                {members.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const m = members.find((x) => x.id === e.target.value);
                      setSelectedMember(m || null);
                      if (m) {
                        setMemberPhoneInput(m.phone);
                        bobaAudio.playIceClink();
                      }
                    }}
                    className="bg-[#1A1D27] border border-[#2B2F40] rounded-xl px-2 py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500 max-w-[120px]"
                  >
                    <option value="">快速選會員</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name.split(' ')[0]} ({m.phone.slice(-4)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quick sample phone tags for fast one-click simulation */}
              <div className="mt-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
                <span className="text-stone-500 shrink-0">快填示範:</span>
                {members.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setMemberPhoneInput(m.phone);
                      bobaAudio.playSeal();
                    }}
                    className={`px-1.5 py-0.5 rounded-md font-mono shrink-0 transition-colors ${
                      !m.isEmailVerified
                        ? 'bg-amber-950/60 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
                        : 'bg-[#181B24] border border-[#2B2F3D] text-stone-300 hover:text-white'
                    }`}
                    title={!m.isEmailVerified ? '待管理者確認會員' : '已驗證會員'}
                  >
                    {m.phone} ({m.name.split(' ')[0]}{!m.isEmailVerified ? '·待審' : ''})
                  </button>
                ))}
              </div>

              {memberPhoneInput.replace(/[^0-9]/g, '').length >= 8 &&
                !members.some((m) => m.phone.replace(/[^0-9]/g, '').includes(memberPhoneInput.replace(/[^0-9]/g, ''))) && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] bg-amber-950/40 border border-amber-600/30 px-2.5 py-1 rounded-xl">
                    <span className="text-amber-300">查無此手機會員！</span>
                    {onOpenPublicApplicationPage && (
                      <button
                        onClick={onOpenPublicApplicationPage}
                        className="text-amber-200 hover:text-white font-bold underline flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>前往獨立網頁為顧客申辦</span>
                      </button>
                    )}
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-[#1A1D27] border border-amber-500/40 rounded-xl p-2.5 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedMember.tier === 'gold'
                        ? 'bg-amber-400'
                        : selectedMember.tier === 'silver'
                        ? 'bg-blue-400'
                        : 'bg-stone-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">{selectedMember.name}</span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    ({selectedMember.phone})
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    {selectedMember.tier === 'gold' ? '金級茶師' : selectedMember.tier === 'silver' ? '銀級茶客' : '銅級茶友'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberPhoneInput('');
                    setSelectedCouponId(null);
                  }}
                  className="text-stone-400 hover:text-white p-0.5"
                  title="移除會員"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-300">
                <span>目前點數: <strong className="text-amber-400 font-mono">{selectedMember.points} 點</strong></span>
                <span className="text-emerald-400 font-medium">本單將累積 +{Math.floor(total / 50)} 點</span>
              </div>

              {/* Member verification status & Manager manual verification */}
              <div className="text-[10px] text-stone-400 flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span>信箱狀態：</span>
                  {selectedMember.isEmailVerified ? (
                    <strong className="text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 已驗證 (管理者已確認)
                    </strong>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <strong className="text-amber-400">待管理者確認</strong>
                      {onManualVerifyEmail && (
                        <button
                          onClick={() => {
                            bobaAudio.playLiquidPour();
                            onManualVerifyEmail(selectedMember.id);
                            setSelectedMember((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    isEmailVerified: true,
                                    verificationStatus: 'verified',
                                    points: prev.points + 15,
                                    coupons: [
                                      ...prev.coupons,
                                      {
                                        id: `coup-cashier-pos-${Date.now()}`,
                                        title: '管理者確認禮 $20 折抵券',
                                        description: '單筆消費滿 $100 可折抵 $20',
                                        discountAmount: 20,
                                        pointsRequired: 0,
                                        used: false,
                                        expiresAt: '2026-12-31',
                                      },
                                    ],
                                  }
                               : null
                            );
                          }}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md transition-colors shadow-xs flex items-center gap-0.5"
                          title="管理者現場一鍵確認通過信箱審核"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>管理者現場確認 (+15點)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-emerald-300 font-mono font-medium">✓ 手機已確認</span>
              </div>

              {/* Usable Coupon Quick Selection */}
              {selectedMember.coupons.filter((c) => !c.used).length > 0 && (
                <div className="pt-1 border-t border-[#25293A] flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">使用專屬抵用券:</span>
                  <div className="flex items-center gap-1">
                    {selectedMember.coupons
                      .filter((c) => !c.used)
                      .slice(0, 2)
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            if (selectedCouponId === c.id) {
                              setSelectedCouponId(null);
                              setDiscountRate(0);
                            } else {
                              setSelectedCouponId(c.id);
                              setDiscountRate(c.discountAmount);
                              bobaAudio.playSeal();
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            selectedCouponId === c.id
                              ? 'bg-amber-600 text-white font-bold'
                              : 'bg-[#14161E] text-amber-300 border border-amber-600/40 hover:bg-[#202434]'
                          }`}
                        >
                          {selectedCouponId === c.id ? `已折$${c.discountAmount} ✓` : `折$${c.discountAmount}`}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
        member={selectedMember}
        members={members}
        onSelectMember={setSelectedMember}
        pointsEarned={selectedMember ? Math.floor(total / 50) : 0}
        onOrderComplete={(order) => {
          onCompleteOrder(order);
          onClearCart();
          setSelectedCouponId(null);
          setDiscountRate(0);
          setSelectedMember(null);
          setMemberPhoneInput('');
        }}
      />
    </div>
  );
};
