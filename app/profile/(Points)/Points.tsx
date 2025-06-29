import Points from "@/components/profile/Points";
import { GOODIES_URL, TRANSACTION_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";
import { GoodiesResult, TransactionResult } from "@/types/goodies";
import FeatureRule from '@/public/content/feature.rule.json'
export default async function PointsPage() {
    if(FeatureRule.profile.points)
    {

        // Execute both fetch requests in parallel
        const [goodiesRes, transactionRes] = await Promise.all([
            bkFetch(GOODIES_URL, { method: "GET" }),
            bkFetch(TRANSACTION_URL, { method: "GET" })
        ]);
        
        // Parse JSON responses in parallel
        const [goodies, transactions] = await Promise.all([
            goodiesRes.json(),
            transactionRes.json()
        ]);
        
        return (
            <Points 
            goodies={goodies as GoodiesResult} 
            transactions={transactions as TransactionResult} 
            />
        );
    }
    return <div className="py-4 text-center">
    <h3 className="text-lg sm:text-xl font-medium mb-4">Points</h3>
    <p className="text-sm text-muted-foreground">
    Something cool is coming soon!
    </p>
  </div>
}