// Ticket template definitions
export const ticketTemplates = [
  {
    id: "template1",
    name: "CCD Light Theme",
    imageUrl: "/images/tickets/download-attendee-light.png",
    imageUrl2: "/images/tickets/download-volunteer-light.png",
    previewUrl:"/images/tickets/ticket-attendee-light.png",
    previewUrl2:"/images/tickets/ticket-volunteer-light.png",
    description: "Light Theme",
    width: 370,
    height: 800,
  },
  {
    id: "template2",
    name: "CCD Dark Theme",
    imageUrl: "/images/tickets/download-attendee-dark.png",
    imageUrl2:"/images/tickets/download-volunteer-dark.png",
    previewUrl:"/images/tickets/ticket-attendee-dark.png",
    previewUrl2:"/images/tickets/ticket-volunteer-dark.png",
    description: "Dark Theme",
    width: 370,
    height: 800,
  },

];



// Layout constants
export const LAYOUT = {
  USER_NAME_TOP_PERCENT: 28.6,
  QR_BOTTOM_PERCENT: 8, // For UI preview (from bottom)
  QR_SIZE_PERCENT: 40, 
  TEXT_SIZE_PERCENT: 5, 
};

export const DOWNLOAD_QR_CENTER_Y_PERCENT = 80;
