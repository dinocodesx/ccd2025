import React from "react";
import {
  ShoppingCart,
  Trophy
} from "lucide-react";
import { GoodiesResult, TransactionResult, Transaction as ServerTransaction, RedemptionResult } from "@/types/goodies";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PointsOverview from "./PointsOverview";
import GoodiesRedeem from "./GoodiesRedeem";
import bkFetch from "@/services/backend.services";
import { REDEMPTION_URL } from "@/lib/constants/be";


interface PointsProps {
  goodies: GoodiesResult;
  transactions: TransactionResult;
}
const fetchRedeemedGoodies= async()=>{
  const res= await bkFetch(REDEMPTION_URL,{method:"GET"})
  const data= await res.json()
  return data
}
// Main Component
const Points: React.FC<PointsProps> =async ({ goodies, transactions }) => {
  // Map server transactions to UI Transaction type
  const transactionData = transactions?.results?.map((t: ServerTransaction) => ({
    id: t.id,
    type: (t.points > 0 ? "earned" : "redeemed") as "earned" | "redeemed",
    activity: t.event || (t.points > 0 ? "Points Earned" : "Points Redeemed"),
    points: t.points,
    timestamp: t.timestamp,
    description: t.event || "",
  })) || [];

  // Calculate stats directly (no useMemo)
  const totalPoints = transactionData.reduce((sum, t) => sum + t.points, 0);
  const totalEarned = transactionData.filter((t) => t.points > 0).reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = Math.abs(transactionData.filter((t) => t.points < 0).reduce((sum, t) => sum + t.points, 0));
  const stats = {
    totalPoints,
    totalEarned,
    totalRedeemed,
    availablePoints: totalPoints - totalRedeemed,
  };

  const redeemedGoodies:RedemptionResult= await fetchRedeemedGoodies()
  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-[3px]">
          <div className="bg-background rounded-3xl p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="size-14 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
                    <img
                      src="/images/elements/gemini.svg"
                      className="w-8 h-8 dark:invert"
                      alt="Gemini AI"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Points
                  </h2>
                  <p className="text-muted-foreground">
                    Event achievements & rewards
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Total Points
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Navigation and Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex gap-3 bg-transparent p-0 mb-8">
          <TabsTrigger
            value="overview"
            className={
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 " +
              "data-[state=active]:bg-blue-600 data-[state=active]:hover:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 " +
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:hover:bg-gray-200 dark:data-[state=inactive]:bg-gray-800 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300"
            }
          >
            <Trophy className="w-5 h-5" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="redeem"
            className={
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 " +
              "data-[state=active]:bg-blue-600 data-[state=active]:hover:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 " +
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:hover:bg-gray-200 dark:data-[state=inactive]:bg-gray-800 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300"
            }
          >
            <ShoppingCart className="w-5 h-5" /> Redeem Rewards
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <PointsOverview transactions={transactions} />
        </TabsContent>
        <TabsContent value="redeem" className="space-y-6">
          <GoodiesRedeem goodies={goodies} totalPoints={stats.totalPoints} redeemedGoodies={redeemedGoodies} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Points;
