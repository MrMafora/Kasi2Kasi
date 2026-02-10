"use client";

import { useState } from "react";
import { Calculator, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";

export default function SettlementPage() {
  const [members, setMembers] = useState(10);
  const [contribution, setContribution] = useState(1000);
  const [payoutRound, setPayoutRound] = useState(3);
  const [exitRound, setExitRound] = useState(6);
  const [calculated, setCalculated] = useState(false);

  const totalPayout = members * contribution;
  const totalContributed = exitRound * contribution;
  const remainingRounds = members - exitRound;
  const remainingOwed = remainingRounds * contribution;

  // If member already received payout
  const hasReceivedPayout = payoutRound <= exitRound;
  const netBalance = hasReceivedPayout
    ? totalContributed - totalPayout // Negative means they owe
    : totalContributed; // They haven't been paid yet

  const owesGroup = hasReceivedPayout && netBalance < 0;
  const groupOwesMember = !hasReceivedPayout && totalContributed > 0;
  const amountOwed = Math.abs(remainingOwed);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-kasi-green/10 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-kasi-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-kasi-charcoal">Exit Calculator</h1>
          <p className="text-gray-500 text-xs">Calculate settlement for early exit</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-kasi-charcoal">Stokvel Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Members</label>
            <input
              type="number"
              className="input-field"
              value={members}
              onChange={(e) => { setMembers(Number(e.target.value)); setCalculated(false); }}
              min={2}
              max={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Contribution (R)</label>
            <input
              type="number"
              className="input-field"
              value={contribution}
              onChange={(e) => { setContribution(Number(e.target.value)); setCalculated(false); }}
              min={100}
              step={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Which round did you receive your payout?
            </label>
            <input
              type="number"
              className="input-field"
              value={payoutRound}
              onChange={(e) => { setPayoutRound(Number(e.target.value)); setCalculated(false); }}
              min={1}
              max={members}
            />
            <p className="text-xs text-gray-400 mt-1">Enter 0 if you haven&apos;t been paid yet</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Which round do you want to exit?
            </label>
            <input
              type="number"
              className="input-field"
              value={exitRound}
              onChange={(e) => { setExitRound(Number(e.target.value)); setCalculated(false); }}
              min={1}
              max={members}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Calculate Settlement
          </button>
        </div>
      </form>

      {calculated && (
        <div className="mt-4 space-y-4">
          {/* Summary */}
          <div className="card">
            <h3 className="font-semibold text-sm text-kasi-charcoal mb-4">Settlement Summary</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total cycle length</span>
                <span className="text-sm font-semibold">{members} months</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Monthly contribution</span>
                <span className="text-sm font-semibold">{formatCurrency(contribution)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Payout received</span>
                <span className="text-sm font-semibold text-kasi-gold">
                  {hasReceivedPayout ? formatCurrency(totalPayout) : "Not yet"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total contributed so far</span>
                <span className="text-sm font-semibold">{formatCurrency(totalContributed)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Remaining rounds after exit</span>
                <span className="text-sm font-semibold">{remainingRounds}</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`card border-2 ${owesGroup ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"}`}>
            <div className="flex items-start gap-3">
              {owesGroup ? (
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-bold text-lg ${owesGroup ? "text-red-700" : "text-emerald-700"}`}>
                  {owesGroup
                    ? `You owe the group ${formatCurrency(amountOwed)}`
                    : groupOwesMember
                    ? `The group owes you ${formatCurrency(totalContributed)}`
                    : "Settlement is balanced"
                  }
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {owesGroup ? (
                    <>
                      You received {formatCurrency(totalPayout)} in round {payoutRound}, but are exiting in
                      round {exitRound}. You still owe {remainingRounds} remaining contributions of{" "}
                      {formatCurrency(contribution)} each = <strong>{formatCurrency(amountOwed)}</strong>.
                    </>
                  ) : groupOwesMember ? (
                    <>
                      You have contributed {formatCurrency(totalContributed)} but haven&apos;t received your
                      payout yet. The group should settle your contributions.
                    </>
                  ) : (
                    <>All contributions are balanced. No settlement required.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          {owesGroup && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-kasi-green" />
                <h3 className="font-semibold text-sm text-kasi-charcoal">Settlement Options</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-kasi-charcoal">Option 1: Lump Sum Payment</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay {formatCurrency(amountOwed)} as a single payment to settle immediately.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-kasi-charcoal">Option 2: Continue Monthly Payments</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Continue paying {formatCurrency(contribution)}/month for {remainingRounds} months
                    even after leaving the group.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-kasi-charcoal">Option 3: Negotiate with Group</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submit a proposal to the group for an alternative arrangement via the governance module.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
