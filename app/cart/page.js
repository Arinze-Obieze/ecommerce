"use client";
import React from 'react';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { trackAnalyticsEvent } from '@/utils/analytics';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState('');
  const [successModal, setSuccessModal] = React.useState({
    open: false,
    orderId: '',
    reference: '',
    amount: 0,
  });
  const isPaymentFinalizingRef = React.useRef(false);
  const hasPaymentSucceededRef = React.useRef(false);

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

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const price = item.discount_price || item.price;
    return total + (price * item.quantity);
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

        // 1. Reserve Stock & Create Order
        trackAnalyticsEvent('begin_checkout_ui', {
          cart_items: cart.length,
          subtotal,
          shipping,
          total,
        });

        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({
                    product_id: item.id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                }))
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

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-[#f8f5f2]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet. Go ahead and explore our products.</p>
        <Link href="/shop" className="px-8 py-3 bg-[#2E5C45] text-white font-medium rounded-full hover:bg-[#254a38] transition-colors shadow-lg shadow-[#2E5C45]/20">
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
              <div key={`${item.id}-${item.variant_id ?? 'base'}`} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                        <p className="text-xs text-gray-400 mb-1">{item.categories?.[0]?.name || 'Product'}</p>
                        <Link href={`/products/${item.slug || item.id}`} className="font-semibold text-gray-900 line-clamp-2 hover:text-[#2E5C45] transition-colors">
                            {item.name}
                        </Link>
                    </div>
                    <button 
                        onClick={() => removeFromCart(item.id, item.variant_id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                    >
                        <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-end justify-between mt-2">
                     {/* Price */}
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                           ₦{(item.discount_price || item.price).toLocaleString()}
                        </span>
                        {item.discount_price && (
                          <span className="text-xs text-gray-400 line-through">
                             ₦{item.price.toLocaleString()}
                          </span>
                        )}
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                        {(() => {
                          const maxStock = Number.isFinite(Number(item.stock_quantity))
                            ? Math.max(0, Number(item.stock_quantity))
                            : Infinity;
                          const disableIncrease = Number.isFinite(maxStock) && item.quantity >= maxStock;
                          return (
                            <>
                        <button 
                             onClick={() => updateQuantity(item.id, -1, item.variant_id)}
                             className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                             disabled={item.quantity <= 1}
                        >
                            <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm text-gray-900">{item.quantity}</span>
                        <button 
                             onClick={() => updateQuantity(item.id, 1, item.variant_id)}
                             className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                             disabled={disableIncrease}
                        >
                            <FiPlus className="w-3 h-3" />
                        </button>
                            </>
                          );
                        })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
                onClick={clearCart}
                className="text-sm text-red-500 hover:underline mt-4 flex items-center gap-2"
            >
                <FiTrash2 /> Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 shrink-0">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
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

                <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isCheckingOut 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#2E5C45] hover:bg-[#254a38] shadow-[#2E5C45]/20'
                    }`}
                >
                    {isCheckingOut ? 'Processing...' : 'Checkout Now'} <FiArrowRight />
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
