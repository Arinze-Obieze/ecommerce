export const DELIVERY_ZONES = [
  {
    id: "anambra",
    icon: "🏙️",
    zone: "Onitsha & Anambra State",
    time: "Same Day",
    timeDetail: "Order before 2 PM",
    fee: "₦800",
    feeDetail: "Flat rate within Anambra",
    color: "var(--zova-primary-action)",
    bg: "var(--zova-green-soft)",
    border: "#D4EAE0",
    cities: ["Onitsha", "Awka", "Nnewi", "Asaba", "Agbor", "Ihiala", "Ekwulobia", "Okpoko"],
  },
  {
    id: "southeast",
    icon: "🌿",
    zone: "South East & South South",
    time: "1–2 Days",
    timeDetail: "Mon–Sat delivery",
    fee: "₦1,200",
    feeDetail: "Standard rate",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    cities: ["Enugu", "Port Harcourt", "Aba", "Umuahia", "Owerri", "Calabar", "Uyo", "Abakaliki"],
  },
  {
    id: "southwest",
    icon: "🌆",
    zone: "Lagos & South West",
    time: "2–3 Days",
    timeDetail: "Mon–Sat delivery",
    fee: "₦1,500",
    feeDetail: "Standard rate",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    cities: ["Lagos Island", "Lagos Mainland", "Ikeja", "Ibadan", "Abeokuta", "Akure", "Benin City", "Warri"],
  },
  {
    id: "northsouth",
    icon: "🏛️",
    zone: "Abuja & North Central",
    time: "2–3 Days",
    timeDetail: "Mon–Fri delivery",
    fee: "₦1,500",
    feeDetail: "Standard rate",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    cities: ["Abuja (FCT)", "Minna", "Lokoja", "Lafia", "Makurdi", "Jos", "Kogi", "Nasarawa"],
  },
  {
    id: "north",
    icon: "🌍",
    zone: "Northern Nigeria",
    time: "3–5 Days",
    timeDetail: "Mon–Fri delivery",
    fee: "₦2,000",
    feeDetail: "Extended zone rate",
    color: "#4B5563",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    cities: ["Kano", "Kaduna", "Katsina", "Sokoto", "Zaria", "Maiduguri", "Yola", "Gombe"],
  },
];

export const PROCESS_STEPS = [
  {
    num: "01",
    icon: "💳",
    title: "You Pay",
    desc: "Your payment is held securely in escrow via Paystack. No money moves until your item passes QC.",
    time: "Instant",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    num: "02",
    icon: "🏪",
    title: "Seller Confirms",
    desc: "The seller confirms stock within 2 hours and delivers your item to our ZOVA hub in Onitsha.",
    time: "Within 2 hrs",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    num: "03",
    icon: "🔬",
    title: "QC Inspection",
    desc: "Our team inspects the item against the listing photos. It must pass before anything ships.",
    time: "Within 2 hrs at hub",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    num: "04",
    icon: "📦",
    title: "Packaged & Dispatched",
    desc: "QC-passed items are carefully packaged with ZOVA branding and handed to our logistics partner.",
    time: "Same day as QC pass",
    color: "var(--zova-primary-action)",
    bg: "var(--zova-green-soft)",
  },
  {
    num: "05",
    icon: "🚚",
    title: "Out for Delivery",
    desc: "Your item is in transit. You receive a tracking number via SMS and can follow it in real time.",
    time: "Varies by zone",
    color: "var(--zova-primary-action)",
    bg: "var(--zova-green-soft)",
  },
  {
    num: "06",
    icon: "🎉",
    title: "Delivered to You",
    desc: "Item arrives at your door. If anything is wrong, you have 7 days to initiate a return.",
    time: "See zone table",
    color: "var(--zova-primary-action)",
    bg: "var(--zova-green-soft)",
  },
];

export const SHIPPING_FAQS = [
  {
    q: "Do you ship outside Nigeria?",
    a: "Not yet. ZOVA currently delivers within Nigeria only. We are working on expanding to other West African countries — sign up for our newsletter to be the first to know.",
  },
  {
    q: "What happens if no one is home at delivery?",
    a: "Our logistics partner will attempt delivery up to 2 times. After 2 failed attempts, the item is held at a nearby pickup point for 48 hours before being returned to our hub. Contact us on WhatsApp immediately if you need to reschedule.",
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "Yes, but only before the item has been dispatched from our hub. Contact us on WhatsApp as soon as possible with your order number. Once dispatched, the address cannot be changed.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Take a photo immediately and contact us within 24 hours of delivery. If the damage occurred during shipping, ZOVA covers the full cost — you will receive a replacement or full refund within 48 hours.",
  },
  {
    q: "Is same-day delivery guaranteed?",
    a: "Same-day delivery within Anambra State applies to orders placed before 2 PM on business days (Monday to Saturday). Orders placed after 2 PM are dispatched the following business day.",
  },
  {
    q: "Do you deliver on Sundays?",
    a: "Currently, our logistics partners operate Monday to Saturday. Sunday delivery is not available. Orders placed on Saturday after 2 PM will be dispatched on Monday.",
  },
  {
    q: "Can I pick up my order from your hub?",
    a: "Yes! You can select hub pickup at checkout if you are in or near Onitsha. Your order will be ready for collection the same day it passes QC. Bring your order confirmation SMS.",
  },
  {
    q: "What if my tracking number shows no updates?",
    a: "Tracking data can take up to 2 hours to update after dispatch. If there is no update after 4 hours, contact us on WhatsApp with your order number and we will investigate immediately.",
  },
];

export const PACKAGING_FEATURES = [
  { icon: "👕", title: "Folded & pressed", desc: "Every item is neatly folded and presented — ready to wear or gift." },
  { icon: "🛡️", title: "Protective wrapping", desc: "Items are wrapped to prevent creasing or damage in transit." },
  { icon: "🏷️", title: "ZOVA branded bag", desc: "Delivered in our signature green ZOVA packaging." },
  { icon: "📄", title: "Order slip included", desc: "A packing slip with your order details is included for easy returns." },
];

export const HERO_STATS = [
  { val: "Same Day", label: "Within Anambra", icon: "⚡" },
  { val: "1–2 Days", label: "South East / SS", icon: "🌿" },
  { val: "2–3 Days", label: "Lagos & Abuja", icon: "🌆" },
  { val: "Free", label: "Returns on QC fails", icon: "🛡️" },
];

export const TRUST_ITEMS = [
  "QC-verified before every shipment",
  "Real-time SMS & app tracking",
  "Free returns on our mistakes",
];

export const SHIPPING_NOTES = [
  { icon: "⏰", title: "2 PM cutoff for same-day", desc: "Orders confirmed and QC-passed before 2 PM on business days are dispatched same day within Anambra." },
  { icon: "📅", title: "Business days only", desc: "Delivery operates Monday to Saturday. Orders placed on Saturday after 2 PM are dispatched the following Monday." },
  { icon: "📍", title: "Accurate address required", desc: "Always include your full address including LGA, street name, and a landmark if possible. Wrong addresses cause delays." },
  { icon: "📞", title: "Keep your phone on", desc: "Our dispatch riders may call before delivery. If unreachable after 2 attempts, the order is held at a pickup point." },
  { icon: "🎁", title: "Gift delivery available", desc: "We can ship to a different address for gifts. Add the recipient name and address at checkout. No prices on packing slip." },
  { icon: "🏢", title: "Office deliveries welcome", desc: "Shipping to an office? Include your company name and floor number in the address for faster delivery." },
];

export const CTA_FOOTNOTES = [
  "Free returns on QC failures",
  "Nationwide delivery",
  "24hr order processing",
];
