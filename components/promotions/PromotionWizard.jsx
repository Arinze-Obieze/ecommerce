'use client';
import Step1Targeting from './steps/Step1Targeting';
import Step2Products from './steps/Step2Products';
import Step3Type from './steps/Step3Type';
import Step4Discount from './steps/Step4Discount';
import Step5Details from './steps/Step5Details';
import Step6Review from './steps/Step6Review';
import PromotionWizardSuccess from '@/components/promotions/PromotionWizardSuccess';
import {
  PromotionWizardResumeBanner,
  PromotionWizardStepper,
} from '@/components/promotions/PromotionWizardStepper';
import usePromotionWizard from '@/components/promotions/usePromotionWizard';

export default function PromotionWizard({ storeId, userId, onDone }) {
  const {
    state,
    dispatch,
    step,
    resumeBanner,
    resumeDraft,
    discardDraft,
    saving,
    error,
    success,
    canNext,
    visibleSteps,
    goNext,
    goBack,
    handleSave,
  } = usePromotionWizard({
    storeId,
    userId,
  });

  if (success) {
    return <PromotionWizardSuccess onDone={onDone} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {resumeBanner && (
        <PromotionWizardResumeBanner onDiscard={discardDraft} onResume={resumeDraft} />
      )}

      <PromotionWizardStepper visibleSteps={visibleSteps} step={step} />

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
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
