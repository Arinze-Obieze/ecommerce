export const PROMOTION_DRAFT_KEY = 'zova_promo_wizard_draft';

export const PROMOTION_STEPS = [
  { num: 1, label: 'Targeting' },
  { num: 2, label: 'Products' },
  { num: 3, label: 'Type' },
  { num: 4, label: 'Discount' },
  { num: 5, label: 'Details' },
  { num: 6, label: 'Review' },
];

export function now() {
  const date = new Date();
  return date.toISOString().slice(0, 16);
}

export const INITIAL_PROMOTION_STATE = {
  targetingScope: null,
  targetingMode: null,
  wholeStore: false,
  selectedProductIds: [],
  selectedCategories: [],
  priceBandMin: '',
  priceBandMax: '',
  promotionTypeId: null,
  promotionTypeLabel: '',
  promotionTypeIcon: '',
  allowsCode: false,
  allowsBundle: false,
  displayName: '',
  customName: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscountCap: null,
  minOrderAmount: null,
  buyXQuantity: null,
  getYQuantity: null,
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

export function promotionWizardReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...INITIAL_PROMOTION_STATE, ...action.payload };
    case 'SET_TARGETING':
      return {
        ...state,
        targetingScope: action.scope,
        targetingMode: action.mode,
        wholeStore: action.wholeStore,
      };
    case 'SET_SELECTED_PRODUCTS':
      return { ...state, selectedProductIds: action.ids };
    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.slugs };
    case 'SET_PRICE_BAND':
      return { ...state, priceBandMin: action.min, priceBandMax: action.max };
    case 'SET_PROMO_TYPE':
      return {
        ...state,
        promotionTypeId: action.typeId,
        allowsCode: action.allowsCode,
        allowsBundle: action.allowsBundle,
      };
    case 'SET_DISPLAY_NAME':
      return { ...state, displayName: action.name };
    case 'SET_CUSTOM_NAME':
      return { ...state, customName: action.name };
    case 'SET_PROMO_TYPE_META':
      return {
        ...state,
        promotionTypeLabel: action.label,
        promotionTypeIcon: action.icon,
      };
    case 'SET_DISCOUNT_TYPE':
      return { ...state, discountType: action.discountType, discountValue: '' };
    case 'SET_DISCOUNT_VALUE':
      return { ...state, discountValue: action.value };
    case 'SET_MAX_CAP':
      return { ...state, maxDiscountCap: action.cap };
    case 'SET_MIN_ORDER':
      return { ...state, minOrderAmount: action.amount };
    case 'SET_BUNDLE':
      return { ...state, buyXQuantity: action.buyX, getYQuantity: action.getY };
    case 'SET_DISPLAY_TAG':
      return { ...state, displayTag: action.tag };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.text };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.code };
    case 'SET_USE_PROMO_CODE':
      return { ...state, usePromoCode: action.use };
    case 'SET_STARTS_AT':
      return { ...state, startsAt: action.value };
    case 'SET_ENDS_AT':
      return { ...state, endsAt: action.value };
    case 'SET_HAS_END_DATE':
      return {
        ...state,
        hasEndDate: action.has,
        endsAt: action.has ? state.endsAt : '',
      };
    default:
      return state;
  }
}

export function validatePromotionStep(step, state) {
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
      return !!state.displayName?.trim() && !!state.startsAt && (!state.hasEndDate || !!state.endsAt);
    case 6:
      return true;
    default:
      return true;
  }
}

export function getVisiblePromotionSteps(skipProductsStep) {
  if (!skipProductsStep) {
    return PROMOTION_STEPS.map((step) => ({ ...step, displayNum: step.num }));
  }

  return PROMOTION_STEPS
    .filter((step) => step.num !== 2)
    .map((step, index) => ({ ...step, displayNum: index + 1 }));
}
