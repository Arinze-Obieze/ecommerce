'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart/CartContext';
import { createClient } from '@/utils/supabase/client';
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';
import { calculateBulkPricing } from '@/utils/catalog/bulk-pricing';
import {
  EMPTY_ADDRESS_FORM,
  NIGERIA_LOCATIONS,
  isAddressValid,
} from '@/features/cart/checkout/address.constants';

export default function useCartCheckout() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, setItemQuantity, clearCart } = useCart();

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState('');
  const [authUser, setAuthUser] = React.useState(null);
  const [addressMode, setAddressMode] = React.useState('saved');
  const [savedAddresses, setSavedAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState('');
  const [addressForm, setAddressForm] = React.useState(EMPTY_ADDRESS_FORM);
  const [saveNewAddress, setSaveNewAddress] = React.useState(true);
  const [loadingAddresses, setLoadingAddresses] = React.useState(true);
  const [deliveryStepOpen, setDeliveryStepOpen] = React.useState(false);
  const [successModal, setSuccessModal] = React.useState({
    open: false,
    orderId: '',
    reference: '',
    amount: 0,
  });

  const isPaymentFinalizingRef = React.useRef(false);
  const hasPaymentSucceededRef = React.useRef(false);

  const cartPricing = React.useMemo(
    () =>
      cart.map((item) => ({
        key: `${item.id}-${item.variant_id ?? 'base'}`,
        pricing: calculateBulkPricing(item, item.quantity),
      })),
    [cart]
  );

  const pricingMap = React.useMemo(
    () => new Map(cartPricing.map((entry) => [entry.key, entry.pricing])),
    [cartPricing]
  );

  const selectedStateCities = React.useMemo(
    () => NIGERIA_LOCATIONS[addressForm.state] || [],
    [addressForm.state]
  );

  const selectedSavedAddress = React.useMemo(
    () => savedAddresses.find((address) => address.id === selectedAddressId) || null,
    [savedAddresses, selectedAddressId]
  );

  const activeDeliveryAddress = addressMode === 'saved' ? selectedSavedAddress : addressForm;

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadUserAndAddresses = React.useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUser(user || null);

      if (!user) {
        setSavedAddresses([]);
        setSelectedAddressId('');
        setAddressMode('new');
        return;
      }

      const response = await fetch('/api/account/addresses', { cache: 'no-store' });
      const json = await response.json();
      const nextAddresses = Array.isArray(json?.data) ? json.data : [];
      setSavedAddresses(nextAddresses);

      const defaultAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0] || null;
      setSelectedAddressId(defaultAddress?.id || '');
      setAddressMode(defaultAddress ? 'saved' : 'new');
      setDeliveryStepOpen(false);
    } catch (error) {
      console.error('Failed to load checkout addresses', error);
      setSavedAddresses([]);
      setSelectedAddressId('');
      setAddressMode('new');
      setDeliveryStepOpen(false);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await loadUserAndAddresses();
    };
    void run();
    return () => {
      active = false;
    };
  }, [loadUserAndAddresses]);

  const subtotal = cart.reduce((total, item) => {
    const pricing = pricingMap.get(`${item.id}-${item.variant_id ?? 'base'}`) || calculateBulkPricing(item, item.quantity);
    return total + pricing.lineTotal;
  }, 0);

  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  const resetSuccessModal = React.useCallback(() => {
    setSuccessModal({
      open: false,
      orderId: '',
      reference: '',
      amount: 0,
    });
  }, []);

  const handleCheckout = React.useCallback(async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    isPaymentFinalizingRef.current = false;
    hasPaymentSucceededRef.current = false;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please log in before checking out');
      }

      let resolvedAddress = null;

      if (addressMode === 'saved') {
        resolvedAddress = savedAddresses.find((address) => address.id === selectedAddressId) || null;
        if (!resolvedAddress || !isAddressValid(resolvedAddress)) {
          throw new Error('Select a valid saved delivery address before checkout.');
        }
      } else {
        if (!isAddressValid(addressForm)) {
          throw new Error('Enter your delivery address before payment.');
        }

        resolvedAddress = {
          ...addressForm,
          type: addressForm.type || 'Address',
          isDefault: savedAddresses.length === 0,
        };

        if (saveNewAddress) {
          const saveResponse = await fetch('/api/account/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...addressForm,
              isDefault: savedAddresses.length === 0,
            }),
          });

          const saveJson = await saveResponse.json();
          if (!saveResponse.ok) {
            throw new Error(saveJson.error || 'Could not save the delivery address.');
          }

          resolvedAddress = saveJson.data;
          const nextAddresses = [resolvedAddress, ...savedAddresses.filter((address) => address.id !== resolvedAddress.id)];
          setSavedAddresses(nextAddresses);
          setSelectedAddressId(resolvedAddress.id);
          setAddressMode('saved');
          setAddressForm(EMPTY_ADDRESS_FORM);
          setSaveNewAddress(true);
        }
      }

      trackAnalyticsEvent('begin_checkout_ui', {
        cart_items: cart.length,
        subtotal,
        shipping,
        total,
        address_mode: addressMode,
        saved_address_for_future: addressMode === 'new' ? saveNewAddress : null,
      });

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
          })),
          deliveryAddress: resolvedAddress,
          addressMode,
          saveAddress: addressMode === 'new' ? saveNewAddress : false,
        }),
      });

      const checkoutJson = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        throw new Error(checkoutJson.error || 'Checkout failed');
      }

      const { orderId, total: authoritativeTotal } = checkoutJson;
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY;
      if (!paystackKey) {
        throw new Error('Paystack configuration missing');
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: Math.round(authoritativeTotal * 100),
        currency: 'NGN',
        ref: `${Math.floor(Math.random() * 1000000000) + 1}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: orderId,
            },
          ],
        },
        callback(response) {
          const paymentReference = response.reference;
          const currentOrderId = orderId;
          isPaymentFinalizingRef.current = true;
          setIsCheckingOut(true);

          fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: paymentReference,
              orderId: currentOrderId,
            }),
          })
            .then((verifyResponse) => {
              if (!verifyResponse.ok) {
                throw new Error(`Verification failed: ${verifyResponse.statusText}`);
              }
              return verifyResponse.json();
            })
            .then((verifyJson) => {
              if (verifyJson.success) {
                hasPaymentSucceededRef.current = true;
                trackAnalyticsEvent('purchase_ui', {
                  order_id: currentOrderId,
                  amount: authoritativeTotal,
                  reference: paymentReference,
                });
                clearCart();
                setIsCheckingOut(false);
                setSuccessModal({
                  open: true,
                  orderId: currentOrderId,
                  reference: paymentReference,
                  amount: authoritativeTotal,
                });
              } else {
                isPaymentFinalizingRef.current = false;
                setCheckoutError(verifyJson.error || 'Payment verification failed.');
                setIsCheckingOut(false);
              }
            })
            .catch((error) => {
              console.error('Verification Error:', error);
              setCheckoutError('Payment succeeded but verification failed. Contact support with your payment reference.');
              isPaymentFinalizingRef.current = false;
              setIsCheckingOut(false);
            });
        },
        onClose() {
          if (isPaymentFinalizingRef.current || hasPaymentSucceededRef.current) {
            return;
          }
          setCheckoutError('Transaction was cancelled before completion.');
          fetch('/api/checkout/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          }).catch((error) => {
            console.error('Failed to cancel reserved order:', error);
          });
          setIsCheckingOut(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
      setIsCheckingOut(false);
    }
  }, [
    addressForm,
    addressMode,
    cart,
    clearCart,
    savedAddresses,
    saveNewAddress,
    selectedAddressId,
    shipping,
    subtotal,
    total,
  ]);

  const deliverySummary = React.useMemo(() => {
    if (!isAddressValid(activeDeliveryAddress)) return null;
    return {
      title: activeDeliveryAddress?.type || 'Delivery address',
      lines: [
        activeDeliveryAddress?.address,
        activeDeliveryAddress?.addressLine2,
        [activeDeliveryAddress?.city, activeDeliveryAddress?.state].filter(Boolean).join(', '),
        activeDeliveryAddress?.phone,
      ].filter(Boolean),
    };
  }, [activeDeliveryAddress]);

  return {
    router,
    cart,
    removeFromCart,
    updateQuantity,
    setItemQuantity,
    clearCart,
    isCheckingOut,
    checkoutError,
    setCheckoutError,
    authUser,
    addressMode,
    setAddressMode,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addressForm,
    setAddressForm,
    saveNewAddress,
    setSaveNewAddress,
    loadingAddresses,
    deliveryStepOpen,
    setDeliveryStepOpen,
    successModal,
    setSuccessModal,
    resetSuccessModal,
    pricingMap,
    selectedStateCities,
    activeDeliveryAddress,
    subtotal,
    shipping,
    total,
    handleCheckout,
    deliverySummary,
  };
}
