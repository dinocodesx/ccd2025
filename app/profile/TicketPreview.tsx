import React from "react";
import Button from "@/components/ui/Button";
import GeminiIcon from "@/components/GeminiIcon";

interface TicketTemplate {
  id: string;
  name: string;
  imageUrl: string;
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
};

const LAYOUT = {
  USER_NAME_TOP_PERCENT: 29,
  QR_BOTTOM_PERCENT: 8,
  QR_SIZE_PERCENT: 45,
  TEXT_SIZE_PERCENT: 4.5,
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
}) => (
  <div className="border border-border rounded-lg bg-background p-3 sm:p-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div className="flex items-center gap-2">
        <img
          src="/images/elements/legal.svg"
          alt="Ticket preview"
          className="w-5 h-5 sm:w-6 sm:h-6"
        />
        <span className="font-bold text-foreground text-sm sm:text-base">
          {selectedTemplate.name}
        </span>
      </div>
    </div>
    <div className="flex justify-center">
      <div className="relative group w-full">
        <div className="w-full flex justify-center">
          <div
            ref={ticketPreviewRef}
            className="relative rounded-xl overflow-hidden  transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              width: isMobile ? "200px" : "250px",
              height: isMobile ? "400px" : "500px",
            }}
          >
            <img
              src={selectedTemplate.imageUrl}
              alt={selectedTemplate.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-ticket.svg";
              }}
            />
            {/* User Info Overlay */}
            {userInfo.uniqueCode && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  top: `${LAYOUT.USER_NAME_TOP_PERCENT}%`,
                }}
              >
                <div className="text-black text-center">
                  {userInfo.fullName && (
                    <div
                      className="font-bold"
                      style={{
                        fontSize: isMobile
                          ? `${200 * (LAYOUT.TEXT_SIZE_PERCENT / 100)}px`
                          : `${250 * (LAYOUT.TEXT_SIZE_PERCENT / 100)}px`,
                      }}
                    >
                      {userInfo.fullName}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* QR Code Overlay */}
            {qrCodeDataURL && (
              <div
                className="absolute transform -translate-x-1/2"
                style={{
                  left: "50%",
                  bottom: `${LAYOUT.QR_BOTTOM_PERCENT}%`,
                }}
              >
                <img
                  src={qrCodeDataURL}
                  alt="QR Code"
                  className="object-cover border-2 border-white rounded"
                  style={{
                    width: isMobile
                      ? `${200 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`
                      : `${250 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`,
                    height: isMobile
                      ? `${200 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`
                      : `${250 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`,
                  }}
                />
              </div>
            )}
            {/* Loading Overlay */}
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
    {/* Download Button - always visible, prominent, inside card */}
    <div className="flex justify-center mt-6">
      <Button
        onClick={onDownload}
        disabled={!qrCodeDataURL || isDownloading}
        size="lg"
        className="bg-[#076eff] hover:bg-[#065acc] text-white font-bold shadow-lg border-2 border-[#076eff] rounded-xl px-6 py-3 flex items-center gap-2 text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
      >
        <GeminiIcon />
        {isDownloading ? "Downloading..." : "Download Ticket"}
        <GeminiIcon />
      </Button>
    </div>
  </div>
);

export default TicketPreview; 