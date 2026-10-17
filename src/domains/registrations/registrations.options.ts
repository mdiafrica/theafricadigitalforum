/** Shared by the /register form and server-side validation. */

export const EVENT_DATES = "June 2–4, 2026"
export const EVENT_LOCATION = "Lomé, Togo"
export const EVENT_HOST = "Media and Digital Institute (MDI)"
export const EVENT_AUDIENCE =
  "Government leaders, C-level executives, tech founders, investors, researchers, and civil society"

export const PASS_TIERS = [
  {
    id: "general",
    name: "General Pass",
    price: 200,
    audience:
      "Designed for tech professionals, startup team members, researchers, and general attendees seeking to learn, network, and explore Africa's evolving digital ecosystem. Includes complete access to all main stage keynotes, panel discussions, and the Innovation Expo floor.",
  },
  {
    id: "executive",
    name: "Executive Pass",
    price: 450,
    audience:
      "Designed for senior management, investors, startup founders, and policy advocates. Unlocks exclusive access to the Executive Lounge, priority seating, structured B2B networking sessions, and specialized thematic workshops.",
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 650,
    audience:
      "Designed for C-level executives, government ministers, international delegates, and key sponsors. Delivers the ultimate forum experience with front-row priority seating, private VIP lounge privileges, direct access to high-level policy roundtables, and invitations to exclusive VIP dinners and galas.",
  },
] as const

export type PassTierId = (typeof PASS_TIERS)[number]["id"]

export const PASS_TIER_IDS = PASS_TIERS.map((tier) => tier.id) as [
  PassTierId,
  ...PassTierId[],
]

/** Rows of the tier comparison table: [feature, general, executive, vip]. */
export const PASS_COMPARISON: ReadonlyArray<
  readonly [string, string, string, string]
> = [
  [
    "Plenary & Keynote Access",
    "Full Access",
    "Full Access",
    "Priority Front-Row Access",
  ],
  [
    "Innovation Expo Access",
    "Limited Access",
    "Full Access",
    "Full Access + Fast Track",
  ],
  [
    "Networking App & Directory",
    "Standard Profile",
    "Enhanced Matchmaking",
    "Matchmaking & Direct Messaging",
  ],
  [
    "Lunch & Coffee Breaks",
    "Included (3 Days)",
    "Dedicated Executive Catering",
    "VIP Executive Catering Lounge",
  ],
  [
    "B2B Matchmaking & Workshops",
    "General Entry",
    "Priority Workshop Registration",
    "Dedicated Concierge Matchmaking",
  ],
  [
    "Networking Receptions",
    "Opening Reception",
    "Opening & Executive Networking",
    "Private VIP Opening Gala & Ministerial Dinners",
  ],
  [
    "Lounge Access",
    "General Hub",
    "Executive Networking Lounge",
    "VIP & Speaker Ministerial Lounge",
  ],
  [
    "Post-Event Materials",
    "Session Recordings",
    "Recordings + Executive Summaries",
    "Full Access Suite + Strategic Briefs",
  ],
]

export const INTEREST_AREAS = [
  "Artificial Intelligence & Ethics",
  "Digital Governance & Public Policy",
  "Startup Ecosystems & Venture Capital",
  "Media, Content Creation & Information Integrity",
  "Fintech & Digital Economy",
  "Infrastructure & Connectivity",
  "Youth Empowerment & Digital Skills",
] as const

export const PARTICIPATION_TYPES = [
  "Attendee",
  "Potential Speaker / Thought Leader",
  "Sponsor / Partner",
  "Exhibitor (Innovation Expo)",
  "Media / Press",
  "Startup Founder (Pitch Competition)",
] as const

export const PRIMARY_GOALS = [
  "Networking with C-level executives and policymakers",
  "Securing investment for my startup",
  "Showcasing new technology or products",
  "Influencing regional digital policy",
  "Learning about emerging trends in AI and digital transformation",
] as const

export const PARTNERSHIP_OPTIONS = [
  "Yes, send me the Sponsorship Deck",
  "I am interested in becoming a Knowledge/Media Partner",
  "Not at this time",
] as const

/** Free-text answers are stored as `Other: <text>` in the same text column. */
export const OTHER_PREFIX = "Other: "

export const INTERNATIONAL = "International"

export const TITLES = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss",
  "Dr.",
  "Prof.",
  "Eng.",
  "Hon.",
  "H.E.",
  "Amb.",
  "Rev.",
  "Pastor",
  "Bishop",
  "Imam",
  "Sheikh",
  "Chief",
] as const

export const COUNTRIES = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo (Republic of the)",
  "Côte d'Ivoire",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "São Tomé and Príncipe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
  INTERNATIONAL,
] as const
