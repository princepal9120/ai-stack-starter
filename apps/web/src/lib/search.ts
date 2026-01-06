import Fuse from "fuse.js";

export type SearchItem = {
    id: string;
    title: string;
    description: string;
    content: string;
    section: "docs" | "guides" | "cli" | "api";
    url: string;
    headings: string[];
};

export type SearchResult = Fuse.FuseResult<SearchItem>;

// Fuse.js configuration for documentation search
// Weighted fields: title > description > headings > content
export const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
    keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "headings", weight: 0.2 },
        { name: "content", weight: 0.1 },
    ],
    // Fuzzy matching settings
    threshold: 0.3, // Lower = more strict (0.0 = exact match)
    distance: 100, // How far to search for a match
    minMatchCharLength: 2, // Minimum 2 characters to match
    includeScore: true,
    includeMatches: true,
    // Performance
    ignoreLocation: true, // Don't penalize matches later in text
    useExtendedSearch: true, // Enable advanced query syntax
};

// Create and memoize Fuse instance
let fuseInstance: Fuse<SearchItem> | null = null;

export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
    fuseInstance = new Fuse(items, fuseOptions);
    return fuseInstance;
}

export function getSearchIndex(): Fuse<SearchItem> | null {
    return fuseInstance;
}

export function search(query: string, limit = 10): SearchResult[] {
    if (!fuseInstance || !query.trim()) {
        return [];
    }
    return fuseInstance.search(query, { limit });
}

// Get section display name
export function getSectionName(section: SearchItem["section"]): string {
    const names: Record<SearchItem["section"], string> = {
        docs: "Documentation",
        guides: "Guides",
        cli: "CLI Reference",
        api: "API",
    };
    return names[section] || section;
}

// Get section icon name for display
export function getSectionIcon(section: SearchItem["section"]): string {
    const icons: Record<SearchItem["section"], string> = {
        docs: "FileText",
        guides: "BookOpen",
        cli: "Terminal",
        api: "Code",
    };
    return icons[section] || "FileText";
}
