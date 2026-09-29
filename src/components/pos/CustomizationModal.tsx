import React, { useState } from 'react';
import { POSDrinkItem, POSTopping, IceOption, SweetnessOption, POSCartItem } from '../../types/pos';
import { POS_TOPPINGS } from '../../data/posData';
import { X, Plus, Minus, Check } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface CustomizationModalProps {
  drink: POSDrinkItem | null;
  onClose: () => void;
  onConfirm: (item: POSCartItem) => void;
}

const ICE_OPTIONS: IceOption[] = ['正常冰', '少冰', '微冰', '去冰', '溫熱'];
const SWEETNESS_OPTIONS: SweetnessOption[] = [
  '正常糖(100%)',
  '少糖(70%)',
  '半糖(50%)',
  '微糖(30%)',
  '一分糖(10%)',
  '無糖(0%)',
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  drink,
  onClose,
  onConfirm,
}) => {
  if (!drink) return null;

  const [size, setSize] = useState<'M' | 'L'>('M');
  const [ice, setIce] = useState<IceOption>('微冰');
  const [sweetness, setSweetness] = useState<SweetnessOption>('半糖(50%)');
  const [selectedToppings, setSelectedToppings] = useState<POSTopping[]>(
    drink.category === 'milk-tea' && drink.id.includes('boba')
      ? [POS_TOPPINGS[0]]
      : []
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  // Calculate unit price
  const sizeCost = size === 'L' ? drink.largePriceOffset : 0;
  const toppingsCost = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = drink.basePrice + sizeCost + toppingsCost;
  const totalPrice = unitPrice * quantity;

  const handleToggleTopping = (topping: POSTopping) => {
    const exists = selectedToppings.some((t) => t.id === topping.id);
    if (exists) {
      setSelectedToppings((prev) => prev.filter((t) => t.id !== topping.id));
    } else {
      bobaAudio.playBobaDrop();
      setSelectedToppings((prev) => [...prev, topping]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bobaAudio.playLiquidPour();
    const cartItem: POSCartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      drink,
      size,
      ice,
      sweetness,
      toppings: selectedToppings,
      quantity,
      itemUnitPrice: unitPrice,
      note: note.trim() || undefined,
    };
    onConfirm(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#181A20] border border-[#2D323E] rounded-2xl shadow-2xl text-stone-100 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2F3B] bg-[#14161C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {drink.image ? (
              <img
                src={drink.image}
                alt={drink.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 shadow-md shrink-0"
              />
            ) : (
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: drink.color }}
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {drink.name}
                </h3>
                <span className="text-xs text-amber-400/90 font-medium">· {drink.teaBase}</span>
              </div>
              <p className="text-xs text-stone-400 font-mono truncate">{drink.nameEn}</p>
              <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{drink.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-[#252A36] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Configuration Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Size Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              容量規格 (Cup Size)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSize('M')}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  size === 'M'
                    ? 'bg-amber-600/15 border-amber-500 text-amber-300 font-semibold shadow-xs'
                    : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                }`}
              >
                <div>
                  <div className="text-xs">中杯 (500ml)</div>
                  <div className="text-[11px] text-stone-400 font-normal">標準經典容量</div>
                </div>
                <span className="font-mono text-xs">NT$ {drink.basePrice}</span>
              </button>

              <button
                type="button"
                onClick={() => setSize('L')}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  size === 'L'
                    ? 'bg-amber-600/15 border-amber-500 text-amber-300 font-semibold shadow-xs'
                    : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                }`}
              >
                <div>
                  <div className="text-xs">大杯 (700ml)</div>
                  <div className="text-[11px] text-stone-400 font-normal">極致享受 (+NT$ 10)</div>
                </div>
                <span className="font-mono text-xs">NT$ {drink.basePrice + drink.largePriceOffset}</span>
              </button>
            </div>
          </div>

          {/* 2. Ice Level (冰量) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                冰量配置 (Ice Level)
              </label>
              <span className="text-xs font-semibold text-amber-400">{ice}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ICE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    bobaAudio.playIceClink();
                    setIce(opt);
                  }}
                  className={`py-2 px-1 text-center text-xs font-medium rounded-xl border transition-all ${
                    ice === opt
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-semibold'
                      : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sweetness Level (甜度) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                甜度配置 (Sweetness Level)
              </label>
              <span className="text-xs font-semibold text-amber-400">{sweetness}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SWEETNESS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSweetness(opt)}
                  className={`py-2 px-1 text-center text-xs font-medium rounded-xl border transition-all ${
                    sweetness === opt
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-semibold'
                      : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                  }`}
                >
                  {opt.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Toppings (加料 +10/15 TWD) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                職人慢熬加料 (Toppings)
              </label>
              <span className="text-xs text-stone-400">已選 {selectedToppings.length} 項</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POS_TOPPINGS.map((top) => {
                const isSelected = selectedToppings.some((t) => t.id === top.id);
                return (
                  <button
                    type="button"
                    key={top.id}
                    onClick={() => handleToggleTopping(top)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-600/15 border-amber-500/80 text-amber-200'
                        : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border text-xs ${
                          isSelected
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'border-stone-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium">{top.name}</span>
                    </div>

                    <span className="font-mono text-xs font-semibold text-amber-400">
                      +NT$ {top.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Special Notes */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
              飲品客製備註 (Note)
            </label>
            <input
              type="text"
              placeholder="例：自備環保杯(-5元)、珍珠分裝、茶濃..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#14161C] border border-[#2D3240] rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer with Live Price & Quantity Steppers */}
        <div className="p-4 sm:p-5 border-t border-[#2A2F3B] bg-[#14161C] flex flex-wrap items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">數量</span>
            <div className="flex items-center bg-[#1F222B] border border-[#2D3240] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#2A2E3B] rounded-lg transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center text-xs font-mono font-bold text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#2A2E3B] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Price Calculation & Add Button */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <div className="text-[11px] text-stone-400">單杯 NT$ {unitPrice}</div>
              <div className="text-lg font-mono font-bold text-amber-400">
                NT$ {totalPrice}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>加入點單</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
