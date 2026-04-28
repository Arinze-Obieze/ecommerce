'use client';

const OPTIONS = [
  {
    value: 'single',
    icon: '🎯',
    title: 'Single Product',
    desc: 'Apply discount to one specific product',
    mode: 'manual',
  },
  {
    value: 'bulk',
    icon: '☑️',
    title: 'Multiple Products',
    desc: 'Hand-pick several products from your store',
    mode: 'manual',
  },
  {
    value: 'category',
    icon: '📂',
    title: 'By Category',
    desc: 'All products in a category automatically qualify — new products added later included',
    mode: 'rules',
  },
];

export default function Step1Targeting({ state, dispatch }) {
  const { targetingScope, targetingMode, wholeStore } = state;

  const select = (value, mode) => {
    dispatch({ type: 'SET_TARGETING', scope: value, mode, wholeStore: false });
  };

  const toggleWholeStore = () => {
    dispatch({ type: 'SET_TARGETING', scope: 'category', mode: 'store', wholeStore: !wholeStore });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">What does this promotion apply to?</h2>
      <p className="text-sm text-gray-500">Choose how you want to target products for this promotion.</p>

      <div className="space-y-3 mt-4">
        {OPTIONS.map(opt => {
          const isSelected = targetingScope === opt.value && !wholeStore;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value, opt.mode)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-[#E8E4DC] bg-white hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {opt.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>

                  {opt.value === 'category' && (
                    <label
                      className="flex items-center gap-2 mt-3 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={wholeStore}
                        onChange={toggleWholeStore}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Whole store — apply to all my products
                      </span>
                    </label>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}

        {/* Whole store selected state */}
        {wholeStore && (
          <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-sm font-semibold text-primary">Whole Store</p>
                <p className="text-xs text-gray-500">All your active products will receive this discount</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
