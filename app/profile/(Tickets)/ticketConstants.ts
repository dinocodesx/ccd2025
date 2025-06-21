// Ticket template definitions
export const ticketTemplates = [
  {
    id: "template1",
    name: "CCD Light Theme",
    imageUrl: "/images/tickets/template1.svg",
    description: "Light Theme",
    width: 370,
    height: 800,
  },
  {
    id: "template2",
    name: "CCD Dark Theme",
    imageUrl: "/images/tickets/template2.svg",
    description: "Dark Theme",
    width: 370,
    height: 800,
  },
  // {
  //   id: "template3",
  //   name: "CCD Blue Themed",
  //   imageUrl: "/images/tickets/template1.svg",
  //   description: "Blue Themed",
  //   width: 370,
  //   height: 800,
  // },
];

// Layout constants
export const LAYOUT = {
  USER_NAME_TOP_PERCENT: 29,
  QR_BOTTOM_PERCENT: 8, // For UI preview (from bottom)
  QR_SIZE_PERCENT: 45, 
  TEXT_SIZE_PERCENT: 4.5, 
};

export const DOWNLOAD_QR_CENTER_Y_PERCENT = 80;

// Social configs will be imported from a separate file due to dependencies
// (e.g. icons, functions). 