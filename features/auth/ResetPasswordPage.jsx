'use client';

import { useRouter } from 'next/navigation';
import ResetPasswordFormPanel from '@/components/auth/reset-password/ResetPasswordFormPanel';
import useResetPasswordPage from '@/features/auth/reset-password/useResetPasswordPage';

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetPassword = useResetPasswordPage(router);

  return (
    <div
      className="zova-auth-page"
      style={{ alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}
    >
      <ResetPasswordFormPanel
        password={resetPassword.password}
        confirmPassword={resetPassword.confirmPassword}
        loading={resetPassword.loading}
        ready={resetPassword.ready}
        validSession={resetPassword.validSession}
        submitting={resetPassword.submitting}
        success={resetPassword.success}
        error={resetPassword.error}
        passwordFocused={resetPassword.passwordFocused}
        passwordHovered={resetPassword.passwordHovered}
        confirmFocused={resetPassword.confirmFocused}
        confirmHovered={resetPassword.confirmHovered}
        submitHovered={resetPassword.submitHovered}
        showPassword={resetPassword.showPassword}
        showConfirmPassword={resetPassword.showConfirmPassword}
        checks={resetPassword.checks}
        setPasswordFocused={resetPassword.setPasswordFocused}
        setPasswordHovered={resetPassword.setPasswordHovered}
        setConfirmFocused={resetPassword.setConfirmFocused}
        setConfirmHovered={resetPassword.setConfirmHovered}
        setSubmitHovered={resetPassword.setSubmitHovered}
        setShowPassword={resetPassword.setShowPassword}
        setShowConfirmPassword={resetPassword.setShowConfirmPassword}
        handlePasswordChange={(event) => resetPassword.setPassword(event.target.value)}
        handleConfirmPasswordChange={(event) => resetPassword.setConfirmPassword(event.target.value)}
        handleSubmit={resetPassword.handleSubmit}
      />
    </div>
  );
}
