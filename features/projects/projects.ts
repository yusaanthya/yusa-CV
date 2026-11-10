import { assetPath } from "@/lib/utils";

export interface Project {
    slug: string;
    org: string;
    title: string;
    summary: string;
    tags: string[];
    url: string;
    linkLabel: string;
    image: string;
    // Keeps the product's key subject in view when the panel crops the image.
    imagePosition: string;
}

// Copy is derived from the canonical CV and bullet bank in career-prep; keep claims in sync with it.
export const PROJECTS: Project[] = [
    {
        slug: "zone-wallet",
        org: "ZONE WALLET",
        title: "Backend engineering & delivery",
        summary:
            "Backend engineering for a crypto exchange and wallet. I led a security-remediation workstream across a 7-person team, setting priorities, assigning work, and defining acceptance criteria. I also built a reusable Go/Pub/Sub reminder pipeline supporting 2 production campaigns.",
        tags: ["Go", "GCP Pub/Sub", "PostgreSQL", "Backend Security"],
        url: "https://www.zonewallet.io/",
        linkLabel: "zonewallet.io",
        image: assetPath("/images/projects/zone-wallet.webp"),
        imagePosition: "100% center",
    },
    {
        slug: "viverse-closet",
        org: "HTC VIVERSE",
        title: "Outfit Closet 2.0",
        summary:
            "An avatar wardrobe for HTC VIVERSE, showcased at MWC 2024. I designed the backend domain model for this new feature and synchronized avatar state with an external vendor’s backend. Our team delivered Closet 2.0 in 8 months against an original 2-year plan.",
        tags: ["Go / Gin", "MySQL", "AWS SQS", "OpenAPI"],
        url: "https://avatar.viverse.com/zh-TW/avatar",
        linkLabel: "avatar.viverse.com",
        image: assetPath("/images/projects/viverse-closet.webp"),
        imagePosition: "center",
    },
];

export interface OtherWork {
    slug: string;
    year: string;
    kind: string;
    title: string;
    summary: string;
    // Optional reference; rows without one render as plain text.
    url?: string;
}

// Earlier and non-production work, newest first. Claims follow the career-prep bullet bank
// and earlier CVs: NiCE2's repository is private, so it is not linked. The Diablo II link
// is the owner-supplied Blizzard article on the Taiwan / HK / Macau launch film.
export const OTHER_WORK: OtherWork[] = [
    {
        slug: "nice2-pwa",
        year: "2026",
        kind: "Side project",
        title: "NiCE2 event navigation PWA",
        summary:
            "Turned a community-built map for a 3,000-stall event into an installable, offline-capable PWA on Cloudflare Pages, with hardened JSON import and managed cache expiry and retirement. Served 51.67k HTTP requests over 4 public days.",
    },
    {
        slug: "diablo-ii-resurrected",
        year: "2021",
        kind: "Launch campaign",
        title: "Diablo II: Resurrected launch event",
        url: "https://news.blizzard.com/zh-tw/article/23724528/6tan",
        summary:
            "Worked on social media marketing and event planning for the Taiwan, Hong Kong and Macau launch; the campaign drove 400,000+ launch-day engagements, before I moved into software engineering.",
    },
    {
        slug: "egx-rezzed",
        year: "2019",
        kind: "Exhibition",
        title: "EGX Rezzed, London",
        summary:
            "Exhibited an indie game prototype with an international team from Portugal, Australia and the UK during my MA in Computer Game Design at Goldsmiths.",
    },
];
