"use client";

function getFieldStateStyles({ hasError, isFocused, isHovered, isFilled, success }) {
  if (success) {
    return {
      border: "var(--zova-primary-action)",
      background: "var(--zova-green-soft)",
      shadow: "0 0 0 3px rgba(46,100,23,0.12)",
    };
  }

  if (hasError) {
    return {
      border: "var(--zova-error)",
      background: "#FEF2F2",
      shadow: isFocused ? "0 0 0 3px rgba(229,57,53,0.12)" : "none",
    };
  }

  if (isFocused) {
    return {
      border: "var(--zova-primary-action)",
      background: "white",
      shadow: "0 0 0 3.5px rgba(46,100,23,0.12)",
    };
  }

  return {
    border: isHovered ? "#B8D4A0" : "var(--zova-border)",
    background: isFilled ? "white" : "var(--zova-surface-alt)",
    shadow: "none",
  };
}

export default function AuthTextField({
  id,
  label,
  type = "text",
  value,
  placeholder,
  icon,
  required = false,
  autoComplete,
  inputMode,
  pattern,
  isFocused,
  isHovered,
  hasError = false,
  isFilled = false,
  success = false,
  trailing,
  onChange,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  helper,
  className = "",
  inputClassName = "",
}) {
  const fieldState = getFieldStateStyles({
    hasError,
    isFocused,
    isHovered,
    isFilled,
    success,
  });

  return (
    <div className={`zova-auth-field ${className}`.trim()}>
      <label htmlFor={id} className="zova-auth-label">
        {label}
      </label>
      <div className="zova-auth-input-wrap">
        {icon ? (
          <span
            className="zova-auth-input-icon"
            style={{
              "--auth-icon-color":
                success
                  ? "var(--zova-primary-action)"
                  : hasError
                    ? "var(--zova-error)"
                    : isFocused
                      ? "var(--zova-primary-action)"
                      : "var(--zova-text-muted)",
            }}
          >
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          pattern={pattern}
          placeholder={placeholder}
          className={`zova-auth-input ${trailing ? "has-trailing" : ""} ${inputClassName}`.trim()}
          style={{
            "--auth-input-border": fieldState.border,
            "--auth-input-bg": fieldState.background,
            "--auth-input-shadow": fieldState.shadow,
          }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
        {trailing}
      </div>
      {helper}
    </div>
  );
}
