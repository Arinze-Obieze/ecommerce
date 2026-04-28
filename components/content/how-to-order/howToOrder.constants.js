export const ORDER_STEPS = [
  {
    num: "01",
    icon: "🔍",
    title: "Browse & Discover",
    subtitle: "Find what you love",
    desc: "Explore hundreds of verified clothing items from our sellers. Every listing shows real photos taken at our hub — no stock images, no filters, no surprises.",
    tips: [
      "Use filters to narrow by size, style, and price",
      "Check the size guide tab on each product",
      "All items are pre-verified — everything you see is in stock",
      "Save items to your Wishlist to come back later",
    ],
  },
  {
    num: "02",
    icon: "📐",
    title: "Check Your Size",
    subtitle: "Our sizing system explained",
    desc: "ZOVA uses a standardized hanger sizing system (Size A, B, C, D) alongside standard S/M/L/XL. Every item comes with exact measurements — chest, length, shoulder, and waist.",
    tips: [
      "Size A = XS/S, Size B = M, Size C = L, Size D = XL/XXL",
      "Always check the measurement table, not just the label",
      "If between sizes, check the product description for fit advice",
      "Still unsure? Message us on WhatsApp before ordering",
    ],
  },
  {
    num: "03",
    icon: "🛒",
    title: "Add to Cart & Checkout",
    subtitle: "Secure and simple",
    desc: "Add your item to cart, review your order, and proceed to secure checkout. We accept all major payment methods powered by Paystack.",
    tips: [
      "You can add multiple items from different sellers in one order",
      "Confirm your delivery address before paying",
      "Save your address for faster future checkouts",
      "A 1.5% payment processing fee applies (Paystack)",
    ],
  },
  {
    num: "04",
    icon: "💳",
    title: "Pay Securely",
    subtitle: "Multiple payment options",
    desc: "Complete your payment through our secure Paystack-powered checkout. Your payment is held in escrow until your item passes our quality check — your money is safe.",
    tips: [
      "Card payments: Visa, Mastercard, Verve",
      "Bank transfer and USSD also supported",
      "Payment is escrowed — not released until QC is passed",
      "You get an instant confirmation SMS and email",
    ],
  },
  {
    num: "05",
    icon: "🔬",
    title: "We Verify Your Item",
    subtitle: "Quality control in action",
    desc: "After your order is confirmed, the seller delivers your item to our physical hub. Our QC team inspects it against the original listing photos before anything ships to you.",
    tips: [
      "QC typically takes less than 2 hours after item arrives",
      "If it fails QC, your order is cancelled and refunded in full",
      "We photograph every item during inspection",
      "You get a notification once your item passes QC",
    ],
  },
  {
    num: "06",
    icon: "🚚",
    title: "Fast Delivery to You",
    subtitle: "Tracked all the way",
    desc: "Once your item passes QC, it is packaged and handed to our logistics partner for delivery. You will receive a tracking number to follow your order every step of the way.",
    tips: [
      "Delivery within Anambra: same day or next day",
      "Delivery across Nigeria: 1–3 business days",
      "Track your order anytime from My Orders",
      "SMS updates at every delivery milestone",
    ],
  },
];

export const ORDER_FAQS = [
  { q: "Can I order without creating an account?", a: "No, you need a ZOVA account to place an order. Sign up takes less than 2 minutes and lets you track orders, save addresses, and manage returns easily." },
  { q: "What if my item is out of stock after I pay?", a: "If a seller fails to confirm stock within 2 hours of your order, the order is automatically cancelled and you receive a full refund — no questions asked." },
  { q: "Can I order multiple items in one checkout?", a: "Yes. You can add items from multiple sellers and check out together. Each item goes through its own QC process at our hub." },
  { q: "What payment methods do you accept?", a: "We accept all cards (Visa, Mastercard, Verve), bank transfer, and USSD via Paystack. We do not accept cash or direct bank transfers outside of Paystack." },
  { q: "Can I change my order after placing it?", a: "You can cancel an order within 30 minutes of placing it if the seller has not yet confirmed stock. After stock is confirmed, the order cannot be changed." },
  { q: "Is my payment safe?", a: "Yes. Your payment is held in escrow by Paystack until your item passes our QC inspection. If the item fails QC, your full payment is returned immediately." },
];

export const PAYMENT_METHODS = [
  { icon: "💳", method: "Debit Card", detail: "Visa, Mastercard, Verve" },
  { icon: "🏦", method: "Bank Transfer", detail: "Direct from any Nigerian bank" },
  { icon: "📱", method: "USSD", detail: "*737#, *737# and more" },
  { icon: "📲", method: "Mobile Money", detail: "Available via Paystack" },
];
