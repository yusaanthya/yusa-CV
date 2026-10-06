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
        image: "/images/projects/zone-wallet.webp",
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
        image: "/images/projects/viverse-closet.webp",
        imagePosition: "center",
    },
];
