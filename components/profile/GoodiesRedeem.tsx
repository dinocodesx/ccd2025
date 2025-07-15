"use client"
import React, { useEffect } from "react";
import { Gift } from "lucide-react";
import { GoodiesResult, Goodie, RedemptionResult, RedemptionRequest } from "@/types/goodies";
import Button from "../ui/Button";
import { toast } from "sonner";
import FeatureRule from '@/public/content/feature.rule.json'
import GeminiIcon from "../GeminiIcon";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const isRedeemed = redeemedItem?.is_approved || false;
  const isOutOfStock = item.status === 'out_of_stock';
  const isDisabled = !FeatureRule.profile.redeem || !isAvailable || isRedeemed || isOutOfStock;
  const router = useRouter()
  // console.log(item.name,FeatureRule.profile.redeem, !isAvailable, isRedeemed, isOutOfStock)
  // // console.log("showing for ",item.id,item)
  // useEffect(() => {
  //   setLoading(prev => !prev)
  // }, [redeemedItem])

  const redeemGoodie = async () => {
    if (isDisabled) {
      return;
    }

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
        router.refresh()

      } else {
        toast.error(data.message || "Failed to redeem goodie.");
      }
    } catch (error) {
      toast.error("An error occurred while redeeming the goodie.");
    } finally {
    }
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300  ${item.available
        ? "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-background hover:shadow-lg hover:scale-[1.02]"
        : "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60"
        }`}
    >
      <div className="p-6 text-center">
        {/* <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center p-3"> */}
        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-black to-[#151515] dark:from-google-blue dark:to-google-blue/50 rounded-2xl flex items-center justify-center p-2">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain rounded-xl"
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
          disabled={isDisabled || loading}
          onClick={(FeatureRule.profile.redeem && isAvailable && !loading) ? redeemGoodie : undefined}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isRedeemed
              ? "bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-default"
              : isAvailable
                ? "bg-google-blue hover:bg-blue-700 text-white hover:scale-105 shadow-lg shadow-blue-600/25"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? (
            <span>{isRedeemed?"Redeemed":"Processing..."}</span>
          ) : isRedeemed ? (
            "Redeemed"
          ) : isRequested ? (
            "Requested"
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : totalPoints < item.points ? (
            "Insufficient Points"
          ) : (
            FeatureRule.profile.redeem ?
              <>
                <img
                  src="/images/profile/prize.svg"
                  alt="Points"
                  className="w-5 h-5"
                />
                <span>{item.points.toLocaleString()}</span>
                <span>points</span>
              </>
              : <>{FeatureRule.profile.notTakingRequestsMessage}</>
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

  // console.log(goodies, redeemedGoodies)

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

      {/* Disclaimer Section */}
      <div className=" flex-col md:flex-row bg-yellow-100 dark:bg-yellow-900/40 border-2 border-yellow-500 dark:border-yellow-400 p-4 rounded-lg mb-4 flex items-start gap-3">
        <span className="flex-shrink-0 flex items-center">
          {/* <GeminiIcon className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md invert dark:invert-0" /> */}
          <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 dark:text-yellow-300 ml-1" />
        </span>
        <p className="text-yellow-900 dark:text-yellow-200 font-semibold gap-y-4">
          <span className="block mb-1">Images shown are for representation purposes only. Actual products may vary.</span>
          <span className="block">All goodies must be collected in person at the event venue on the event day. Uncollected items cannot be claimed or collected at a later date.</span>
        </p>
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