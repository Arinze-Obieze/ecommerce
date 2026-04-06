"use client";
import React from 'react';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiMapPin, FiCheckCircle, FiX } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { calculateBulkPricing } from '@/utils/bulkPricing';

const NIGERIA_LOCATIONS = {
  Abia: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu'],
  Adamawa: ['Yola', 'Mubi', 'Numan', 'Jimeta'],
  'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
  Bauchi: ['Bauchi', 'Azare', 'Misau', 'Jamaare'],
  Bayelsa: ['Yenagoa', 'Brass', 'Kaiama', 'Ogbia'],
  Benue: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'],
  Borno: ['Maiduguri', 'Biu', 'Konduga', 'Dikwa'],
  'Cross River': ['Calabar', 'Ikom', 'Ogoja', 'Ugep'],
  Delta: ['Asaba', 'Warri', 'Sapele', 'Ughelli'],
  Ebonyi: ['Abakaliki', 'Afikpo', 'Onueke', 'Ishieke'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'],
  Ekiti: ['Ado Ekiti', 'Ikere Ekiti', 'Ikole Ekiti', 'Ijero Ekiti'],
  Enugu: ['Enugu', 'Nsukka', 'Agbani', 'Oji River'],
  Gombe: ['Gombe', 'Kumo', 'Billiri', 'Dukku'],
  Imo: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
  Jigawa: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure'],
  Kaduna: ['Kaduna', 'Zaria', 'Kafanchan', 'Sabon Tasha'],
  Kano: ['Kano', 'Wudil', 'Gaya', 'Bichi'],
  Katsina: ['Katsina', 'Daura', 'Funtua', 'Malumfashi'],
  Kebbi: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
  Kogi: ['Lokoja', 'Okene', 'Anyigba', 'Kabba'],
  Kwara: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba'],
  Lagos: ['Ikeja', 'Lagos Island', 'Lekki', 'Surulere', 'Yaba', 'Ajah'],
  Nasarawa: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa'],
  Niger: ['Minna', 'Suleja', 'Bida', 'Kontagora'],
  Ogun: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota'],
  Ondo: ['Akure', 'Ondo', 'Owo', 'Ikare'],
  Osun: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
  Oyo: ['Ibadan', 'Ogbomoso', 'Oyo', 'Saki'],
  Plateau: ['Jos', 'Bukuru', 'Pankshin', 'Shendam'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Eleme'],
  Sokoto: ['Sokoto', 'Tambuwal', 'Wurno', 'Gwadabawa'],
  Taraba: ['Jalingo', 'Wukari', 'Bali', 'Takum'],
  Yobe: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'],
  Zamfara: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Tsafe'],
  FCT: ['Abuja', 'Gwagwalada', 'Kubwa', 'Lugbe'],
};

const NIGERIA_STATES = Object.keys(NIGERIA_LOCATIONS);

const EMPTY_ADDRESS_FORM = {
  type: 'Home',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Nigeria',
  phone: '',
};

function isAddressValid(address) {
  return Boolean(
    String(address?.address || '').trim() &&
    String(address?.city || '').trim() &&
    String(address?.state || '').trim() &&
    String(address?.phone || '').trim()
  );
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  emptyMessage = 'No matches found',
  allowCustom = false,
  customOptionLabel,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value || '');
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    setQuery(value || '');
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);
  const trimmedQuery = String(query || '').trim();
  const hasExactMatch = React.useMemo(
    () => options.some((option) => option.toLowerCase() === trimmedQuery.toLowerCase()),
    [options, trimmedQuery]
  );

  return (
    <div className="relative" ref={rootRef}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition focus:border-[#2E5C45] disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <span className={`text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#dbe7e0] bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]">
          <div className="border-b border-gray-100 p-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-[#f8faf8] px-3 py-2.5 text-sm outline-none focus:border-[#2E5C45]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              <>
                {allowCustom && trimmedQuery && !hasExactMatch ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: trimmedQuery } });
                      setQuery(trimmedQuery);
                      setIsOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-xl border border-dashed border-[#b9d5c4] bg-[#f8fcf9] px-3 py-2.5 text-left text-sm font-semibold text-[#1f5f43] transition hover:bg-[#f1faf4]"
                  >
                    <span>{customOptionLabel ? customOptionLabel(trimmedQuery) : `Use "${trimmedQuery}"`}</span>
                    <FiCheckCircle className="h-4 w-4 text-[#2E5C45]" />
                  </button>
                ) : null}
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: option } });
                      setQuery(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      option === value ? 'bg-[#edf8f2] font-semibold text-[#1f5f43]' : 'text-gray-700 hover:bg-[#f5f8f6]'
                    }`}
                  >
                    <span>{option}</span>
                    {option === value ? <FiCheckCircle className="h-4 w-4 text-[#2E5C45]" /> : null}
                  </button>
                ))}
              </>
            ) : (
              <div className="space-y-2 px-3 py-4">
                {allowCustom && trimmedQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: trimmedQuery } });
                      setQuery(trimmedQuery);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-[#b9d5c4] bg-[#f8fcf9] px-3 py-2.5 text-left text-sm font-semibold text-[#1f5f43] transition hover:bg-[#f1faf4]"
                  >
                    <span>{customOptionLabel ? customOptionLabel(trimmedQuery) : `Use "${trimmedQuery}"`}</span>
                    <FiCheckCircle className="h-4 w-4 text-[#2E5C45]" />
                  </button>
                ) : null}
                <div className="text-sm text-gray-500">{emptyMessage}</div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CartPage() {
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
    () => cart.map((item) => ({
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
  const canProceedToPayment = Boolean(
    authUser &&
    !loadingAddresses &&
    ((addressMode === 'saved' && isAddressValid(selectedSavedAddress)) ||
      (addressMode === 'new' && isAddressValid(addressForm)))
  );

  // Load Paystack Script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    const loadUserAndAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        setAuthUser(user || null);

        if (!user) {
          setSavedAddresses([]);
          setSelectedAddressId('');
          setAddressMode('new');
          return;
        }

        const res = await fetch('/api/account/addresses', { cache: 'no-store' });
        const json = await res.json();
        if (!active) return;
        const nextAddresses = Array.isArray(json?.data) ? json.data : [];
        setSavedAddresses(nextAddresses);

        const defaultAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0] || null;
        setSelectedAddressId(defaultAddress?.id || '');
        setAddressMode(defaultAddress ? 'saved' : 'new');
        setDeliveryStepOpen(false);
      } catch (error) {
        if (!active) return;
        console.error('Failed to load checkout addresses', error);
        setSavedAddresses([]);
        setSelectedAddressId('');
        setAddressMode('new');
        setDeliveryStepOpen(false);
      } finally {
        if (active) setLoadingAddresses(false);
      }
    };

    void loadUserAndAddresses();

    return () => {
      active = false;
    };
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const pricing = pricingMap.get(`${item.id}-${item.variant_id ?? 'base'}`) || calculateBulkPricing(item, item.quantity);
    return total + pricing.lineTotal;
  }, 0);
  
  const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over 50k logic example
  const total = subtotal + shipping;

 const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    isPaymentFinalizingRef.current = false;
    hasPaymentSucceededRef.current = false;
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

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
                const saveRes = await fetch('/api/account/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...addressForm,
                        isDefault: savedAddresses.length === 0,
                    }),
                });

                const saveJson = await saveRes.json();
                if (!saveRes.ok) {
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

        // 1. Reserve Stock & Create Order
        trackAnalyticsEvent('begin_checkout_ui', {
          cart_items: cart.length,
          subtotal,
          shipping,
          total,
          address_mode: addressMode,
          saved_address_for_future: addressMode === 'new' ? saveNewAddress : null,
        });

        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({
                    product_id: item.id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                })),
                deliveryAddress: resolvedAddress,
                addressMode,
                saveAddress: addressMode === 'new' ? saveNewAddress : false,
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Checkout failed');
        }

        const { orderId, total: authoritativeTotal } = data;

        // 2. Initialize Paystack Payment
        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY;
        if (!paystackKey) {
            throw new Error('Paystack configuration missing');
        }

        const handler = window.PaystackPop.setup({
            key: paystackKey,
            email: user.email,
            amount: Math.round(authoritativeTotal * 100),
            currency: 'NGN',
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: orderId
                    }
                ]
            },
            // FIX: Make this a regular function, not async
            callback: function(response) {
                // Store response and orderId for later use
                const paymentReference = response.reference;
                const currentOrderId = orderId;
                isPaymentFinalizingRef.current = true;
                
                // Show loading state
                setIsCheckingOut(true);
                
                // Use fetch with .then() instead of async/await
                fetch('/api/paystack/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reference: paymentReference,
                        orderId: currentOrderId
                    })
                })
                .then(verifyRes => {
                    if (!verifyRes.ok) {
                        throw new Error(`Verification failed: ${verifyRes.statusText}`);
                    }
                    return verifyRes.json();
                })
                .then(verifyData => {
                    if (verifyData.success) {
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
                        setCheckoutError(verifyData.error || 'Payment verification failed.');
                        setIsCheckingOut(false);
                    }
                })
                .catch(err => {
                    console.error('Verification Error:', err);
                    setCheckoutError('Payment succeeded but verification failed. Contact support with your payment reference.');
                    isPaymentFinalizingRef.current = false;
                    setIsCheckingOut(false);
                });
            },
            onClose: function() {
                // Avoid cancelling reserved stock while payment callback/verification is in progress
                // or after a successful verification flow.
                if (isPaymentFinalizingRef.current || hasPaymentSucceededRef.current) {
                  return;
                }
                setCheckoutError('Transaction was cancelled before completion.');
                fetch('/api/checkout/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                }).catch((cancelError) => {
                    console.error('Failed to cancel reserved order:', cancelError);
                });
                setIsCheckingOut(false);
            }
        });
        
        handler.openIframe();

    } catch (error) {
        console.error('Checkout error:', error);
        setCheckoutError(error.message);
        setIsCheckingOut(false);
    }
};

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

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-[#f8f5f2]">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
            <FiShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm md:max-w-md text-sm md:text-base leading-relaxed">
          Looks like you haven't added anything to your cart yet. Discover your next favorite item in our shop!
        </p>
        <Link href="/shop" className="px-8 py-3.5 bg-[#2E5C45] text-white font-bold rounded-full hover:bg-[#254a38] hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(46,92,69,0.3)]">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-8 md:py-16">
      <PaymentSuccessModal
        isOpen={successModal.open}
        orderId={successModal.orderId}
        reference={successModal.reference}
        amount={successModal.amount}
        primaryHref={successModal.orderId ? `/profile/orders/${successModal.orderId}` : '/profile?tab=orders'}
        onPrimaryAction={() => {
          setSuccessModal({
            open: false,
            orderId: '',
            reference: '',
            amount: 0,
          });
          router.push(successModal.orderId ? `/profile/orders/${successModal.orderId}` : '/profile?tab=orders');
        }}
        onClose={() => {
          setSuccessModal({
            open: false,
            orderId: '',
            reference: '',
            amount: 0,
          });
          router.push('/shop');
        }}
      />

      {authUser && deliveryStepOpen ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-[#0f1720]/45 pt-24 sm:items-center sm:p-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,32,0.18)] sm:rounded-[32px]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E5C45]">Step 2</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">Delivery details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a saved address or add a delivery address for this order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeliveryStepOpen(false);
                  setCheckoutError('');
                }}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                aria-label="Close delivery step"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-7">
              {savedAddresses.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressMode('saved')}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      addressMode === 'saved'
                        ? 'border border-[#A8DFC4] bg-[#e8f6ef] text-[#1f5f43]'
                        : 'border border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    Use saved address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('new')}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      addressMode === 'new'
                        ? 'border border-[#A8DFC4] bg-[#e8f6ef] text-[#1f5f43]'
                        : 'border border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    Add another address
                  </button>
                </div>
              ) : null}

              {loadingAddresses ? (
                <div className="space-y-3">
                  <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                </div>
              ) : addressMode === 'saved' && savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((address) => {
                    const selected = selectedAddressId === address.id;
                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? 'border-[#A8DFC4] bg-[#edf8f2]'
                            : 'border-gray-200 bg-white hover:border-[#cfe1d7]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {address.type}
                              {address.isDefault ? (
                                <span className="ml-2 rounded-full bg-[#dff3e8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1f5f43]">
                                  Default
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 break-words">
                              {[address.address, address.addressLine2, address.city, address.state, address.country].filter(Boolean).join(', ')}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{address.phone}</p>
                          </div>
                          {selected ? <FiCheckCircle className="h-5 w-5 shrink-0 text-[#2E5C45]" /> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={addressForm.type}
                      onChange={(e) => setAddressForm((current) => ({ ...current, type: e.target.value }))}
                      placeholder="Label e.g. Home"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                    />
                    <input
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((current) => ({ ...current, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                    />
                  </div>
                  <input
                    value={addressForm.address}
                    onChange={(e) => setAddressForm((current) => ({ ...current, address: e.target.value }))}
                    placeholder="Address line 1"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  />
                  <input
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm((current) => ({ ...current, addressLine2: e.target.value }))}
                    placeholder="Address line 2 (optional)"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SearchableSelect
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((current) => ({
                        ...current,
                        state: e.target.value,
                        city: NIGERIA_LOCATIONS[e.target.value]?.includes(current.city) ? current.city : '',
                      }))}
                      options={NIGERIA_STATES}
                      placeholder="Search state"
                    />
                    <SearchableSelect
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((current) => ({ ...current, city: e.target.value }))}
                      options={selectedStateCities}
                      placeholder={addressForm.state ? 'Search city' : 'Select state first'}
                      disabled={!addressForm.state}
                      emptyMessage={addressForm.state ? 'No city match found. Type to use your city.' : 'Select a state first'}
                      allowCustom={Boolean(addressForm.state)}
                      customOptionLabel={(input) => `Use "${input}" as city`}
                    />
                    <input
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm((current) => ({ ...current, postalCode: e.target.value }))}
                      placeholder="Postal code"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E5C45]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Country
                    </label>
                    <input
                      value="Nigeria"
                      disabled
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                    />
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600">
                      Save this address to my account for future orders. If unchecked, it will be used for this checkout only.
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
                    if (!isAddressValid(activeDeliveryAddress)) {
                      setCheckoutError('Complete a valid delivery address to continue.');
                      return;
                    }
                    setCheckoutError('');
                    setDeliveryStepOpen(false);
                  }}
                  className="flex-1 rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#254a38]"
                >
                  Save delivery details
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cart.length})</h1>
        {checkoutError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={`${item.id}-${item.variant_id ?? 'base'}`} className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                {(() => {
                  const pricing = pricingMap.get(`${item.id}-${item.variant_id ?? 'base'}`) || calculateBulkPricing(item, item.quantity);
                  return (
                    <>
                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                  <img 
                    src={item.image_urls?.[0] || 'https://placehold.co/200x200?text=No+Image'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[11px] md:text-xs text-gray-400 mb-1">{item.categories?.[0]?.name || 'Product'}</p>
                        <Link href={`/products/${item.slug || item.id}`} className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 hover:text-[#2E5C45] transition-colors">
                            {item.name}
                        </Link>
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.selectedColor ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f7f4] px-2.5 py-1 text-[11px] md:text-xs font-semibold text-[#2E5C45]">
                                Color: {item.selectedColor}
                              </span>
                            ) : null}
                            {item.selectedSize ? (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] md:text-xs font-semibold text-gray-700">
                                Size: {item.selectedSize}
                              </span>
                            ) : null}
                          </div>
                        )}
                    </div>
                    <button 
                        onClick={() => removeFromCart(item.id, item.variant_id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                        title="Remove item"
                    >
                        <FiTrash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-end mt-2 md:mt-auto">
                     {/* Price */}
                    <div className="flex flex-col mb-3 md:mb-0">
                        <span className="font-bold text-gray-900 text-base md:text-lg leading-none mb-1">
                           ₦{pricing.finalUnitPrice.toLocaleString()} each
                        </span>
                        {pricing.finalUnitPrice < pricing.baseUnitPrice && (
                          <span className="text-[11px] md:text-xs text-gray-400 line-through">
                             ₦{pricing.baseUnitPrice.toLocaleString()} each
                          </span>
                        )}
                        {pricing.hasBulkDiscount ? (
                          <span className="mt-1 text-[11px] md:text-xs font-semibold text-[#0F7A4F]">
                            {pricing.appliedTier.discount_percent}% bulk discount applied for {pricing.appliedTier.minimum_quantity}+ units
                          </span>
                        ) : null}
                    </div>

                    {/* Quantity Control */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full md:w-auto mt-2 md:mt-3">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200 w-full sm:w-auto">
                        {(() => {
                          const maxStock = Number.isFinite(Number(item.stock_quantity))
                            ? Math.max(0, Number(item.stock_quantity))
                            : Infinity;
                          const disableIncrease = Number.isFinite(maxStock) && item.quantity >= maxStock;
                          return (
                            <>
                        <button 
                             onClick={() => updateQuantity(item.id, -1, item.variant_id)}
                             className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-lg transition-all"
                             disabled={item.quantity <= 1}
                        >
                            <FiMinus className="w-4 h-4" />
                        </button>
                        <input 
                             type="number"
                             value={item.quantity}
                             onChange={(e) => {
                               const val = parseInt(e.target.value, 10);
                               if (!isNaN(val)) {
                                 setItemQuantity(item.id, val, item.variant_id);
                               }
                             }}
                             onBlur={(e) => {
                               const val = parseInt(e.target.value, 10);
                               // If input is left empty or invalid, reset to at least 1
                               if (isNaN(val) || val < 1) {
                                 setItemQuantity(item.id, 1, item.variant_id);
                               }
                             }}
                             className="w-full sm:w-14 md:w-16 text-center font-bold text-base md:text-[15px] text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none p-0 hide-number-spinners scbar-hide"
                             min="1"
                             max={Number.isFinite(maxStock) ? maxStock : undefined}
                        />
                        <button 
                             onClick={() => updateQuantity(item.id, 1, item.variant_id)}
                             className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-lg transition-all disabled:opacity-50"
                             disabled={disableIncrease}
                        >
                            <FiPlus className="w-4 h-4" />
                        </button>
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Line total
                        </span>
                        <span className="text-sm md:text-base font-bold text-gray-900">
                          ₦{pricing.lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
            
            <button 
                onClick={clearCart}
                className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all mt-4 flex items-center gap-2 w-fit mx-auto md:mx-0"
            >
                <FiTrash2 /> Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[400px] shrink-0">
             <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping Estimate</span>
                        <span>{shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl border border-gray-100 bg-[#fcfcfc] p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Delivery address</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                We collect this in the next step before payment.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {deliverySummary && !deliveryStepOpen ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f6ef] px-2.5 py-1 text-[11px] font-semibold text-[#1f5f43]">
                              <FiCheckCircle className="h-3.5 w-3.5" />
                              Ready
                            </span>
                          ) : null}
                          <FiMapPin className="w-4 h-4 text-[#2E5C45] shrink-0 mt-0.5" />
                        </div>
                    </div>

                    {deliverySummary ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4">
                          <p className="text-sm font-semibold text-gray-900">{deliverySummary.title}</p>
                          {deliverySummary.lines.map((line) => (
                            <p key={line} className="mt-1 text-sm text-gray-600 break-words">{line}</p>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeliveryStepOpen(true)}
                          className="w-full rounded-xl border border-[#dbe7e0] bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#2E5C45] hover:text-[#2E5C45]"
                        >
                          Change delivery address
                        </button>
                      </div>
                    ) : !authUser ? (
                        <p className="text-sm text-gray-500">
                            You’ll need to sign in before checkout so we can collect a delivery address.
                        </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryStepOpen(true);
                          setCheckoutError('');
                        }}
                        className="w-full rounded-xl border border-dashed border-[#bfd4c7] bg-white px-4 py-4 text-sm font-semibold text-[#2E5C45] transition hover:border-[#2E5C45] hover:bg-[#f7fbf8]"
                      >
                        Add delivery address
                      </button>
                    )}
                </div>

                <button 
                    onClick={() => {
                        if (!deliverySummary) {
                          setDeliveryStepOpen(true);
                          setCheckoutError('Add a delivery address to continue.');
                          return;
                        }
                        void handleCheckout();
                    }}
                    disabled={
                        isCheckingOut ||
                        loadingAddresses ||
                        !authUser
                    }
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isCheckingOut 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#2E5C45] hover:bg-[#254a38] shadow-[#2E5C45]/20'
                    }`}
                >
                    {isCheckingOut
                      ? 'Processing...'
                      : loadingAddresses
                        ? 'Loading address...'
                        : !deliverySummary
                          ? 'Continue to Delivery'
                          : 'Proceed to Payment'} <FiArrowRight />
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Secure Checkout
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
