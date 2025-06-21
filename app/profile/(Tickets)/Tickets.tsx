"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Session } from "next-auth";

import React from "react";
import TicketTemplateCard from "./TicketTemplateCard";
import TicketPreview from "./TicketPreview";
import SocialShareButtons from "./SocialShareButtons";
import TicketInstructions from "./TicketInstructions";
import { ticketTemplates, LAYOUT, DOWNLOAD_QR_CENTER_Y_PERCENT } from "./ticketConstants";
import { calculateLayout } from "./ticketUtils";
import GeminiIcon from "@/components/GeminiIcon";


export default function Tickets({ session }: { session: Session }) {
  const [selectedTemplate, setSelectedTemplate] =
    useState(() => ticketTemplates.find(t => t.id === "template1") || null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasGeneratedQR, setHasGeneratedQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [templateImages, setTemplateImages] = useState<{ [key: string]: HTMLImageElement | null }>({});
  const ticketPreviewRef = useRef<HTMLDivElement>(null);
  const [templateLoading, setTemplateLoading] = useState<{ [id: string]: boolean }>(() => {
    const initial: { [id: string]: boolean } = {};
    ticketTemplates.forEach(t => { initial[t.id] = true; });
    return initial;
  });
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    ticketTemplates.forEach(template => {
      const img = new Image();
      img.src = template.imageUrl;
      img.onload = () => {
        setTemplateLoading(prev => ({ ...prev, [template.id]: false }));
        setTemplateImages(prev => ({ ...prev, [template.id]: img }));
      };
      img.onerror = () => {
        setTemplateLoading(prev => ({ ...prev, [template.id]: false }));
        console.error(`Failed to load template image: ${template.id}`);
      };
    });
  loadGoogleFont()
  }, []);
const loadGoogleFont=async()=>{
  const font = new FontFace(
    "GoogleFont",
    "url(/fonts/GoogleSans-Medium.ttf)"
  );

  await font.load();
  document.fonts.add(font);
}
  useEffect(() => {
    ticketTemplates.forEach(template => {
      const img = document.querySelector(`img[data-template-id='${template.id}']`) as HTMLImageElement | null;
      if (img && img.complete) {
        setTemplateLoading(prev => ({ ...prev, [template.id]: false }));
        setTemplateImages(prev => ({ ...prev, [template.id]: img }));
      }
    });
  }, []);

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
    if (selectedTemplate && !hasGeneratedQR && session && userInfo.uniqueCode) {
      generateQRCode();
    }
  }, [selectedTemplate, session, userInfo.uniqueCode, hasGeneratedQR]);

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
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
        templateImg.src = selectedTemplate.imageUrl;
      });
      const imgWidth = templateImg.naturalWidth || selectedTemplate.width;
      const imgHeight = templateImg.naturalHeight || selectedTemplate.height;
      const canvasWidth = imgWidth;
      const canvasHeight = imgHeight;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrCodeDataURL;
      });
      const layout = calculateLayout(canvasWidth, canvasHeight, LAYOUT, DOWNLOAD_QR_CENTER_Y_PERCENT);
      const qrDrawX = layout.qrX - (layout.qrSize / 2);
      const qrDrawY = layout.qrY - (layout.qrSize / 2);
      ctx.drawImage(qrImg, qrDrawX, qrDrawY, layout.qrSize, layout.qrSize);
      if (userInfo.fullName) {

        if(userInfo.fullName.length>19)
          layout.nameSize=80
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${layout.nameSize}px GoogleFont, serif`;
        ctx.fillStyle = selectedTemplate.id=="template2"?"#ffffff":"#000000";
        ctx.strokeStyle = selectedTemplate.id=="template2"? "rgba(255, 255, 255)":"rgba(0,0,0,0)";
        ctx.lineWidth = layout.nameSize * 0.05;
        ctx.strokeText(userInfo.fullName, layout.nameX, layout.nameY);
        ctx.fillText(userInfo.fullName, layout.nameX, layout.nameY);
      }
      let dataURL = canvas.toDataURL("image/png", 0.92);
      function dataURLSize(dataUrl: string) {
        let head = 'data:image/png;base64,';
        if (dataUrl.startsWith('data:image/jpeg')) head = 'data:image/jpeg;base64,';
        return Math.round((dataUrl.length - head.length) * 3 / 4);
      }
      if (dataURLSize(dataURL) > 2 * 1024 * 1024) {
        dataURL = canvas.toDataURL("image/jpeg", 0.85);
        if (dataURLSize(dataURL) > 2 * 1024 * 1024) {
          dataURL = canvas.toDataURL("image/jpeg", 0.7);
        }
      }
      const link = document.createElement("a");
      link.download = `CCD2025-ticket-${userInfo.fullName}.png`;
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
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              Your Event Ticket
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl">
              Welcome {userInfo.fullName || userInfo.username}! Select a design
              and generate your personalized CCD 2025 ticket.
            </p>
          </div>
          <div className="flex-shrink-0 justify-center hidden md:flex md:justify-end">
            <img
              src="/images/elements/2025-black.svg"
              alt="CCD 2025"
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 dark:invert"
            />
          </div>
        </div>
      </div>
      <hr className="mb-4 sm:mb-6" />
      <div className="mb-4 sm:mb-6">

        <div className="flex flex-col items-stretch justify-stretch md:flex-row gap-6 w-full h-full">
          <div className="md:w-2/5 w-full h-full self-stretch">
            <TicketTemplateCard
              ticketTemplates={ticketTemplates}
              selectedTemplate={selectedTemplate}
              templateLoading={templateLoading}
              setSelectedTemplate={setSelectedTemplate}
              setTemplateLoading={setTemplateLoading}
              setTemplateImages={setTemplateImages}
            />
            {isMobile && selectedTemplate && (
              <div className="mt-4 flex flex-col items-center gap-4">
                <TicketPreview
                  selectedTemplate={selectedTemplate}
                  userInfo={userInfo}
                  qrCodeDataURL={qrCodeDataURL}
                  isMobile={isMobile}
                  isGenerating={isGenerating}
                  ticketPreviewRef={ticketPreviewRef}
                  onDownload={downloadTicket}
                  isDownloading={isDownloading}
                />
                <Button
                  onClick={downloadTicket}
                  disabled={!qrCodeDataURL || isDownloading}
                  className="bg-foreground  text-background px-6 py-2 rounded-lg font-semibold"
                >
                  <GeminiIcon className="dark:invert"/>
                  {isDownloading ? "Downloading..." : "Download"}
                  <GeminiIcon className="dark:invert"/>
                </Button>
              </div>
            )}
          </div>
          {!isMobile && selectedTemplate && (
            <div className="md:w-3/5 w-full h-full self-stretch">
              <TicketPreview
                selectedTemplate={selectedTemplate}
                userInfo={userInfo}
                qrCodeDataURL={qrCodeDataURL}
                isMobile={isMobile}
                isGenerating={isGenerating}
                ticketPreviewRef={ticketPreviewRef}
                onDownload={downloadTicket}
                isDownloading={isDownloading}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 space-y-4 animate-fade-in inline-block lg:hidden">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/10 via-[#34a853]/10 to-[#ea4335]/10 animate-gradient-x"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#4285f4]/20 rounded-xl p-6">
            <h4 className="font-bold text-lg text-[#4285f4] dark:text-[#4285f4] mb-4 flex items-center gap-2">
              🎉 Share Your CCD Kolkata Ticket
              <div className="h-1 w-1 rounded-full bg-[#34a853]"></div>
              <div className="h-1 w-1 rounded-full bg-[#ea4335]"></div>
              <div className="h-1 w-1 rounded-full bg-[#fbbc04]"></div>
            </h4>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-200">
                Show your excitement for CCD Kolkata 2025! Share your ticket on social media and tag us:
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="bg-[#4285f4]/10 text-[#4285f4] px-3 py-1.5 rounded-full text-sm font-medium">@gdgcloudkol</span>
                <span className="bg-[#34a853]/10 text-[#34a853] px-3 py-1.5 rounded-full text-sm font-medium">#CCDKol2025</span>
                <span className="bg-google-yellow/10 text-google-yellow px-3 py-1.5 rounded-full text-sm font-medium">#GDGCloudKolkata</span>
              </div>

              <div className=" items-center justify-center  flex md:hidden mx-auto w-full">
                <SocialShareButtons />
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <span className="font-semibold">Note:</span> Your QR code is secure and tamper-proof. Feel free to show it in your social media posts!
                </p>
              </div>
            
            </div>
          </div>
        </div>
       
      </div>

      <TicketInstructions />

    </div>
  );
}
