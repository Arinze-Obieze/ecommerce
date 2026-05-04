export const FREE_SHIPPING_THRESHOLD = 50000;
export const STANDARD_SHIPPING_FEE = 2500;

export function calculateShippingFee(subtotal) {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
