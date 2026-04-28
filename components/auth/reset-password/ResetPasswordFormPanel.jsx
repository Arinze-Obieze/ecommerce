"use client";

import Link from "next/link";
import { FiAlertCircle, FiArrowLeft, FiLoader, FiLock } from "react-icons/fi";
import AuthPasswordField from "@/components/auth/shared/AuthPasswordField";
import AuthStatusCard from "@/components/auth/shared/AuthStatusCard";
import PasswordRequirementRow from "@/components/auth/shared/PasswordRequirementRow";
import { RESET_PASSWORD_REQUIREMENTS } from "@/components/auth/reset-password/resetPassword.constants";

function SpinnerIcon() {
  return <FiLoader size={16} style={{ animation: "zovaSpin 0.9s linear infinite" }} />;
}

export default function ResetPasswordFormPanel(props) {
  const {
    password,
    confirmPassword,
    loading,
    ready,
    validSession,
    submitting,
    success,
    error,
    passwordFocused,
    passwordHovered,
    confirmFocused,
    confirmHovered,
    submitHovered,
    showPassword,
    showConfirmPassword,
    checks,
    setPasswordFocused,
    setPasswordHovered,
    setConfirmFocused,
    setConfirmHovered,
    setSubmitHovered,
    setShowPassword,
    setShowConfirmPassword,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = props;

  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div
      className="zova-auth-panel"
      style={{
        minHeight: "auto",
        flex: "0 1 480px",
        border: "1px solid var(--zova-border)",
        borderRadius: 24,
        boxShadow: "0 18px 60px rgba(17,17,17,0.08)",
        padding: 28,
        justifyContent: "flex-start",
      }}
    >
      <Link href="/login" className="zova-auth-back-link" style={{ marginBottom: 20, color: "var(--zova-text-body)" }}>
        <FiArrowLeft size={14} />
        Back to login
      </Link>

      <div style={{ marginBottom: 20 }}>
        <span className="zova-auth-kicker" style={{ marginBottom: 14 }}>
          Secure account setup
        </span>
        <h1 className="zova-auth-heading serif" style={{ fontSize: 34, lineHeight: 1.05, marginTop: 14 }}>
          Set your new password
        </h1>
        <p className="zova-auth-subcopy" style={{ marginTop: 10, lineHeight: 1.7 }}>
          Choose a strong password to finish account recovery or complete your invited account setup.
        </p>
      </div>

      {loading ? (
        <AuthStatusCard tone="neutral" className="zova-auth-animate-3">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SpinnerIcon />
            <span>Validating your secure link...</span>
          </div>
        </AuthStatusCard>
      ) : null}

      {!loading && ready && !validSession ? (
        <AuthStatusCard
          tone="danger"
          title="Link unavailable"
          icon={<FiAlertCircle size={16} />}
          className="zova-auth-animate-3"
        >
          This password setup link is invalid, already used, or expired. Request a fresh reset email to continue.
        </AuthStatusCard>
      ) : null}

      {!loading && validSession ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {error ? <AuthStatusCard tone="danger">{error}</AuthStatusCard> : null}

          {success ? (
            <AuthStatusCard tone="success">
              Password updated successfully. Taking you to your dashboard...
            </AuthStatusCard>
          ) : null}

          <AuthPasswordField
            id="reset-password"
            label="New Password"
            value={password}
            placeholder="Enter your new password"
            icon={<FiLock size={18} />}
            showValue={showPassword}
            setShowValue={setShowPassword}
            isFocused={passwordFocused}
            isHovered={passwordHovered}
            onChange={handlePasswordChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            onMouseEnter={() => setPasswordHovered(true)}
            onMouseLeave={() => setPasswordHovered(false)}
          />

          <AuthPasswordField
            id="reset-password-confirm"
            label="Confirm Password"
            value={confirmPassword}
            placeholder="Confirm your new password"
            icon={<FiLock size={18} />}
            showValue={showConfirmPassword}
            setShowValue={setShowConfirmPassword}
            isFocused={confirmFocused}
            isHovered={confirmHovered}
            hasError={Boolean(confirmPassword) && !passwordsMatch}
            success={Boolean(confirmPassword) && passwordsMatch}
            onChange={handleConfirmPasswordChange}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            onMouseEnter={() => setConfirmHovered(true)}
            onMouseLeave={() => setConfirmHovered(false)}
          />

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--zova-border)",
              background: "var(--zova-surface-alt)",
              display: "grid",
              gap: 10,
            }}
          >
            {RESET_PASSWORD_REQUIREMENTS.map((item) => (
              <PasswordRequirementRow key={item.key} met={checks[item.key]} label={item.label} />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="zova-auth-submit"
            style={{
              "--auth-submit-bg":
                submitting || success
                  ? "var(--zova-primary-action-hover)"
                  : submitHovered
                    ? "var(--zova-primary-action-hover)"
                    : "var(--zova-primary-action)",
              "--auth-submit-shadow":
                submitting || success
                  ? "none"
                  : submitHovered
                    ? "0 10px 24px rgba(46,100,23,0.25)"
                    : "0 6px 18px rgba(46,100,23,0.18)",
              "--auth-submit-transform":
                !submitting && !success && submitHovered ? "translateY(-1px)" : "none",
            }}
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => setSubmitHovered(false)}
          >
            {submitting ? "Updating password..." : success ? "Password updated" : "Save new password"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
