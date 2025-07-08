"use client";

import Button from "@/components/ui/Button";
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import GeminiIcon from "@/components/GeminiIcon";
import FeatureRuleContent from "@/public/content/feature.rule.json";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserProfile } from "@/types/login";
import type { Session } from "next-auth";

// FormValues type
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
  tsize?: string;
  graduation_year?: number;
  student?: boolean;
  twitter?: string;
  linkedin?: string;
  github?: string;
};

export default function ProfileForm({ user, session }: { user: UserProfile; session: Session }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useSession();

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
    tsize: z.string().optional(),
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
      lastName: user?.last_name[0] === '.' ? "" : user?.last_name[0] || "",
      email: session.user.email || "",
      company: user.company || "",
      role: user?.role || "",
      pronoun: user?.pronoun || "",
      phone: user?.phone || "",
      college: user?.college || "",
      course: user?.course || "",
      tsize: user?.tsize || "",
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
          last_name: values.lastName[0] === '.' ? "" : values.lastName[0] || "",
          email: values.email || "",
          company: values.company,
          role: values.role || "",
          pronoun: values.pronoun || "",
          phone: values.phone || "",
          college: values.college || "",
          course: values.course || "",
          graduation_year: values.graduation_year || undefined,
          student: values.student ?? false,
          tsize: values.tsize || "",
          socials: {
            twitter: values.twitter || "",
            linkedin: values.linkedin || "",
            github: values.github || "",
          },
        } : FeatureRuleContent.profile.editTshirt ? {
          tsize: values.tsize || "",
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
            name="tsize"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs sm:text-sm text-muted-foreground">
                  T-shirt Size
                </FormLabel>
                <FormControl>
                  <Select
                    disabled={!FeatureRuleContent.profile.editTshirt}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your t-shirt size" />
                    </SelectTrigger>
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
                </FormControl>
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
            <GeminiIcon className="dark:invert" />
            {isSubmitting ? "Saving..." : "Save"}
            <GeminiIcon className="dark:invert ml-0" />
          </Button>
        </div>
      </form>
    </Form>
  );
} 