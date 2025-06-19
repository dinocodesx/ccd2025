"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Session } from "next-auth";
import GeminiIcon from "@/components/GeminiIcon";

interface TicketTemplate {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  width: number;
  height: number;
}

const ticketTemplates: TicketTemplate[] = [
  {
    id: "template1",
    name: "CCD White Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "White Themed",
    width: 1000,
    height: 400,
  },
  {
    id: "template2",
    name: "CCD Green Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "Green Themed",
    width: 1000,
    height: 400,
  },
  {
    id: "template3",
    name: "CCD Blue Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "Blue Themed",
    width: 1000,
    height: 400,
  },
];

const getTextFieldCoordinates = (
  templateId: string,
  canvasWidth: number,
  canvasHeight: number
) => {
  const baseCoords = {
    nameX: canvasWidth * 0.07,
    nameY: canvasHeight * 0.85,
    ticketIdX: canvasWidth * 0.07,
    ticketIdY: canvasHeight * 0.95,
    nameSize: Math.floor(canvasHeight * 0.055),
    ticketIdSize: Math.floor(canvasHeight * 0.04),
  };

  switch (templateId) {
    case "template1":
      return {
        ...baseCoords,
        nameX: canvasWidth * 0.07,
        ticketIdX: canvasWidth * 0.07,
      };
    case "template2":
      return {
        ...baseCoords,
        nameX: canvasWidth * 0.07,
        ticketIdX: canvasWidth * 0.07,
      };
    case "template3":
      return {
        ...baseCoords,
        nameX: canvasWidth * 0.07,
        ticketIdX: canvasWidth * 0.07,
      };
    default:
      return baseCoords;
  }
};

// Helper function to get responsive text size based on viewport
const getResponsiveTextSize = () => {
  const viewportWidth = window.innerWidth;
  const baseSize = viewportWidth * 0.025; // 2.5% of viewport width
  return {
    nameSize: Math.max(12, Math.min(18, baseSize)), // Min 12px, Max 18px
  };
};

export default function Tickets({ session }: { session: Session }) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TicketTemplate | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasGeneratedQR, setHasGeneratedQR] = useState(false);
  const [responsiveTextSize, setResponsiveTextSize] = useState({
    nameSize: 14,
  });
  const [isMobile, setIsMobile] = useState(false);
  const ticketPreviewRef = useRef<HTMLDivElement>(null);

  // Extract user data directly from session
  const userInfo = useMemo(() => {
    const profile = (session?.user as any)?.profile;
    const uniqueCode = profile?.unique_code || "1234";
    const firstName = profile?.first_name || "";
    const lastName = profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (session?.user as any)?.username || "";

    return {
      uniqueCode,
      firstName,
      lastName,
      fullName,
      username,
      qrText: uniqueCode,
    };
  }, [session]);

  useEffect(() => {
    const updateLayout = () => {
      setResponsiveTextSize(getResponsiveTextSize());
      setIsMobile(window.innerWidth < 640); // 640px sm breakpoint 
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (!hasGeneratedQR && session && userInfo.uniqueCode) {
      generateQRCode();
    }
  }, [session, userInfo.uniqueCode, hasGeneratedQR]);

  const generateQRCode = async () => {
    if (hasGeneratedQR || !userInfo.qrText) return;

    setIsGenerating(true);
    try {
      const dataURL = await QRCode.toDataURL(userInfo.qrText, {
        width: 150,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataURL(dataURL);
      setHasGeneratedQR(true);
      toast.success("QR code generated successfully!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error("QR generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTicket = async () => {
    if (!selectedTemplate || !qrCodeDataURL) {
      toast.error("Please select a template and ensure QR code is generated");
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      canvas.width = selectedTemplate.width;
      canvas.height = selectedTemplate.height;

      const templateImg = new Image();

      templateImg.onload = () => {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        const qrImg = new Image();

        qrImg.onload = () => {
          // Calculate QR code size and position
          let displayedWidth = 400;
          if (ticketPreviewRef.current) {
            displayedWidth =
              ticketPreviewRef.current.getBoundingClientRect().width;
          }

          const viewportWidth = window.innerWidth;
          const vwSize = (15 * viewportWidth) / 100;
          const clampedSize = Math.min(200, Math.max(40, vwSize));
          const scaleFactor = canvas.width / displayedWidth;
          const qrSize = clampedSize * scaleFactor;

          // Position QR code on the ticket
          const qrX = canvas.width - canvas.width * 0.07 - qrSize;
          const qrY = canvas.height * 0.2;

          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          try {
            const coords = getTextFieldCoordinates(
              selectedTemplate.id,
              canvas.width,
              canvas.height
            );

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            if (userInfo.fullName) {
              ctx.font = `bold ${coords.nameSize}px Arial`;
              ctx.fillStyle = "#000000";
              ctx.fillText(userInfo.fullName, coords.nameX, coords.nameY);
            }

            // Download the ticket
            const dataURL = canvas.toDataURL("image/png", 0.9);
            const link = document.createElement("a");
            link.download = `ccd2025-ticket-${userInfo.uniqueCode}-${selectedTemplate.id}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Ticket downloaded successfully!");
          } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download ticket");
          }
        };

        qrImg.onerror = () => toast.error("Failed to load QR code");
        qrImg.src = qrCodeDataURL;
      };

      templateImg.onerror = () => toast.error("Failed to load template image");
      templateImg.src = selectedTemplate.imageUrl;
    } catch (error) {
      toast.error("Failed to download ticket");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state if session is not available
  if (!session) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#076eff] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              Your Event Ticket
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl">
              Welcome {userInfo.fullName || userInfo.username}! Select a design
              and generate your personalized CCD 2025 ticket with QR code
              authentication.
            </p>
          </div>
          <div className="flex-shrink-0 flex justify-center md:justify-end">
            <img
              src="/images/elements/2025-black.svg"
              alt="CCD 2025"
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 dark:invert"
            />
          </div>
        </div>
      </div>

      <hr className="mb-4 sm:mb-6" />

      {/* Template Selection */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
          Choose Your Ticket Design
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ticketTemplates.map((template) => (
            <div
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg ${
                selectedTemplate?.id === template.id
                  ? "ring-2 ring-[#076eff] border-[#076eff] shadow-lg"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <Card className="h-full">
                <CardHeader className="pb-2 sm:pb-3">
                  <h4 className="text-xs sm:text-sm font-medium">
                    {template.name}
                  </h4>
                </CardHeader>
                <CardBody className="pt-0">
                  <div
                    className="relative rounded-lg overflow-hidden mb-2 sm:mb-3"
                    style={{
                      aspectRatio: `${template.width}/${template.height}`,
                      width: "100%",
                    }}
                  >
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-ticket.svg";
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Preview */}
      {selectedTemplate && (
        <div className="mb-6 sm:mb-8">
          <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
            Preview Ticket
          </h4>
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
              <Button
                onClick={downloadTicket}
                disabled={!qrCodeDataURL || isDownloading}
                size="sm"
                className="bg-[#076eff] hover:bg-[#065acc] text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <GeminiIcon/>
                {isDownloading ? "Downloading..." : "Download Ticket"}
               <GeminiIcon/>
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="relative group w-full max-w-4xl">
                {/* Mobile horizontal layout */}
                {isMobile ? (
                  <div className="w-full">
                    <div className="w-full">
                      <div
                        ref={ticketPreviewRef}
                        className="relative rounded-xl overflow-hidden shadow-lg border border-border transition-transform duration-300 group-hover:scale-[1.02] w-full"
                        style={{
                          aspectRatio: `${selectedTemplate.width}/${selectedTemplate.height}`,
                          width: "100%", // Full width
                          height: "auto", // Auto height to maintain aspect ratio
                        }}
                      >
                        <img
                          src={selectedTemplate.imageUrl}
                          alt={selectedTemplate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/images/placeholder-ticket.svg";
                          }}
                        />

                        {/* QR Code Overlay - positioned at top-right with responsive size */}
                        {qrCodeDataURL && (
                          <div className="absolute top-[20%] right-[7%]">
                            <img
                              src={qrCodeDataURL}
                              alt="QR Code"
                              className="object-cover border-2 border-white rounded"
                              style={{
                                width: "clamp(30px, 12vw, 80px)", // Responsive size for mobile
                                height: "clamp(30px, 12vw, 80px)",
                              }}
                            />
                          </div>
                        )}

                        {userInfo.uniqueCode && (
                          <div className="absolute bottom-[7%] left-[7%]">
                            <div className="text-black">
                              {" "}
                              {/* Grayish shade */}
                              {userInfo.fullName && (
                                <div
                                  className="font-bold"
                                  style={{
                                    fontSize: "clamp(8px, 3vw, 14px)", 
                                  }}
                                >
                                  {userInfo.fullName}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Loading Overlay */}
                        {isGenerating && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#076eff]"></div>
                              <span className="text-sm">
                                Generating QR Code...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Mobile info text */}
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Your personalized ticket preview
                    </p>
                  </div>
                ) : (
                  <div
                    ref={ticketPreviewRef}
                    className="relative rounded-xl overflow-hidden shadow-lg border border-border transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{
                      aspectRatio: `${selectedTemplate.width}/${selectedTemplate.height}`,
                      width: "100%",
                    }}
                  >
                    <img
                      src={selectedTemplate.imageUrl}
                      alt={selectedTemplate.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-ticket.svg";
                      }}
                    />

                    {qrCodeDataURL && (
                      <div className="absolute top-[20%] right-[7%]">
                        <img
                          src={qrCodeDataURL}
                          alt="QR Code"
                          className="object-cover border-2 border-white rounded"
                          style={{
                            width: `clamp(40px, 15vw, 200px)`,
                            height: `clamp(40px, 15vw, 200px)`,
                          }}
                        />
                      </div>
                    )}
                    {userInfo.uniqueCode && (
                      <div className="absolute bottom-[10%] left-[7%]">
                        <div
                          className="text-black"
                          style={{
                            width: `clamp(200px, 30vw, 400px)`,
                          }}
                        >
                          {userInfo.fullName && (
                            <div
                              className="font-bold"
                              style={{
                                fontSize: `clamp(12px, 2.5vw, 20px)`,
                              }}
                            >
                              {userInfo.fullName}
                            </div>
                          )}
                        </div>
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
          📋 How to use your ticket:
        </h4>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">•</span>
            Select your preferred ticket design from the three available themes
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">•</span>
            Your QR code is automatically generated using your unique session
            ID:{" "}
            <code className="bg-white/50 dark:bg-black/20 px-1 rounded text-xs">
              {userInfo.uniqueCode}
            </code>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">•</span>
            Download your personalized ticket with all your details
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">•</span>
            Present this ticket at CCD 2025 for entry verification
          </li>
        </ul>
      </div>
    </div>
  );
}
