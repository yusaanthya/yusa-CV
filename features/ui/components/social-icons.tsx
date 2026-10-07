import { cn } from "@/lib/utils";
import { SOCIAL_LINKS } from "../social-links";

interface SocialIconsProps {
    className?: string;
}

export function SocialIcons({ className }: SocialIconsProps) {
    return (
        <ul className={cn("flex items-center gap-1", className)}>
            {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                    {/* 44px target around a 24px glyph; -ml on the first keeps the glyph aligned with the text above. */}
                    <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.label} (opens in a new tab)`}
                        title={link.label}
                        className="grid h-11 w-11 place-items-center rounded text-mute transition-colors duration-150 hover:text-accent first:-ml-2.5"
                    >
                        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                            <path d={link.path} />
                        </svg>
                    </a>
                </li>
            ))}
        </ul>
    );
}
