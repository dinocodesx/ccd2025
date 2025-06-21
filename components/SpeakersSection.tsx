"use client";

import { ChevronsDown, ChevronsUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getSpeakers } from "@/lib/speakers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";

interface Speaker {
  id: string;
  fullName: string;
  tagLine: string;
  bio: string;
  profilePicture: string;
  links?: { title: string; url: string; linkType: string }[];
}

const socialIcon = (type: string) => {
  if (type === "LinkedIn") return "/images/socials/linkedin.svg";
  if (type === "Twitter" || type === "X") return "/images/socials/x.svg";
  return null;
};

const SpeakersSection: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpeakers = async () => {
      setLoading(true);
      setError(null);
      try {
        const speakersData = await getSpeakers();
        setSpeakers(speakersData);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load speakers");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSpeakers();
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hidden Guest Speaker Section */}
      <div hidden>
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-black dark:text-white">
            Guest Speaker
          </h2>
          <div className="flex justify-start">
            <div className="max-w-md w-full">
              <div className="flex flex-col md:flex-row items-center p-6 bg-white rounded-xl shadow-sm">
                <div
                  className="w-32 h-32 bg-gray-200 rounded-lg mr-6 mb-4 md:mb-0 bg-center bg-cover"
                  style={{
                    backgroundImage: "url(/images/speakers/sample-guest.jpg)",
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Guest Name</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Guest Designation
                  </p>
                  <p className="text-sm text-gray-500">Guest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Speakers Section */}
      <div className="mb-6 text-start">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-black dark:text-white">
          Our Amazing Speakers
        </h2>
        <p className="text-base text-gray-500 max-w-2xl">
          Discover our amazing speakers for the final day of GCCD Kolkata 2025
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-300"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] rounded-2xl p-[2px] flex flex-col min-h-[180px] cursor-pointer"
              onClick={() => setSelectedSpeaker(speaker)}
            >
              <div className="flex flex-col flex-1 bg-white rounded-2xl overflow-hidden">
                <div className="flex  justify-between bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] px-4 py-2">
                  <span className="text-white text-base font-medium">
                    Speaker
                  </span>
                  <Image
                    src="/images/elements/resources-speaker.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 "
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-1 md:gap-4 md:p-4 pt-4 rounded-t-2xl">
                  <div
                    className="w-40 h-40 rounded-lg bg-gray-200 flex-shrink-0 bg-center bg-cover border-2 border-black/80 mb-4 md:mb-0"
                    style={{
                      backgroundImage: `url(${speaker.profilePicture})`,
                    }}
                  />
                  <div className="flex-1 flex flex-col min-w-0 h-full w-full justify-between">
                    {/* Desktop text content: name, tagline, bio */}
                    <div className="hidden md:block text-left">
                      <div className="text-lg font-semibold text-black mb-1 ">
                        {speaker.fullName}
                      </div>
                      <div className="text-sm text-gray-700 mb-1 ">
                        {speaker.tagLine}
                      </div>
                      <div className="text-sm text-gray-500 mb-1 flex items-end">
                        <div className="line-clamp-2 overflow-hidden max-w-full no-scrollbar">
                          {speaker.bio}
                        </div>
                      </div>
                    </div>
                    {/* Mobile text content (unchanged) */}
                    <div className="md:hidden">
                      <div className="text-lg font-semibold text-black mb-1 truncate text-center">
                        {speaker.fullName}
                      </div>
                      <div className="text-sm text-gray-700 mb-1 md:truncate text-center px-2">
                        {speaker.tagLine}
                      </div>
                    </div>
                    {/* Mobile social icons (with border) - below tagline, above bio */}
                    <div className="flex flex-row items-center gap-2 mt-1 mb-2 justify-center md:hidden">
                      {speaker.links &&
                        speaker.links.map((link) =>
                          link.linkType === "LinkedIn" ||
                            link.linkType === "Twitter" ||
                            link.linkType === "X" ? (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center border-2 border-black/80 rounded-full p-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Image
                                src={socialIcon(link.linkType) || ""}
                                alt={link.linkType}
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                            </a>
                          ) : null
                        )}
                    </div>
                    {/* Mobile bio section (sm and below) */}
                    <div className="md:hidden bg-gray-200 p-4 px-4 flex flex-col items-center justify-between rounded-t-xl">
                      <div
                        className={`max-w-full text-black/50 transition-all duration-300 overflow-hidden no-scrollbar ${expandedMobile === speaker.id
                          ? "max-h-96"
                          : "max-h-12 line-clamp-2"
                          }`}
                      >
                        {speaker.bio}
                      </div>
                      {expandedMobile === speaker.id ? (
                        <button
                          className="text-blue-600 text-xs underline whitespace-nowrap flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMobile(null);
                          }}
                        >
                          <ChevronsUp className="bg-black text-white w-10 h-6 rounded-full mt-1" />
                        </button>
                      ) : (
                        <button
                          className="text-blue-600 text-xs underline whitespace-nowrap flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMobile(speaker.id);
                          }}
                        >
                          <ChevronsDown className="bg-black text-white w-10 h-6 rounded-full mt-1" />
                        </button>
                      )}
                    </div>
                    {/* Desktop social icons (no border) - always below bio */}
                    <div className="hidden md:flex flex-row items-center gap-2 mt-1 mb-4">
                      {speaker.links &&
                        speaker.links.map((link) =>
                          link.linkType === "LinkedIn" ||
                            link.linkType === "Twitter" ||
                            link.linkType === "X" ? (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Image
                                src={socialIcon(link.linkType) || ""}
                                alt={link.linkType}
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                            </a>
                          ) : null
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedSpeaker}
        onOpenChange={() => setSelectedSpeaker(null)}
      >
        <DialogContent className="max-w-2xl z-999 max-h-[700px] md:h-auto">
          {selectedSpeaker && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center">
                  <div
                    className="size-32 rounded-lg bg-gray-200 bg-center bg-cover border-2 border-black/80 mb-4"
                    style={{
                      backgroundImage: `url(${selectedSpeaker.profilePicture})`,
                      backgroundSize: "cover",
                    }}
                  />
                  <DialogTitle className="text-xl font-bold text-center">
                    {selectedSpeaker.fullName}
                  </DialogTitle>
                  <p className="text-base mb-2 text-center">
                    {selectedSpeaker.tagLine}
                  </p>
                </div>
              </DialogHeader>
              <div className="my-2">
                <div className="text-center whitespace-pre-line scroll-auto mb-2">
                  {selectedSpeaker.bio}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SpeakersSection;
