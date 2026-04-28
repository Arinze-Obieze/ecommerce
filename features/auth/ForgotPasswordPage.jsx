'use client';

import ForgotPasswordFormPanel from '@/components/auth/forgot-password/ForgotPasswordFormPanel';
import ForgotPasswordShowcase from '@/components/auth/forgot-password/ForgotPasswordShowcase';
import ForgotPasswordSuccessOverlay from '@/components/auth/forgot-password/ForgotPasswordSuccessOverlay';
import useForgotPasswordPage from '@/features/auth/forgot-password/useForgotPasswordPage';

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPasswordPage();

  return (
    <div className="zova-auth-page">
      {forgotPassword.success ? <ForgotPasswordSuccessOverlay email={forgotPassword.email} /> : null}

      <ForgotPasswordFormPanel
        email={forgotPassword.email}
        error={forgotPassword.error}
        loading={forgotPassword.loading}
        success={forgotPassword.success}
        emailFocused={forgotPassword.emailFocused}
        emailHovered={forgotPassword.emailHovered}
        submitHovered={forgotPassword.submitHovered}
        setEmailFocused={forgotPassword.setEmailFocused}
        setEmailHovered={forgotPassword.setEmailHovered}
        setSubmitHovered={forgotPassword.setSubmitHovered}
        handleEmailChange={(event) => forgotPassword.setEmail(event.target.value)}
        handleResetPassword={forgotPassword.handleResetPassword}
      />

      <ForgotPasswordShowcase slide={forgotPassword.slide} setSlide={forgotPassword.setSlide} />
    </div>
  );
}
