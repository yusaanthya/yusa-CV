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
        <Container className="py-16 sm:py-20">
            <div className="mb-8 flex justify-end print:hidden">
                <PrintButton />
            </div>
            <article
                className="prose prose-game max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </Container>
    );
}
