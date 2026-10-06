import fs from "fs";
import path from "path";
import { Container } from "@/features/ui/components/container";
import { markdownToHtml } from "@/lib/markdown";
import { PrintButton } from "./print-button";

export default async function CVPage() {
    const filePath = path.join(process.cwd(), "content/cv/yusa-liu.md");
    const raw = fs.readFileSync(filePath, "utf-8");
    const htmlContent = await markdownToHtml(raw);

    return (
        <Container className="py-10 sm:py-16">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex justify-end print:hidden">
                    <PrintButton />
                </div>
                {/* Framed like a document page; the frame drops away in print. */}
                <article className="cv-sheet -mx-6 border-y border-line bg-surface px-6 py-10 sm:mx-0 sm:border-x sm:px-12 sm:py-14">
                    <div
                        className="prose prose-site"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </article>
            </div>
        </Container>
    );
}
