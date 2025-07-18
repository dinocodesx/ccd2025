"use client";
import { useState, useEffect } from "react";

import FeatureRule from "@/public/content/feature.rule.json";
import { LeaderboardData, LeaderboardResult } from "@/types/leaderboard";

import CardContainer from "@/components/ui/CardContainer";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/UserAvatar";
import Image from "next/image";
import Coin from "@/public/images/coin.svg";
import Medal1 from "@/public/images/profile/Medal1.svg";
import Medal2 from "@/public/images/profile/Medal2.svg";
import Medal3 from "@/public/images/profile/Medal3.svg";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Trophy, Users, Award, TrendingUp } from "lucide-react";

import { useSession } from "next-auth/react";

function getMedal(rank: number) {
  if (rank === 1) return Medal1;
  if (rank === 2) return Medal2;
  if (rank === 3) return Medal3;
  return null;
}

function getMedalLabel(rank: number) {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  return null;
}

function getPerformanceTier(points: number) {
  if (points >= 500)
    return "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
  if (points >= 200)
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
  if (points >= 100)
    return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
  if (points >= 50)
    return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
  if (points >= 20)
    return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
  return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
}

function getPerformanceLabel(points: number) {
  if (points >= 500) return "Legend";
  if (points >= 200) return "Champion";
  if (points >= 100) return "Expert";
  if (points >= 50) return "Advanced";
  if (points >= 20) return "Intermediate";
  return "Beginner";
}

function getInitials(first: string, last: string) {
  return `${first?.[0]?.toUpperCase() || "P"}${
    last === "." ? "" : last?.[0]?.toUpperCase() || ""
  }`;
}

function getRankSuffix(rank: number) {
  if (rank % 10 === 1 && rank % 100 !== 11) return "st";
  if (rank % 10 === 2 && rank % 100 !== 12) return "nd";
  if (rank % 10 === 3 && rank % 100 !== 13) return "rd";
  return "th";
}

const PodiumCard = ({
  user,
  rank,
}: {
  user: LeaderboardResult;
  rank: number;
}) => {
  const medal = getMedal(rank);
  const medalLabel = getMedalLabel(rank);
  const performanceTier = getPerformanceTier(user.points);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 18,
        delay: 0.08 * rank,
        duration: 0.4,
      }}
      whileHover={{
        boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)",
        backgroundColor: "rgba(255,255,255,0.98)",
      }}
      className={cn(
        "relative flex flex-col items-center justify-between bg-gradient-to-br from-card to-card/80 rounded-3xl p-3 sm:p-6 mx-1 sm:mx-2 min-w-[100px] sm:min-w-[200px] max-w-[120px] sm:max-w-[240px] border-2 transition-all duration-300 hover: backdrop-blur-sm",
        rank === 1 &&
          "z-20 scale-110 border-gradient-to-r from-yellow-400 to-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30",
        rank === 2 &&
          "z-10 border-gradient-to-r from-gray-400 to-gray-600 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/30 dark:to-slate-800/30",
        rank === 3 &&
          "border-gradient-to-r from-orange-400 to-orange-600 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30"
      )}
      style={{ minHeight: "auto", height: "auto" }}
    >
      {/* Rank indicator */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-bold flex items-center justify-center ">
        #{rank}
      </div>

      <div className="flex flex-col items-center gap-3">
        {medal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.12 * rank,
              type: "spring",
              stiffness: 120,
              damping: 16,
            }}
            className="relative"
          >
            <Image
              src={medal}
              alt={medalLabel || "Medal"}
              width={56}
              height={56}
              className="w-8 h-8 sm:w-14 sm:h-14"
            />
            <div className="absolute -inset-1  opacity-20 animate-pulse"></div>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <Avatar className="h-12 w-12 sm:h-20 sm:w-20 border-2 sm:border-4 border-white dark:border-gray-800">
            <AvatarFallback className="text-sm sm:text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <div className="text-xs sm:text-lg font-bold text-foreground leading-tight">
              {user.first_name} {user.last_name === "." ? "" : user.last_name}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-col items-center gap-2 mt-4">
        <div
          className={cn(
            "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-lg border-2 ",
            performanceTier
          )}
        >
          <Image
            src={Coin}
            alt="points"
            width={16}
            height={16}
            className="w-4 h-4 sm:w-6 sm:h-6"
          />
          <span>{user.points.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <>
    <div className="flex flex-col items-center mb-12">
      <div className="text-center mb-8">
        <div className="w-64 h-6 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
        <div className="w-48 h-4 bg-gray-300 rounded animate-pulse mx-auto"></div>
      </div>

      <div className="flex flex-wrap items-end justify-center w-full gap-4 sm:gap-8 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div
              className="flex flex-col items-center justify-between bg-card rounded-3xl  p-6 mx-2 min-w-[200px] max-w-[240px] border-2"
              style={{ minHeight: 280 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="w-24 h-5 bg-gray-300 rounded"></div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
              </div>
              <div className="w-28 h-10 bg-gray-300 rounded-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="overflow-x-auto">
      <Table className="rounded-2xl overflow-hidden min-w-[400px] ">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
            <TableHead className="w-16 text-center font-bold">Rank</TableHead>
            <TableHead className="font-bold">Participant</TableHead>
            <TableHead className="text-center font-bold">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 17 }).map((_, idx) => (
            <TableRow key={idx} className="animate-pulse">
              <TableCell className="text-center">
                <div className="w-8 h-8 bg-gray-300 rounded mx-auto"></div>
              </TableCell>
              <TableCell className="flex items-center gap-3 min-w-[140px]">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </TableCell>
              <TableCell className="text-center">
                <div className="w-20 h-7 bg-gray-300 rounded-full mx-auto"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
);

const LeaderBoardData = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResult[]>(
    []
  );
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/leaderboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch leaderboard data: ${response.status}`
          );
        }

        const data: LeaderboardData = await response.json();
        setLeaderboardData(data.results);
        setCount(data.count);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load leaderboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    intervalId = setInterval(fetchLeaderboard, 60000); // Poll every 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Trophy className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-500 text-lg font-medium mb-2">
            Unable to Load Leaderboard
          </p>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const participants = leaderboardData;
  const topThree = participants.slice(0, 3);

  // Get current user data from session
  const currentUser = session?.user;
  const userFirstName =
    currentUser?.first_name || currentUser?.profile?.first_name || "";
  const userLastName =
    currentUser?.last_name || currentUser?.profile?.last_name || "";
  const userScore = currentUser?.profile?.points || 0;

  // Find current user's position in leaderboard
  const userPosition = participants.findIndex(
    (participant) =>
      participant.first_name?.toLowerCase() === userFirstName?.toLowerCase() &&
      participant.last_name?.toLowerCase() === userLastName?.toLowerCase()
  );
  const userRanked = userPosition !== -1;

  return (
    <>
      {/* Podium Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="text-center mb-8 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Top Performers
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm md:text-base">
            <Users className="w-4 h-4" />
            {count} active participants competing
          </p>
        </div>
        {/* Responsive: Stack on mobile, row on md+ */}
        <div className="flex flex-row items-end justify-center w-full gap-2 sm:gap-8 mb-4 px-2">
          {/* Second Place */}
          {topThree[1] && (
            <div className="order-2 sm:order-1">
              <PodiumCard user={topThree[1]} rank={2} />
            </div>
          )}
          {/* First Place */}
          {topThree[0] && (
            <div className="order-1 sm:order-2">
              <PodiumCard user={topThree[0]} rank={1} />
            </div>
          )}
          {/* Third Place */}
          {topThree[2] && (
            <div className="order-3 sm:order-3">
              <PodiumCard user={topThree[2]} rank={3} />
            </div>
          )}
        </div>
      </div>

      {/* Full Rankings Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
        }}
        className="overflow-x-auto px-1 md:px-0"
      >
        <Table className="rounded-2xl overflow-hidden min-w-[340px] md:min-w-[400px]  text-xs sm:text-sm md:text-base">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
              <TableHead className="w-14 sm:w-16 text-center font-bold">
                Rank
              </TableHead>
              <TableHead className="font-bold">Participant</TableHead>
              <TableHead className="text-center font-bold">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant, idx) => {
              const currentRank = idx + 1;
              const isTopThree = currentRank <= 3;
              const isCurrentUser =
                participant.first_name?.toLowerCase() ===
                  userFirstName?.toLowerCase() &&
                participant.last_name?.toLowerCase() ===
                  userLastName?.toLowerCase();
              const performanceTier = getPerformanceTier(participant.points);
              const performanceLabel = getPerformanceLabel(participant.points);
              return (
                <motion.tr
                  key={`${participant.first_name}-${participant.last_name}-${currentRank}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                  className={cn(
                    "transition-colors hover:bg-accent/50 text-xs sm:text-sm md:text-base",
                    isTopThree && "font-semibold",
                    currentRank === 1 &&
                      "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
                    currentRank === 2 &&
                      "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20",
                    currentRank === 3 &&
                      "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
                    isCurrentUser &&
                      "border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
                  )}
                >
                  <TableCell className="text-center text-base font-bold p-2 sm:p-3">
                    {isTopThree ? (
                      <div className="flex items-center justify-center">
                        <Image
                          src={getMedal(currentRank)!}
                          alt={`${getMedalLabel(currentRank)} Medal`}
                          width={22}
                          height={22}
                          className="inline-block sm:w-7 sm:h-7"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {currentRank}<sup>{getRankSuffix(currentRank)}</sup>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[100px] sm:min-w-[140px] p-2 sm:p-3">
                    <span className="truncate font-medium">
                      {participant.first_name}{" "}
                      {participant.last_name === "."
                        ? ""
                        : participant.last_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center p-2 sm:p-3">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full border-2 text-xs sm:text-sm font-bold ",
                        performanceTier
                      )}
                    >
                      <Image
                        src={Coin}
                        alt="points"
                        width={16}
                        height={16}
                        className="sm:w-[18px] sm:h-[18px]"
                      />
                      {participant.points.toLocaleString()}
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
            {/* Render unranked user at the bottom if not ranked */}
            {!userRanked && userFirstName && (
              <motion.tr
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + participants.length * 0.03 }}
                className={cn(
                  "font-semibold border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
                )}
              >
                <TableCell className="text-center text-lg font-bold text-blue-600 p-2 sm:p-3">
                  Unranked
                </TableCell>
                <TableCell className="flex items-center gap-3 min-w-[140px] p-2 sm:p-3">
                  <Avatar className="h-10 w-10 border-2 border-blue-500">
                    <AvatarFallback className="text-base font-bold bg-blue-500 text-white">
                      {getInitials(userFirstName, userLastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-blue-700 dark:text-blue-300">
                    {userFirstName} {userLastName === "." ? "" : userLastName}
                  </span>
                </TableCell>
                <TableCell className="text-center p-2 sm:p-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-semibold border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <Image src={Coin} alt="points" width={18} height={18} />
                    {userScore.toLocaleString()}
                  </div>
                </TableCell>
              </motion.tr>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          📊 Displaying top 20 participants • Rankings update every 30 second.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Continue participating in event activities to improve your ranking!
        </p>
      </div>
    </>
  );
};

const LeaderBoard = () => {
  return (
    <div className="py-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 max-w-6xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3 flex items-center justify-center md:justify-start gap-2 sm:gap-3">
              CCD'25 Kolkata Event Rankings
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
              Earn points through activities and climb the leaderboard!
            </p>
          </div>
          <div className="flex-shrink-0 flex justify-center md:justify-end">
            <img
              src="/images/elements/2025-black.svg"
              alt="CCD 2025 Logo"
              className="h-8 sm:h-10 md:h-12 dark:invert opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      {!FeatureRule.showLeaderboard ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            Event Leaderboard Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Rankings will be available once the event begins. Stay tuned!
          </p>
        </div>
      ) : (
        <LeaderBoardData />
      )}
    </div>
  );
};

export default LeaderBoard;
