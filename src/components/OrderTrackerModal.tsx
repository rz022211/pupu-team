import React, { useEffect, useState } from 'react';
import { OrderRecord } from '../types/boba';
import { CheckCircle2, Clock, Sparkles, Coffee, CupSoda, PackageCheck, X } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface OrderTrackerModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onNewDrink: () => void;
}

const STAGES = [
  { id: 'brewing', label: '1. Steeping Single-Origin Leaves', desc: 'Water calibrated to 92°C, precision infusion', icon: Coffee },
  { id: 'shaking', label: '2. Emulsion & Shaking', desc: 'Vigorously aerating tea with crystal ice and milk', icon: CupSoda },
  { id: 'sealing', label: '3. Heat-Sealing & Straw Pack', desc: 'Applying airtight gold-embossed seal', icon: Sparkles },
  { id: 'ready', label: '4. Ready at Atelier Counter', desc: 'Crafted with care, waiting under your name', icon: PackageCheck },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onNewDrink,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!order) return;
    setCurrentStageIndex(0);

    // Simulate progress through the stages
    const timer1 = setTimeout(() => {
      setCurrentStageIndex(1);
      bobaAudio.playShake();
    }, 4000);

    const timer2 = setTimeout(() => {
      setCurrentStageIndex(2);
      bobaAudio.playSeal();
    }, 9000);

    const timer3 = setTimeout(() => {
      setCurrentStageIndex(3);
      bobaAudio.playIceClink();
    }, 14000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [order]);

  if (!order) return null;

  const currentStage = STAGES[currentStageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#EAE2D5] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#7A6A5A] hover:text-[#2B1D12] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Order Header */}
        <div className="text-center pb-6 border-b border-[#EAE2D5]">
          <span className="text-xs font-semibold text-[#A67C52] uppercase tracking-wider">
            Order In Progress · {order.orderId}
          </span>
          <h3 className="text-2xl font-display font-semibold text-[#2B1D12] mt-1">
            Crafting for {order.customerName}
          </h3>
          <div className="flex items-center justify-center gap-2 text-xs text-[#7A6A5A] mt-1">
            <span>Ordered at {order.createdAt}</span>
            <span aria-hidden="true">·</span>
            <span>Est. Ready in {Math.max(1, 10 - currentStageIndex * 3)} min</span>
          </div>
        </div>

        {/* Stage Progress Tracker */}
        <div className="py-6 space-y-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? 'bg-white border-[#3D2C1E] shadow-sm'
                    : isCompleted
                    ? 'bg-[#F2EDE4]/60 border-[#E5DBCC]'
                    : 'bg-transparent border-transparent opacity-45'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-[#3D2C1E] text-white animate-pulse'
                      : isCompleted
                      ? 'bg-[#3D2C1E] text-white'
                      : 'bg-[#EAE2D5] text-[#8C7662]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#2B1D12]">{stage.label}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-[#A67C52] uppercase tracking-wide">
                        Active Step
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-medium text-emerald-700">Done</span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A6A5A] mt-0.5">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Itemized Order Recap */}
        <div className="bg-white rounded-xl border border-[#E8DFC8] p-3.5 text-xs text-[#7A6A5A] space-y-1.5 mb-6">
          <div className="flex justify-between font-medium text-[#2B1D12]">
            <span>{order.items.length} Drink Item(s)</span>
            <span className="font-mono-numbers">${order.total.toFixed(2)} Paid</span>
          </div>
          <div className="text-[11px] text-[#8C7662] truncate">
            {order.items.map((it) => `${it.quantity}x ${it.drink.name}`).join(' · ')}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onNewDrink();
            }}
            className="flex-1 py-3 px-4 bg-[#3D2C1E] hover:bg-[#2B1E14] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center"
          >
            Craft Another Custom Boba
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-[#F2EDE4] hover:bg-[#EAE2D5] text-[#2B1D12] text-xs font-medium rounded-xl transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
