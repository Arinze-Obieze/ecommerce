"use client";

import Link from "next/link";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import AuthBrandHeader from "@/components/auth/shared/AuthBrandHeader";
import AuthTextField from "@/components/auth/shared/AuthTextField";

export default function ForgotPasswordFormPanel({
  email,
  error,
  loading,
  success,
  emailFocused,
  emailHovered,
  submitHovered,
  setEmailFocused,
  setEmailHovered,
  setSubmitHovered,
  handleEmailChange,
  handleResetPassword,
}) {
  return (
    <div className="zova-auth-panel max-md:flex-[1_1_100%] max-md:px-6 max-md:py-10">
      <div className="zova-auth-panel-stripe" />

      <div className="zova-auth-panel-content">
        <AuthBrandHeader className="zova-auth-animate-1" markClassName="h-[60px] w-[118px]" imageClassName="p-1.5" iconSize={24} label="" />

        <div className="zova-auth-animate-2" style={{ marginBottom: 10 }}>
          <span className="zova-auth-kicker">Account recovery</span>
        </div>

        <div className="zova-auth-animate-3" style={{ marginBottom: 30 }}>
          <h1 className="zova-auth-heading serif" style={{ fontSize: 52, lineHeight: 0.92, letterSpacing: "-0.04em" }}>
            Forgot your password?
          </h1>
          <p className="zova-auth-subcopy" style={{ lineHeight: 1.7 }}>
            Enter the email tied to your account and we will send you a reset link so you can get back in quickly.
          </p>
        </div>

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {error ? <div className="zova-auth-error zova-auth-animate-4">{error}</div> : null}

          <AuthTextField
            id="forgot-password-email"
            label="Email Address"
            type="email"
            value={email}
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={<FiMail size={18} />}
            isFocused={emailFocused}
            isHovered={emailHovered}
            hasError={Boolean(error)}
            isFilled={Boolean(email)}
            onChange={handleEmailChange}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            onMouseEnter={() => setEmailHovered(true)}
            onMouseLeave={() => setEmailHovered(false)}
            className="zova-auth-animate-4"
          />

          <button
            type="submit"
            disabled={loading || success}
            className="zova-auth-submit zova-auth-animate-5"
            style={{
              "--auth-submit-bg":
                loading || success
                  ? "#b7c7c0"
                  : submitHovered
                    ? "var(--zova-primary-action-hover)"
                    : "var(--zova-primary-action)",
              "--auth-submit-shadow":
                loading || success ? "none" : "0 10px 24px rgba(46,100,23,0.22)",
              "--auth-submit-transform":
                loading || success ? "none" : submitHovered ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => setSubmitHovered(false)}
          >
            {loading ? "Sending reset link..." : success ? "Link sent" : "Send Reset Link"}
          </button>
        </form>

        <div className="zova-auth-animate-6" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/login" className="zova-auth-back-link">
            <FiArrowLeft size={15} />
            Back to login
          </Link>
          <p className="zova-auth-note">
            Remembered your password? You can return to sign in right away.
          </p>
        </div>
      </div>
    </div>
  );
}
