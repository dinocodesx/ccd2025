import Points from "@/components/profile/Points";
import { GOODIES_URL, TRANSACTION_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";
import { GoodiesResult, TransactionResult } from "@/types/goodies";
import FeatureRule from "@/public/content/feature.rule.json";
import { Suspense } from "react";
import GeminiIcon from "@/components/GeminiIcon";

export default async function PointsPage({
  searchParams,
}: {
  searchParams: { active?: string };
}) {
  if (FeatureRule.profile.points) {
    // Execute both fetch requests in parallel
    const [goodiesRes, transactionRes] = await Promise.all([
      bkFetch(GOODIES_URL, { method: "GET" }),
      bkFetch(TRANSACTION_URL, { method: "GET" }),
    ]);

    // Parse JSON responses in parallel
    const [goodies, transactions] = await Promise.all([
      goodiesRes.json(),
      transactionRes.json(),
    ]);

    return (
      <Suspense fallback={<div className="py-8 flex items-center justify-center text-center text-muted-foreground"><GeminiIcon className="animate-spin mr-2"/>Loading points...</div>}>
        <Points
          goodies={goodies as GoodiesResult}
          transactions={transactions as TransactionResult}
          searchParams={searchParams}
        />
      </Suspense>
    );
  }
  return (
    <div className="py-4 text-center">
      <h3 className="text-lg sm:text-xl font-medium mb-4">Points</h3>
      <p className="text-sm text-muted-foreground">
        Something cool is coming soon!
      </p>
    </div>
  );
}
