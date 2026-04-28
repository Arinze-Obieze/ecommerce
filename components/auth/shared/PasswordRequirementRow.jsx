"use client";

import { FiCheck } from "react-icons/fi";

export default function PasswordRequirementRow({ met, label }) {
  return (
    <div className={`zova-auth-requirement ${met ? "is-met" : ""}`}>
      <span className="zova-auth-requirement-icon">
        {met ? <FiCheck size={9} strokeWidth={3.5} /> : null}
      </span>
      <span className="zova-auth-requirement-label">{label}</span>
    </div>
  );
}
