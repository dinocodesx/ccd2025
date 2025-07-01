import React from "react";
import { ShoppingCart, Trophy } from "lucide-react";
import {
  GoodiesResult,
  TransactionResult,
  Transaction as ServerTransaction,
  RedemptionResult,
} from "@/types/goodies";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PointsOverview from "./PointsOverview";
import GoodiesRedeem from "./GoodiesRedeem";
import bkFetch from "@/services/backend.services";
import { REDEMPTION_URL } from "@/lib/constants/be";

interface PointsProps {
  goodies: GoodiesResult;
  transactions: TransactionResult;
}
const fetchRedeemedGoodies = async () => {
  const res = await bkFetch(REDEMPTION_URL, { method: "GET" });
  const data = await res.json();
  return data;
};
// Main Component
const Points: React.FC<PointsProps> = async ({ goodies, transactions }) => {
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
  return (
    <div className="w-full space-y-6">
      {/* Tabs Navigation and Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-row gap-2 sm:gap-3 bg-transparent p-0 mb-6 sm:mb-8">
          <TabsTrigger
            value="overview"
            className={
              "flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 " +
              "data-[state=active]:bg-blue-600 data-[state=active]:hover:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 " +
              "data-[state=inactive]:border data-[state=inactive]:border-gray-200 dark:data-[state=inactive]:border-gray-700 " +
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:hover:bg-gray-200 dark:data-[state=inactive]:bg-gray-800 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300"
            }
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="redeem"
            className={
              "flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 " +
              "data-[state=active]:bg-blue-600 data-[state=active]:hover:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 " +
              "data-[state=inactive]:border data-[state=inactive]:border-gray-200 dark:data-[state=inactive]:border-gray-700 " +
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:hover:bg-gray-200 dark:data-[state=inactive]:bg-gray-800 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300"
            }
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>
              Redeem<span className="hidden sm:inline"> Rewards</span>
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <PointsOverview transactions={transactions} />
        </TabsContent>
        <TabsContent value="redeem" className="space-y-4 sm:space-y-6">
          <GoodiesRedeem
            goodies={goodies}
            totalPoints={stats.totalPoints}
            redeemedGoodies={redeemedGoodies}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Points;
