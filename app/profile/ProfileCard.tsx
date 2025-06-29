import CardContainer from "@/components/ui/CardContainer";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/UserAvatar";
import { cn, extractGithubUsername } from "@/lib/utils";
import { UserProfile } from "@/types/login";
import { Session } from "next-auth";

import Image from "next/image";


import LeaderBoard from "../../components/profile/LeaderBoard";
import Frame, { FrameType } from "../../components/profile/Frames";
import Tickets from "./(Tickets)/Tickets";
import ProfileForm from "@/components/profile/ProfileForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import LoadLink from "@/components/blocks/LoadLink";
import Coin from '@/public/images/coin.svg'
import PointsPage from "./(Points)/Points";
import { Suspense } from "react";
import Loader from "@/components/Loader";
export default function ProfileCard({
  user,
  session,
  activeTab
}: {
  user: UserProfile;
  session: Session;
  activeTab: string;
}) {


  const validTabs = [
    { value: "My Profile", link: "?tab=My%20Profile" },
    { value: "Frame Studio", link: "?tab=Frame%20Studio" },
    { value: "Tickets", link: "?tab=Tickets" },
    { value: "Points", link: "?tab=Points" },
    { value: "Leaderboard", link: "?tab=Leaderboard" },
  ];
  const tabColors: Record<string, string> = {
    attendee: 'var(--google-blue)',
    organizer: 'var(--google-red)',
    volunteer: 'var(--google-green)',
  };
  const tabBg = tabColors[user.event_role] || '';

  return (
    <div className="min-h-screen p-2 sm:p-4 w-full mx-auto">
      <CardContainer
        headerTitle={
          <span className="text-white font-medium text-lg">My Profile</span>
        }
        maxWidth="max-w-5xl"
      >
        <div className="p-2 sm:p-4">
          {/* Profile header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage
                    src={
                      user.socials?.github &&
                      `https://github.com/${extractGithubUsername(
                        user.socials?.github
                      )}.png`
                    }
                    alt={
                      (user.socials?.github &&
                        extractGithubUsername(user.socials?.github)) ||
                      "avatar"
                    }
                  />
                  <AvatarFallback>
                    {user?.first_name[0] || "A"}
                    {user?.last_name[0] || "W"}
                  </AvatarFallback>
                </Avatar>
                <Image
                  src={`/images/cfs/smile${user.event_role === "attendee" ?
                    'b'
                    : user.event_role === "organizer" ?
                      'r'
                      : user.event_role === "volunteer" ?
                        'g'
                        : ''}.svg`}
                  alt="Smile"
                  width={24}
                  height={24}
                  className="absolute -bottom-0 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white dark:border-black"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  {user?.first_name} {user.last_name}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {session.user.profile?.student ? "Student" : "Professional"}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                  {session.user.profile?.student ? session.user.profile.college : session.user.profile?.company}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize">{user.event_role}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap-reverse">
             
              <div className={cn(
                "border text-foreground px-4 sm:px-6 flex items-center gap-2 text-sm sm:text-base p-2 rounded-4xl font-bold",
                user.points < 20 && "border-google-red bg-google-red/20 text-google-red",
                user.points >= 20 && user.points < 100 && "border-google-yellow bg-google-yellow/20 text-google-yellow",
                user.points >= 100 && "border-google-green bg-google-green/20 text-google-green"
              )}>
                <Image src={Coin} alt="coin" width={24} height={24}/>
                {user.points}
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <Tabs value={activeTab || "My Profile"}>
            <TabsList className="h-auto mb-8 flex flex-wrap gap-2 sm:gap-6 bg-transparent p-0 items-start justify-start">
              {validTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors border border-gray-200 dark:border-muted cursor-pointer",
                    activeTab === tab.value ? "text-white dark:text-white border-0" : "text-[#676c72] hover:text-[#000000] dark:text-[#e5e7eb] dark:hover:text-white"
                  )}

                  style={{
                    backgroundColor: activeTab==tab.value ?
                   user.event_role=="attendee" ? "var(--google-blue)": 
                  user.event_role=="organizer" ? 
                  "var(--google-red)":
                   "var(--google-green)"
                    :""
                  }}
                >
                  <LoadLink href={tab.link} scroll={false}>
                    {tab.value}
                  </LoadLink>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="My Profile">
              <ProfileForm user={user} session={session} />
            </TabsContent>
            <TabsContent value="Frame Studio">
              <Frame frameType={user.event_role.toLowerCase() as FrameType} />
            </TabsContent>
            <TabsContent value="Tickets">
            <Suspense fallback={<Loader name="tickets"/>}>
              <Tickets session={session} />
              /</Suspense>
            </TabsContent>
            <TabsContent value="Points">
              <Suspense fallback={<Loader name="points"/>}>
               <PointsPage />
              </Suspense>
            </TabsContent>
            <TabsContent value="Leaderboard">
              <LeaderBoard />
            </TabsContent>
          </Tabs>
        </div>
      </CardContainer>
    </div>
  );
}
