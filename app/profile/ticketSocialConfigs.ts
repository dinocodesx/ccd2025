import { Twitter, Linkedin, Facebook, Instagram, Share2 } from "lucide-react";
import { isMobileDevice, fallbackShare } from "./ticketUtils";

// WhatsAppIcon is a string identifier for SocialShareButtons to render
export const SOCIAL_CONFIGS = [
  {
    platform: "X (Twitter)",
    icon: Twitter,
    bgColor: "hover:bg-black",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const text = `🎟️ Excited to be part of Cloud Community Days Kolkata 2025!\n\nJoin me on March 30, 2025 at Biswa Bangla Convention Centre for the largest cloud conference in Eastern India.\n\n@gdgcloudkol\n#CCDKol2025`;
      const url = "https://ccd.gdgcloud.kolkata.dev?utm_source=twitter&utm_medium=social&utm_campaign=ccd2025";
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    bgColor: "hover:bg-[#0077b5]",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const url = "https://ccd.gdgcloud.kolkata.dev?utm_source=linkedin&utm_medium=social&utm_campaign=ccd2025";
      const title = "Cloud Community Days Kolkata 2025 - March 30, 2025";
      const summary = "🎟️ Thrilled to announce that I'll be attending Cloud Community Days Kolkata 2025! Join me at Biswa Bangla Convention Centre for a day of cloud computing, networking, and learning from industry experts. Don't miss Eastern India's largest cloud conference! #CCDKol2025 #GDGCloudKolkata";
      return `https://www.linkedin.com/sharing/share-offsite/?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    }
  },
  {
    platform: "Facebook",
    icon: Facebook,
    bgColor: "hover:bg-[#1877f2]",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const url = "https://ccd.gdgcloud.kolkata.dev?utm_source=facebook&utm_medium=social&utm_campaign=ccd2025";
      const quote = "🎟️ Just secured my spot at Cloud Community Days Kolkata 2025! Join me on March 30, 2025 at Biswa Bangla Convention Centre for Eastern India's largest cloud conference. A full day of tech talks, workshops, and amazing networking opportunities awaits! 🚀";
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
    }
  },
  {
    platform: "WhatsApp",
    icon: "WhatsAppIcon",
    bgColor: "hover:bg-[#25D366]",
    iconColor: "group-hover:text-white",
    getShareUrl: () => {
      const text = `🎟️ Hey! I'm going to Cloud Community Days Kolkata 2025!\n\n📅 March 30, 2025\n📍 Biswa Bangla Convention Centre\n\nJoin me at Eastern India's largest cloud conference for a day of learning and networking!\n\nRegister now: https://ccd.gdgcloud.kolkata.dev?utm_source=whatsapp&utm_medium=social&utm_campaign=ccd2025\n\n#CCDKol2025`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
  },
  {
    platform: "Instagram",
    icon: Instagram,
    bgColor: "hover:bg-[#e4405f]",
    iconColor: "group-hover:text-white",
    onClick: (toast: any) => {
      if (isMobileDevice()) {
        try {
          window.open("instagram://camera", "_blank");
        } catch (err) {
          toast.error("Couldn't open Instagram app. Try downloading and sharing your ticket manually.", {
            duration: 5000,
          });
        }
      } else {
        toast.info(
          "Download your ticket and share it as a post on Instagram! Tag @gdgcloudkol and use #CCDKol2025. Join us on March 30, 2025 at Biswa Bangla Convention Centre!", 
          { duration: 6000 }
        );
      }
    }
  },
  {
    platform: "More",
    icon: Share2,
    bgColor: "hover:bg-gray-200 dark:hover:bg-gray-700",
    iconColor: "group-hover:text-black dark:group-hover:text-white",
    onClick: (toast: any) => fallbackShare(toast)
  }
]; 