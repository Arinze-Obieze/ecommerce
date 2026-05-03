"use client";

import Link from "next/link";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";
import BrandMark from "@/components/brand/BrandMark";

function Spinner() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      style={{ animation: "zovaSpin 0.8s linear infinite", flexShrink: 0 }}
    >
      <circle cx="8.5" cy="8.5" r="6" stroke="rgba(0,0,0,0.12)" strokeWidth="2.5" />
      <path
        d="M8.5 2.5a6 6 0 016 6"
        stroke="var(--zova-text-body)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailField({
  email,
  onChange,
  isFocused,
  isHovered,
  hasError,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}) {
  const border = hasError
    ? "var(--zova-error)"
    : isFocused
      ? "var(--zova-primary-action)"
      : isHovered
        ? "#B8D4A0"
        : "var(--zova-border)";
  const background = hasError
    ? "#FEF2F2"
    : isFocused
      ? "white"
      : "var(--zova-surface-alt)";

  return (
    <div className="zova-auth-field zova-auth-animate-3" style={{ marginBottom: 16 }}>
      <label className="zova-auth-label">Email address</label>
      <div className="zova-auth-input-wrap">
        <FiMail
          size={16}
          className="zova-auth-input-icon"
          style={{ "--auth-icon-color": isFocused ? "var(--zova-primary-action)" : "var(--zova-text-muted)" }}
        />
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          placeholder="you@example.com"
          className="zova-auth-input"
          style={{
            "--auth-input-border": border,
            "--auth-input-bg": background,
            "--auth-input-shadow": isFocused ? "0 0 0 3.5px rgba(46,100,23,0.12)" : "none",
          }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </div>
    </div>
  );
}

function PasswordField({
  password,
  showPass,
  setShowPass,
  isFocused,
  isHovered,
  hasError,
  onChange,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}) {
  const border = hasError
    ? "var(--zova-error)"
    : isFocused
      ? "var(--zova-primary-action)"
      : isHovered
        ? "#B8D4A0"
        : "var(--zova-border)";
  const background = hasError
    ? "#FEF2F2"
    : isFocused
      ? "white"
      : "var(--zova-surface-alt)";

  return (
    <div className="zova-auth-animate-4" style={{ marginBottom: 14 }}>
      <div className="zova-auth-label-row" style={{ marginBottom: 7 }}>
        <label className="zova-auth-label">Password</label>
        <Link href="/forgot-password" className="zova-auth-link" style={{ fontSize: 12.5 }}>
          Forgot password?
        </Link>
      </div>

      <div className="zova-auth-input-wrap">
        <FiLock
          size={16}
          className="zova-auth-input-icon"
          style={{ "--auth-icon-color": isFocused ? "var(--zova-primary-action)" : "var(--zova-text-muted)" }}
        />
        <input
          type={showPass ? "text" : "password"}
          required
          value={password}
          placeholder="Enter your password"
          className="zova-auth-input has-trailing"
          style={{
            "--auth-input-border": border,
            "--auth-input-bg": background,
            "--auth-input-shadow": isFocused ? "0 0 0 3.5px rgba(46,100,23,0.12)" : "none",
          }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
        <button
          type="button"
          className="zova-auth-input-toggle"
          onClick={() => setShowPass((value) => !value)}
          aria-label={showPass ? "Hide password" : "Show password"}
        >
          {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );
}

function RememberMe({
  checked,
  hovered,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <div
      className="zova-auth-check zova-auth-animate-5"
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="zova-auth-checkbox"
        style={{
          "--auth-check-border": checked ? "var(--zova-primary-action)" : "var(--zova-border)",
          "--auth-check-bg": checked
            ? "var(--zova-primary-action)"
            : hovered
              ? "var(--zova-surface-alt)"
              : "white",
        }}
      >
        {checked ? <FiCheck size={11} color="#fff" strokeWidth={3.5} /> : null}
      </div>
      <span className="zova-auth-check-label">Keep me signed in</span>
    </div>
  );
}

export default function LoginFormPanel(props) {
  const {
    email,
    password,
    error,
    loading,
    rememberMe,
    showPass,
    emailFocused,
    emailHovered,
    passFocused,
    passHovered,
    submitHovered,
    googleHovered,
    facebookHovered,
    rememberHovered,
    setShowPass,
    setRememberMe,
    setEmailFocused,
    setEmailHovered,
    setPassFocused,
    setPassHovered,
    setSubmitHovered,
    setGoogleHovered,
    setFacebookHovered,
    setRememberHovered,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    handleGoogleLogin,
  } = props;

  return (
    <div className="zova-auth-panel max-md:flex-[1_1_100%] max-md:px-6 max-md:py-10">
      <div className="zova-auth-panel-stripe" />

      <div className="zova-auth-panel-content">
        <div className="zova-auth-brand-row zova-auth-animate-1">
          <BrandMark alt="ZOVA" priority className="h-11 w-[148px] sm:h-[46px] sm:w-[156px]" />
          <span className="zova-auth-brand-text">ZOVA</span>
        </div>

        <div className="zova-auth-animate-2" style={{ marginBottom: 36 }}>
          <h1 className="zova-auth-heading serif">Welcome back.</h1>
          <p className="zova-auth-subcopy">Sign in to your ZOVA account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          {error ? <div className="zova-auth-error">{error}</div> : null}

          <EmailField
            email={email}
            hasError={Boolean(error)}
            isFocused={emailFocused}
            isHovered={emailHovered}
            onChange={handleEmailChange}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            onMouseEnter={() => setEmailHovered(true)}
            onMouseLeave={() => setEmailHovered(false)}
          />

          <PasswordField
            password={password}
            showPass={showPass}
            setShowPass={setShowPass}
            hasError={Boolean(error)}
            isFocused={passFocused}
            isHovered={passHovered}
            onChange={handlePasswordChange}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setTimeout(() => setPassFocused(false), 180)}
            onMouseEnter={() => setPassHovered(true)}
            onMouseLeave={() => setPassHovered(false)}
          />

          <RememberMe
            checked={rememberMe}
            hovered={rememberHovered}
            onToggle={() => setRememberMe((value) => !value)}
            onMouseEnter={() => setRememberHovered(true)}
            onMouseLeave={() => setRememberHovered(false)}
          />

          <div className="zova-auth-animate-6">
            <button
              type="submit"
              disabled={loading}
              className="zova-auth-submit"
              style={{
                "--auth-submit-bg": loading
                  ? "var(--zova-border)"
                  : submitHovered
                    ? "var(--zova-primary-action-hover)"
                    : "var(--zova-primary-action)",
                "--auth-submit-color": loading ? "var(--zova-text-muted)" : "white",
                "--auth-submit-shadow": loading
                  ? "none"
                  : submitHovered
                    ? "0 10px 30px rgba(46,100,23,0.35)"
                    : "0 5px 18px rgba(46,100,23,0.22)",
                "--auth-submit-transform": !loading && submitHovered ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <FiArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          <div className="zova-auth-divider zova-auth-animate-7">
            <div className="zova-auth-divider-line" />
            <span className="zova-auth-divider-label">OR</span>
            <div className="zova-auth-divider-line" />
          </div>

          <div className="zova-auth-social-row zova-auth-animate-8">
            <button
              type="button"
              className="zova-auth-social-btn"
              style={{
                "--auth-social-bg": googleHovered ? "var(--zova-surface-alt)" : "white",
                "--auth-social-shadow": googleHovered ? "0 3px 10px rgba(46,100,23,0.08)" : "none",
                "--auth-social-transform": googleHovered ? "translateY(-1px)" : "none",
              }}
              onClick={handleGoogleLogin}
              onMouseEnter={() => setGoogleHovered(true)}
              onMouseLeave={() => setGoogleHovered(false)}
            >
              <FaGoogle size={14} color="#EA4335" />
              Google
            </button>

            <button
              type="button"
              className="zova-auth-social-btn"
              style={{
                "--auth-social-bg": facebookHovered ? "var(--zova-surface-alt)" : "white",
                "--auth-social-shadow": facebookHovered ? "0 3px 10px rgba(46,100,23,0.08)" : "none",
                "--auth-social-transform": facebookHovered ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={() => setFacebookHovered(true)}
              onMouseLeave={() => setFacebookHovered(false)}
            >
              <FaFacebookF size={14} color="#1877F2" />
              Facebook
            </button>
          </div>

          <p className="zova-auth-helper">
            New to ZOVA?{" "}
            <Link href="/signup" className="zova-auth-link">
              Create an account →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
