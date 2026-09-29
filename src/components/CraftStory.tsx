import React from 'react';
import heroBobaImg from '../assets/images/hero_boba_craft_1790660293144.jpg';

export const CraftStory: React.FC = () => {
  return (
    <section id="craft-story" className="py-16 border-t border-[#EAE2D5] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Editorial Text */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A67C52]">
              Philosophy & Heritage
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-semibold text-[#2B1D12] mt-1.5 leading-tight">
              Honoring the Ritual of High Mountain Leaves & Slow Tapioca
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5A4B] mt-4 leading-relaxed">
              BobaFlow began as an atelier in pursuit of one uncompromised standard: bubble tea
              worthy of ancient tea traditions. We discard powdered creams and artificial syrups in
              favor of heirloom whole leaves, farm-fresh pasture milk, and raw muscovado pearls
              simmered patiently by hand.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#2B1D12]">
                  01. Single-Estate High Mountain Harvests
                </h3>
                <p className="text-xs text-[#7A6A5A] mt-1 leading-relaxed">
                  Grown above 1,400 meters in Alishan, Nantou, and Kyoto where misty alpine microclimates
                  naturally concentrate amino acids and aroma precursors.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2B1D12]">
                  02. 90-Minute Slow Kokuto Caramelization
                </h3>
                <p className="text-xs text-[#7A6A5A] mt-1 leading-relaxed">
                  Our cassava pearls are hand-stirred in unrefined black sugar kettle syrup,
                  yielding a tender chew with deep smoky molasses undertones.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2B1D12]">
                  03. Precision Temperature Aeration
                </h3>
                <p className="text-xs text-[#7A6A5A] mt-1 leading-relaxed">
                  Every pour is steeped to specific thermal degrees before violent acoustic chilling,
                  preserving delicate volatile aromatics and ensuring velvety milk suspension.
                </p>
              </div>
            </div>

            {/* Proof Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-[#E8DFC8]">
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-[#2B1D12] font-mono-numbers">
                  1,400m
                </div>
                <div className="text-[11px] text-[#7A6A5A] mt-0.5">Average Garden Elevation</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-[#2B1D12] font-mono-numbers">
                  90 min
                </div>
                <div className="text-[11px] text-[#7A6A5A] mt-0.5">Slow Pearl Caramelization</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-[#2B1D12] font-mono-numbers">
                  100%
                </div>
                <div className="text-[11px] text-[#7A6A5A] mt-0.5">Direct Farm Transparency</div>
              </div>
            </div>
          </div>

          {/* Editorial Visual Showcase */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-[#E8DFC8] bg-[#F2EDE4]">
              <img
                src={heroBobaImg}
                alt="Artisanal Boba Preparation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-md hidden sm:block max-w-xs">
              <span className="text-[10px] uppercase font-semibold text-[#A67C52] tracking-wider block">
                Atelier Standard
              </span>
              <p className="text-xs text-[#3D2C1E] font-medium mt-1">
                "Zero artificial flavor syrups. Zero milk powders. Just water, fire, leaf, and cane."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
