
import { TrendingUp, TrendingDown, Trophy, Plus, Minus } from "lucide-react";
import { TransactionResult, Transaction as ServerTransaction } from "@/types/goodies";
import { useMemo } from "react";

interface Transaction {
  id: number;
  type: "earned" | "redeemed";
  activity: string;
  points: number;
  timestamp: string;
  description: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: "earned" | "redeemed" | "available";
}

interface TransactionCardProps {
  transaction: Transaction;
  getTransactionColor: (type: string, points: number) => any;
  getTransactionIcon: (type: string, points: number) => React.ReactNode;
  formatDate: (timestamp: string) => string;
}

const STAT_VARIANTS = {
  earned: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    textColor: "text-emerald-700 dark:text-emerald-300",
    labelColor: "text-emerald-600 dark:text-emerald-400",
  },
  redeemed: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    textColor: "text-rose-700 dark:text-rose-300",
    labelColor: "text-rose-600 dark:text-rose-400",
  },
  available: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    iconBg: "bg-sky-100 dark:bg-sky-900/50",
    textColor: "text-sky-700 dark:text-sky-300",
    labelColor: "text-sky-600 dark:text-sky-400",
  },
} as const;

const TRANSACTION_COLORS = {
  earned: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  redeemed: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    icon: "bg-rose-100 dark:bg-rose-900/50",
  },
} as const;

const getTransactionIcon = (type: string, points: number): React.ReactNode => {
  return type === "earned" || points > 0 ? (
    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <Minus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
  );
};

const getTransactionColor = (type: string, points: number) => {
  return type === "earned" || points > 0
    ? TRANSACTION_COLORS.earned
    : TRANSACTION_COLORS.redeemed;
};

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, variant }) => {
  const styles = STAT_VARIANTS[variant];
  return (
    <div className={`${styles.bg} rounded-2xl p-4 border ${styles.border} transition-colors duration-200`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 ${styles.iconBg} rounded-xl`}>{icon}</div>
        <div>
          <div className={`text-lg font-bold ${styles.textColor}`}>{value}</div>
          <div className={`text-sm ${styles.labelColor}`}>{label}</div>
        </div>
      </div>
    </div>
  );
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  getTransactionColor,
  getTransactionIcon,
  formatDate,
}) => {
  const colors = getTransactionColor(transaction.type, transaction.points);
  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-md`}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <div className="flex items-center justify-center gap-3 w-full">
        <div className={`p-3 ${colors.icon} rounded-xl flex-shrink-0 mb-2 sm:mb-0`}>
          {getTransactionIcon(transaction.type, transaction.points)}
        </div>
        <div className="flex-1 w-full">
          <h5 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-0">
            {transaction.activity}
          </h5>
          <p className="text-sm text-muted-foreground mb-1 sm:mb-0">
            {transaction.description}
          </p>
          <span className="text-xs text-muted-foreground block sm:inline">
            {formatDate(transaction.timestamp)}
          </span>
        </div>
        </div>
        <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 sm:gap-0">
          <div className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            {transaction.points > 0 ? "+" : ""}
            {transaction.points.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
      </div>
    </div>
  );
};

interface PointsOverviewProps {
  transactions: TransactionResult;
}

const PointsOverview: React.FC<PointsOverviewProps> = ({ transactions }) => {
  const transactionData = transactions?.results?.map((t: ServerTransaction) => ({
    id: t.id,
    type: (t.points > 0 ? "earned" : "redeemed") as "earned" | "redeemed",
    activity: t.event || (t.points > 0 ? "Points Earned" : "Points Redeemed"),
    points: t.points,
    timestamp: t.timestamp,
    description: t.event || "",
  })) || [];

  const stats = useMemo(() => {
    const totalPoints = transactionData.reduce((sum, t) => sum + t.points, 0);
    const totalEarned = transactionData.filter((t) => t.points > 0).reduce((sum, t) => sum + t.points, 0);
    const totalRedeemed = Math.abs(transactionData.filter((t) => t.points < 0).reduce((sum, t) => sum + t.points, 0));
    return {
      totalPoints,
      totalEarned,
      totalRedeemed,
      availablePoints: totalPoints - totalRedeemed,
    };
  }, [transactionData]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          value={`+${stats.totalEarned.toLocaleString()}`}
          label="Earned"
          variant="earned"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          value={`${stats.totalRedeemed.toLocaleString()}`}
          label="Redeemed"
          variant="redeemed"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          value={stats.availablePoints.toLocaleString()}
          label="Available"
          variant="available"
        />
      </div>
      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
        <div className="space-y-3">
          {transactionData.length === 0 ? (
            <div className="text-muted-foreground">No transactions yet.</div>
          ) : (
            transactionData.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                getTransactionColor={getTransactionColor}
                getTransactionIcon={getTransactionIcon}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsOverview; 