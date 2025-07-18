import React from "react";
import { ShoppingCart, Trophy } from "lucide-react";
import {
  GoodiesResult,
  TransactionResult,
  Transaction as ServerTransaction,
  RedemptionResult,
} from "@/types/goodies";
import PointsOverview from "./PointsOverview";
import GoodiesRedeem from "./GoodiesRedeem";
import Link from "next/link";

import bkFetch from "@/services/backend.services";
import { REDEMPTION_URL, USERS_DJANGO_URL } from "@/lib/constants/be";
import CouponRedemptionDialogTrigger from "./CouponRedemptionDialogTrigger";
import FeatureRule from "@/public/content/feature.rule.json";
import { getServerSession, Profile } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PointsProps {
  goodies: GoodiesResult;
  transactions: TransactionResult;
  searchParams: { active?: string };
}

const fetchRedeemedGoodies = async () => {
  const res = await bkFetch(REDEMPTION_URL, { method: "GET" });
  const data = await res.json();
  return data;
};

// Main Component
const Points: React.FC<PointsProps> = async ({
  goodies,
  transactions,
  searchParams,
}) => {
  const session = await getServerSession(authOptions);

  const defaultTab = searchParams?.active || "overview";
  

  // Map server transactions to UI Transaction type
  const transactionData =
    transactions?.results?.map((t: ServerTransaction) => ({
      id: t.id,
      type: (t.points > 0 ? "earned" : "redeemed") as "earned" | "redeemed",
      activity: t.event || (t.points > 0 ? "Points Earned" : "Points Redeemed"),
      points: t.points,
      timestamp: t.timestamp,
      description: t.event || "",
    })) || [];

  // Calculate stats directly (no useMemo)
  const totalPoints = transactionData.reduce((sum, t) => sum + t.points, 0);
  const totalEarned = transactionData
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = Math.abs(
    transactionData
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + t.points, 0)
  );
  const stats = {
    totalPoints,
    totalEarned,
    totalRedeemed,
    availablePoints: totalPoints - totalRedeemed,
  };

  const redeemedGoodies: RedemptionResult = await fetchRedeemedGoodies();

  // Get default tab from search params or use "overview"
  // const defaultTab = resolvedSearchParams?.active || "overview";
  const userRes= await bkFetch(USERS_DJANGO_URL,{method:"GET"})
  const user=await userRes.json()

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Points
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Participate in events, earn points and redeem them for awesome
              rewards!
            </p>

            {FeatureRule.showRedemptionForm &&
              user?.is_checked_in && !user?.early_bird_redeemed && (
                <CouponRedemptionDialogTrigger user={user as Profile}/>
              )}
          </div>
          <div className="flex-shrink-0 justify-center md:justify-end hidden md:block">
            <img
              src="/images/elements/2025-black.svg"
              alt="CCD 2025"
              className="h-8 md:h-10 dark:invert"
            />
          </div>
        </div>
      </div>
      <hr className="mb-6" />

      {/* Tabs Navigation and Content */}
      <div className="w-full">
        <div className="flex flex-row gap-2 sm:gap-3 bg-transparent p-0 mb-6 sm:mb-8 justify-center items-center">
          <Link
            href="/profile?tab=Points&active=overview"
            scroll={false}
            className="block"
          >
            <button
              className={
                "flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 " +
                (defaultTab === "overview"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md sm:shadow-lg shadow-blue-600/25"
                  : "border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300")
              }
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Overview</span>
            </button>
          </Link>
          <Link
            href="/profile?tab=Points&active=redeem"
            scroll={false}
            className="block"
          >
            <button
              className={
                "flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 " +
                (defaultTab === "redeem"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md sm:shadow-lg shadow-blue-600/25"
                  : "border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300")
              }
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                Redeem<span className="hidden sm:inline"> Rewards</span>
              </span>
            </button>
          </Link>
        </div>

        {defaultTab === "overview" && (
          <div className="space-y-4 sm:space-y-6">
            <PointsOverview transactions={transactions} />
          </div>
        )}

        {defaultTab === "redeem" && (
          <div className="space-y-4 sm:space-y-6">
            <GoodiesRedeem
              goodies={goodies}
              totalPoints={stats.totalPoints}
              redeemedGoodies={redeemedGoodies}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Points;
