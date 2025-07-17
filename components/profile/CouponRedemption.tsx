"use client"
import React, { Dispatch, SetStateAction, useState } from "react";
import { useSession } from "next-auth/react";
import Button from "../ui/Button";
import { toast } from "sonner";
import FeatureRule from '@/public/content/feature.rule.json';

const CouponRedemption: React.FC<{
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({
  setOpen
}) => {
  const { data: session } = useSession();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/goodies/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Coupon code redeemed! Points will be added to your account.");
        setCouponCode("");
        setOpen(false);
      } else {
        toast.error(data.message || "Failed to redeem coupon code.");
      }
    } catch (err) {
      toast.error("An error occurred while redeeming the coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (!FeatureRule.showRedemptionForm) return null;
  if (!session?.user?.profile?.is_checked_in) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-yellow-900 dark:text-yellow-200 text-center font-medium">
        You must be checked in to redeem a coupon code.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-[#181A20] rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-800">
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Redeem Your Coupon Code</h2>
          <p className="text-muted-foreground text-base mb-4">Enter your coupon code below to add points to your account. Codes are case-sensitive.</p>
        </div>
        <form onSubmit={handleCouponSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="coupon-code" className="font-semibold text-lg text-foreground text-left">Coupon Code</label>
            <input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              placeholder="Enter your coupon code"
              className="w-full px-5 py-4 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-[#23272F] text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-google-blue focus:border-google-blue transition shadow-sm"
              disabled={couponLoading}
              required
              autoFocus
              maxLength={32}
            />
          </div>
          <Button
            type="submit"
            disabled={couponLoading || !couponCode.trim()}
            className="w-full py-4 rounded-xl text-lg font-semibold bg-google-blue hover:bg-blue-700 text-white shadow-lg transition"
          >
            {couponLoading ? "Redeeming..." : "Redeem Now"}
          </Button>
          <Button 
            disabled={couponLoading} 
            onClick={() => setOpen(false)} 
            variant="outline"
          >
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CouponRedemption;