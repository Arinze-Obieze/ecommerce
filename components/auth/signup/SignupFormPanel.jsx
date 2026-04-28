"use client";

import Link from "next/link";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import {
  FiArrowRight,
  FiCheck,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
  FiX,
} from "react-icons/fi";
import AuthBrandHeader from "@/components/auth/shared/AuthBrandHeader";
import AuthCheckboxRow from "@/components/auth/shared/AuthCheckboxRow";
import AuthPasswordField from "@/components/auth/shared/AuthPasswordField";
import AuthSocialButton from "@/components/auth/shared/AuthSocialButton";
import AuthTextField from "@/components/auth/shared/AuthTextField";
import PasswordRequirementRow from "@/components/auth/shared/PasswordRequirementRow";
import {
  SIGNUP_REQUIREMENTS,
} from "@/components/auth/signup/signup.constants";

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

export default function SignupFormPanel(props) {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    error,
    loading,
    agreeTerms,
    hoverState,
    focusState,
    showPass,
    showConfirm,
    passFocused,
    passStrength,
    strengthColor,
    strengthLabel,
    passwordsMatch,
    requirements,
    onFocusChange,
    onHoverChange,
    setShowPass,
    setShowConfirm,
    setAgreeTerms,
    onFullNameChange,
    onEmailChange,
    onPhoneChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    onGoogleSignup,
  } = props;

  return (
    <div
      className="zova-auth-panel max-md:flex-[1_1_100%] max-md:px-6 max-md:py-10"
      style={{ flex: "0 0 min(520px, 100%)" }}
    >
      <div className="zova-auth-panel-stripe" />

      <div className="zova-auth-panel-content" style={{ maxWidth: 400 }}>
        <AuthBrandHeader
          className="zova-auth-animate-1"
          markClassName="h-[100px] w-[100px]"
          imageClassName="p-3"
        />

        <div className="zova-auth-animate-2" style={{ marginBottom: 32 }}>
          <h1 className="zova-auth-heading serif" style={{ fontSize: 38 }}>
            Create your
            <br />
            account.
          </h1>
          <p className="zova-auth-subcopy">Join the ZOVA marketplace with one clean setup.</p>
        </div>

        <form onSubmit={onSubmit}>
          {error ? (
            <div className="zova-auth-error" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiX size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          ) : null}

          <div className="zova-auth-social-row zova-auth-animate-3" style={{ marginBottom: 20 }}>
            <AuthSocialButton
              icon={<FaGoogle size={14} color="#EA4335" />}
              label="Google"
              hovered={hoverState.google}
              onClick={onGoogleSignup}
              onMouseEnter={() => onHoverChange("google", true)}
              onMouseLeave={() => onHoverChange("google", false)}
            />
            <AuthSocialButton
              icon={<FaFacebookF size={14} color="#1877F2" />}
              label="Facebook"
              hovered={hoverState.facebook}
              onClick={() => {}}
              onMouseEnter={() => onHoverChange("facebook", true)}
              onMouseLeave={() => onHoverChange("facebook", false)}
            />
          </div>

          <div className="zova-auth-divider zova-auth-animate-4" style={{ marginTop: 0, marginBottom: 20 }}>
            <div className="zova-auth-divider-line" />
            <span className="zova-auth-divider-label">OR SIGN UP WITH EMAIL</span>
            <div className="zova-auth-divider-line" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <AuthTextField
              id="full-name"
              label="Full Name"
              value={fullName}
              required
              placeholder="Chidi Okonkwo"
              icon={<FiUser size={15} />}
              isFocused={focusState.name}
              isHovered={hoverState.name}
              isFilled={Boolean(fullName)}
              onChange={onFullNameChange}
              onFocus={() => onFocusChange("name", true)}
              onBlur={() => onFocusChange("name", false)}
              onMouseEnter={() => onHoverChange("name", true)}
              onMouseLeave={() => onHoverChange("name", false)}
              className="zova-auth-animate-4"
            />

            <AuthTextField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              required
              autoComplete="email"
              placeholder="you@example.com"
              icon={<FiMail size={15} />}
              isFocused={focusState.email}
              isHovered={hoverState.email}
              isFilled={Boolean(email)}
              onChange={onEmailChange}
              onFocus={() => onFocusChange("email", true)}
              onBlur={() => onFocusChange("email", false)}
              onMouseEnter={() => onHoverChange("email", true)}
              onMouseLeave={() => onHoverChange("email", false)}
              className="zova-auth-animate-5"
            />

            <AuthTextField
              id="phone"
              label="Phone"
              type="tel"
              value={phone}
              placeholder="+234 801 234 5678"
              icon={<FiPhone size={15} />}
              inputMode="numeric"
              pattern="[0-9+()\\-\\s]*"
              isFocused={focusState.phone}
              isHovered={hoverState.phone}
              isFilled={Boolean(phone)}
              onChange={onPhoneChange}
              onFocus={() => onFocusChange("phone", true)}
              onBlur={() => onFocusChange("phone", false)}
              onMouseEnter={() => onHoverChange("phone", true)}
              onMouseLeave={() => onHoverChange("phone", false)}
              className="zova-auth-animate-6"
            />

            <div className="zova-auth-animate-7">
              <AuthPasswordField
                id="password"
                label="Password"
                value={password}
                placeholder="Create a password"
                icon={<FiLock size={15} />}
                showValue={showPass}
                setShowValue={setShowPass}
                isFocused={focusState.pass}
                isHovered={hoverState.pass}
                onChange={onPasswordChange}
                onFocus={() => {
                  onFocusChange("pass", true);
                  onFocusChange("passRequirements", true);
                }}
                onBlur={() => {
                  onFocusChange("pass", false);
                  window.setTimeout(() => onFocusChange("passRequirements", false), 180);
                }}
                onMouseEnter={() => onHoverChange("pass", true)}
                onMouseLeave={() => onHoverChange("pass", false)}
                helper={
                  <>
                    {password.length > 0 ? (
                      <div className="zova-auth-strength">
                        <div className="zova-auth-strength-bars">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <div
                              key={index}
                              className="zova-auth-strength-bar"
                              style={{
                                "--auth-strength-fill": index <= passStrength ? strengthColor : "var(--zova-border)",
                              }}
                            />
                          ))}
                        </div>
                        {strengthLabel ? (
                          <p
                            className="zova-auth-strength-label"
                            style={{ "--auth-strength-color": strengthColor }}
                          >
                            {strengthLabel} password
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {passFocused && password.length > 0 ? (
                      <div className="zova-auth-requirements">
                        {SIGNUP_REQUIREMENTS.map((item) => (
                          <PasswordRequirementRow
                            key={item.key}
                            met={requirements[item.key]}
                            label={item.label}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                }
              />
            </div>

            <div className="zova-auth-animate-8">
              <AuthPasswordField
                id="confirm-password"
                label="Confirm Password"
                value={confirmPassword}
                placeholder="Repeat your password"
                icon={
                  confirmPassword.length > 0 ? (
                    passwordsMatch ? <FiCheck size={15} /> : <FiX size={15} />
                  ) : (
                    <FiLock size={15} />
                  )
                }
                showValue={showConfirm}
                setShowValue={setShowConfirm}
                isFocused={focusState.confirm}
                isHovered={hoverState.confirm}
                hasError={Boolean(confirmPassword) && !passwordsMatch}
                success={Boolean(confirmPassword) && passwordsMatch}
                onChange={onConfirmPasswordChange}
                onFocus={() => onFocusChange("confirm", true)}
                onBlur={() => onFocusChange("confirm", false)}
                onMouseEnter={() => onHoverChange("confirm", true)}
                onMouseLeave={() => onHoverChange("confirm", false)}
                helper={
                  confirmPassword.length > 0 ? (
                    <p
                      className="zova-auth-note"
                      style={{
                        marginTop: 6,
                        color: passwordsMatch ? "var(--zova-primary-action-hover)" : "var(--zova-error)",
                        fontWeight: 600,
                      }}
                    >
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  ) : null
                }
              />
            </div>
          </div>

          <AuthCheckboxRow
            checked={agreeTerms}
            hovered={hoverState.agreeTerms}
            onToggle={() => setAgreeTerms((current) => !current)}
            onMouseEnter={() => onHoverChange("agreeTerms", true)}
            onMouseLeave={() => onHoverChange("agreeTerms", false)}
            className="zova-auth-animate-8"
          >
            <>
              I agree to ZOVA&apos;s{" "}
              <Link href="/terms" className="zova-auth-link" onClick={(event) => event.stopPropagation()}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="zova-auth-link" onClick={(event) => event.stopPropagation()}>
                Privacy Policy
              </Link>
            </>
          </AuthCheckboxRow>

          <div className="zova-auth-animate-8">
            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="zova-auth-submit"
              style={{
                "--auth-submit-bg":
                  loading || !agreeTerms
                    ? "var(--zova-border)"
                    : hoverState.submit
                      ? "var(--zova-primary-action-hover)"
                      : "var(--zova-primary-action)",
                "--auth-submit-color":
                  loading || !agreeTerms ? "var(--zova-text-muted)" : "white",
                "--auth-submit-shadow":
                  loading || !agreeTerms
                    ? "none"
                    : hoverState.submit
                      ? "0 10px 30px rgba(46,100,23,0.35)"
                      : "0 5px 18px rgba(46,100,23,0.22)",
                "--auth-submit-transform":
                  !loading && agreeTerms && hoverState.submit ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={() => onHoverChange("submit", true)}
              onMouseLeave={() => onHoverChange("submit", false)}
            >
              {loading ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <FiArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          <p className="zova-auth-helper" style={{ marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/login" className="zova-auth-link">
              Sign in →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
