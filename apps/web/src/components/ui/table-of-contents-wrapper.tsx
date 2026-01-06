import { useEffect, useState } from "react";
import { TableOfContents, type Heading } from "./table-of-contents";
import { extractHeadingsFromDOM } from "../../lib/toc";

export function TableOfContentsWrapper() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Function to extract headings
        const extractHeadings = () => {
            const extracted = extractHeadingsFromDOM();
            if (extracted.length > 0) {
                setHeadings(extracted);
                setIsLoaded(true);
                return true;
            }
            return false;
        };

        // Try immediately
        if (extractHeadings()) return;

        // If no headings found, wait for DOM to be ready
        // This handles the case when React hydrates before Astro content is rendered
        const timeoutId = setTimeout(() => {
            extractHeadings();
        }, 100);

        // Also try after a longer delay as fallback
        const fallbackId = setTimeout(() => {
            if (!isLoaded) {
                extractHeadings();
            }
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(fallbackId);
        };
    }, [isLoaded]);

    // Don't render until we have headings
    if (headings.length === 0) {
        return (
            <nav className="text-sm" aria-label="Table of contents">
                <h4 className="font-medium text-slate-200 mb-4 text-xs uppercase tracking-wider">
                    On this page
                </h4>
                <div className="text-slate-500 text-xs">Loading...</div>
            </nav>
        );
    }

    return <TableOfContents headings={headings} />;
}
