"use client";

import AuthShowcase from "@/components/auth/shared/AuthShowcase";
import { SIGNUP_PILLS, SIGNUP_SLIDES, SIGNUP_STEPS } from "@/components/auth/signup/signup.constants";

export default function SignupShowcase({ slide, setSlide }) {
  return (
    <AuthShowcase slide={slide} setSlide={setSlide} slides={SIGNUP_SLIDES} pills={SIGNUP_PILLS}>
      <div className="zova-auth-stepper">
        {SIGNUP_STEPS.map((step, index) => (
          <div key={step} className={`zova-auth-step ${index === 0 ? "is-active" : ""}`}>
            <div className="zova-auth-step-index">{index + 1}</div>
            <span className="zova-auth-step-label">{step}</span>
            {index < SIGNUP_STEPS.length - 1 ? <div className="zova-auth-step-line" /> : null}
          </div>
        ))}
      </div>
    </AuthShowcase>
  );
}
