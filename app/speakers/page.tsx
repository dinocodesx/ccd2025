"use client"
import Layout from "@/components/layout/Layout";
import HrWithImage from "@/components/ui/HrWithImage";
import { ContentParagraph } from "@/components/ui/PageContentParagraph";
import { PageHeader } from "@/components/ui/PageHeader";

import speakersData from "../../public/content/speakers.json";
import SpeakerCompaniesSection from "@/components/SpeakerCompanies";
import SpeakersSection from "@/components/SpeakersSection";
import Image from "next/image";
import React, { useState } from "react";
import SpeakerDialog from "@/components/SpeakerDialog";
import { ChevronsDown, ChevronsUp } from "lucide-react";

export default function Speakers() {
  interface GuestOfHonor {
    name: string;
    designation: string;
    bio:string;
    image: string;
    linkedin?: string;
  }

  interface SpeakerData {
    title: string;
    description: string;
    illustration: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    // guestOfHonor is now an array
    guestOfHonor?: GuestOfHonor[];
  }
  // Normalize guestOfHonor to always be an array
  const rawSpeakerData = speakersData as any;
  const speakerData: SpeakerData = {
    ...rawSpeakerData,
    guestOfHonor: rawSpeakerData.guestOfHonor
      ? Array.isArray(rawSpeakerData.guestOfHonor)
        ? rawSpeakerData.guestOfHonor
        : [rawSpeakerData.guestOfHonor]
      : [],
  };

  const guestOfHonorList: GuestOfHonor[] = speakerData.guestOfHonor || [];

  // Dialog state for Guest of Honor
  const [selectedGuest, setSelectedGuest] = useState<GuestOfHonor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedMobileGuest, setExpandedMobileGuest] = useState<number | null>(null);

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-12 py-14 relative z-10">
        <div className="min-h-screen overflow-hidden">
          <div className="">
            <PageHeader>{speakerData.title}</PageHeader>

            <ContentParagraph className="text-base py-2">
              {speakerData.description}
            </ContentParagraph>

            <HrWithImage
              src={speakerData.illustration.src}
              alt={speakerData.illustration.alt}
              width={speakerData.illustration.width}
              height={speakerData.illustration.height}
            />

            {/* Add code here and don't delete any existing code */}
            <div hidden>
              <SpeakerCompaniesSection variant="marquee" />
            </div>
            {/* <CallForSpeakers /> */}

            {/* Guest of Honor Section - Styled like Speaker Card */}
            {guestOfHonorList.length > 0 && (
              <div className="mb-10">
                <div className="flex flex-col items-center justify-center gap-2 mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold  text-black dark:text-white text-center">
                  Guest of Honor
                </h2>
                <span className="mx-auto text-center text-base text-gray-500 max-w-2xl">The Guest of Honor of CCD Kolkata 2025.</span>
                </div>
                {/* Container for multiple guest cards */}
                <div className="flex flex-wrap justify-center gap-6">
                  {/* Added flex-wrap and gap */}
                  {guestOfHonorList.map((guest, index) => (
                    <div key={index} className="w-full max-w-sm">
                      <div
                        className="bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] rounded-2xl p-[2px] h-full cursor-pointer"
                        onClick={() => {
                          setSelectedGuest(guest);
                          setDialogOpen(true);
                        }}
                      >
                        <div className="flex flex-col flex-1 bg-white  rounded-2xl overflow-hidden h-full">
                          {/* Header */}
                          <div className="flex justify-between bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] px-4 py-2">
                            <span className="text-white text-base font-medium">
                              Guest of Honor
                            </span>
                            <Image
                              src="/images/elements/star.svg"
                              alt="Guest of Honor Icon"
                              width={20}
                              height={20}
                              className="w-5 h-5 "
                            />
                          </div>
                          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 pt-4 sm:px-0 md:px-4 md:py-4 flex-grow">
                            <div
                              className="w-32 h-32 rounded-lg bg-gray-200 flex-shrink-0 bg-center bg-cover border-2 border-black/80 mb-4 md:mb-0"
                              style={{
                                backgroundImage: `url(${guest.image})`,
                              }}
                            />
                            <div className="flex-1 flex flex-col min-w-0 h-full w-full justify-between">
                              {/* Desktop text content: name, designation, bio */}
                              <div className="hidden md:block text-left">
                                <h3 className="text-lg font-semibold mb-1 text-black">
                                  {guest.name}
                                </h3>
                                <p className="text-sm text-gray-700">
                                  {guest.designation}
                                </p>
                                <div className="text-sm text-gray-500 mb-1 flex items-end">
                                  <div className="line-clamp-2 overflow-hidden max-w-full no-scrollbar">
                                    {guest.bio}
                                  </div>
                                </div>
                                {guest.linkedin && (
                                  <div className="mt-2 flex justify-start">
                                    <a
                                      href={guest.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                                      title="LinkedIn"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Image
                                        src="/images/socials/linkedin.svg"
                                        alt="LinkedIn"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 "
                                      />
                                      <span className="sr-only">LinkedIn</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                              {/* Mobile text content */}
                              <div className="md:hidden">
                                <div className="text-lg font-semibold text-black mb-1 truncate text-center">
                                  {guest.name}
                                </div>
                                <div className="text-sm text-gray-700 mb-1 text-center px-2">
                                  {guest.designation}
                                </div>
                                {/* Mobile social icons (with border) - below tagline, above bio */}
                                {guest.linkedin && (
                                  <div className="flex flex-row items-center gap-2 mt-1 mb-2 justify-center">
                                    <a
                                      href={guest.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center border-2 border-black/80 rounded-full p-1"
                                      title="LinkedIn"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Image
                                        src="/images/socials/linkedin.svg"
                                        alt="LinkedIn"
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                      />
                                    </a>
                                  </div>
                                )}
                                {/* Mobile bio section (sm and below) */}
                                <div className="bg-gray-200 p-4 px-4 flex flex-col items-center justify-between rounded-t-xl">
                                  <div
                                    className={`max-w-full text-black/50 transition-all duration-300 overflow-hidden no-scrollbar ${expandedMobileGuest === index
                                      ? "max-h-96"
                                      : "max-h-12 line-clamp-2"
                                      }`}
                                  >
                                    {guest.bio}
                                  </div>
                                  {expandedMobileGuest === index ? (
                                    <button
                                      className="text-blue-600 text-xs underline whitespace-nowrap flex-shrink-0"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setExpandedMobileGuest(null);
                                      }}
                                    >
                                      <ChevronsUp className="bg-black text-white w-10 h-6 rounded-full mt-1" />
                                    </button>
                                  ) : (
                                    <button
                                      className="text-blue-600 text-xs underline whitespace-nowrap flex-shrink-0"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setExpandedMobileGuest(index);
                                      }}
                                    >
                                      <ChevronsDown className="bg-black text-white w-10 h-6 rounded-full mt-1" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* SpeakerDialog for Guest of Honor */}
                <SpeakerDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  speaker={selectedGuest}
                />
              </div>
            )}

            <SpeakersSection />
          </div>
        </div>
      </div>
    </Layout>
  );
}
