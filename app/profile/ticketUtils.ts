// Calculate layout for ticket overlays
export const calculateLayout = (containerWidth: number, containerHeight: number, LAYOUT: any, qrCenterYPercent?: number) => {
  const qrSize = containerWidth * (LAYOUT.QR_SIZE_PERCENT / 100);
  const textSize = Math.max(
    12,
    containerWidth * (LAYOUT.TEXT_SIZE_PERCENT / 100)
  );

  return {
    nameX: containerWidth / 2, // Center X
    nameY: containerHeight * (LAYOUT.USER_NAME_TOP_PERCENT / 100), // From top
    nameSize: textSize,
    qrSize: qrSize,
    qrX: containerWidth / 2, // Center X
    qrY: qrCenterYPercent !== undefined
      ? containerHeight * (qrCenterYPercent / 100)
      : containerHeight * (1 - LAYOUT.QR_BOTTOM_PERCENT / 100), // Default to UI preview logic
  };
};

// Helper function to check if device is mobile
export const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

// Fallback share function using Web Share API
export const fallbackShare = async (toast: any) => {
  const shareData = {
    title: "Cloud Community Days Kolkata 2025",
    text: "🎟️ I'm attending CCD Kolkata 2025 on 19 July ! Join me at Taal Kutir By Taj.",
    url: "https://ccd2025.gdgcloudkol.org/apply",
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      toast.info("Native sharing not supported on your device.");
    }
  } catch (err) {
    toast.error("Sharing failed. Try using a platform button instead.");
  }
}; 