// components/product-wizard/WizardStepper.jsx
"use client";
import React from "react";
import { WIZARD_STEPS, isWizardStepComplete } from "@/lib/product-wizard-constants";
import { useWizard } from "./WizardProvider";

export default function WizardStepper() {
  const { currentStep, goToStep, state } = useWizard();
  let furthestCompletedStep = 0;
  for (const step of WIZARD_STEPS) {
    if (!isWizardStepComplete(step.num, state)) break;
    furthestCompletedStep = step.num;
  }

  const progressBaseStep = Math.max(currentStep - 1, furthestCompletedStep);
  const progress = (progressBaseStep / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-[#2E5C45]">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <span className="text-xs font-semibold text-gray-500">
            {WIZARD_STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-1.5 bg-[#dbe7e0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E5C45] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-center gap-1.5 mt-2.5">
          {WIZARD_STEPS.map((s) => (
            <div key={s.num} className={`h-1.5 rounded-full transition-all duration-300 ${
              s.num === currentStep ? "w-5 bg-[#2E5C45]"
                : s.num <= furthestCompletedStep ? "w-1.5 bg-[#2E5C45]/50"
                : "w-1.5 bg-[#dbe7e0]"
            }`} />
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block mb-6">
        <div className="relative rounded-2xl border border-[#dbe7e0] bg-white px-8 py-5 shadow-sm">
          {/* Track */}
          <div className="absolute top-1/2 left-[6%] right-[6%] h-[2px] bg-[#dbe7e0] -translate-y-1" />
          <div
            className="absolute top-1/2 left-[6%] h-[2px] bg-[#2E5C45] -translate-y-1 transition-all duration-500 ease-out"
            style={{ width: `${progress * 0.88}%` }}
          />
          <div className="relative flex justify-between">
            {WIZARD_STEPS.map((s) => {
              const active = s.num === currentStep;
              const complete = isWizardStepComplete(s.num, state);
              const done = s.num <= furthestCompletedStep && complete;
              const canGoToStep = s.num !== currentStep && s.num <= furthestCompletedStep && complete;
              return (
                <div key={s.num} className="flex flex-col items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (canGoToStep) goToStep(s.num);
                    }}
                    disabled={!canGoToStep}
                    aria-current={active ? "step" : undefined}
                    aria-label={canGoToStep ? `Go to ${s.label}` : s.label}
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                      border-[3px] transition-all duration-300
                      ${active ? "bg-[#2E5C45] border-[#2E5C45] text-white scale-110 shadow-md shadow-[#2E5C45]/20"
                        : done ? "bg-[#2E5C45] border-[#2E5C45] text-white hover:bg-[#254a38] hover:border-[#254a38] cursor-pointer"
                        : "bg-white border-[#dbe7e0] text-gray-400"
                      }
                      ${canGoToStep ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5C45] focus-visible:ring-offset-2" : "cursor-default"}
                    `}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.num}
                  </button>
                  <span className={`text-[10px] font-semibold tracking-wide ${
                    active ? "text-[#2E5C45]" : done ? "text-[#2E5C45]/60" : "text-gray-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
