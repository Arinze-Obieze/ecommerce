'use client';
import { useState } from 'react';

export default function Step4Discount({ state, dispatch }) {
  const {
    discountType, discountValue, maxDiscountCap, minOrderAmount,
    buyXQuantity, getYQuantity, allowsBundle,
  } = state;

  const [showMinOrder, setShowMinOrder] = useState(!!minOrderAmount);
  const examplePrice = 15000;

  const savings = discountType === 'percentage'
    ? Math.min(examplePrice * (discountValue / 100), maxDiscountCap || Infinity)
    : discountType === 'fixed_amount'
    ? Math.min(discountValue || 0, examplePrice)
    : 0;

  const finalPrice = Math.max(0, examplePrice - savings);
  const highPercentWarn = discountType === 'percentage' && discountValue > 70;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Set your discount</h2>
        <p className="text-sm text-gray-500 mt-1">Choose how the discount is calculated.</p>
      </div>

      {/* Discount type toggle */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'percentage', label: '% Percentage off' },
          { value: 'fixed_amount', label: '₦ Fixed amount off' },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => dispatch({ type: 'SET_DISCOUNT_TYPE', discountType: opt.value })}
            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              discountType === opt.value
                ? 'border-[#2E5C45] bg-[#2E5C45] text-white'
                : 'border-[#dbe7e0] text-gray-700 hover:border-[#2E5C45]/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Discount value */}
      {discountType === 'percentage' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Percentage off</label>
            <div className="relative">
              <input
                type="number"
                min={1} max={90}
                value={discountValue || ''}
                onChange={e => dispatch({ type: 'SET_DISCOUNT_VALUE', value: Number(e.target.value) })}
                placeholder="e.g. 20"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm pr-10 focus:outline-none focus:border-[#2E5C45]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
            </div>
            {highPercentWarn && (
              <p className="text-amber-600 text-xs mt-1.5 font-medium">⚠️ Discounts above 70% are unusually high. Are you sure?</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Maximum discount cap <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
              <input
                type="number"
                min={0}
                value={maxDiscountCap || ''}
                onChange={e => dispatch({ type: 'SET_MAX_CAP', cap: Number(e.target.value) || null })}
                placeholder="No cap"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">e.g. cap at ₦5,000 even if 30% would be more</p>
          </div>
        </div>
      )}

      {discountType === 'fixed_amount' && (
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Amount off</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
            <input
              type="number"
              min={1}
              value={discountValue || ''}
              onChange={e => dispatch({ type: 'SET_DISCOUNT_VALUE', value: Number(e.target.value) })}
              placeholder="e.g. 2000"
              className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]"
            />
          </div>
        </div>
      )}

      {/* Bundle fields */}
      {allowsBundle && (
        <div className="rounded-xl border border-[#dbe7e0] p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Bundle configuration</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Buy quantity</label>
              <input
                type="number" min={1}
                value={buyXQuantity || ''}
                onChange={e => dispatch({ type: 'SET_BUNDLE', buyX: Number(e.target.value), getY: getYQuantity })}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Get free</label>
              <input
                type="number" min={1}
                value={getYQuantity || ''}
                onChange={e => dispatch({ type: 'SET_BUNDLE', buyX: buyXQuantity, getY: Number(e.target.value) })}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Live preview */}
      {discountValue > 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">Live preview</p>
          On a ₦{examplePrice.toLocaleString('en-NG')} item — customer saves{' '}
          <span className="font-bold text-gray-900">₦{Math.round(savings).toLocaleString('en-NG')}</span>, pays{' '}
          <span className="font-bold text-gray-900">₦{Math.round(finalPrice).toLocaleString('en-NG')}</span>
        </div>
      )}

      {/* Min order */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => { setShowMinOrder(v => !v); if (showMinOrder) dispatch({ type: 'SET_MIN_ORDER', amount: null }); }}
          className="text-sm font-medium text-[#2E5C45] hover:underline"
        >
          {showMinOrder ? '− Remove minimum order' : '+ Add minimum order amount'}
        </button>
        {showMinOrder && (
          <div className="mt-3">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Minimum cart total</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
              <input
                type="number" min={0}
                value={minOrderAmount || ''}
                onChange={e => dispatch({ type: 'SET_MIN_ORDER', amount: Number(e.target.value) || null })}
                placeholder="e.g. 10000"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Discount only applies when cart total is above this amount</p>
          </div>
        )}
      </div>
    </div>
  );
}
