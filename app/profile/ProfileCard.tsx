"use client";

import Button from "@/components/ui/Button";
import CardContainer from "@/components/ui/CardContainer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/UserAvatar";
import { extractGithubUsername } from "@/lib/utils";
import { UserProfile } from "@/types/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import LeaderBoard from "./LeaderBoard";
import Points from "./Points";
import YourBadge from "./YourBadge";
import Tickets from "./Tickets";
import FeatureRuleContent from "@/public/content/feature.rule.json";

type FormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  company?: string;
  role?: string;
  pronoun?: string;
  phone?: string;
  college?: string;
  course?: string;
  tshirt?: string;
  graduation_year?: number;
  student?: boolean;
  twitter?: string;
  linkedin?: string;
  github?: string;
};

export default function ProfileCard({
  user,
  session,
}: {
  user: UserProfile;
  session: Session;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useSession();

  // Get initial tab from URL or default to "My Profile"
  const getInitialTab = () => {
    const tabFromUrl = searchParams.get("tab");
    const validTabs = [
      "My Profile",
      "Points",
      "Leaderboard",
      "Frame Studio",
      "Tickets",
    ];
    return validTabs.includes(tabFromUrl || "") ? tabFromUrl : "My Profile";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync with URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    const validTabs = [
      "My Profile",
      "Points",
      "Leaderboard",
      "Frame Studio",
      "Tickets",
    ];
    if (
      tabFromUrl &&
      validTabs.includes(tabFromUrl) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .default(session.user.email || ""),
    company: z.string().optional(),
    role: z.string().optional(),
    pronoun: z.string().optional(),
    phone: z.string().optional(),
    college: z.string().optional(),
    course: z.string().optional(),
    graduation_year: z.number().optional(),
    student: z.boolean().default(false),
    twitter: z
      .string()
      .trim()
      .refine(
        (val) =>
          val === "" ||
          /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/.test(
            val
          ),
        { message: "Invalid Twitter URL" }
      )
      .optional(),

    linkedin: z
      .string()
      .trim()
      .refine(
        (val) =>
          val === "" || /^https?:\/\/(www\.)?linkedin\.com\/.+$/.test(val),
        { message: "Invalid LinkedIn URL" }
      )
      .optional(),

    github: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || /^https?:\/\/(www\.)?github\.com\/.+$/.test(val),
        { message: "Invalid GitHub URL" }
      )
      .optional(),
  });

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: session.user.email || "",
      company: user.company || "",
      role: user?.role || "",
      pronoun: user?.pronoun || "",
      phone: user?.phone || "",
      college: user?.college || "",
      course: user?.course || "",
      tshirt: user?.tsize || "",
      graduation_year: user?.graduation_year || undefined,
      student: user?.student ?? false,
      twitter: user?.socials?.twitter || "",
      linkedin: user?.socials?.linkedin || "",
      github: user?.socials?.github || "",
    },
  });

  const onError = (errors: FieldErrors<FormValues>) => {
    console.error("Validation Errors:", errors);
  };
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    const data =
      FeatureRuleContent.profile.edit ?
        {
          first_name: values.firstName || "",
          last_name: values.lastName || "",
          email: values.email || "",
          company: values.company,
          role: values.role || "",
          pronoun: values.pronoun || "",
          phone: values.phone || "",
          college: values.college || "",
          course: values.course || "",
          graduation_year: values.graduation_year || undefined,
          student: values.student ?? false,
          tsize: values.tshirt || "",
          socials: {
            twitter: values.twitter || "",
            linkedin: values.linkedin || "",
            github: values.github || "",
          },
        } : FeatureRuleContent.profile.editTshirt ? {
          tshirt: values.tshirt || "",
          socials: {
            twitter: values.twitter || "",
            linkedin: values.linkedin || "",
            github: values.github || "",
          },
        } : {
          socials: {
            twitter: values.twitter || "",
            linkedin: values.linkedin || "",
            github: values.github || "",
          }
        };

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
      toast("Profile updated successfully!");
      await update();
      router.refresh();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        'y'
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
                    {form.watch("student") ? "Student" : "Professional"}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {form.watch("student")
                      ? form.watch("college")
                      : form.watch("company")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap-reverse">
              <div
                style={{
                  backgroundColor: `${user.event_role === "attendee" ?
                    'var(--google-blue)'
                    : user.event_role === "organizer" ?
                      'var(--google-red)'
                      : user.event_role === "volunteer" ?
                        'var(--google-yellow)'
                        : ''}`
                }}
                className={`hover:bg-[${user.event_role === "attendee" ?
                  '#4285f4'
                  : user.event_role === "organizer" ?
                    '#ea4336'
                    : user.event_role === "volunteer" ?
                      '#faab00'
                      : ''}]/90 text-white px-4 sm:px-6 flex items-center gap-2 text-sm sm:text-base p-2 rounded-4xl`}>
                <Image
                  src="/images/cfs/circleStar.svg"
                  alt="attendee badge"
                  width={16}
                  height={16}
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <span className="capitalize">{user.event_role}</span>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="mb-8 flex flex-wrap gap-2 sm:gap-6">
            {[
              "My Profile",
              "Frame Studio",
              "Tickets",
              "Points",
              "Leaderboard",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={activeTab === tab ? {
                  backgroundColor: `${user.event_role === "attendee" ?
                    'var(--google-blue)'
                    : user.event_role === "organizer" ?
                      'var(--google-red)'
                      : user.event_role === "volunteer" ?
                        'var(--google-yellow)'
                        : ''}`
                } : {}}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors border border-gray-200 dark:border-muted cursor-pointer ${activeTab === tab
                  ? `text-white dark:text-white border-0`
                  : "text-[#676c72] hover:text-[#000000] dark:text-[#e5e7eb] dark:hover:text-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "My Profile" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!FeatureRuleContent.profile.edit}
                            placeholder="gdgcloudkol"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!FeatureRuleContent.profile.edit}
                            placeholder="Doe"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="pronoun"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          Pronouns
                        </FormLabel>
                        <Select
                          disabled={!FeatureRuleContent.profile.edit}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your pronoun" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {[
                                {
                                  value: "NA",
                                  display_name: "Prefer not to say",
                                },
                                { value: "she", display_name: "She/Her" },
                                { value: "he", display_name: "He/Him" },
                                { value: "they", display_name: "They/Them" },
                                { value: "other", display_name: "Other" },
                              ].map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                  {e.display_name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!FeatureRuleContent.profile.edit}
                            placeholder="+91 98765 43210"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("student") ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="college"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                            College
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!FeatureRuleContent.profile.edit}
                              placeholder="Your College"
                              className="border-input focus:border-[#076eff] text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="graduation_year"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                            Graduation Year
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!FeatureRuleContent.profile.edit}
                              type="number"
                              placeholder="2024"
                              className="border-input focus:border-[#076eff] text-sm"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={"course"}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                            Course
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!FeatureRuleContent.profile.edit}
                              placeholder={"Your Course"}
                              className="border-input focus:border-[#076eff] text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                            Company
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!FeatureRuleContent.profile.edit}
                              placeholder="Your Company"
                              className="border-input focus:border-[#076eff] text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={"role"}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                            Role
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!FeatureRuleContent.profile.edit}
                              placeholder={"Your Role"}
                              className="border-input focus:border-[#076eff] text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="tshirt"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          T-shirt Size
                        </FormLabel>
                        <Select
                          disabled={!FeatureRuleContent.profile.editTshirt}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your t-shirt size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {[
                                {
                                  value: "S",
                                  display_name: "Small",
                                },
                                { value: "M", display_name: "Medium" },
                                { value: "L", display_name: "Large" },
                                { value: "XL", display_name: "X-Large" },
                                { value: "2XL", display_name: "2X-Large" },
                                { value: "3XL", display_name: "3X-Large" },
                                { value: "4XL", display_name: "4X-Large" },
                                { value: "5XL", display_name: "5X-Large" },
                              ].map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                  {e.display_name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          LinkedIn
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="linkedin.com/in/username"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          GitHub
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="github.com/username"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                          Twitter
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="twitter.com/username"
                            className="border-input focus:border-[#076eff] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                {form.formState.errors.root && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.root.message}
                  </p>
                )}

                {/* Save button */}
                <div className="mt-6 sm:mt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white dark:text-black px-6 sm:px-8 text-sm sm:text-base flex items-center gap-2"
                  >
                    <Image
                      src="/images/cfs/gemini.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 dark:invert"
                    />
                    {isSubmitting ? "Saving..." : "Save"}
                    <Image
                      src="/images/cfs/gemini.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 dark:invert"
                    />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {activeTab === "Points" && <Points />}

          {activeTab === "Leaderboard" && <LeaderBoard />}

          {activeTab === "Frame Studio" && <YourBadge />}

          {activeTab === "Tickets" && <Tickets session={session} />}
        </div>
      </CardContainer>
    </div>
  );
}
