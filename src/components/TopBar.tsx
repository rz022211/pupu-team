import React from 'react';
import { ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface TopBarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE2D5] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element brand wordmark */}
        <a
          href="#"
          className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#2B1D12] hover:opacity-90 transition-opacity"
        >
          BobaFlow
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-[#6B5A4B]">
          <a
            href="#boba-lab"
            className="hover:text-[#2B1D12] transition-colors hover:underline underline-offset-8"
          >
            Boba Lab
          </a>
          <a
            href="#signature-menu"
            className="hover:text-[#2B1D12] transition-colors hover:underline underline-offset-8"
          >
            Signature Menu
          </a>
          <a
            href="#flavor-alchemist"
            className="hover:text-[#2B1D12] transition-colors hover:underline underline-offset-8"
          >
            Flavor Alchemist
          </a>
          <a
            href="#craft-story"
            className="hover:text-[#2B1D12] transition-colors hover:underline underline-offset-8"
          >
            Our Craft
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Audio toggle button */}
          <button
            onClick={onToggleMute}
            className="p-2 text-[#6B5A4B] hover:text-[#2B1D12] hover:bg-[#EFE8DC] rounded-lg transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label="Sound effects toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Cart Bag Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#3D2C1E] hover:bg-[#2B1E14] rounded-xl transition-all shadow-xs active:scale-95"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="font-mono-numbers">
              {cartCount > 0 ? `${cartCount} · $${cartTotal.toFixed(2)}` : 'Bag (0)'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
