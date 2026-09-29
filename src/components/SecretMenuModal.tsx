import React from 'react';
import { CustomBobaDrink } from '../types/boba';
import { Bookmark, X, ArrowRight, Trash2 } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface SecretMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDrinks: CustomBobaDrink[];
  onLoadDrink: (drink: CustomBobaDrink) => void;
  onDeleteSavedDrink: (drinkId: string) => void;
}

export const SecretMenuModal: React.FC<SecretMenuModalProps> = ({
  isOpen,
  onClose,
  savedDrinks,
  onLoadDrink,
  onDeleteSavedDrink,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#EAE2D5] rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[85vh] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D5]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#A67C52]" />
              <div>
                <h3 className="text-lg font-display font-semibold text-[#2B1D12]">
                  My Boba Passport & Secret Vault
                </h3>
                <p className="text-xs text-[#7A6A5A]">
                  {savedDrinks.length} saved custom formulation{savedDrinks.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A6A5A] hover:text-[#2B1D12] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
            {savedDrinks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7A6A5A]">
                No saved custom recipes yet. Craft your drink in the Boba Lab and tap "Save to Vault"
                to remember your signature formula!
              </div>
            ) : (
              savedDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="bg-white p-4 rounded-xl border border-[#E8DFC8] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[#2B1D12]">{drink.name}</h4>
                    <div className="text-xs text-[#7A6A5A] mt-0.5">
                      <span>{drink.teaBase.name.split(' ')[0]}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{drink.sweetness}% Sweet</span>
                      <span aria-hidden="true"> · </span>
                      <span className="capitalize">{drink.ice}</span>
                    </div>
                    {drink.toppings.length > 0 && (
                      <div className="text-[11px] text-[#A67C52] mt-0.5">
                        {drink.toppings.map((t) => t.name).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        bobaAudio.playLiquidPour();
                        onLoadDrink(drink);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#3D2C1E] text-white hover:bg-[#2B1E14] rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSavedDrink(drink.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE2D5] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#2B1D12] hover:bg-[#EFE8DC] rounded-lg transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
