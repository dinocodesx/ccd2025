"use client"
import React from "react";
import { Gift } from "lucide-react";
import { GoodiesResult, Goodie, RedemptionResult, RedemptionRequest } from "@/types/goodies";
import Button from "../ui/Button";
import { toast } from "sonner";
import FeatureRule from '@/public/content/feature.rule.json'
interface RedeemItem {
  id: number;
  name: string;
  points: number;
  image: string;
  description: string;
  available: boolean;
  status: 'available' | 'requested' | 'redeemed' | 'out_of_stock';
}

interface RedeemCardProps {
  item: RedeemItem;
  totalPoints: number;
  redeemedItem: RedemptionRequest | undefined | null;

}

const RedeemCard: React.FC<RedeemCardProps> = ({ item, totalPoints, redeemedItem }) => {
  const [loading, setLoading] = React.useState(false);
  const isAvailable = item.status === 'available' && totalPoints >= item.points;
  const isRequested = redeemedItem ? true : false;
  const isRedeemed = redeemedItem?.is_approved;
  const isOutOfStock = item.status === 'out_of_stock';

  const redeemGoodie = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goodies/redeem', {
        method: "POST",
        body: JSON.stringify({ goodie: item.id }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Goodie redeem request registered successfully!");
      } else {
        toast.error(data.message || "Failed to redeem goodie.");
      }
    } catch (error) {
      toast.error("An error occurred while redeeming the goodie.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${item.available
          ? "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-background hover:shadow-lg"
          : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"
        }`}
    >
      <div className="p-6 text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center p-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain rounded-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <Gift className="w-10 h-10 text-white hidden" />
        </div>
        <h4 className="font-bold text-foreground mb-2">{item.name}</h4>
        <p className="text-sm text-muted-foreground mb-6">{item.description}</p>
        <Button
          disabled={!FeatureRule.profile.redeem || !isAvailable || loading || isRequested || isRedeemed || isOutOfStock}
          onClick={!FeatureRule.profile.redeem && isAvailable ? redeemGoodie : undefined}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isAvailable
              ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg shadow-blue-600/25"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? (
            <span>Processing...</span>
          ) : isRedeemed ? (
            "Redeemed"
          ) : isRequested ? (
            "Requested"
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : totalPoints < item.points ? (
            "Insufficient Points"
          ) : (
            FeatureRule.profile.redeem?
            <>
              <img
                src="/images/profile/prize.svg"
                alt="Points"
                className="w-5 h-5"
              />
              <span>{item.points.toLocaleString()}</span>
              <span>points</span>
            </>
            :<>Not taking requests</>
          )}
        </Button>
      </div>
      {isOutOfStock && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Sold Out
        </div>
      )}
    </div>
  );
};

export interface GoodiesRedeemProps {
  goodies: GoodiesResult;
  totalPoints: number;
  redeemedGoodies: RedemptionResult;
}

const GoodiesRedeem: React.FC<GoodiesRedeemProps> = ({ goodies, totalPoints, redeemedGoodies }) => {
  // Map goodie id to redemption status
  const redemptionMap: Record<number, 'requested' | 'redeemed'> = {};
  redeemedGoodies?.results?.forEach((r: RedemptionRequest) => {
    if (r.is_approved) {
      redemptionMap[r.goodie] = 'redeemed';
    } else {
      redemptionMap[r.goodie] = 'requested';
    }
  });
  const redeemItems = goodies?.results?.map((g: Goodie) => {
    let status: 'available' | 'requested' | 'redeemed' | 'out_of_stock' = 'available';
    if (g.quantity_available <= 0) {
      status = 'out_of_stock';
    } else if (redemptionMap[g.id] === 'redeemed') {
      status = 'redeemed';
    } else if (redemptionMap[g.id] === 'requested') {
      status = 'requested';
    }
    return {
      id: g.id,
      name: g.name,
      points: g.points_cost,
      image: g.image_url,
      description: g.description,
      available: g.quantity_available > 0,
      status,
    };
  }) || [];
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-xl font-bold text-foreground">Redeem Your Points</h3>
        <p className="text-muted-foreground">Request to exchange your points for awesome rewards</p>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {redeemItems.length === 0 ? (
            <div className="text-muted-foreground">No goodies available.</div>
          ) : (
            redeemItems.map((item) => {
              const redeemItem = redeemedGoodies.results.find(g => g.goodie == item.id)
              return (
                <RedeemCard key={item.id} item={item} totalPoints={totalPoints} redeemedItem={redeemItem} />
              )
            })
          )}
        </div>
      
      
    </div>
  );
};

export default GoodiesRedeem; 