'use client';

import { useRouter } from 'next/navigation';
import SignupFormPanel from '@/components/auth/signup/SignupFormPanel';
import SignupShowcase from '@/components/auth/signup/SignupShowcase';
import SignupSuccessOverlay from '@/components/auth/signup/SignupSuccessOverlay';
import {
  SIGNUP_STRENGTH_COLORS,
  SIGNUP_STRENGTH_LABELS,
} from '@/components/auth/signup/signup.constants';
import useSignupPage from '@/features/auth/signup/useSignupPage';

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignupPage(router);
  const strengthLabel = SIGNUP_STRENGTH_LABELS[signup.passStrength];
  const strengthColor = SIGNUP_STRENGTH_COLORS[signup.passStrength];

  return (
    <div className="zova-auth-page">
      {signup.success ? <SignupSuccessOverlay /> : null}

      <SignupFormPanel
        fullName={signup.fullName}
        email={signup.email}
        phone={signup.phone}
        password={signup.password}
        confirmPassword={signup.confirmPassword}
        error={signup.error}
        loading={signup.loading}
        agreeTerms={signup.agreeTerms}
        hoverState={signup.hoverState}
        focusState={signup.focusState}
        showPass={signup.showPass}
        showConfirm={signup.showConfirm}
        passFocused={Boolean(signup.focusState.passRequirements)}
        passStrength={signup.passStrength}
        strengthColor={strengthColor}
        strengthLabel={strengthLabel}
        passwordsMatch={signup.passwordsMatch}
        requirements={signup.requirements}
        onFocusChange={signup.setFocus}
        onHoverChange={signup.setHover}
        setShowPass={signup.setShowPass}
        setShowConfirm={signup.setShowConfirm}
        setAgreeTerms={signup.setAgreeTerms}
        onFullNameChange={(event) => signup.setFullName(event.target.value)}
        onEmailChange={(event) => signup.setEmail(event.target.value)}
        onPhoneChange={(event) => signup.setPhone(event.target.value)}
        onPasswordChange={(event) => signup.setPassword(event.target.value)}
        onConfirmPasswordChange={(event) => signup.setConfirmPassword(event.target.value)}
        onSubmit={signup.handleSignup}
        onGoogleSignup={signup.handleGoogleSignup}
      />

      <SignupShowcase slide={signup.slide} setSlide={signup.setSlide} />
    </div>
  );
}
