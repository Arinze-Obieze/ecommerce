'use client';

import { useRouter } from 'next/navigation';
import LoginFormPanel from '@/components/auth/login/LoginFormPanel';
import LoginShowcase from '@/components/auth/login/LoginShowcase';
import LoginSuccessOverlay from '@/components/auth/login/LoginSuccessOverlay';
import useLoginPage from '@/features/auth/login/useLoginPage';

export default function LoginPage() {
  const router = useRouter();
  const login = useLoginPage(router);

  return (
    <div className="zova-auth-page">
      {login.success ? <LoginSuccessOverlay /> : null}

      <LoginFormPanel
        email={login.email}
        password={login.password}
        error={login.error}
        loading={login.loading}
        rememberMe={login.rememberMe}
        showPass={login.showPass}
        passStrength={login.passStrength}
        strengthLabel={login.strengthLabel}
        strengthColor={login.strengthColor}
        requirements={login.checks}
        emailFocused={login.emailFocused}
        emailHovered={login.emailHovered}
        passFocused={login.passFocused}
        passHovered={login.passHovered}
        submitHovered={login.submitHovered}
        googleHovered={login.googleHovered}
        facebookHovered={login.facebookHovered}
        rememberHovered={login.rememberHovered}
        setShowPass={login.setShowPass}
        setRememberMe={login.setRememberMe}
        setEmailFocused={login.setEmailFocused}
        setEmailHovered={login.setEmailHovered}
        setPassFocused={login.setPassFocused}
        setPassHovered={login.setPassHovered}
        setSubmitHovered={login.setSubmitHovered}
        setGoogleHovered={login.setGoogleHovered}
        setFacebookHovered={login.setFacebookHovered}
        setRememberHovered={login.setRememberHovered}
        handleEmailChange={(event) => login.setEmail(event.target.value)}
        handlePasswordChange={(event) => login.setPassword(event.target.value)}
        handleLogin={login.handleLogin}
        handleGoogleLogin={login.handleGoogleLogin}
      />

      <LoginShowcase slide={login.slide} setSlide={login.setSlide} mounted={login.mounted} />
    </div>
  );
}
