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
        title: "Exchange server backend",
        summary:
            "Go services behind a crypto exchange and wallet. I implemented corporate redemption review and refund flows inside a transactional outbox, built a rate-limited Pub/Sub reminder pipeline reused by two campaigns, and designed the fraud-return capability the team adopted as its baseline.",
        tags: ["Go", "GCP Pub/Sub", "PostgreSQL", "Transactional outbox"],
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
            "The avatar closet for HTC's VIVERSE platform, showcased at MWC 2024. I redefined the avatar, asset, and ownership boundaries so editor state, reusable assets, and inventory could evolve separately, and designed the accessory and animation APIs that let 7 internal contributors and 2 vendor developers build in parallel. The release shipped in 8 months against an original 2-year plan.",
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
            "Turned a community-built map for a 3,000-stall event into an installable, offline-first PWA on Cloudflare Pages, with hardened JSON import and a planned retirement after the event. Served 51.67k HTTP requests over four public days.",
    },
    {
        slug: "diablo-ii-resurrected",
        year: "2021",
        kind: "Launch campaign",
        title: "Diablo II: Resurrected launch event",
        url: "https://news.blizzard.com/zh-tw/article/23724528/6tan",
        summary: "A launch campaign that drove 400,000+ launch-day engagements, before I moved into software engineering.",
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
