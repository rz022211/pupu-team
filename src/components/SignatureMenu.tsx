import React from 'react';
import { SignatureDrink } from '../types/boba';
import { SIGNATURE_DRINKS } from '../data/bobaMenu';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface SignatureMenuProps {
  onSelectToCustomize: (drink: SignatureDrink) => void;
  onQuickAdd: (drink: SignatureDrink) => void;
}

export const SignatureMenu: React.FC<SignatureMenuProps> = ({
  onSelectToCustomize,
  onQuickAdd,
}) => {
  return (
    <section id="signature-menu" className="py-12 border-t border-[#EAE2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A67C52]">
              Curated Master Series
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#2B1D12] mt-1">
              Signature Creations
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6A5A] mt-1 max-w-xl">
              Carefully calibrated by our tea sommeliers for optimal sweetness, milk emulsion, and
              tapioca elasticity.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7A6A5A]">
            <span>6 House Specialties</span>
            <span aria-hidden="true">·</span>
            <span>Single-Origin Leaves</span>
          </div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SIGNATURE_DRINKS.map((drink) => (
            <div
              key={drink.id}
              className="group bg-white rounded-2xl border border-[#E8DFC8]/70 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Product Image Frame */}
                <div className="relative aspect-[4/3] bg-[#F2EDE4] overflow-hidden">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#201D1A]/85 backdrop-blur-xs text-[#FAF8F5] text-[11px] px-2.5 py-1 rounded-md font-medium">
                    {drink.tags[0]}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#2B1D12] text-xs font-semibold px-2.5 py-1 rounded-md font-mono-numbers shadow-xs">
                    ${drink.price.toFixed(2)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] text-[#8C7662] mb-1">
                    <span>{drink.caffeineLevel} Caffeine</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-numbers">{drink.calories} kcal</span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#2B1D12] group-hover:text-[#8C5641] transition-colors">
                    {drink.name}
                  </h3>
                  <p className="text-xs text-[#A67C52] font-medium mt-0.5">{drink.subtitle}</p>

                  <p className="text-xs text-[#6B5A4B] mt-2.5 line-clamp-2 leading-relaxed">
                    {drink.description}
                  </p>

                  {/* Tasting Notes */}
                  <div className="mt-3 pt-3 border-t border-[#F2ECE3]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C7662] block mb-1">
                      Sensory Profile
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-[#554637]">
                      {drink.tastingNotes.join(' · ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    bobaAudio.playLiquidPour();
                    onSelectToCustomize(drink);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-medium bg-[#F5EFE6] hover:bg-[#ECE4D8] text-[#3D2C1E] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Customize in Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    bobaAudio.playBobaDrop();
                    onQuickAdd(drink);
                  }}
                  className="py-2 px-3.5 text-xs font-semibold bg-[#3D2C1E] hover:bg-[#2B1E14] text-white rounded-xl transition-colors active:scale-95 shadow-xs flex items-center gap-1"
                  title="Quick add to order"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
