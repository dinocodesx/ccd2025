import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Gift,
  ShoppingCart,
  Trophy,
  Sparkles,
} from "lucide-react";

// Types
interface Game {
  id: number;
  name: string;
  position: string;
  points: number;
  rank: number;
}

interface Transaction {
  id: number;
  type: "earned" | "redeemed";
  activity: string;
  points: number;
  timestamp: string;
  description: string;
}

interface RedeemItem {
  id: number;
  name: string;
  points: number;
  image: string;
  description: string;
  available: boolean;
}

interface PointsProps {
  games?: Game[];
  transactions?: Transaction[];
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: "earned" | "redeemed" | "available";
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface AchievementCardProps {
  game: Game;
  getRankColor: (rank: number) => string;
  getMedalImage: (rank: number) => string;
}

interface TransactionCardProps {
  transaction: Transaction;
  getTransactionColor: (type: string, points: number) => any;
  getTransactionIcon: (type: string, points: number) => React.ReactNode;
  formatDate: (timestamp: string) => string;
}

interface RedeemCardProps {
  item: RedeemItem;
  totalPoints: number;
}

const RANK_COLORS = {
  1: "bg-gradient-to-r from-yellow-500 to-amber-500", // Gold
  2: "bg-gradient-to-r from-gray-400 to-slate-500", // Silver
  3: "bg-gradient-to-r from-orange-500 to-amber-600", // Bronze
  default: "bg-gradient-to-r from-blue-500 to-indigo-500",
} as const;

const RANK_BORDER_COLORS = {
  1: "border-yellow-300 dark:border-yellow-600", // Gold
  2: "border-gray-300 dark:border-gray-600", // Silver
  3: "border-orange-300 dark:border-orange-600", // Bronze
  default: "border-blue-300 dark:border-blue-600",
} as const;

const MEDAL_IMAGES = {
  1: "/images/profile/Medal1.svg",
  2: "/images/profile/Medal2.svg",
  3: "/images/profile/Medal3.svg",
  default: "/images/profile/Medal4.svg",
} as const;

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

// Mock Data
const DEFAULT_GAMES: Game[] = [
  {
    id: 1,
    name: "Cloud Quiz Challenge",
    position: "1st Position",
    points: 1250,
    rank: 1,
  },
  {
    id: 2,
    name: "Social Media Challenge",
    position: "3rd Position",
    points: 850,
    rank: 3,
  },
  {
    id: 3,
    name: "Tech Talk Attendance",
    position: "2nd Position",
    points: 1100,
    rank: 2,
  },
  {
    id: 4,
    name: "Community Engagement",
    position: "5th Position",
    points: 650,
    rank: 5,
  },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: "earned",
    activity: "Quiz Challenge Winner",
    points: 1250,
    timestamp: "2025-06-20T10:30:00Z",
    description: "1st place in Cloud Quiz Challenge",
  },
  {
    id: 2,
    type: "earned",
    activity: "Tech Talk Attendance",
    points: 500,
    timestamp: "2025-06-19T14:15:00Z",
    description: "Attended Kubernetes Deep Dive session",
  },
  {
    id: 3,
    type: "redeemed",
    activity: "Exclusive Swag",
    points: -300,
    timestamp: "2025-06-18T16:45:00Z",
    description: "Redeemed GDG hoodie",
  },
  {
    id: 4,
    type: "earned",
    activity: "Networking Bingo",
    points: 850,
    timestamp: "2025-06-17T11:20:00Z",
    description: "3rd place in networking challenge",
  },
  {
    id: 5,
    type: "redeemed",
    activity: "Premium Badge",
    points: -150,
    timestamp: "2025-06-16T09:10:00Z",
    description: "Unlocked premium profile badge",
  },
];

const REDEEM_ITEMS: RedeemItem[] = [
  {
    id: 1,
    name: "CCD Kolkata Hoodie",
    points: 500,
    image:
      "https://www.teez.in/cdn/shop/files/GoogleDeveloperGroupsMenHoodie_1_large.jpg",
    description: "Official GDG Cloud Kolkata hoodie",
    available: true,
  },
  {
    id: 2,
    name: "Premium Badge",
    points: 150,
    image: "/images/rewards/badge.svg",
    description: "Unlock premium profile badge",
    available: true,
  },
  {
    id: 3,
    name: "Tech Stickers Pack",
    points: 75,
    image: "/images/rewards/stickers.svg",
    description: "Collection of tech stickers",
    available: true,
  },
  {
    id: 4,
    name: "Exclusive T-Shirt",
    points: 350,
    image:
      "https://www.teez.in/cdn/shop/files/GoogleDeveloperGroupsMenHoodie_1_large.jpg",
    description: "Limited edition event t-shirt",
    available: false,
  },
];

// Utility Functions
const getRankColor = (rank: number): string => {
  return RANK_COLORS[rank as keyof typeof RANK_COLORS] || RANK_COLORS.default;
};

const getRankBorderColor = (rank: number): string => {
  return (
    RANK_BORDER_COLORS[rank as keyof typeof RANK_BORDER_COLORS] ||
    RANK_BORDER_COLORS.default
  );
};

const getMedalImage = (rank: number): string => {
  return (
    MEDAL_IMAGES[rank as keyof typeof MEDAL_IMAGES] || MEDAL_IMAGES.default
  );
};

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

// Components
const StatCard: React.FC<StatCardProps> = ({ icon, value, label, variant }) => {
  const styles = STAT_VARIANTS[variant];

  return (
    <div
      className={`${styles.bg} rounded-2xl p-4 border ${styles.border} transition-colors duration-200`}
    >
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

const TabButton: React.FC<TabButtonProps> = ({
  isActive,
  onClick,
  icon,
  children,
}) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
      isActive
        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
    }`}
  >
    {icon}
    {children}
  </button>
);

const AchievementCard: React.FC<AchievementCardProps> = ({
  game,
  getRankColor,
  getMedalImage,
}) => (
  <div className="group">
    <div
      className={`${getRankColor(
        game.rank
      )} rounded-2xl p-[2px] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="bg-background rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {game.rank <= 3 && (
              <div
                className={`absolute inset-0 ${getRankColor(
                  game.rank
                )} rounded-full`}
              />
            )}
            <div className="relative w-12 h-12 flex items-center justify-center dark:bg-gray-800 rounded-full">
              <img
                src={getMedalImage(game.rank)}
                alt={`Rank ${game.rank} medal`}
                className="w-8 h-8"
              />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground">{game.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-3 py-1 rounded-full ${getRankColor(
                  game.rank
                )} text-white font-medium`}
              >
                {game.position}
              </span>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                +{game.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
      <div className="flex items-center gap-4">
        <div className={`p-3 ${colors.icon} rounded-xl`}>
          {getTransactionIcon(transaction.type, transaction.points)}
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-foreground">
            {transaction.activity}
          </h5>
          <p className="text-sm text-muted-foreground">
            {transaction.description}
          </p>
          <span className="text-xs text-muted-foreground">
            {formatDate(transaction.timestamp)}
          </span>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${colors.text}`}>
            {transaction.points > 0 ? "+" : ""}
            {transaction.points.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
      </div>
    </div>
  );
};

const RedeemCard: React.FC<RedeemCardProps> = ({ item, totalPoints }) => {
  const isAvailable = item.available && totalPoints >= item.points;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
        item.available
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
              // Fallback to Gift icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          {/* Fallback Gift icon (hidden by default)  */}
          <Gift className="w-10 h-10 text-white hidden" />
        </div>

        <h4 className="font-bold text-foreground mb-2">{item.name}</h4>
        <p className="text-sm text-muted-foreground mb-6">{item.description}</p>

        <button
          disabled={!isAvailable}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isAvailable
              ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg shadow-blue-600/25"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {!item.available ? (
            "Out of Stock"
          ) : totalPoints < item.points ? (
            "Insufficient Points"
          ) : (
            <>
              <img
                src="/images/profile/prize.svg"
                alt="Points"
                className="w-5 h-5"
              />
              <span>{item.points.toLocaleString()}</span>
              <span>points</span>
            </>
          )}
        </button>
      </div>

      {!item.available && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Sold Out
        </div>
      )}
    </div>
  );
};

// Main Component
const Points: React.FC<PointsProps> = ({ games = [], transactions = [] }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "redeem">("overview");

  const gameData = games.length > 0 ? games : DEFAULT_GAMES;
  const transactionData =
    transactions.length > 0 ? transactions : DEFAULT_TRANSACTIONS;

  const stats = useMemo(() => {
    const totalPoints = gameData.reduce((sum, game) => sum + game.points, 0);
    const totalEarned = transactionData
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);
    const totalRedeemed = Math.abs(
      transactionData
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + t.points, 0)
    );

    return {
      totalPoints,
      totalEarned,
      totalRedeemed,
      availablePoints: totalPoints - totalRedeemed,
    };
  }, [gameData, transactionData]);

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-[3px]">
          <div className="bg-background rounded-3xl p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
                    <img
                      src="/images/elements/gemini.svg"
                      className="w-8 h-8 dark:invert"
                      alt="Gemini AI"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">
                      {gameData.length}
                    </span>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                }
                value={`+${stats.totalEarned.toLocaleString()}`}
                label="Earned"
                variant="earned"
              />
              <StatCard
                icon={
                  <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                }
                value={`-${stats.totalRedeemed.toLocaleString()}`}
                label="Redeemed"
                variant="redeemed"
              />
              <StatCard
                icon={
                  <Gift className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                }
                value={stats.availablePoints.toLocaleString()}
                label="Available"
                variant="available"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <TabButton
          isActive={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<Trophy className="w-5 h-5" />}
        >
          Overview
        </TabButton>
        <TabButton
          isActive={activeTab === "redeem"}
          onClick={() => setActiveTab("redeem")}
          icon={<ShoppingCart className="w-5 h-5" />}
        >
          Redeem Rewards
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Achievement Highlights */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Achievement Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameData.map((game) => (
                <AchievementCard
                  key={game.id}
                  game={game}
                  getRankColor={getRankColor}
                  getMedalImage={getMedalImage}
                />
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {transactionData.slice(0, 3).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  getTransactionColor={getTransactionColor}
                  getTransactionIcon={getTransactionIcon}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">
              Redeem Your Points
            </h3>
            <p className="text-muted-foreground">
              Exchange your points for awesome rewards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REDEEM_ITEMS.map((item) => (
              <RedeemCard
                key={item.id}
                item={item}
                totalPoints={stats.totalPoints}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Points;
