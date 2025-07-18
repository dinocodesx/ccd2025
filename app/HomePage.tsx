"use client";

import CallForSpeakers from "@/components/CallForSpeakers";
import HeroSection2 from "@/components/HeroSection2";
import SvgBand from "@/components/SvgBand";
import React, { useState, useEffect } from "react";
import CONTENT from "../public/content/home.json";
import featureRule from "../public/content/feature.rule.json";
import AboutFrame from "@/components/AboutFrame";
import Highlights from "@/components/Highlights";
import Link from "next/link";
import Sponsors from "@/components/Sponsors";
import CompanyLogos from "@/components/SpeakerCompanies";
import SpeakerCompaniesSection from "@/components/SpeakerCompanies";
import { useTheme } from "next-themes";
import GeminiIcon from "@/components/GeminiIcon";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [prevTheme, setPrevTheme] = useState<string | undefined>(undefined);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== undefined) {
      if (prevTheme === undefined) {
        setPrevTheme(theme);
        return;
      }

      if (prevTheme !== theme) {
        // Increment opacity when theme changes
        const increment = 15;
        const currentOpacity = backgroundOpacity;
        const targetOpacity = Math.min(currentOpacity + increment, 100);
        setBackgroundOpacity(targetOpacity);
        setPrevTheme(theme);

        // Reset opacity to 35 after 5 seconds
        const timer = setTimeout(() => {
          setBackgroundOpacity(0);
        }, 12000);
        return () => clearTimeout(timer);
      }
    }
  }, [theme]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen xl:min-h-[110dvh] flex flex-col justify-center items-center text-center px-4 pt-20 pb-32 relative dark:bg-[var(--black)]">
        {/* Background text with dynamic opacity ****Not required anymore***** */}
        {/* <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-50"
          style={{ opacity: backgroundOpacity / 100 }}
        >
          <span className="text-3xl md:text-4xl lg:text-8xl font-black text-gray-200 dark:text-gray-900 select-all">
            {CONTENT.couponCode}
          </span>
        </div> */}

        <div className="container mx-auto z-10 relative xl:-mt-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[var(--foreground)] dark:text-[var(--white)]">
            Cloud Community
            <br />
            <div className="flex items-center justify-center">
              <img
                src="/images/elements/GCP.webp"
                alt="Cloud"
                className="h-12 w-auto mr-6"
              />
              Days{" "}
              <span className="text-[var(--google-blue)] border-2 border-[var(--google-blue)] rounded-full px-6 py-2 text-3xl md:text-4xl ml-4 mt-5">
                2025
              </span>
            </div>
          </h1>

          <p className="text-xl md:text-2xl mt-8 mb-12 text-[var(--blue50)] dark:text-[var(--gray20)]">
            {CONTENT.date} -{" "}
            <Link
              href={CONTENT.venueLink}
              target="_blank"
              className="cursor-pointer"
            >
              {CONTENT.venue}
            </Link>
          </p>
          {featureRule.guidelines.showGuidelines ?
          <Link href={featureRule.guidelines.guidlinesLink} target="_blank" rel="noreferrer noopener">
          <Button
              className="bg-google-blue hover:bg-blue-600 transition-all duration-200 text-white px-8 py-3 rounded-full font-medium text-lg inline-flex items-center cursor-pointer"

            >
              <GeminiIcon/>
            {featureRule.guidelines.guidelinesText}
             <GeminiIcon/>
            </Button>
          </Link>
:featureRule.ticketsSoldOut? (
            <button
              className="bg-google-red text-white px-8 py-3 rounded-full font-medium text-lg inline-flex items-center cursor-not-allowed "
              disabled
            >
              <GeminiIcon/>
              Tickets Sold Out
             <GeminiIcon/>
            </button>
          ) : (
            <Link
              href="/apply"
              className="bg-[var(--black)] text-[var(--white)] dark:bg-[var(--white)] dark:text-[var(--black)] px-8 py-3 rounded-full font-medium text-lg inline-flex items-center"
            >
              <img
                src="/images/elements/gemini.svg"
                className="mr-4 dark:invert block"
                alt={"gemini"}
              />
              Apply for Tickets
              <img
                src="/images/elements/gemini.svg"
                className="ml-4 dark:invert block"
                alt={"gemini"}
              />
            </Link>
          )}
        </div>

        {/* City Skyline Image */}
        <div className="absolute -bottom-10 left-0 right-0 w-full">
          <img
            src="/images/kolkata.svg"
            alt="Kolkata Skyline"
            className="h-full xl:w-11/12 mx-auto xl:h-auto invert dark:invert-0 opacity-80 dark:opacity-30"
          />
        </div>
      </section>

      {/* Rest of your components remain unchanged */}
      <AboutFrame />
      <div className="w-full max-w-5xl mx-auto">
      <SpeakerCompaniesSection variant="grid" />
      </div>
      <SvgBand
        reverse={true}
        pauseOnHover={true}
        className="bg-[var(--marquee-backgroundBlue)]"
      />
      <HeroSection2 />
      <SvgBand
        reverse={false}
        pauseOnHover={true}
        className="bg-[var(--marquee-backgroundYellow)]"
      />
      <div className="my-20">
        <CallForSpeakers />
      </div>
      <Highlights />
      <Sponsors />
      <SvgBand reverse={true} pauseOnHover={true} className="bg-[#E84435]" />
    </div>
  );
}
