import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpeakerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker: {
    name?: string; // for guest
    fullName?: string; // for speaker
    designation?: string; // for guest
    tagLine?: string; // for speaker
    bio: string;
    image?: string; // for guest
    profilePicture?: string; // for speaker
    links?: { title: string; url: string; linkType: string }[];
    linkedin?: string; // for guest
  } | null;
}

const SpeakerDialog: React.FC<SpeakerDialogProps> = ({ open, onOpenChange, speaker }) => {
  if (!speaker) return null;
  const displayName = speaker.fullName || speaker.name || "";
  const displayTag = speaker.tagLine || speaker.designation || "";
  const displayImage = speaker.profilePicture || speaker.image || "";
  const links = speaker.links || (speaker.linkedin ? [{ title: "LinkedIn", url: speaker.linkedin, linkType: "LinkedIn" }] : []);

  const socialIcon = (type: string) => {
    if (type === "LinkedIn") return "/images/socials/linkedin.svg";
    if (type === "Twitter" || type === "X") return "/images/socials/x.svg";
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl z-999 max-h-[700px] md:h-auto overflow-auto">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div
              className="size-32 rounded-lg bg-gray-200 bg-center bg-cover border-2 border-black/80 mb-4"
              style={{ backgroundImage: `url(${displayImage})`, backgroundSize: "cover" }}
            />
            <DialogTitle className="text-xl font-bold text-center">
              {displayName}
            </DialogTitle>
            <p className="text-base mb-2 text-center">{displayTag}</p>
            <div className="flex flex-row items-center gap-2 mt-1 mb-2 justify-center">
              {links.map((link) =>
                link.linkType === "LinkedIn" || link.linkType === "Twitter" || link.linkType === "X" ? (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center border-2 border-black/80 rounded-full p-1"
                  >
                    <Image
                      src={socialIcon(link.linkType) || ""}
                      alt={link.linkType}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="my-2">
          <div className="text-center whitespace-pre-line scroll-auto mb-2">
            {speaker.bio}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpeakerDialog; 