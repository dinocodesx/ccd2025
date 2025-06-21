import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Share2,
  Clipboard,
} from "lucide-react";
import { isMobileDevice, fallbackShare } from "./ticketUtils";

// WhatsAppIcon is a string identifier for SocialShareButtons to render
export const SOCIAL_CONFIGS = [
  {
    platform: "X (Twitter)",
    icon: Twitter,
    bgColor: "hover:bg-black",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const text = `🎟️ Excited to be part of Cloud Community Days Kolkata 2025!\n\nJoin me on 19th July 2025 at Taj Taal Kutir, Newtown for the largest cloud conference in Eastern India.\n\n@gdgcloudkol\n#CCDKol2025\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply`;
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}`;
    },
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    bgColor: "hover:bg-[#0077b5]",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const url = "https://ccd2025.gdgcloudkol.org/apply";
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`;
    },
    onClick: (toast: any) => {
      const url = "https://ccd2025.gdgcloudkol.org/apply";
      const caption =
        "🎟️ Excited to be part of Cloud Community Days Kolkata 2025! Join me on 19th July 2025 at Taj Taal Kutir, Newtown for the largest cloud conference in Eastern India. @gdgcloudkol #CCDKol2025\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply";
      try {
        const win = window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer"
        );
        if (!win) throw new Error("Popup blocked");
      } catch (err) {
        navigator.clipboard.writeText(caption).then(() => {
          toast.success(
            "Couldn't open LinkedIn. Caption copied to clipboard! Paste it in your post.",
            { duration: 4000 }
          );
        });
      }
    },
  },
  {
    platform: "Facebook",
    icon: Facebook,
    bgColor: "hover:bg-[#1877f2]",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const url = "https://ccd2025.gdgcloudkol.org/apply";
      const quote =
        "🎟️ Just secured my spot at Cloud Community Days Kolkata 2025! Join me on 19th July 2025 at Taj Taal Kutir, Newtown for Eastern India's largest cloud conference.";
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&quote=${encodeURIComponent(quote)}`;
    },
    onClick: (toast: any) => {
      const url = "https://ccd2025.gdgcloudkol.org/apply";
      const caption =
        "🎟️ Just secured my spot at Cloud Community Days Kolkata 2025! Join me on 19th July 2025 at Taj Taal Kutir, Newtown for Eastern India's largest cloud conference. @gdgcloudkol #CCDKol2025\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply";
      try {
        const win = window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(
            caption
          )}`,
          "_blank",
          "noopener,noreferrer"
        );
        if (!win) throw new Error("Popup blocked");
      } catch (err) {
        navigator.clipboard.writeText(caption).then(() => {
          toast.success(
            "Couldn't open Facebook. Caption copied to clipboard! Paste it in your post.",
            { duration: 4000 }
          );
        });
      }
    },
  },
  // {
  //   platform: "WhatsApp",
  //   icon: "WhatsAppIcon",
  //   bgColor: "hover:bg-[#25D366]",
  //   iconColor: "group-hover:text-white",
  //   getShareUrl: () => {
  //     const text = `🎟️ Hey! I'm going to Cloud Community Days Kolkata 2025!\n\n📅 19th July 2025\n📍 Taj Taal Kutir, Newtown\n\nJoin me at Eastern India's largest cloud conference for a day of learning and networking!\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply\n\n#CCDKol2025`;
  //     return `https://wa.me/?text=${encodeURIComponent(text)}`;
  //   },
  // },
  {
    platform: "Instagram",
    icon: Instagram,
    bgColor: "hover:bg-[#e4405f]",
    iconColor: "group-hover:text-white",
    onClick: (toast: any) => {
      const text =
        "🎟️ Attending Cloud Community Days Kolkata 2025 on 19th July at Taj Taal Kutir, Newtown! Eastern India's largest cloud conference. #CCDKol2025 @gdgcloudkol\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply";

      try {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            if (isMobileDevice()) {
              toast.success("Caption copied! Open Instagram to share.", {
                duration: 3000,
              });
              setTimeout(() => {
                try {
                  window.open("instagram://camera", "_blank");
                } catch (err) {
                  window.open("https://www.instagram.com/", "_blank");
                }
              }, 1000);
            } else {
              toast.success(
                "Caption copied to clipboard! You can paste it in Instagram.",
                { duration: 4000 }
              );
              setTimeout(() => {
                window.open("https://www.instagram.com/", "_blank");
              }, 1000);
            }
          })
          .catch((err) => {
            console.error("Clipboard error:", err);
            toast.info(
              "Copy this text for your Instagram post:\n\n🎟️ Attending Cloud Community Days Kolkata 2025 on 19th July at Taj Taal Kutir, Newtown! Eastern India's largest cloud conference. #CCDKol2025 @gdgcloudkol\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply",
              { duration: 8000 }
            );
          });
      } catch (err) {
        toast.info(
          "Copy this text for your Instagram post:\n\n🎟️ Attending Cloud Community Days Kolkata 2025 on 19th July at Taj Taal Kutir, Newtown! Eastern India's largest cloud conference. #CCDKol2025 @gdgcloudkol\n\nApply For Tickets: https://ccd2025.gdgcloudkol.org/apply",
          { duration: 8000 }
        );
      }
    },
  },

];
