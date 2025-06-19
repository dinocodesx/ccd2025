import React from "react";
import { cn } from "@/lib/utils";

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

const TicketTemplateCard: React.FC<Props> = ({
  ticketTemplates,
  selectedTemplate,
  templateLoading,
  setSelectedTemplate,
  setTemplateLoading,
  setTemplateImages,
}) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto sm:max-w-lg">
    {ticketTemplates.map((template) => (
      <div
        key={template.id}
        className={cn(
          "group transition-all duration-300 ease-in-out transform",
          !templateLoading[template.id] && "cursor-pointer hover:scale-105",
          selectedTemplate?.id === template.id && "scale-105",
          templateLoading[template.id] && "opacity-60 cursor-not-allowed"
        )}
        onClick={() => {
          if (!templateLoading[template.id]) {
            setSelectedTemplate(template);
          }
        }}
      >
        <div
          className={`relative rounded-lg p-0.5 transition-all duration-300 ${
            selectedTemplate?.id === template.id
              ? "bg-gradient-to-r from-[#ea4336] via-[#4285f4] to-[#34a853]"
              : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
          }`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-md p-1.5 h-full">
            <div className="relative rounded-sm overflow-hidden mb-1.5 bg-gray-50 dark:bg-gray-800">
              {templateLoading[template.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#076eff]"></div>
                </div>
              )}
              <img
                src={template.imageUrl}
                alt={template.name}
                className={cn(
                  "w-full h-full object-contain transition-transform duration-300",
                  templateLoading[template.id] && "opacity-0"
                )}
                data-template-id={template.id}
                onLoad={() => {
                  setTemplateLoading(prev => ({ ...prev, [template.id]: false }));
                  const img = document.querySelector(`img[data-template-id='${template.id}']`) as HTMLImageElement;
                  if (img) {
                    setTemplateImages(prev => ({ ...prev, [template.id]: img }));
                  }
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder-ticket.svg";
                  setTemplateLoading(prev => ({ ...prev, [template.id]: false }));
                }}
              />
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-0.5 right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 ">
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
      </div>
    ))}
  </div>
);

export default TicketTemplateCard; 