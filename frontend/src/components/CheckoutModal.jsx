import React, { useState, useEffect, useRef } from 'react';
import { billingService } from '../services/billingService';
import useAuthStore from '../store/authStore';
import { useApi } from '../hooks/useApi';
import { 
  X, CreditCard, Shield, RefreshCw, CheckCircle, 
  Smartphone, Lock, Copy, Check, QrCode, 
  ArrowLeft, Clock, ExternalLink, AlertCircle 
} from 'lucide-react';

const PLAN_AMOUNT = 99;
const UPI_ID = '8122061903@axl';
const PAYEE_NAME = 'Tushar Kumar Tiwari';
const PAYMENT_WINDOW_SECONDS = 600; // 10 minutes

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutModal = ({ isOpen, onClose, planName, onSuccess }) => {
  if (!isOpen) return null;

  // Steps: 'select' → 'upi-scan' | 'card-details' → 'upi-confirm' → 'processing' → 'pending' | 'success'
  const [step, setStep] = useState('select');
  const [method, setMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiReference, setUpiReference] = useState('');
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [billingConfig, setBillingConfig] = useState({});
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(PAYMENT_WINDOW_SECONDS);
  const [submitError, setSubmitError] = useState('');
  const timerRef = useRef(null);

  const { loading, error, execute } = useApi();
  const setUserDetails = useAuthStore((state) => state.setUserDetails);

  // Fetch billing config on mount
  useEffect(() => {
    billingService.getConfig()
      .then((res) => {
        setBillingConfig(res || {});
        if (res && res.razorpay_key_id) {
          setRazorpayKey(res.razorpay_key_id);
        }
      })
      .catch((err) => console.error('Failed to fetch billing config:', err));
  }, []);

  // Timer for UPI scan step
  useEffect(() => {
    if (step === 'upi-scan') {
      setTimer(PAYMENT_WINDOW_SECONDS);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUPIApp = () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${PLAN_AMOUNT}&cu=INR&tn=${encodeURIComponent('IPL Cric-AI Pro Plan')}`;
    // Use a hidden anchor tag to trigger the UPI intent — window.open blocks non-HTTP protocols
    const link = document.createElement('a');
    link.href = upiUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartPayment = async (type) => {
    if (type === 'upi') {
      setMethod('upi');
      setStep('upi-scan');
      return;
    }

    if (razorpayKey) {
      // Live Razorpay for card payments
      setStep('processing');
      try {
        const order = await billingService.createOrder(planName);
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Failed to load Razorpay payment SDK.');
          setStep('select');
          return;
        }

        const options = {
          key: razorpayKey,
          amount: order.amount * 100,
          currency: order.currency,
          name: "IPL Cric-AI",
          description: `${planName} Subscription Refill`,
          order_id: order.order_id,
          handler: async (response) => {
            setStep('processing');
            try {
              const res = await billingService.verifyPayment({
                order_id: order.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
              setUserDetails({
                subscription: res.subscription,
                credits: res.credits
              });
              setStep('success');
              setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
              }, 2500);
            } catch (err) {
              console.error('Signature validation failed:', err);
              alert('Signature verification failed.');
              setStep('select');
            }
          },
          prefill: {
            email: localStorage.getItem('username') || "user@example.com"
          },
          theme: { color: "#4f46e5" },
          modal: { ondismiss: () => setStep('select') }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Razorpay flow failed:', err);
        setStep('select');
      }
    } else {
      // Card sandbox simulation
      setMethod('card');
      setStep('card-details');
    }
  };

  const handleSimulateCardPayment = async (e) => {
    e.preventDefault();
    setStep('processing');

    try {
      const order = await billingService.createOrder(planName);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await billingService.verifyPayment({
        order_id: order.order_id,
        payment_id: `pay_${Math.random().toString(36).substring(2, 11)}`,
        signature: `sig_${Math.random().toString(36).substring(2, 16)}`
      });
      setUserDetails({
        subscription: response.subscription,
        credits: response.credits
      });
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Simulated payment error:', err);
      setStep('card-details');
    }
  };

  const handleConfirmUPI = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!upiReference.trim() || upiReference.trim().length < 10) {
      setSubmitError('Please enter a valid UPI Transaction Reference ID (min 10 characters).');
      return;
    }

    setStep('processing');

    try {
      const response = await billingService.confirmUPI(upiReference.trim());
      
      if (response.status === 'pending_verification') {
        // Payment submitted for admin review
        setStep('pending');
      } else {
        // Instant approval (card/Razorpay)
        setUserDetails({
          subscription: response.subscription,
          credits: response.credits
        });
        setStep('success');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error('UPI confirmation error:', err);
      const errMsg = err?.response?.data?.detail || 'Failed to confirm payment. Please try again or contact support.';
      setSubmitError(errMsg);
      setStep('upi-confirm');
    }
  };

  const goBack = () => {
    setSubmitError('');
    if (step === 'upi-scan') setStep('select');
    else if (step === 'upi-confirm') setStep('upi-scan');
    else if (step === 'card-details') setStep('select');
    else setStep('select');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={step !== 'processing' && step !== 'success' && step !== 'pending' ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden z-10 transition-all duration-300 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800 relative z-10 sticky top-0 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            {(step === 'upi-scan' || step === 'upi-confirm' || step === 'card-details') && step !== 'pending' && (
              <button 
                onClick={goBack}
                className="text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xl">{step === 'success' ? '🎉' : step === 'upi-scan' || step === 'upi-confirm' ? '📱' : '💳'}</span>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-display">
              {step === 'select' && 'Secure Payment'}
              {step === 'upi-scan' && 'Scan & Pay'}
              {step === 'upi-confirm' && 'Confirm Payment'}
              {step === 'card-details' && 'Card Details'}
              {step === 'processing' && 'Processing'}
              {step === 'success' && 'Confirmed!'}
            </h3>
          </div>
          {step !== 'processing' && step !== 'success' && step !== 'pending' && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">

          {/* ─────── STEP 1: SELECT PAYMENT METHOD ─────── */}
          {step === 'select' && (
            <div className="space-y-5">
              {/* Product Info */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/30 dark:to-cyan-950/20 border border-indigo-100/60 dark:border-indigo-900/30 text-center">
                <span className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-indigo-600 dark:text-emerald-400 block mb-1">PRO PLAN UPGRADE</span>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-display">₹{PLAN_AMOUNT}</span>
                  <span className="text-sm text-gray-400">.00</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">One-time • Unlimited predictions forever</span>
              </div>

              {/* Pro Features mini-list */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {['Unlimited Predictions', 'Live Simulations', 'Full Analytics', 'Priority Support'].map((f) => (
                  <div key={f} className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Payment Method Buttons */}
              <div className="space-y-2.5">
                {/* UPI - Primary */}
                <button
                  onClick={() => handleStartPayment('upi')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-200 dark:border-emerald-800/50 bg-indigo-50/50 dark:bg-emerald-950/20 hover:border-indigo-400 dark:hover:border-emerald-500 hover:bg-indigo-50 dark:hover:bg-emerald-950/30 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center space-x-3 text-slate-800 dark:text-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-emerald-400 dark:to-cyan-500 flex items-center justify-center text-white dark:text-slate-900 shadow-md">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-sm block">UPI Payment</span>
                      <span className="text-[10px] text-gray-400 block">PhonePe • GPay • Paytm • BHIM</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Recommended</span>
                    <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => handleStartPayment('card')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-gray-600 bg-slate-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center space-x-3 text-slate-800 dark:text-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-gray-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-sm block">Credit / Debit Card</span>
                      <span className="text-[10px] text-gray-400 block">Visa • Mastercard • RuPay</span>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 uppercase tracking-widest text-center">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Encrypted · Secure Gateway</span>
              </div>
            </div>
          )}

          {/* ─────── STEP 2A: UPI SCAN & PAY ─────── */}
          {step === 'upi-scan' && (
            <div className="space-y-5">
              {/* Timer */}
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className={`text-xs font-bold ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                  Payment window: {formatTime(timer)}
                </span>
              </div>

              {/* QR Code Display */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col items-center">
                <div className="w-56 h-56 rounded-xl overflow-hidden border-2 border-dashed border-indigo-200 dark:border-gray-700 p-1 bg-white">
                  <img 
                    src="/assets/upi-qr-code.png" 
                    alt="UPI QR Code - Scan to Pay" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-semibold tracking-wide">Scan with any UPI app to pay</p>
              </div>

              {/* OR Divider */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or pay directly</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
              </div>

              {/* UPI ID Display + Copy */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">UPI ID</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{UPI_ID}</span>
                  </div>
                  <button
                    onClick={handleCopyUPI}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      copied 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-[10px] text-gray-400">
                  <span className="font-semibold">Payee:</span> {PAYEE_NAME}
                </div>
              </div>

              {/* Open UPI App Button — native <a> tag for protocol handler */}
              <a
                href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${PLAN_AMOUNT}&cu=INR&tn=${encodeURIComponent('IPL Cric-AI Pro Plan')}`}
                className="w-full flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-emerald-400 dark:to-cyan-500 text-white dark:text-slate-950 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg no-underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open UPI App & Pay ₹{PLAN_AMOUNT}</span>
              </a>

              {/* Proceed to confirm */}
              <button
                onClick={() => setStep('upi-confirm')}
                className="w-full text-center p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-950/20 transition-all"
              >
                ✅ I have completed the payment → Submit Reference
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                <Shield className="w-3 h-3" />
                <span>Amount: ₹{PLAN_AMOUNT}.00 · Direct UPI Transfer</span>
              </div>
            </div>
          )}

          {/* ─────── STEP 2B: UPI CONFIRM REFERENCE ─────── */}
          {step === 'upi-confirm' && (
            <form onSubmit={handleConfirmUPI} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Almost Done!</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Enter the UPI Transaction Reference ID from your payment app to verify your purchase.
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">UPI Transaction Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. 431228793402"
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 font-mono tracking-wide transition-colors"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  You'll find this in your UPI app under payment details / transaction history.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 hover:opacity-90 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify & Activate Pro</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─────── STEP 2C: CARD DETAILS (SANDBOX) ─────── */}
          {step === 'card-details' && (
            <form onSubmit={handleSimulateCardPayment} className="space-y-5">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/20 flex items-center space-x-2 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sandbox Mode — Card payments are simulated for testing.</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-indigo-500 dark:hover:bg-emerald-400 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{PLAN_AMOUNT}.00</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─────── PROCESSING ─────── */}
          {step === 'processing' && (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 dark:text-emerald-400 animate-spin" />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-500/20 dark:border-emerald-500/20 animate-ping" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Processing Payment</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verifying your payment and activating Pro...</p>
              </div>
            </div>
          )}

          {/* ─────── PENDING VERIFICATION ─────── */}
          {step === 'pending' && (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1 text-2xl">⏳</div>
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-lg">Payment Under Review</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1.5">
                  Your UPI transaction reference has been submitted successfully.
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed max-w-xs mx-auto">
                  An admin will verify your payment against our bank records. 
                  Your account will be upgraded to <span className="font-bold text-emerald-600 dark:text-emerald-400">Pro</span> once confirmed.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 inline-flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-semibold">Typical verification: within 24 hours</span>
                </div>
              </div>
              <button
                onClick={() => { if (onSuccess) onSuccess(); onClose(); }}
                className="mt-2 bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs py-2.5 px-6 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* ─────── SUCCESS ─────── */}
          {step === 'success' && (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</div>
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xl">Payment Successful!</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
                  Your account has been upgraded to Pro Tier.
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  Unlimited predictions • All features unlocked
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
