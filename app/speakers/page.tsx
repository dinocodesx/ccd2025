import CallForSpeakers from "@/components/CallForSpeakers";
import Layout from "@/components/layout/Layout";
import HrWithImage from "@/components/ui/HrWithImage";
import { ContentParagraph } from "@/components/ui/PageContentParagraph";
import { PageHeader } from "@/components/ui/PageHeader";

import speakersData from "../../public/content/speakers.json";
import SpeakerCompaniesSection from "@/components/SpeakerCompanies";
import SpeakersSection from "@/components/SpeakersSection";
import Image from "next/image";

export default function Speakers() {
  interface GuestOfHonor {
    name: string;
    designation: string;
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
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-black dark:text-white text-center">
                  Guest of Honor
                </h2>
                {/* Container for multiple guest cards */}
                <div className="flex flex-wrap justify-center gap-6">
                  {/* Added flex-wrap and gap */}
                  {guestOfHonorList.map((guest, index) => (
                    <div key={index} className="w-full max-w-sm">
                      <div className="bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] rounded-2xl p-[2px] h-full">
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
                          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 p-4 flex-grow">
                            <div
                              className="w-32 h-32 rounded-lg bg-gray-200 flex-shrink-0 bg-center bg-cover border-2 border-black/80 mb-4 md:mb-0"
                              style={{
                                backgroundImage: `url(${guest.image})`,
                              }}
                            />
                            <div className="flex-1 flex flex-col min-w-0 text-center md:text-left">
                              <h3 className="text-lg font-semibold mb-1 text-black">
                                {guest.name}
                              </h3>
                              <p className="text-sm text-gray-700">
                                {guest.designation}
                              </p>
                              {guest.linkedin && (
                                <div className="mt-2 flex justify-center md:justify-start">
                                  <a
                                    href={guest.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                                    title="LinkedIn"
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SpeakersSection />
          </div>
        </div>
      </div>
    </Layout>
  );
}
