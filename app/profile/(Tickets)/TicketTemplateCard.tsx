import React from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import SocialShareButtons from "./SocialShareButtons";

interface TicketTemplate {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  width: number;
  height: number;
}

type Props = {
  ticketTemplates: TicketTemplate[];
  selectedTemplate: TicketTemplate | null;
  templateLoading: { [id: string]: boolean };
  setSelectedTemplate: (t: TicketTemplate) => void;
  setTemplateLoading: (fn: (prev: { [id: string]: boolean }) => { [id: string]: boolean }) => void;
  setTemplateImages: (fn: (prev: { [key: string]: HTMLImageElement | null }) => { [key: string]: HTMLImageElement | null }) => void;
};

const themeSwitch = {
  template1: (
    <span className="inline-block w-6 h-6 rounded-full border border-gray-300 bg-gradient-to-br from-white to-gray-200" title="Light" />
  ),
  template2: (
    <span className="inline-block w-6 h-6 rounded-full border border-gray-700 bg-gradient-to-br from-[#151515] to-[#111]" title="Dark" />
  ),
};

const TicketTemplateCard: React.FC<Props> = ({
  ticketTemplates,
  selectedTemplate,
  templateLoading,
  setSelectedTemplate,

}) => (
  <div className="flex flex-row md:flex-col gap-3 w-full max-w-lg mx-auto">
    {ticketTemplates.map((template) => (
      <Button
        key={template.id}
        type="button"
        className={cn(
          "flex-1 flex items-center justify-center border rounded-xl p-4 transition-all duration-200 focus:outline-none",
          selectedTemplate?.id === template.id
            ? "border-[#4285f4] ring-2 ring-[#4285f4] bg-blue-50 dark:bg-gray-900"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#4285f4] hover:bg-blue-50/40 dark:hover:bg-gray-800/60",
          templateLoading[template.id] && "opacity-60 cursor-not-allowed"
        )}
        onClick={() => {
          if (!templateLoading[template.id]) {
            setSelectedTemplate(template);
          }
        }}
        disabled={templateLoading[template.id]}
        aria-pressed={selectedTemplate?.id === template.id}
      >
        <div className="mt-1">{themeSwitch[template.id as keyof typeof themeSwitch]}</div>
        <span className={cn(
          "font-semibold text-xs lg:text-base ml-2",
          selectedTemplate?.id === template.id ? "text-google-blue" : "text-gray-800 dark:text-gray-200"
        )}>
          {template.description}
        </span>

      </Button>
    ))}
     <hr className="my-4"/>
    <div className="hidden md:flex flex-col items-center justify-center  gap-y-4">
   <span>Share your ticket</span>
      <div className="w-full items-center justify-center">
        <SocialShareButtons />
      </div>
    </div>
  </div>
);

export default TicketTemplateCard; 