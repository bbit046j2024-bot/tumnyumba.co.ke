"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PayButtonProps {
  bookingId: string;
  amountDue: number;
  amountPaid: number;
  onPaymentSuccess?: (receipt: string, amount: number) => void;
}

type PaymentState = "IDLE" | "INITIATING" | "WAITING_PIN" | "CONFIRMED" | "FAILED" | "TIMEOUT";

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function PayButton({
  bookingId,
  amountDue,
  amountPaid,
  onPaymentSuccess,
}: PayButtonProps) {
  const remaining = Math.max(0, Math.round((amountDue - amountPaid) * 100) / 100);

  const [paymentState, setPaymentState] = useState<PaymentState>(remaining === 0 ? "CONFIRMED" : "IDLE");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Installment mode toggle
  const [isCustomInstallment, setIsCustomInstallment] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(String(remaining));

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);

  const clearPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPolling();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1F9254", "#1F6B4A", "#E4F5EC", "#FFD700"],
      });
    } catch {
      // Ignored if canvas-confetti cannot run
    }
  };

  const startPolling = (id: string, chargeAmount: number) => {
    clearPolling();
    pollCountRef.current = 0;

    pollTimerRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      try {
        const res = await fetch(`/api/payments/${id}/status`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === "PUSHED") {
          setPaymentState("WAITING_PIN");
        } else if (data.status === "CONFIRMED") {
          clearPolling();
          setPaymentState("CONFIRMED");
          setReceiptNumber(data.mpesaReceiptNumber);
          triggerConfetti();
          if (onPaymentSuccess) {
            onPaymentSuccess(data.mpesaReceiptNumber || "", chargeAmount);
          }
        } else if (data.status === "FAILED") {
          clearPolling();
          setPaymentState("FAILED");
          setErrorMessage("Payment was declined or cancelled on your phone.");
        } else if (data.status === "TIMEOUT") {
          clearPolling();
          setPaymentState("TIMEOUT");
          setErrorMessage("M-Pesa request timed out. Please try again.");
        }

        // Cap polling at 150 cycles (~5 minutes)
        if (pollCountRef.current >= 150) {
          clearPolling();
          if (paymentState !== "CONFIRMED") {
            setPaymentState("TIMEOUT");
            setErrorMessage("Payment status check timed out. If money was deducted, your booking will update automatically.");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  const handleInitiatePay = async () => {
    if (paymentState === "INITIATING" || paymentState === "WAITING_PIN") return;

    setPaymentState("INITIATING");
    setErrorMessage("");
    setReceiptNumber(null);

    const chargeAmount = isCustomInstallment && Number(customAmount) > 0
      ? Math.min(Number(customAmount), remaining)
      : remaining;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installmentAmount: isCustomInstallment ? chargeAmount : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 202) {
        setPaymentId(data.paymentId);
        setPaymentState("WAITING_PIN");
        startPolling(data.paymentId, chargeAmount);
      } else if (res.status === 409) {
        setPaymentState("FAILED");
        setErrorMessage(data.error || "A payment is already in progress or this booking is already settled.");
      } else {
        setPaymentState("FAILED");
        setErrorMessage(data.error || "Failed to initiate payment. Please check your network and account.");
      }
    } catch {
      setPaymentState("FAILED");
      setErrorMessage("Network error connecting to payment gateway.");
    }
  };

  const handleRetry = () => {
    clearPolling();
    setPaymentState("IDLE");
    setErrorMessage("");
  };

  if (remaining === 0 || paymentState === "CONFIRMED") {
    return (
      <div className="bg-[#E4F5EC] border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1F9254] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg font-poppins">Booking Payment Confirmed</h4>
          <p className="text-xs text-gray-600 mt-0.5">
            {receiptNumber ? (
              <span>
                M-Pesa Receipt: <strong className="font-mono text-gray-900">{receiptNumber}</strong>
              </span>
            ) : (
              "Payment has been settled successfully."
            )}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/70 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> All payments up to date
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4 border border-gray-100">
      {/* Amount Display & Installment Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Balance Due</span>
          <span className="text-lg font-bold text-gray-900 font-poppins">{fmt(remaining)}</span>
        </div>

        {/* Installment Options */}
        {paymentState === "IDLE" && remaining > 500 && (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Payment Option:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomInstallment(false)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    !isCustomInstallment
                      ? "bg-[#1F6B4A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Pay Full ({fmt(remaining)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomInstallment(true);
                    setCustomAmount(String(Math.round(remaining / 2)));
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isCustomInstallment
                      ? "bg-[#1F6B4A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Installment
                </button>
              </div>
            </div>

            {isCustomInstallment && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-500 font-mono">KSh</span>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="input text-xs py-1.5 px-2.5 font-semibold text-gray-900"
                  placeholder="Enter installment amount"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* State Displays */}
      {paymentState === "WAITING_PIN" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2.5 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Smartphone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm font-poppins">Check Your Phone</div>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
              We have sent an M-Pesa prompt to your registered Safaricom phone. Please enter your <strong>M-PESA PIN</strong> to confirm payment.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for M-Pesa confirmation...
          </div>
        </div>
      )}

      {(paymentState === "FAILED" || paymentState === "TIMEOUT") && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div className="text-xs text-red-700 font-medium">{errorMessage}</div>
          <button
            onClick={handleRetry}
            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5 mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}

      {/* Main Pay Button */}
      {paymentState === "IDLE" && (
        <button
          onClick={handleInitiatePay}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Pay {fmt(isCustomInstallment ? Math.min(Number(customAmount) || 0, remaining) : remaining)} via M-Pesa
        </button>
      )}

      {paymentState === "INITIATING" && (
        <button
          disabled
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting to M-Pesa...
        </button>
      )}

      <p className="text-[11px] text-gray-400 text-center">
        🔒 Fast & Secure M-Pesa STK Push. Funds disbursed directly according to platform terms.
      </p>
    </div>
  );
}
