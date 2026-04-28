"use client";

import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthTextField from "@/components/auth/shared/AuthTextField";

export default function AuthPasswordField({
  id,
  label,
  value,
  placeholder,
  icon,
  showValue,
  setShowValue,
  isFocused,
  isHovered,
  hasError = false,
  success = false,
  onChange,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  helper,
}) {
  return (
    <AuthTextField
      id={id}
      label={label}
      type={showValue ? "text" : "password"}
      value={value}
      required
      placeholder={placeholder}
      icon={icon}
      isFocused={isFocused}
      isHovered={isHovered}
      hasError={hasError}
      success={success}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      helper={helper}
      trailing={
        <button
          type="button"
          className="zova-auth-input-toggle"
          onClick={() => setShowValue((current) => !current)}
          aria-label={showValue ? `Hide ${label}` : `Show ${label}`}
        >
          {showValue ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      }
    />
  );
}
