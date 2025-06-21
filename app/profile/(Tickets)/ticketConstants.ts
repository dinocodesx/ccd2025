// Ticket template definitions
export const ticketTemplates = [
  {
    id: "template1",
    name: "CCD Light Theme",
    imageUrl: "/images/tickets/template1.png",
    previewUrl:"/images/tickets/ticket-light-large.png",
    description: "Light Theme",
    width: 370,
    height: 800,
  },
  {
    id: "template2",
    name: "CCD Dark Theme",
    imageUrl: "/images/tickets/template2.svg",
    previewUrl:"/images/tickets/ticket-dark-large.png",
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
