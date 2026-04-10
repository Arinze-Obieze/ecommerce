"use client";

import React from "react";
import Link from "next/link";

export default function PaymentSuccessModal({
  isOpen,
  orderId,
  reference,
  amount,
  onClose,
  onPrimaryAction,
  primaryHref = "/profile?tab=orders",
  redirectSeconds = 4,
}) {
  const confettiPieces = React.useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        duration: 1.8 + Math.random() * 1.7,
        color: ["#2E5C45", "#f59e0b", "#ef4444", "#2563eb", "#10b981"][index % 5],
      })),
    []
  );
  const [secondsLeft, setSecondsLeft] = React.useState(redirectSeconds);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    setSecondsLeft(redirectSeconds);

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          onPrimaryAction?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, onPrimaryAction, redirectSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="absolute top-[-20px] h-3 w-2 rounded-sm opacity-90"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animation: `drop ${piece.duration}s linear ${piece.delay}s infinite`,
                transform: `rotate(${piece.id * 21}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative px-6 pb-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment successful</h2>
          <p className="mb-5 text-sm text-gray-600">
            Your order has been confirmed and is now in processing.
          </p>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm">
            <p className="mb-1 text-gray-500">Order ID</p>
            <p className="mb-3 font-semibold text-gray-900">{orderId}</p>
            <p className="mb-1 text-gray-500">Payment reference</p>
            <p className="mb-3 break-all font-semibold text-gray-900">{reference}</p>
            <p className="mb-1 text-gray-500">Amount paid</p>
            <p className="font-semibold text-gray-900">
              ₦{Number(amount || 0).toLocaleString()}
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Redirecting you to your orders in{" "}
            <span className="font-bold">{secondsLeft}</span>{" "}
            second{secondsLeft === 1 ? "" : "s"}.
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="w-full rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#254a38]"
            >
              View my order
            </button>
            <Link
              href={primaryHref}
              className="hidden"
              aria-hidden="true"
            >
              Orders
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drop {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(430px) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
