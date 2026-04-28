'use client';

export function PromotionWizardResumeBanner({ onDiscard, onResume }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-800">You have an unfinished promotion draft.</p>
      <div className="flex flex-shrink-0 gap-2">
        <button onClick={onDiscard} className="text-xs font-semibold text-gray-500 hover:text-gray-700">
          Discard
        </button>
        <button onClick={onResume} className="text-xs font-semibold text-primary hover:underline">
          Resume →
        </button>
      </div>
    </div>
  );
}

export function PromotionWizardStepper({ visibleSteps, step }) {
  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-1">
      {visibleSteps.map((wizardStep, index) => {
        const isCurrent = wizardStep.num === step;
        const isDone = wizardStep.num < step;

        return (
          <div key={wizardStep.num} className="flex shrink-0 items-center gap-1">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-primary text-white'
                  : isDone
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isDone ? '✓' : wizardStep.displayNum}
              <span className="hidden sm:inline">{wizardStep.label}</span>
            </div>
            {index < visibleSteps.length - 1 ? (
              <div className={`h-px w-4 shrink-0 ${isDone ? 'bg-primary' : 'bg-gray-200'}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
