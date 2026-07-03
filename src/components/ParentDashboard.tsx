import React, { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  Check,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { UserProgress, ParentCheckpoint } from "../types";

interface ParentDashboardProps {
  progress: UserProgress;
  onUpdateParentConfig: (config: ParentCheckpoint) => void;
  currentConfig: ParentCheckpoint;
}

interface ParentPinPaymentRequest {
  id: string;
  guardianEmail: string;
  payerName: string;
  transferReference: string;
  product: string;
  bankName: string;
  accountNumber: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
  issuedPin?: string | null;
  amountKobo?: number;
}

export default function ParentDashboard({
  progress,
  onUpdateParentConfig,
  currentConfig,
}: ParentDashboardProps) {
  const [pinInput, setPinInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successSaved, setSuccessSaved] = useState(false);

  const [parentEmail, setParentEmail] = useState(
    currentConfig.parentEmail || "",
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    currentConfig.dailyGoalMinutes,
  );
  const [rewardOffer, setRewardOffer] = useState(
    currentConfig.rewardOffer || "",
  );
  const [hourStart, setHourStart] = useState(
    currentConfig.activityAllowedHourStart,
  );
  const [hourEnd, setHourEnd] = useState(currentConfig.activityAllowedHourEnd);
  const [parentNotes, setParentNotes] = useState(
    currentConfig.parentNotes || "",
  );

  const [purchaseEmail, setPurchaseEmail] = useState(
    currentConfig.parentEmail || "",
  );
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState("");
  const [showBuyParentLinkPin, setShowBuyParentLinkPin] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<
    ParentPinPaymentRequest[]
  >([]);

  const latestRequest = useMemo(
    () => paymentRequests[0] || null,
    [paymentRequests],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowBuyParentLinkPin(params.get("parentLinkPage") === "buy");
  }, []);

  const openPurchasePage = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "guardian");
    params.set("parentLinkPage", "buy");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    setShowBuyParentLinkPin(true);
  };

  const closePurchasePage = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "guardian");
    params.delete("parentLinkPage");
    const query = params.toString();
    window.history.pushState(
      {},
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
    setShowBuyParentLinkPin(false);
  };

  const handleSubmitPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setPurchaseMsg("");

    const guardianEmail = purchaseEmail.trim().toLowerCase();
    if (!guardianEmail || !guardianEmail.includes("@")) {
      setErrorMsg("Enter a valid guardian email.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const callbackUrl = `${window.location.origin}${window.location.pathname}?tab=guardian&parentLinkPage=buy`;
      const resp = await fetch("/api/parent-pin/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianEmail,
          callbackUrl,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || "Failed to initialize payment.");
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      setPurchaseMsg("Payment initialized. Continue to checkout.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to start payment right now.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCheckStatus = async (emailOverride?: string) => {
    const guardianEmail = String(emailOverride || purchaseEmail || parentEmail)
      .trim()
      .toLowerCase();
    if (!guardianEmail) {
      setErrorMsg("Enter the guardian email used for payment to check status.");
      return;
    }

    setStatusLoading(true);
    setErrorMsg("");
    try {
      const resp = await fetch(
        `/api/parent-pin/payment-request?guardianEmail=${encodeURIComponent(guardianEmail)}`,
      );
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || "Failed to check payment status.");
        return;
      }
      setPaymentRequests(Array.isArray(data) ? data : []);
      if (!data.length) {
        setPurchaseMsg("No payment request found for this email yet.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to check payment status right now.");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    const verifyPayment = async () => {
      setStatusLoading(true);
      setErrorMsg("");
      try {
        const resp = await fetch(
          `/api/parent-pin/payment-request/verify/${encodeURIComponent(reference)}`,
        );
        const data = await resp.json();
        if (!resp.ok) {
          setErrorMsg(data.error || "Failed to verify payment.");
          return;
        }
        if (data.verified && data.pin) {
          setPurchaseMsg(
            `Payment verified successfully. Your Parent PIN is ${data.pin}.`,
          );
          setPinInput(data.pin);
          if (data.request?.guardianEmail) {
            setParentEmail(data.request.guardianEmail);
            setPurchaseEmail(data.request.guardianEmail);
          }
          await handleCheckStatus(data.request?.guardianEmail);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Unable to verify payment right now.");
      } finally {
        setStatusLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();

    if (!cleanPin) {
      setErrorMsg("Enter your approved Parent PIN.");
      return;
    }

    try {
      const resp = await fetch("/api/parent-pin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: cleanPin,
          studentUsername: progress.username,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || "Unable to unlock parent safeguards.");
        return;
      }

      onUpdateParentConfig({
        ...currentConfig,
        parentPin: cleanPin,
        parentEmail: data.ownerEmail || parentEmail,
      });
      setParentEmail(data.ownerEmail || parentEmail);
      setAuthenticated(true);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to unlock safeguards right now.");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateParentConfig({
      parentPin: currentConfig.parentPin,
      parentEmail,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      rewardOffer,
      activityAllowedHourStart: Number(hourStart),
      activityAllowedHourEnd: Number(hourEnd),
      parentNotes,
    });
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2000);
  };

  return (
    <div
      id="parent-dashboard-root"
      className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-8"
    >
      {!authenticated ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4.5 bg-indigo-50 text-indigo-700 rounded-3xl shadow-sm relative">
              <Lock className="w-10 h-10" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">
              Parent/Guardian Safety LINK
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Parent access requires payment verification. Each approved Parent
              PIN can only link up to 2 students.
            </p>
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              Payments are verified live through Paystack before the Parent PIN
              is issued.
            </p>
          </div>

          {!showBuyParentLinkPin ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openPurchasePage}
                className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Buy Parent Link Pin
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={closePurchasePage}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Parent Link
              </button>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="font-display font-extrabold text-xl text-slate-900">
                    Buy Parent Link Pin
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter the guardian email, continue to Paystack checkout, and
                    your Parent PIN will be issued automatically after live
                    payment verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <CreditCard className="w-5 h-5 text-indigo-600" /> Live
                      Payment Verification
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                          Provider
                        </p>
                        <p className="font-bold text-slate-900">Paystack</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                          Product
                        </p>
                        <p className="font-bold text-slate-900">
                          Parent LINK PIN (up to 2 students)
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                          Verification
                        </p>
                        <p className="font-bold text-slate-900">
                          Automatic after successful Paystack payment
                        </p>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmitPaymentRequest}
                    className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3"
                  >
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Proceed to Paystack Checkout
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="Guardian email"
                      value={purchaseEmail}
                      onChange={(e) => setPurchaseEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60"
                    >
                      {submittingPayment
                        ? "Redirecting..."
                        : "Pay with Paystack"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Check Payment Status
                </p>
                <p className="text-3xs text-slate-500">
                  Once approved, your PIN appears here and can be used to unlock
                  safeguards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCheckStatus()}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {statusLoading ? "Checking..." : "Check Status"}
              </button>
            </div>

            {purchaseMsg && (
              <div className="text-2xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                {purchaseMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-2xs text-red-700 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {errorMsg}
              </div>
            )}

            {latestRequest && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm">
                <p>
                  <span className="font-bold text-slate-700">Status:</span>{" "}
                  <span
                    className={`font-bold ${latestRequest.status === "approved" ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {latestRequest.status}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-slate-700">Reference:</span>{" "}
                  {latestRequest.transferReference}
                </p>
                {latestRequest.issuedPin && (
                  <p>
                    <span className="font-bold text-slate-700">
                      Issued PIN:
                    </span>{" "}
                    <span className="font-mono font-black text-indigo-700 tracking-widest">
                      {latestRequest.issuedPin}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 max-w-md mx-auto">
            <input
              type="password"
              required
              maxLength={6}
              placeholder="Enter approved Parent PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl py-3 text-center text-lg font-bold tracking-widest focus:outline-hidden"
            />
            <button
              type="submit"
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" /> Unlock Safeguards
            </button>
          </form>
        </div>
      ) : (
        <div id="parent-active-workspace" className="space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-150">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500 w-7 h-7" />
                Linked Guardian Administration
              </h2>
              <p className="text-xs text-slate-500">
                You are monitoring statistics for candidate:{" "}
                <b>{progress.username}</b>
              </p>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-bold transition cursor-pointer"
            >
              Lock Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">
                Study Target Accomplishment
              </span>
              <span className="text-lg font-mono font-black text-indigo-700 block">
                {(progress.timeSpentMinutes / 60).toFixed(1)} hours total
              </span>
              <p className="text-3xs text-slate-500">
                Daily Goal: {dailyGoalMinutes} minutes
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">
                Accuracy Assessment
              </span>
              <span className="text-lg font-mono font-black text-indigo-700 block">
                {progress.accuracy}% Accuracy
              </span>
              <p className="text-3xs text-slate-500">
                WAEC standard benchmark: 75% for A1
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">
                Current Motivation Streak
              </span>
              <span className="text-lg font-mono font-black text-amber-500 flex items-center gap-1">
                🔥 {progress.streak} days active
              </span>
              <p className="text-3xs text-slate-500">
                Consistency quota: Active today
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <form
              onSubmit={handleSaveConfig}
              className="lg:col-span-8 space-y-6"
            >
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">
                Adjustment Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">
                    Guardian Alert Email
                  </label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">
                    Target Study Hours (Daily, Min)
                  </label>
                  <input
                    type="number"
                    required
                    value={dailyGoalMinutes}
                    onChange={(e) =>
                      setDailyGoalMinutes(Number(e.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 block">
                  Your Reward Pledge Offer (Displays on Child’s Dashboard)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free cinema ticket if you answer 50 chemistry questions this weekend!"
                  value={rewardOffer}
                  onChange={(e) => setRewardOffer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden font-sans font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">
                    CBT Allowed Start Hour
                  </label>
                  <select
                    value={hourStart}
                    onChange={(e) => setHourStart(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">
                    CBT Allowed End Hour
                  </label>
                  <select
                    value={hourEnd}
                    onChange={(e) => setHourEnd(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 block">
                  Motivational Encouragement note
                </label>
                <textarea
                  rows={2}
                  placeholder="Write an encouraging note that displays on their welcome dashboard..."
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2.5 px-3 focus:outline-hidden resize-none"
                />
              </div>
              <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl">
                {successSaved ? (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <Check className="w-4 h-4" /> Parameters saved successfully!
                  </span>
                ) : (
                  <span className="text-slate-400 text-3xs">
                    Rules synchronize on child’s next log event.
                  </span>
                )}
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Apply Guardrails
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
