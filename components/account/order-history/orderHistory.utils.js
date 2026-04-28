export const ORDER_STATUS_STYLES = {
  completed: {
    label: "Completed",
    color: "var(--zova-primary-action)",
    background: "var(--zova-green-soft)",
    border: "#B8D4A0",
  },
  processing: {
    label: "Processing",
    color: "#EA580C",
    background: "#FFF7ED",
    border: "#FED7AA",
  },
  pending: {
    label: "Pending",
    color: "#888888",
    background: "#F5F5F5",
    border: "#E8E8E8",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--zova-error)",
    background: "#FEF2F2",
    border: "#FECACA",
  },
};

export function formatOrderDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOrderPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}
