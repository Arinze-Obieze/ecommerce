'use client';

export default function PromotionWizardSuccess({ onDone }) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Promotion Submitted!</h2>
      <p className="mb-6 text-sm text-gray-500">
        You'll be notified when it's approved — usually within 2 hours.
      </p>
      <button
        onClick={onDone}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Back to Promotions
      </button>
    </div>
  );
}
