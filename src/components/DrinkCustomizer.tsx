import React, { useState } from 'react';
import { CustomBobaDrink, SweetnessLevel, IceLevel, CupSize } from '../types/boba';
import { TEA_BASES, MILK_OPTIONS, TOPPINGS } from '../data/bobaMenu';
import { bobaAudio } from '../utils/audio';
import { Check, Plus, Minus, Flame, Sparkles, Coffee, Droplets } from 'lucide-react';

interface DrinkCustomizerProps {
  drink: CustomBobaDrink;
  onChange: (updated: Partial<CustomBobaDrink>) => void;
  onAddToCart: () => void;
}

export const DrinkCustomizer: React.FC<DrinkCustomizerProps> = ({
  drink,
  onChange,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'tea' | 'milk' | 'sweet-ice' | 'toppings'>('tea');

  // Recalculate price and calories
  const updateDrinkWithCalculatedMetrics = (partial: Partial<CustomBobaDrink>) => {
    const nextDrink = { ...drink, ...partial };

    const basePrice = nextDrink.teaBase.basePrice;
    const sizeMultiplier = nextDrink.size === 'large' ? 1.0 : 0.0;
    const milkPrice = nextDrink.milk.price;
    const toppingsPrice = nextDrink.toppings.reduce((acc, t) => acc + t.price, 0);
    const drizzlePrice = nextDrink.syrupDrizzle !== 'none' ? 0.6 : 0;
    const totalPrice = basePrice + sizeMultiplier + milkPrice + toppingsPrice + drizzlePrice;

    // Calorie math
    const baseCalories = 20;
    const sizeCal = nextDrink.size === 'large' ? 1.3 : 1.0;
    const sweetCal = (nextDrink.sweetness / 100) * 140;
    const milkCal = nextDrink.milk.calorieOffset;
    const topCal = nextDrink.toppings.reduce((acc, t) => acc + t.calories, 0);
    const totalCal = Math.round((baseCalories + sweetCal + milkCal + topCal) * sizeCal);

    onChange({
      ...partial,
      price: Math.round(totalPrice * 100) / 100,
      calories: totalCal,
    });
  };

  const handleSelectTea = (teaId: string) => {
    const tea = TEA_BASES.find((t) => t.id === teaId);
    if (!tea) return;
    bobaAudio.playLiquidPour();
    updateDrinkWithCalculatedMetrics({ teaBase: tea });
  };

  const handleSelectMilk = (milkId: string) => {
    const milk = MILK_OPTIONS.find((m) => m.id === milkId);
    if (!milk) return;
    bobaAudio.playLiquidPour();
    updateDrinkWithCalculatedMetrics({ milk });
  };

  const handleSelectSweetness = (level: SweetnessLevel) => {
    updateDrinkWithCalculatedMetrics({ sweetness: level });
  };

  const handleSelectIce = (level: IceLevel) => {
    bobaAudio.playIceClink();
    updateDrinkWithCalculatedMetrics({ ice: level });
  };

  const handleToggleTopping = (toppingId: string) => {
    const exists = drink.toppings.some((t) => t.id === toppingId);
    let nextToppings;
    if (exists) {
      nextToppings = drink.toppings.filter((t) => t.id !== toppingId);
    } else {
      const topToAdd = TOPPINGS.find((t) => t.id === toppingId);
      if (!topToAdd) return;
      bobaAudio.playBobaDrop();
      nextToppings = [...drink.toppings, topToAdd];
    }
    updateDrinkWithCalculatedMetrics({ toppings: nextToppings });
  };

  const handleToggleDrizzle = (drizzle: 'none' | 'brown-sugar' | 'honey' | 'strawberry') => {
    updateDrinkWithCalculatedMetrics({ syrupDrizzle: drizzle });
  };

  // Flavor balance meters
  const bodyScore = drink.teaBase.bodyScore;
  const sweetScore = Math.min(5, Math.max(1, Math.round(drink.sweetness / 25) + 1));
  const creamScore = drink.milk.creamyScore;
  const chewScore = drink.toppings.reduce((acc, t) => Math.max(acc, t.chewiness), 1);

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFC8]/60 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Header & Size Picker */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EADFC7]/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A67C52]">
              Atelier Customizer
            </span>
            <input
              type="text"
              value={drink.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="block mt-0.5 text-xl font-semibold font-display text-[#2B1D12] bg-transparent border-b border-transparent hover:border-[#D1B89D] focus:border-[#966838] focus:outline-none transition-colors"
              title="Click to rename drink"
            />
          </div>

          {/* Cup Size Selector */}
          <div className="flex items-center bg-[#EEE7DC] p-1 rounded-xl">
            <button
              onClick={() => updateDrinkWithCalculatedMetrics({ size: 'regular' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                drink.size === 'regular'
                  ? 'bg-[#FAF8F5] text-[#2B1D12] shadow-sm'
                  : 'text-[#6B5A4B] hover:text-[#2B1D12]'
              }`}
            >
              500ml Regular
            </button>
            <button
              onClick={() => updateDrinkWithCalculatedMetrics({ size: 'large' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                drink.size === 'large'
                  ? 'bg-[#FAF8F5] text-[#2B1D12] shadow-sm'
                  : 'text-[#6B5A4B] hover:text-[#2B1D12]'
              }`}
            >
              700ml Grande (+$1.00)
            </button>
          </div>
        </div>

        {/* Sensory Balance Radar Indicators */}
        <div className="grid grid-cols-4 gap-2 my-4 py-2.5 px-3 bg-[#F4EDE2] rounded-xl text-center text-xs">
          <div>
            <div className="text-[11px] text-[#7A6A5A]">Tea Body</div>
            <div className="font-semibold text-[#3D2C1E]">{bodyScore}/5</div>
          </div>
          <div>
            <div className="text-[11px] text-[#7A6A5A]">Sweetness</div>
            <div className="font-semibold text-[#3D2C1E]">{sweetScore}/5</div>
          </div>
          <div>
            <div className="text-[11px] text-[#7A6A5A]">Creaminess</div>
            <div className="font-semibold text-[#3D2C1E]">{creamScore}/5</div>
          </div>
          <div>
            <div className="text-[11px] text-[#7A6A5A]">Chew Factor</div>
            <div className="font-semibold text-[#3D2C1E]">{chewScore}/5</div>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#E8DFC8]/60 pb-3 mb-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tea')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'tea'
                ? 'bg-[#3D2C1E] text-white shadow-sm'
                : 'text-[#6B5A4B] hover:bg-[#EFE8DD]'
            }`}
          >
            1. Single-Origin Tea
          </button>
          <button
            onClick={() => setActiveTab('milk')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'milk'
                ? 'bg-[#3D2C1E] text-white shadow-sm'
                : 'text-[#6B5A4B] hover:bg-[#EFE8DD]'
            }`}
          >
            2. Milk & Cloud
          </button>
          <button
            onClick={() => setActiveTab('sweet-ice')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'sweet-ice'
                ? 'bg-[#3D2C1E] text-white shadow-sm'
                : 'text-[#6B5A4B] hover:bg-[#EFE8DD]'
            }`}
          >
            3. Sweetness & Chill
          </button>
          <button
            onClick={() => setActiveTab('toppings')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'toppings'
                ? 'bg-[#3D2C1E] text-white shadow-sm'
                : 'text-[#6B5A4B] hover:bg-[#EFE8DD]'
            }`}
          >
            4. Toppings & Drizzle
          </button>
        </div>

        {/* Tab 1: Single-Origin Tea Bases */}
        {activeTab === 'tea' && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {TEA_BASES.map((tea) => {
              const selected = drink.teaBase.id === tea.id;
              return (
                <div
                  key={tea.id}
                  onClick={() => handleSelectTea(tea.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selected
                      ? 'border-[#3D2C1E] bg-[#F7F2EA] shadow-xs'
                      : 'border-[#E8DFC8]/70 hover:border-[#D1B89D] bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-black/10"
                      style={{ backgroundColor: tea.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#2B1D12]">{tea.name}</h4>
                        <span className="text-[11px] text-[#8C7662]">· {tea.roast} Roast</span>
                      </div>
                      <p className="text-xs text-[#7A6A5A] mt-0.5">{tea.description}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#554637]">
                        <span>Notes:</span>
                        {tea.flavorNotes.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono-numbers text-xs font-semibold text-[#2B1D12]">
                      ${tea.basePrice.toFixed(2)}
                    </span>
                    {selected && (
                      <span className="flex items-center justify-end text-xs text-[#3D2C1E] mt-1 font-medium">
                        <Check className="w-3.5 h-3.5 mr-0.5" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Milk & Foam Options */}
        {activeTab === 'milk' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {MILK_OPTIONS.map((milk) => {
              const selected = drink.milk.id === milk.id;
              return (
                <div
                  key={milk.id}
                  onClick={() => handleSelectMilk(milk.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    selected
                      ? 'border-[#3D2C1E] bg-[#F7F2EA] shadow-xs'
                      : 'border-[#E8DFC8]/70 hover:border-[#D1B89D] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#2B1D12]">{milk.name}</h4>
                      {selected && <Check className="w-4 h-4 text-[#3D2C1E]" />}
                    </div>
                    {milk.badge && (
                      <span className="text-[11px] text-[#A67C52] font-medium block mt-0.5">
                        {milk.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#EFE8DD] flex items-center justify-between text-xs">
                    <span className="text-[#7A6A5A]">+{milk.calorieOffset} kcal</span>
                    <span className="font-mono-numbers font-semibold text-[#2B1D12]">
                      {milk.price > 0 ? `+$${milk.price.toFixed(2)}` : 'Included'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Sweetness & Ice */}
        {activeTab === 'sweet-ice' && (
          <div className="space-y-6 py-2">
            {/* Sweetness Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7A6A5A]">
                  Sweetness Level
                </label>
                <span className="text-xs font-semibold text-[#2B1D12]">
                  {drink.sweetness}% ·{' '}
                  {drink.sweetness === 0
                    ? 'Unsweetened (Pure Tea)'
                    : drink.sweetness === 30
                    ? 'Delicate Hint'
                    : drink.sweetness === 50
                    ? 'Artisan Half Sweet'
                    : drink.sweetness === 70
                    ? 'House Standard'
                    : drink.sweetness === 100
                    ? 'Full Sweet'
                    : 'Extra Indulgence'}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {([0, 30, 50, 70, 100, 120] as SweetnessLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleSelectSweetness(lvl)}
                    className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-all ${
                      drink.sweetness === lvl
                        ? 'bg-[#3D2C1E] text-white border-[#3D2C1E] shadow-xs'
                        : 'bg-white border-[#E8DFC8] text-[#554637] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    {lvl}%
                  </button>
                ))}
              </div>
            </div>

            {/* Ice Level Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7A6A5A]">
                  Temperature & Ice
                </label>
                <span className="text-xs font-semibold text-[#2B1D12] capitalize">
                  {drink.ice.replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'warm', label: 'Warm (50°C)' },
                  { id: 'no-ice', label: 'No Ice' },
                  { id: 'light', label: 'Light Ice' },
                  { id: 'regular', label: 'Regular Chill' },
                  { id: 'extra', label: 'Extra Ice' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectIce(item.id as IceLevel)}
                    className={`py-2 px-2 text-center text-xs font-medium rounded-lg border transition-all ${
                      drink.ice === item.id
                        ? 'bg-[#3D2C1E] text-white border-[#3D2C1E] shadow-xs'
                        : 'bg-white border-[#E8DFC8] text-[#554637] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Toppings & Tiger Drizzle */}
        {activeTab === 'toppings' && (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {/* Tiger Stripe Drizzle Selector */}
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Cup Wall Drizzle
                </span>
                <span className="text-xs text-amber-900 font-mono-numbers">+$0.60</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'brown-sugar', label: 'Tiger Muscovado' },
                  { id: 'strawberry', label: 'Strawberry Purée' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() =>
                      handleToggleDrizzle(d.id as 'none' | 'brown-sugar' | 'strawberry')
                    }
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                      drink.syrupDrizzle === d.id
                        ? 'bg-amber-900 text-white border-amber-900'
                        : 'bg-white/80 border-amber-200 text-amber-950 hover:bg-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topping Item List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7A6A5A]">
                Slow-Simmered Toppings (Multi-Select)
              </label>

              {TOPPINGS.map((top) => {
                const selected = drink.toppings.some((t) => t.id === top.id);
                return (
                  <div
                    key={top.id}
                    onClick={() => handleToggleTopping(top.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selected
                        ? 'border-[#3D2C1E] bg-[#F7F2EA]'
                        : 'border-[#E8DFC8]/70 hover:border-[#D1B89D] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: top.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-[#2B1D12]">{top.name}</h5>
                          <span className="text-[10px] text-[#8C7662]">
                            · Chewiness: {'●'.repeat(top.chewiness)}
                            {'○'.repeat(5 - top.chewiness)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6A5A] line-clamp-1">{top.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono-numbers font-semibold text-[#2B1D12]">
                        +${top.price.toFixed(2)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          selected
                            ? 'bg-[#3D2C1E] text-white border-[#3D2C1E]'
                            : 'border-[#D1B89D] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#E8DFC8]/60 flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-[#7A6A5A] uppercase tracking-wide">Calculated Total</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-[#2B1D12]">
              ${drink.price.toFixed(2)}
            </span>
            <span className="text-xs text-[#8C7662] font-mono-numbers">~{drink.calories} kcal</span>
          </div>
        </div>

        <button
          onClick={onAddToCart}
          className="flex-1 max-w-[200px] py-3 px-4 bg-[#3D2C1E] hover:bg-[#2B1E14] text-white text-xs font-semibold rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Add to Order Bag</span>
        </button>
      </div>
    </div>
  );
};
