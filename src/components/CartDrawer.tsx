import React, { useState } from 'react';
import { CartItem, OrderRecord } from '../types/boba';
import { X, Plus, Minus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onPlaceOrder: (order: OrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [tipRate, setTipRate] = useState<number>(0.15);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.drink.price * item.quantity,
    0
  );
  const tax = subtotal * 0.0825;
  const tip = subtotal * tipRate;
  const total = subtotal + tax + tip;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    bobaAudio.playSeal();

    const newOrder: OrderRecord = {
      orderId: `BF-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cartItems],
      subtotal,
      tax,
      total,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedPickupMinutes: 10,
      customerName: customerName.trim() || 'Honored Guest',
      status: 'brewing',
    };

    onPlaceOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Body */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#EAE2D5] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#EAE2D5] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-semibold text-[#2B1D12]">
                Your Boba Bag
              </h3>
              <p className="text-xs text-[#7A6A5A]">
                {cartItems.length} unique creation{cartItems.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A6A5A] hover:text-[#2B1D12] hover:bg-[#EFE8DC] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] text-[#7A6A5A] flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#2B1D12]">Your bag is empty</h4>
                <p className="text-xs text-[#7A6A5A] mt-1 max-w-xs mx-auto">
                  Craft your custom cup in the Boba Lab or choose a signature house creation.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white rounded-xl border border-[#E8DFC8] p-4 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-[#2B1D12]">
                        {item.drink.name}
                      </h4>
                      <div className="text-xs text-[#7A6A5A] mt-0.5">
                        <span>{item.drink.size === 'large' ? '700ml' : '500ml'}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{item.drink.sweetness}% Sweet</span>
                        <span aria-hidden="true"> · </span>
                        <span className="capitalize">{item.drink.ice.replace('-', ' ')}</span>
                      </div>
                      <div className="text-[11px] text-[#8C7662] mt-1">
                        Base: {item.drink.teaBase.name.split(' ')[0]} / {item.drink.milk.name}
                      </div>
                      {item.drink.toppings.length > 0 && (
                        <div className="text-[11px] text-[#A67C52] mt-1">
                          + {item.drink.toppings.map((t) => t.name).join(', ')}
                        </div>
                      )}
                      {item.drink.syrupDrizzle !== 'none' && (
                        <div className="text-[11px] text-amber-900 font-medium">
                          + Tiger Muscovado Drizzle
                        </div>
                      )}
                    </div>

                    <span className="font-mono-numbers text-sm font-semibold text-[#2B1D12] shrink-0">
                      ${(item.drink.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EFE6]">
                    <button
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>

                    <div className="flex items-center gap-2 bg-[#F5EFE6] px-2 py-1 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, -1)}
                        className="p-1 text-[#6B5A4B] hover:text-[#2B1D12]"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono-numbers font-semibold text-[#2B1D12] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, 1)}
                        className="p-1 text-[#6B5A4B] hover:text-[#2B1D12]"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cartItems.length > 0 && (
            <form onSubmit={handleCheckout} className="p-5 border-t border-[#EAE2D5] bg-white space-y-4">
              {/* Customer Name */}
              <div>
                <label className="text-[11px] font-semibold text-[#7A6A5A] uppercase tracking-wider block mb-1">
                  Pickup Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name (for cup label)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#E8DFC8] rounded-lg focus:outline-none focus:border-[#3D2C1E]"
                />
              </div>

              {/* Tip Selection */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] mb-1 font-semibold uppercase tracking-wider">
                  <span>Barista Craft Tip</span>
                  <span className="font-mono-numbers">${tip.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 0.1, 0.15, 0.2].map((rate) => (
                    <button
                      type="button"
                      key={rate}
                      onClick={() => setTipRate(rate)}
                      className={`py-1 text-xs font-medium rounded-lg border transition-colors ${
                        tipRate === rate
                          ? 'bg-[#3D2C1E] text-white border-[#3D2C1E]'
                          : 'border-[#E8DFC8] text-[#6B5A4B] hover:bg-[#F9F6F0]'
                      }`}
                    >
                      {rate === 0 ? 'None' : `${Math.round(rate * 100)}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation Lines */}
              <div className="space-y-1.5 text-xs text-[#7A6A5A] pt-2 border-t border-[#F2ECE3]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-numbers text-[#2B1D12]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8.25%)</span>
                  <span className="font-mono-numbers text-[#2B1D12]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm text-[#2B1D12] pt-1">
                  <span>Estimated Total</span>
                  <span className="font-mono-numbers">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pickup timing note */}
              <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl text-xs text-[#6B5A4B]">
                <Clock className="w-4 h-4 text-[#A67C52] shrink-0" />
                <span>Express Bar Prep: Fresh in 8–12 minutes at Counter A</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#3D2C1E] hover:bg-[#2B1E14] text-white text-xs font-semibold rounded-xl shadow-sm transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <span>Confirm Order · ${total.toFixed(2)}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
