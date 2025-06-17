"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Session } from "next-auth";

interface TicketTemplate {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  width: number;
  height: number;
}

// Updated to vertical dimensions for ticket templates
const ticketTemplates: TicketTemplate[] = [
  {
    id: "template1",
    name: "CCD White Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "White Themed",
    width: 370,
    height: 800,
  },
  {
    id: "template2",
    name: "CCD Green Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "Green Themed",
    width: 370,
    height: 800,
  },
  {
    id: "template3",
    name: "CCD Blue Themed",
    imageUrl: "/images/tickets/template1.svg",
    description: "Blue Themed",
    width: 370,
    height: 800,
  },
];

// Absolute positioning constants
const LAYOUT = {
  USER_NAME_TOP_PERCENT: 29,
  QR_BOTTOM_PERCENT: 8, 
  QR_SIZE_PERCENT: 45, 
  TEXT_SIZE_PERCENT: 4.5, 
};

const calculateLayout = (containerWidth: number, containerHeight: number) => {
  const qrSize = containerWidth * (LAYOUT.QR_SIZE_PERCENT / 100);
  const textSize = Math.max(
    12,
    containerWidth * (LAYOUT.TEXT_SIZE_PERCENT / 100)
  );

  return {
    nameX: containerWidth / 2, // Center X
    nameY: containerHeight * (LAYOUT.USER_NAME_TOP_PERCENT / 100), // From top
    nameSize: textSize,

    // QR code
    qrSize: qrSize,
    qrX: containerWidth / 2, // Center X
    qrY: containerHeight * (1 - LAYOUT.QR_BOTTOM_PERCENT / 100), // From bottom edge
  };
};

export default function Tickets({ session }: { session: Session }) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TicketTemplate | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasGeneratedQR, setHasGeneratedQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ticketPreviewRef = useRef<HTMLDivElement>(null);

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
      setIsMobile(window.innerWidth < 640);
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
        width: 400,
        margin: 1,
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

    const scaleFactor = 3; 
    canvas.width = selectedTemplate.width * scaleFactor;
    canvas.height = selectedTemplate.height * scaleFactor;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";

    // Wait for template to fully load before proceeding
    await new Promise((resolve, reject) => {
      templateImg.onload = resolve;
      templateImg.onerror = reject;
      templateImg.src = selectedTemplate.imageUrl;
    });

    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";

    // Wait for QR code to fully load
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrCodeDataURL;
    });

    // Calculate layout using scaled dimensions
    const layout = calculateLayout(canvas.width, canvas.height);
    
    const qrDrawX = layout.qrX - (layout.qrSize / 2);
    const qrDrawY = layout.qrY - layout.qrSize;

    // Draw QR code at scaled dimensions
    ctx.drawImage(qrImg, qrDrawX, qrDrawY, layout.qrSize, layout.qrSize);

    if (userInfo.fullName) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Enhanced font rendering
      ctx.font = `bold ${layout.nameSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.fillStyle = "#000000";
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = layout.nameSize * 0.05; // Proportional stroke width
      ctx.strokeText(userInfo.fullName, layout.nameX, layout.nameY);
      
      ctx.fillText(userInfo.fullName, layout.nameX, layout.nameY);
    }

    const dataURL = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `ccd2025-ticket-${userInfo.fullName}-${selectedTemplate.id}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ticket downloaded successfully!");

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
      <div className="mb-4 sm:mb-6">
        <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">
          Choose Your Ticket Design
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto sm:max-w-lg">
          {ticketTemplates.map((template) => (
            <div
              key={template.id}
              className={`group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                selectedTemplate?.id === template.id
                  ? "scale-105"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Card Container with Gradient Border Effect */}
              <div
                className={`relative rounded-lg p-0.5 transition-all duration-300 ${
                  selectedTemplate?.id === template.id
                    ? "bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853] shadow-lg"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
                }`}
              >
                <div className="bg-white dark:bg-gray-900 rounded-md p-1.5 h-full">
                  {/* Preview Image Container */}
                  <div
                    className="relative rounded-sm overflow-hidden mb-1.5 bg-gray-50 dark:bg-gray-800"
                    style={{
                      aspectRatio: `${template.width}/${template.height}`,
                      width: "100%",
                      height: "auto",
                      maxHeight: "80px", // Limit max height
                    }}
                  >
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-contain transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-ticket.svg";
                      }}
                    />

                    {/* Selection Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-0.5 right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#4285f4] to-[#34a853] rounded-full flex items-center justify-center">
                          <svg
                            className="w-1 h-1 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3
                      className={`font-medium text-xs leading-tight transition-colors duration-300 ${
                        selectedTemplate?.id === template.id
                          ? "text-[#4285f4] dark:text-[#4285f4]"
                          : "text-gray-800 dark:text-gray-200 group-hover:text-[#4285f4] dark:group-hover:text-[#4285f4]"
                      }`}
                    >
                      {template.name.split(" ")[1]}
                    </h3>

                    {/* Color Indicator - Smaller */}
                    <div className="flex justify-center mt-1">
                      <div
                        className={`w-2 h-0.5 rounded-full transition-all duration-300 ${
                          template.id === "template1"
                            ? "bg-gray-400"
                            : template.id === "template2"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        } ${selectedTemplate?.id === template.id ? "w-3" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Text - Smaller */}
              <div
                className={`text-center mt-0.5 transition-all duration-300 ${
                  selectedTemplate?.id === template.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <span className="text-xs font-medium text-[#4285f4] dark:text-[#4285f4]">
                  {selectedTemplate?.id === template.id ? "✓" : "Select"}
                </span>
              </div>
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
                <img
                  src="/images/elements/gemini.svg"
                  alt="gemini"
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 invert"
                />
                {isDownloading ? "Downloading..." : "Download Ticket"}
                <img
                  src="/images/elements/gemini.svg"
                  alt="gemini"
                  className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 invert"
                />
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="relative group w-full">
                <div className="w-full flex justify-center">
                  <div
                    ref={ticketPreviewRef}
                    className="relative rounded-xl overflow-hidden shadow-lg border border-border transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{
                      width: isMobile ? "300px" : "400px", 
                      height: isMobile ? "600px" : "800px", 
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

                    {/* User Info Overlay - using percentage-based positioning for consistency */}
                    {userInfo.uniqueCode && (
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: "50%", // Center horizontally
                          top: `${LAYOUT.USER_NAME_TOP_PERCENT}%`, // From top
                        }}
                      >
                        <div className="text-black text-center">
                          {userInfo.fullName && (
                            <div
                              className="font-bold"
                              style={{
                                fontSize: isMobile
                                  ? `${
                                      300 * (LAYOUT.TEXT_SIZE_PERCENT / 100)
                                    }px` // 300px container
                                  : `${
                                      400 * (LAYOUT.TEXT_SIZE_PERCENT / 100)
                                    }px`, // 400px container
                              }}
                            >
                              {userInfo.fullName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* QR Code Overlay - using percentage-based positioning*/}
                    {qrCodeDataURL && (
                      <div
                        className="absolute transform -translate-x-1/2"
                        style={{
                          left: "50%", // Center horizontally
                          bottom: `${LAYOUT.QR_BOTTOM_PERCENT}%`, // From bottom
                        }}
                      >
                        <img
                          src={qrCodeDataURL}
                          alt="QR Code"
                          className="object-cover border-2 border-white rounded"
                          style={{
                            width: isMobile
                              ? `${300 * (LAYOUT.QR_SIZE_PERCENT / 100)}px` // 300px container
                              : `${400 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`, // 400px container
                            height: isMobile
                              ? `${300 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`
                              : `${400 * (LAYOUT.QR_SIZE_PERCENT / 100)}px`,
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
