import type { Heading } from "../components/ui/table-of-contents";

/**
 * Extract headings from HTML content
 */
export function extractHeadings(html: string): Heading[] {
    const headingRegex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
    const headings: Heading[] = [];

    let match;
    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        const id = match[2];
        const text = match[3]
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .trim();

        headings.push({ id, text, level });
    }

    return headings;
}

/**
 * Generate heading ID from text
 */
export function generateHeadingId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Extract headings from DOM (client-side)
 */
export function extractHeadingsFromDOM(): Heading[] {
    if (typeof document === 'undefined') {
        return [];
    }

    const headings: Heading[] = [];
    const elements = document.querySelectorAll('article h2, article h3, article h4');

    elements.forEach((element) => {
        const level = parseInt(element.tagName[1]);
        let id = element.id;

        // Generate ID if missing
        if (!id) {
            id = generateHeadingId(element.textContent || '');
            element.id = id;
        }

        const text = element.textContent || '';
        headings.push({ id, text, level });
    });

    return headings;
}
