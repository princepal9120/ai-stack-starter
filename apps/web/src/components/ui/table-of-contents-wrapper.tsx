"use client";

import { useEffect, useState } from "react";
import { TableOfContents, type Heading } from "./table-of-contents";
import { extractHeadingsFromDOM } from "../../lib/toc";

export function TableOfContentsWrapper() {
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        // Extract headings from the DOM after component mounts
        const extracted = extractHeadingsFromDOM();
        setHeadings(extracted);
    }, []);

    return <TableOfContents headings={headings} />;
}
