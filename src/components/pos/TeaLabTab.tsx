import React, { useState } from 'react';
import { CustomBobaDrink } from '../../types/boba';
import { POSCartItem } from '../../types/pos';
import { TEA_BASES, MILK_OPTIONS, TOPPINGS } from '../../data/bobaMenu';
import { BobaPhysicsCanvas } from '../BobaPhysicsCanvas';
import { Sparkles, ArrowRight, RotateCcw, Droplets, Flame } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface TeaLabTabProps {
  onSendToPOSCart: (item: any) => void;
}

const DEFAULT_LAB_DRINK: CustomBobaDrink = {
  id: 'lab-drink',
  name: '茶研所·極上炭焙黑糖鮮奶',
  size: 'regular',
  teaBase: TEA_BASES[0],
  milk: MILK_OPTIONS[0],
  sweetness: 50,
  ice: 'regular',
  toppings: [TOPPINGS[0]],
  syrupDrizzle: 'brown-sugar',
  price: 75,
  calories: 360,
  isSealed: false,
  sipCount: 0,
};

export const TeaLabTab: React.FC<TeaLabTabProps> = ({ onSendToPOSCart }) => {
  const [labDrink, setLabDrink] = useState<CustomBobaDrink>(DEFAULT_LAB_DRINK);

  const handleUpdate = (updated: Partial<CustomBobaDrink>) => {
    setLabDrink((prev) => ({ ...prev, ...updated }));
  };

  const handleSendToRegister = () => {
    bobaAudio.playSeal();
    const cartItem = {
      cartItemId: `lab-${Date.now()}`,
      drink: {
        id: 'lab-custom',
        name: labDrink.name,
        nameEn: 'Artisanal Lab Formulation',
        category: 'specialty' as const,
        basePrice: labDrink.price,
        largePriceOffset: 10,
        color: labDrink.teaBase.color,
        description: `茶底：${labDrink.teaBase.name} · 乳源：${labDrink.milk.name}`,
        teaBase: labDrink.teaBase.name,
        tags: ['茶研所特調'],
      },
      size: labDrink.size === 'large' ? ('L' as const) : ('M' as const),
      ice:
        labDrink.ice === 'warm'
          ? '溫熱'
          : labDrink.ice === 'no-ice'
          ? '去冰'
          : labDrink.ice === 'light'
          ? '微冰'
          : labDrink.ice === 'extra'
          ? '正常冰'
          : '少冰',
      sweetness:
        labDrink.sweetness === 0
          ? '無糖(0%)'
          : labDrink.sweetness === 30
          ? '微糖(30%)'
          : labDrink.sweetness === 50
          ? '半糖(50%)'
          : labDrink.sweetness === 70
          ? '少糖(70%)'
          : '正常糖(100%)',
      toppings: labDrink.toppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: 10,
        defaultGrams: 80,
      })),
      quantity: 1,
      itemUnitPrice: labDrink.price,
      note: '茶研所客製手調',
    };

    onSendToPOSCart(cartItem);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#0F1014] text-stone-100 overflow-y-auto select-none space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22252F]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Artisanal Sensory Physics & Formulation Lab
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            茶研所 · 液體物理與感官調飲台
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            提供吧檯手即時模擬茶湯比重、小農乳化分層、慢熬粉圓彈力碰撞與吸管品飲感官體驗。
          </p>
        </div>

        <button
          onClick={handleSendToRegister}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>送至前台收銀點單 (NT$ {labDrink.price})</span>
        </button>
      </div>

      {/* Physics Canvas & Lab Mixer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Physics Cup Canvas */}
        <div className="lg:col-span-5 bg-[#14161D] border border-[#262A37] rounded-3xl p-6 flex flex-col items-center justify-center min-h-[520px] shadow-sm">
          <BobaPhysicsCanvas
            drink={labDrink}
            onDrinkChange={handleUpdate}
          />
        </div>

        {/* Right: Formulation Palette */}
        <div className="lg:col-span-7 bg-[#14161D] border border-[#262A37] rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#22252F]">
            <div>
              <span className="text-xs text-amber-500 font-semibold uppercase">調配品名</span>
              <input
                type="text"
                value={labDrink.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="block text-base font-bold text-white bg-transparent border-b border-transparent hover:border-amber-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">試算定價</span>
              <span className="text-xl font-mono font-bold text-amber-400">
                NT$ {labDrink.price}
              </span>
            </div>
          </div>

          {/* Tea Base Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              1. 產地原葉基底 (Single-Origin Tea Base)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {TEA_BASES.map((tea) => (
                <button
                  key={tea.id}
                  onClick={() => {
                    bobaAudio.playLiquidPour();
                    handleUpdate({ teaBase: tea });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    labDrink.teaBase.id === tea.id
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-[#1A1D27] border-[#252937] text-stone-300 hover:bg-[#202432]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tea.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{tea.name}</div>
                    <div className="text-[10px] text-stone-400 truncate">{tea.origin}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Milk & Cream Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              2. 乳源與雲頂 (Milk & Clouds)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MILK_OPTIONS.map((milk) => (
                <button
                  key={milk.id}
                  onClick={() => {
                    bobaAudio.playLiquidPour();
                    handleUpdate({ milk });
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    labDrink.milk.id === milk.id
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                      : 'bg-[#1A1D27] border-[#252937] text-stone-300 hover:bg-[#202432]'
                  }`}
                >
                  <div className="text-xs font-medium truncate">{milk.name}</div>
                  <div className="text-[10px] text-stone-400">{milk.badge || '醇厚乳香'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Drizzle & Wall Coating */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              3. 杯壁掛蜜工藝 (Syrup Drizzle)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: '無掛蜜' },
                { id: 'brown-sugar', label: '沖繩黑糖琥珀掛壁' },
                { id: 'strawberry', label: '天然草莓果泥掛壁' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleUpdate({ syrupDrizzle: d.id as any })}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center ${
                    labDrink.syrupDrizzle === d.id
                      ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                      : 'bg-[#1A1D27] border-[#252937] text-stone-300 hover:bg-[#202432]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
