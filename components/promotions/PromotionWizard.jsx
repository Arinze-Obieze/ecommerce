'use client';
import { useReducer, useEffect, useCallback, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Step1Targeting from './steps/Step1Targeting';
import Step2Products from './steps/Step2Products';
import Step3Type from './steps/Step3Type';
import Step4Discount from './steps/Step4Discount';
import Step5Details from './steps/Step5Details';
import Step6Review from './steps/Step6Review';

const now = () => {
  const d = new Date();
  return d.toISOString().slice(0, 16);
};

const INITIAL = {
  // Step 1
  targetingScope: null,   // 'single' | 'bulk' | 'category'
  targetingMode: null,    // 'manual' | 'rules' | 'store'
  wholeStore: false,
  // Step 2
  selectedProductIds: [],
  selectedCategories: [],
  priceBandMin: '',
  priceBandMax: '',
  // Step 3
  promotionTypeId: null,
  promotionTypeLabel: '',
  promotionTypeIcon: '',
  allowsCode: false,
  allowsBundle: false,
  displayName: '',
  customName: '',
  // Step 4
  discountType: 'percentage',
  discountValue: '',
  maxDiscountCap: null,
  minOrderAmount: null,
  buyXQuantity: null,
  getYQuantity: null,
  // Step 5
  displayTag: '',
  description: '',
  promoCode: '',
  usePromoCode: false,
  startsAt: now(),
  endsAt: '',
  hasEndDate: false,
  badgeBgColor: '#111111',
  badgeTextColor: '#FFFFFF',
  tagBgColor: '#F472B6',
  tagTextColor: '#FFFFFF',
  showSavingsAmount: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return { ...INITIAL, ...action.payload };
    case 'SET_TARGETING': return { ...state, targetingScope: action.scope, targetingMode: action.mode, wholeStore: action.wholeStore };
    case 'SET_SELECTED_PRODUCTS': return { ...state, selectedProductIds: action.ids };
    case 'SET_SELECTED_CATEGORIES': return { ...state, selectedCategories: action.slugs };
    case 'SET_PRICE_BAND': return { ...state, priceBandMin: action.min, priceBandMax: action.max };
    case 'SET_PROMO_TYPE': return { ...state, promotionTypeId: action.typeId, allowsCode: action.allowsCode, allowsBundle: action.allowsBundle };
    case 'SET_DISPLAY_NAME': return { ...state, displayName: action.name };
    case 'SET_CUSTOM_NAME': return { ...state, customName: action.name };
    case 'SET_PROMO_TYPE_META': return { ...state, promotionTypeLabel: action.label, promotionTypeIcon: action.icon };
    case 'SET_DISCOUNT_TYPE': return { ...state, discountType: action.discountType, discountValue: '' };
    case 'SET_DISCOUNT_VALUE': return { ...state, discountValue: action.value };
    case 'SET_MAX_CAP': return { ...state, maxDiscountCap: action.cap };
    case 'SET_MIN_ORDER': return { ...state, minOrderAmount: action.amount };
    case 'SET_BUNDLE': return { ...state, buyXQuantity: action.buyX, getYQuantity: action.getY };
    case 'SET_DISPLAY_TAG': return { ...state, displayTag: action.tag };
    case 'SET_DESCRIPTION': return { ...state, description: action.text };
    case 'SET_PROMO_CODE': return { ...state, promoCode: action.code };
    case 'SET_USE_PROMO_CODE': return { ...state, usePromoCode: action.use };
    case 'SET_STARTS_AT': return { ...state, startsAt: action.value };
    case 'SET_ENDS_AT': return { ...state, endsAt: action.value };
    case 'SET_HAS_END_DATE': return { ...state, hasEndDate: action.has, endsAt: action.has ? state.endsAt : '' };
    default: return state;
  }
}

const DRAFT_KEY = 'zova_promo_wizard_draft';

const STEPS = [
  { num: 1, label: 'Targeting' },
  { num: 2, label: 'Products' },
  { num: 3, label: 'Type' },
  { num: 4, label: 'Discount' },
  { num: 5, label: 'Details' },
  { num: 6, label: 'Review' },
];

function validate(step, state) {
  switch (step) {
    case 1:
      return !!(state.targetingScope || state.wholeStore);
    case 2:
      if (state.wholeStore) return true;
      if (state.targetingScope === 'single') return state.selectedProductIds.length === 1;
      if (state.targetingScope === 'bulk') return state.selectedProductIds.length > 0;
      if (state.targetingScope === 'category') return state.selectedCategories.length > 0;
      return false;
    case 3:
      return !!(state.promotionTypeId || state.customName) && !!state.displayName?.trim();
    case 4:
      return !!(state.discountValue > 0);
    case 5:
      return !!(state.displayName?.trim()) && !!state.startsAt && (!state.hasEndDate || !!state.endsAt);
    case 6:
      return true;
    default:
      return true;
  }
}

export default function PromotionWizard({ storeId, userId, onDone }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [step, setStep] = useState(1);
  const [resumeBanner, setResumeBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check for saved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.targetingScope || parsed?.wholeStore) setResumeBanner(true);
      }
    } catch {}
  }, []);

  // Autosave on every state change
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const resumeDraft = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      dispatch({ type: 'HYDRATE', payload: saved });
    } catch {}
    setResumeBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setResumeBanner(false);
  };

  const canNext = validate(step, state);
  const skipStep2 = state.wholeStore;
  const totalSteps = skipStep2 ? 5 : 6;
  const effectiveStep = skipStep2 && step > 1 ? step - 1 : step;

  const goNext = () => {
    if (step === 1 && skipStep2) { setStep(3); return; }
    if (step < 6) setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 3 && skipStep2) { setStep(1); return; }
    if (step > 1) setStep(s => s - 1);
  };

  const handleSave = async (isActive) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      const promoPayload = {
        store_id: storeId,
        owner_type: 'seller',
        name: state.displayName,
        display_name: state.displayName,
        display_tag: state.displayTag || null,
        description: state.description || null,
        promotion_type_id: state.promotionTypeId || null,
        discount_type: state.discountType,
        discount_value: Number(state.discountValue) || 0,
        min_order_amount: state.minOrderAmount || 0,
        max_discount_cap: state.maxDiscountCap || null,
        buy_x_quantity: state.buyXQuantity || null,
        get_y_quantity: state.getYQuantity || null,
        badge_bg_color: state.badgeBgColor,
        badge_text_color: state.badgeTextColor,
        tag_bg_color: state.tagBgColor,
        tag_text_color: state.tagTextColor,
        show_savings_amount: state.showSavingsAmount,
        promo_code: state.usePromoCode ? state.promoCode : null,
        applies_to: state.wholeStore ? 'all' : state.targetingScope === 'category' ? 'categories' : 'products',
        is_active: isActive,
        is_featured: false,
        priority: 0,
        starts_at: new Date(state.startsAt).toISOString(),
        ends_at: state.hasEndDate && state.endsAt ? new Date(state.endsAt).toISOString() : null,
        created_by: userId,
        approved_by_zova: false,
      };

      const { data: promo, error: promoErr } = await supabase
        .from('promotions')
        .insert(promoPayload)
        .select('id')
        .single();

      if (promoErr) throw promoErr;

      // Insert targets or rules
      if (state.targetingMode === 'manual' && state.selectedProductIds.length > 0) {
        const targets = state.selectedProductIds.map(id => ({
          promotion_id: promo.id,
          target_type: 'product',
          target_id: String(id),
        }));
        const { error: tErr } = await supabase.from('promotion_targets').insert(targets);
        if (tErr) throw tErr;
      }

      if (state.targetingMode === 'rules' && state.selectedCategories.length > 0) {
        const rules = state.selectedCategories.map(slug => ({
          promotion_id: promo.id,
          rule_type: 'category',
          rule_value: slug,
        }));
        if (state.priceBandMin) rules.push({ promotion_id: promo.id, rule_type: 'price_min', rule_value: String(state.priceBandMin) });
        if (state.priceBandMax) rules.push({ promotion_id: promo.id, rule_type: 'price_max', rule_value: String(state.priceBandMax) });
        const { error: rErr } = await supabase.from('promotion_rules').insert(rules);
        if (rErr) throw rErr;
      }

      localStorage.removeItem(DRAFT_KEY);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#2E6417] mx-auto mb-5 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Promotion Submitted!</h2>
        <p className="text-sm text-gray-500 mb-6">You'll be notified when it's approved — usually within 2 hours.</p>
        <button
          onClick={onDone}
          className="px-6 py-3 rounded-xl bg-[#2E6417] text-white font-semibold text-sm hover:bg-[#245213] transition-colors"
        >
          Back to Promotions
        </button>
      </div>
    );
  }

  const visibleSteps = skipStep2 ? STEPS.filter(s => s.num !== 2).map((s, i) => ({ ...s, displayNum: i + 1 })) : STEPS.map(s => ({ ...s, displayNum: s.num }));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Resume banner */}
      {resumeBanner && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-amber-800">You have an unfinished promotion draft.</p>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={discardDraft} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Discard</button>
            <button onClick={resumeDraft} className="text-xs font-semibold text-[#2E6417] hover:underline">Resume →</button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {visibleSteps.map((s, i) => {
          const isCurrent = s.num === step;
          const isDone = s.num < step;
          return (
            <div key={s.num} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCurrent ? 'bg-[#2E6417] text-white' : isDone ? 'bg-[#2E6417]/10 text-[#2E6417]' : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? '✓' : s.displayNum}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < visibleSteps.length - 1 && <div className={`w-4 h-px flex-shrink-0 ${isDone ? 'bg-[#2E6417]' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6">
        {step === 1 && <Step1Targeting state={state} dispatch={dispatch} />}
        {step === 2 && <Step2Products state={state} dispatch={dispatch} storeId={storeId} />}
        {step === 3 && <Step3Type state={state} dispatch={dispatch} />}
        {step === 4 && <Step4Discount state={state} dispatch={dispatch} />}
        {step === 5 && <Step5Details state={state} dispatch={dispatch} />}
        {step === 6 && (
          <Step6Review
            state={state}
            onSubmit={() => handleSave(false)}
            onDraft={() => handleSave(false)}
            saving={saving}
          />
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}
      </div>

      {/* Nav */}
      {step < 6 && (
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={step === 1 ? onDone : goBack}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {step === 1 ? '← Cancel' : '← Back'}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="px-6 py-2.5 rounded-xl bg-[#2E6417] text-white text-sm font-bold hover:bg-[#245213] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue →
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
