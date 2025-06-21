import React, { useState } from "react";
import Button from "@/components/ui/Button";
import GeminiIcon from "@/components/GeminiIcon";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TicketTemplate {
  id: string;
  name: string;
  imageUrl: string;
  previewUrl: string;
  description: string;
  width: number;
  height: number;
}

type UserInfo = {
  uniqueCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  qrText: string;
};

type Props = {
  selectedTemplate: TicketTemplate;
  userInfo: UserInfo;
  qrCodeDataURL: string;
  isMobile: boolean;
  isGenerating: boolean;
  ticketPreviewRef: React.RefObject<HTMLDivElement | null>;
  onDownload: () => void;
  isDownloading: boolean;
  isDialogView?: boolean;
};

const LAYOUT = {
  USER_NAME_TOP_PERCENT: 29,
  QR_BOTTOM_PERCENT: 8,
  QR_SIZE_PERCENT: 34,
  TEXT_SIZE_PERCENT: 5.5,
};

const TicketPreview: React.FC<Props> = ({
  selectedTemplate,
  userInfo,
  qrCodeDataURL,
  isMobile,
  isGenerating,
  ticketPreviewRef,
  onDownload,
  isDownloading,
  isDialogView = false,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Reset image loaded state if template changes
  React.useEffect(() => {
    setIsImageLoaded(false);
    setHasImageError(false);
  }, [selectedTemplate.imageUrl]);

  return (
    <div
      className={cn(
        !isDialogView &&
          "border border-border rounded-lg  dark:bg-[#111] p-3 sm:p-4 w-11/12 h-full"  
      )}
    >
      {!isDialogView && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/elements/legal.svg"
              alt="Ticket preview"
              className="w-5 h-5 sm:w-6 sm:h-6"
              width={24}
              height={24}
            />
            <span className="font-bold text-foreground text-sm sm:text-base">
              {selectedTemplate.name}
            </span>
          </div>
          {/* Download button for desktop (hidden on mobile) */}
          <div className="hidden sm:flex ml-auto">
            <Button
              onClick={onDownload}
              disabled={!qrCodeDataURL || isDownloading}
              size="md"
              className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GeminiIcon className="dark:invert" />
              {isDownloading ? "Downloading..." : "Download Ticket"}
              <GeminiIcon className="dark:invert" />
            </Button>
    
          </div>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <div className="relative group w-full">
          <div className="w-full flex justify-center">
            <div
              ref={ticketPreviewRef}
              className="relative rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
              style={{
                width: isMobile ? "min(90vw, 300px)" : "250px",
                height: isMobile ? "calc(min(90vw, 350px) * 8 / 5)" : "400px",
              }}
            >
              {/* Ticket Image */}
              <Image
                src={hasImageError ? "/images/placeholder-ticket.svg" : selectedTemplate.previewUrl}
                alt={selectedTemplate.name}
                width={1080}
                height={1920}
                className="w-auto h-full object-contain rounded-3xl mx-auto border"
                onLoad={() => setIsImageLoaded(true)}
                onError={() => {
                  setHasImageError(true);
                  setIsImageLoaded(true); // Show placeholder as loaded
                }}
                priority
              />

              {/* Loader overlay while image is loading */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                  <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3 shadow-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#076eff]"></div>
                    <span className="text-sm text-black">Loading ticket...</span>
                  </div>
                </div>
              )}

              {/* Only show user info and QR after image loads */}
              {isImageLoaded && userInfo.uniqueCode && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: "50%",
                    top: `${LAYOUT.USER_NAME_TOP_PERCENT}%`,
                    width: "100%",
                  }}
                >
                  <div className={cn(selectedTemplate.id=="template1" && "text-black", selectedTemplate.id=="template2"&&"text-white","text-center px-3")}>
                    {userInfo.fullName && (
                      <div
                        className={
                        cn(
                          "font-bold text-[13px]",
                           userInfo.fullName.length>16 && userInfo.fullName.length<19 && "text-[17px]",
                           userInfo.fullName.length>19 &&"text-[13px]",
                        )
                        }
                     
                      >
                        {userInfo.fullName}

                      </div>
                    )}
                  </div>
                </div>
              )}

              {isImageLoaded && qrCodeDataURL && (
                <div
                  className="absolute transform -translate-x-1/2"
                  style={{
                    left: "50%",
                    bottom: `${LAYOUT.QR_BOTTOM_PERCENT}%`,
                  }}
                >
                  <Image
                    src={qrCodeDataURL}
                    alt="QR Code"
                    width={512}
                    height={512}
                    className="object-cover border-2 border-white rounded"
                    style={{
                      width: isMobile
                        ? `calc(min(90vw, 350px) * ${LAYOUT.QR_SIZE_PERCENT / 100})`
                        : `${250 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`,
                      height: isMobile
                        ? `calc(min(90vw, 350px) * ${LAYOUT.QR_SIZE_PERCENT / 100})`
                        : `${250 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`,
                    }}
                  />
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#076eff]"></div>
                    <span className="text-sm">Generating QR Code...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default TicketPreview; 