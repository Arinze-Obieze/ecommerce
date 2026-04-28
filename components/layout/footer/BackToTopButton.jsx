"use client";

import { FiArrowUp } from "react-icons/fi";

export default function BackToTopButton() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      className="zova-footer-backtop"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FiArrowUp className="h-4 w-4" />
    </button>
  );
}
