'use client';

import Link from 'next/link';
import { FiArrowRight, FiCheck, FiCheckCircle, FiMapPin, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi';
import PaymentSuccessModal from '@/components/checkout/PaymentSuccessModal';
import SearchableSelect from '@/features/cart/checkout/SearchableSelect';
import {
  EMPTY_ADDRESS_FORM,
  NIGERIA_LOCATIONS,
  NIGERIA_STATES,
  isAddressValid,
} from '@/features/cart/checkout/address.constants';
import { calculateBulkPricing } from '@/utils/catalog/bulk-pricing';

export function CartEmptyState() {
  return (
    <div className="zova-page flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm md:h-32 md:w-32">
        <FiShoppingBag className="h-10 w-10 text-gray-300 md:h-12 md:w-12" />
      </div>
      <h1 className="zova-title mb-3 text-center text-2xl font-black text-gray-900 md:text-4xl">Your cart is empty</h1>
      <p className="zova-copy mb-8 max-w-sm text-center text-sm leading-relaxed md:max-w-md md:text-base">
        Looks like you haven&apos;t added anything to your cart yet. Discover your next favorite item in our shop!
      </p>
      <Link href="/shop" className="zova-btn zova-btn-primary px-8 py-3.5">
        Start Shopping
      </Link>
    </div>
  );
}

export function CartSuccessModal({ cartPage }) {
  return (
    <PaymentSuccessModal
      isOpen={cartPage.successModal.open}
      orderId={cartPage.successModal.orderId}
      reference={cartPage.successModal.reference}
      amount={cartPage.successModal.amount}
      primaryHref={cartPage.successModal.orderId ? `/profile/orders/${cartPage.successModal.orderId}` : '/profile?tab=orders'}
      onPrimaryAction={() => {
        const orderId = cartPage.successModal.orderId;
        cartPage.resetSuccessModal();
        cartPage.router.push(orderId ? `/profile/orders/${orderId}` : '/profile?tab=orders');
      }}
      onClose={() => {
        cartPage.resetSuccessModal();
        cartPage.router.push('/shop');
      }}
    />
  );
}

export function CartDeliveryModal({ cartPage }) {
  if (!cartPage.deliveryStepOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-[#0f1720]/45 pt-24 sm:items-center sm:p-6"
      onClick={() => {
        cartPage.setDeliveryStepOpen(false);
        cartPage.setCheckoutError('');
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,32,0.18)] sm:rounded-[32px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Step 2</p>
            <h2 className="zova-title mt-1 text-xl font-black text-gray-900">Delivery details</h2>
            <p className="zova-copy mt-1 text-sm">
              Choose a saved address or add a delivery address for this order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              cartPage.setDeliveryStepOpen(false);
              cartPage.setCheckoutError('');
            }}
            className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
            aria-label="Close delivery step"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-7">
          {!cartPage.authUser ? (
            <div className="mb-5 rounded-2xl border border-[#B8D4A0] bg-primary-soft p-4">
              <p className="text-sm font-semibold text-[#1f5f43]">Guest checkout</p>
              <p className="mt-1 text-sm text-[#356a52]">
                Enter the email for order updates and delivery coordination. You can create an account later.
              </p>
              <input
                value={cartPage.checkoutEmail}
                onChange={(event) => cartPage.setCheckoutEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-3 w-full rounded-xl border border-[#B8D4A0] bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : null}

          {cartPage.savedAddresses.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => cartPage.setAddressMode('saved')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cartPage.addressMode === 'saved' ? 'border border-[#B8D4A0] bg-primary-soft text-[#1f5f43]' : 'border border-gray-200 bg-white text-gray-600'}`}
              >
                Use saved address
              </button>
              <button
                type="button"
                onClick={() => cartPage.setAddressMode('new')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cartPage.addressMode === 'new' ? 'border border-[#B8D4A0] bg-primary-soft text-[#1f5f43]' : 'border border-gray-200 bg-white text-gray-600'}`}
              >
                Add another address
              </button>
            </div>
          ) : null}

          {cartPage.loadingAddresses ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          ) : cartPage.addressMode === 'saved' && cartPage.savedAddresses.length > 0 ? (
            <div className="space-y-3">
              {cartPage.savedAddresses.map((address) => {
                const selected = cartPage.selectedAddressId === address.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => cartPage.setSelectedAddressId(address.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-[#B8D4A0] bg-primary-soft' : 'border-gray-200 bg-white hover:border-[#B8D4A0]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {address.type}
                          {address.isDefault ? <span className="ml-2 rounded-full bg-[#dff3e8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1f5f43]">Default</span> : null}
                        </p>
                        <p className="mt-1 break-words text-sm text-gray-600">
                          {[address.address, address.addressLine2, address.city, address.state, address.country].filter(Boolean).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{address.phone}</p>
                      </div>
                      {selected ? <FiCheckCircle className="h-5 w-5 shrink-0 text-primary" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={cartPage.addressForm.type}
                  onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, type: event.target.value }))}
                  placeholder="Label e.g. Home"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  value={cartPage.addressForm.phone}
                  onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <input
                value={cartPage.addressForm.address}
                onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, address: event.target.value }))}
                placeholder="Address line 1"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={cartPage.addressForm.addressLine2}
                onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, addressLine2: event.target.value }))}
                placeholder="Address line 2 (optional)"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SearchableSelect
                  label="State"
                  value={cartPage.addressForm.state}
                  onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, state: event.target.value, city: NIGERIA_LOCATIONS[event.target.value]?.includes(current.city) ? current.city : '' }))}
                  options={NIGERIA_STATES}
                  placeholder="Search state"
                />
                <SearchableSelect
                  label="City"
                  value={cartPage.addressForm.city}
                  onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, city: event.target.value }))}
                  options={cartPage.selectedStateCities}
                  placeholder={cartPage.addressForm.state ? 'Search city' : 'Select state first'}
                  disabled={!cartPage.addressForm.state}
                  emptyMessage={cartPage.addressForm.state ? 'No city match found. Type to use your city.' : 'Select a state first'}
                  allowCustom={Boolean(cartPage.addressForm.state)}
                  customOptionLabel={(input) => `Use "${input}" as city`}
                />
                <input
                  value={cartPage.addressForm.postalCode}
                  onChange={(event) => cartPage.setAddressForm((current) => ({ ...current, postalCode: event.target.value }))}
                  placeholder="Postal code"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Country</label>
                <input value="Nigeria" disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none" />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
                <input type="checkbox" checked={cartPage.saveNewAddress} onChange={(event) => cartPage.setSaveNewAddress(event.target.checked)} className="mt-0.5" disabled={!cartPage.authUser} />
                <span className="text-sm text-gray-600">
                  {cartPage.authUser
                    ? 'Save this address to my account for future orders. If unchecked, it will be used for this checkout only.'
                    : 'This address will be used for this guest checkout only.'}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-[#fcfcfc] px-5 py-4 sm:px-7">
          <div className="flex">
            <button
              type="button"
              onClick={() => {
                if (!cartPage.authUser && !cartPage.checkoutEmail.trim()) {
                  cartPage.setCheckoutError('Add an email address to continue as a guest.');
                  return;
                }
                if (!isAddressValid(cartPage.activeDeliveryAddress)) {
                  cartPage.setCheckoutError('Complete a valid delivery address to continue.');
                  return;
                }
                cartPage.setCheckoutError('');
                cartPage.setDeliveryStepOpen(false);
              }}
              className="zova-btn zova-btn-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
            >
              Save delivery details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartItemsList({ cartPage }) {
  return (
    <div className="flex-1 space-y-4">
      {cartPage.cart.map((item) => (
        <div key={`${item.id}-${item.variant_id ?? 'base'}`} className="zova-panel flex gap-4 p-3 transition-all hover:shadow-md md:p-5">
          {(() => {
            const pricing = cartPage.pricingMap.get(`${item.id}-${item.variant_id ?? 'base'}`) || calculateBulkPricing(item, item.quantity);
            const maxStock = Number.isFinite(Number(item.stock_quantity)) ? Math.max(0, Number(item.stock_quantity)) : Infinity;
            const disableIncrease = Number.isFinite(maxStock) && item.quantity >= maxStock;

            return (
              <>
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 md:h-32 md:w-32">
                  <img src={item.image_urls?.[0] || 'https://placehold.co/200x200?text=No+Image'} alt={item.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-1 text-[11px] text-gray-400 md:text-xs">{item.categories?.[0]?.name || 'Product'}</p>
                      <Link href={`/products/${item.slug || item.id}`} className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-primary md:text-base">
                        {item.name}
                      </Link>
                      {item.selectedColor || item.selectedSize ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.selectedColor ? <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary md:text-xs">Color: {item.selectedColor}</span> : null}
                          {item.selectedSize ? <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 md:text-xs">Size: {item.selectedSize}</span> : null}
                        </div>
                      ) : null}
                    </div>
                    <button onClick={() => cartPage.removeFromCart(item.id, item.variant_id)} className="p-1.5 text-gray-400 transition-colors hover:text-red-500" title="Remove item">
                      <FiTrash2 className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-1 flex-col justify-end md:mt-auto">
                    <div className="mb-3 flex flex-col md:mb-0">
                      <span className="mb-1 text-base font-bold leading-none text-gray-900 md:text-lg">
                        ₦{pricing.finalUnitPrice.toLocaleString()} each
                      </span>
                      {pricing.finalUnitPrice < pricing.baseUnitPrice ? <span className="text-[11px] text-gray-400 line-through md:text-xs">₦{pricing.baseUnitPrice.toLocaleString()} each</span> : null}
                      {pricing.hasBulkDiscount ? <span className="mt-1 text-[11px] font-semibold text-primary-hover md:text-xs">{pricing.appliedTier.discount_percent}% bulk discount applied for {pricing.appliedTier.minimum_quantity}+ units</span> : null}
                    </div>

                    <div className="mt-2 flex w-full flex-col gap-3 sm:mt-3 sm:w-auto sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex w-full items-center rounded-xl border border-gray-200 bg-gray-50 p-1 sm:w-auto">
                        <button onClick={() => cartPage.updateQuantity(item.id, -1, item.variant_id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm md:h-10 md:w-10" disabled={item.quantity <= 1}>
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(event) => {
                            const value = parseInt(event.target.value, 10);
                            if (!Number.isNaN(value)) {
                              cartPage.setItemQuantity(item.id, value, item.variant_id);
                            }
                          }}
                          onBlur={(event) => {
                            const value = parseInt(event.target.value, 10);
                            if (Number.isNaN(value) || value < 1) {
                              cartPage.setItemQuantity(item.id, 1, item.variant_id);
                            }
                          }}
                          className="scbar-hide hide-number-spinners w-full border-none bg-transparent p-0 text-center text-base font-bold text-gray-900 focus:outline-none focus:ring-0 sm:w-14 md:w-16 md:text-[15px]"
                          min="1"
                          max={Number.isFinite(maxStock) ? maxStock : undefined}
                        />
                        <button onClick={() => cartPage.updateQuantity(item.id, 1, item.variant_id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm disabled:opacity-50 md:h-10 md:w-10" disabled={disableIncrease}>
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs">Line total</span>
                        <span className="text-sm font-bold text-gray-900 md:text-base">₦{pricing.lineTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      ))}

      <button onClick={cartPage.clearCart} className="zova-btn zova-btn-destructive mt-4 flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all md:mx-0">
        <FiTrash2 /> Clear Cart
      </button>
    </div>
  );
}

export function CartSummaryPanel({ cartPage }) {
  return (
    <div className="lg:w-[400px] shrink-0">
      <div className="zova-panel sticky top-8 p-6 md:p-8">
        <h2 className="zova-title mb-6 text-xl font-black text-gray-900">Order Summary</h2>

        <div className="mb-6 space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₦{cartPage.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping Estimate</span>
            <span>{cartPage.shipping === 0 ? 'Free' : `₦${cartPage.shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-4 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>₦{cartPage.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-[#fcfcfc] p-4">
          <div className="mb-3 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3">
            <p className="text-sm font-bold text-gray-900">Contact email</p>
            <p className="mt-1 text-xs text-gray-500">
              {cartPage.authUser
                ? cartPage.authUser.email
                : cartPage.checkoutEmail || 'Add your email in the delivery step before payment.'}
            </p>
          </div>

          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Delivery address</h3>
              <p className="mt-1 text-xs text-gray-500">We collect this in the next step before payment.</p>
            </div>
            <div className="flex items-center gap-2">
              {cartPage.deliverySummary && !cartPage.deliveryStepOpen ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-[#1f5f43]">
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  Ready
                </span>
              ) : null}
              <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            </div>
          </div>

          {cartPage.deliverySummary ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">{cartPage.deliverySummary.title}</p>
                {cartPage.deliverySummary.lines.map((line) => (
                  <p key={line} className="mt-1 break-words text-sm text-gray-600">{line}</p>
                ))}
              </div>
              <button type="button" onClick={() => cartPage.setDeliveryStepOpen(true)} className="zova-btn zova-btn-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition">
                Change delivery address
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                cartPage.setDeliveryStepOpen(true);
                cartPage.setCheckoutError('');
              }}
              className="zova-btn zova-btn-secondary w-full rounded-xl border-dashed px-4 py-4 text-sm font-semibold text-primary transition"
            >
              Add delivery address
            </button>
          )}
        </div>

        <button
          onClick={() => {
            if (!cartPage.deliverySummary) {
              cartPage.setDeliveryStepOpen(true);
              cartPage.setCheckoutError('Add a delivery address to continue.');
              return;
            }
            void cartPage.handleCheckout();
          }}
          disabled={cartPage.isCheckingOut || cartPage.loadingAddresses}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold text-white shadow-lg transition-all ${cartPage.isCheckingOut ? 'cursor-not-allowed bg-gray-400' : 'bg-primary shadow-primary/20 hover:bg-primary-hover'}`}
        >
          {cartPage.isCheckingOut ? 'Processing...' : cartPage.loadingAddresses ? 'Loading address...' : !cartPage.deliverySummary ? 'Continue to Delivery' : 'Proceed to Payment'} <FiArrowRight />
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Secure Checkout
        </div>
      </div>
    </div>
  );
}
