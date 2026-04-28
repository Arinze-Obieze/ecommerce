'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  getVisiblePromotionSteps,
  INITIAL_PROMOTION_STATE,
  PROMOTION_DRAFT_KEY,
  promotionWizardReducer,
  validatePromotionStep,
} from '@/components/promotions/promotionWizard.config';

export default function usePromotionWizard({ storeId, userId }) {
  const [state, dispatch] = useReducer(promotionWizardReducer, INITIAL_PROMOTION_STATE);
  const [step, setStep] = useState(1);
  const [resumeBanner, setResumeBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(PROMOTION_DRAFT_KEY);
      if (!savedDraft) return;
      const parsedDraft = JSON.parse(savedDraft);
      if (parsedDraft?.targetingScope || parsedDraft?.wholeStore) {
        setResumeBanner(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROMOTION_DRAFT_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const resumeDraft = () => {
    try {
      const savedDraft = JSON.parse(localStorage.getItem(PROMOTION_DRAFT_KEY) || '{}');
      dispatch({ type: 'HYDRATE', payload: savedDraft });
    } catch {}
    setResumeBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(PROMOTION_DRAFT_KEY);
    setResumeBanner(false);
  };

  const skipProductsStep = state.wholeStore;
  const canNext = validatePromotionStep(step, state);
  const totalSteps = skipProductsStep ? 5 : 6;
  const effectiveStep = skipProductsStep && step > 1 ? step - 1 : step;
  const visibleSteps = useMemo(
    () => getVisiblePromotionSteps(skipProductsStep),
    [skipProductsStep]
  );

  const goNext = () => {
    if (step === 1 && skipProductsStep) {
      setStep(3);
      return;
    }

    if (step < 6) {
      setStep((currentStep) => currentStep + 1);
    }
  };

  const goBack = () => {
    if (step === 3 && skipProductsStep) {
      setStep(1);
      return;
    }

    if (step > 1) {
      setStep((currentStep) => currentStep - 1);
    }
  };

  const handleSave = async (isActive) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    try {
      const promotionPayload = {
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
        applies_to: state.wholeStore
          ? 'all'
          : state.targetingScope === 'category'
            ? 'categories'
            : 'products',
        is_active: isActive,
        is_featured: false,
        priority: 0,
        starts_at: new Date(state.startsAt).toISOString(),
        ends_at:
          state.hasEndDate && state.endsAt ? new Date(state.endsAt).toISOString() : null,
        created_by: userId,
        approved_by_zova: false,
      };

      const { data: promotion, error: promotionError } = await supabase
        .from('promotions')
        .insert(promotionPayload)
        .select('id')
        .single();

      if (promotionError) throw promotionError;

      if (state.targetingMode === 'manual' && state.selectedProductIds.length > 0) {
        const targets = state.selectedProductIds.map((id) => ({
          promotion_id: promotion.id,
          target_type: 'product',
          target_id: String(id),
        }));
        const { error: targetsError } = await supabase.from('promotion_targets').insert(targets);
        if (targetsError) throw targetsError;
      }

      if (state.targetingMode === 'rules' && state.selectedCategories.length > 0) {
        const rules = state.selectedCategories.map((slug) => ({
          promotion_id: promotion.id,
          rule_type: 'category',
          rule_value: slug,
        }));

        if (state.priceBandMin) {
          rules.push({
            promotion_id: promotion.id,
            rule_type: 'price_min',
            rule_value: String(state.priceBandMin),
          });
        }

        if (state.priceBandMax) {
          rules.push({
            promotion_id: promotion.id,
            rule_type: 'price_max',
            rule_value: String(state.priceBandMax),
          });
        }

        const { error: rulesError } = await supabase.from('promotion_rules').insert(rules);
        if (rulesError) throw rulesError;
      }

      localStorage.removeItem(PROMOTION_DRAFT_KEY);
      setSuccess(true);
    } catch (saveError) {
      setError(saveError.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return {
    state,
    dispatch,
    step,
    setStep,
    resumeBanner,
    resumeDraft,
    discardDraft,
    saving,
    error,
    success,
    canNext,
    totalSteps,
    effectiveStep,
    visibleSteps,
    goNext,
    goBack,
    handleSave,
  };
}
