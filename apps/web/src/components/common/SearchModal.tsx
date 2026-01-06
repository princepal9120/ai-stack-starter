import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Search,
    FileText,
    BookOpen,
    Terminal,
    Code,
    ArrowRight,
    Command,
    CornerDownLeft,
} from "lucide-react";
import Fuse from "fuse.js";
import { searchData } from "../../lib/search-data";
import type { SearchItem, SearchResult } from "../../lib/search";
import { fuseOptions, getSectionName } from "../../lib/search";

// Icons for each section
const sectionIcons: Record<SearchItem["section"], React.ReactNode> = {
    docs: <FileText className="w-4 h-4" />,
    guides: <BookOpen className="w-4 h-4" />,
    cli: <Terminal className="w-4 h-4" />,
    api: <Code className="w-4 h-4" />,
};

// Recent searches key for localStorage
const RECENT_SEARCHES_KEY = "ai-stack-recent-searches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveRecentSearch(query: string): void {
    if (typeof window === "undefined" || !query.trim()) return;
    try {
        const recent = getRecentSearches().filter((s) => s !== query);
        recent.unshift(query);
        localStorage.setItem(
            RECENT_SEARCHES_KEY,
            JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES))
        );
    } catch {
        // Silently fail
    }
}

// Highlight matched text
function highlightMatch(text: string, indices: readonly [number, number][] | undefined): React.ReactNode {
    if (!indices || indices.length === 0) {
        return text;
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const [start, end] of indices) {
        if (start > lastIndex) {
            result.push(text.slice(lastIndex, start));
        }
        result.push(
            <mark key={start} className="bg-purple-500/30 text-purple-300 rounded px-0.5">
                {text.slice(start, end + 1)}
            </mark>
        );
        lastIndex = end + 1;
    }

    if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
    }

    return result;
}

export function SearchModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Initialize Fuse.js
    const fuse = useMemo(() => new Fuse(searchData, fuseOptions), []);

    // Search results
    const results = useMemo(() => {
        if (!query.trim()) return [];
        return fuse.search(query, { limit: 10 });
    }, [fuse, query]);

    // Group results by section
    const groupedResults = useMemo(() => {
        const groups: Record<string, SearchResult[]> = {};
        for (const result of results) {
            const section = result.item.section;
            if (!groups[section]) {
                groups[section] = [];
            }
            groups[section].push(result);
        }
        return groups;
    }, [results]);

    // Flat list for keyboard navigation
    const flatResults = useMemo(() => results.map((r) => r.item), [results]);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            // Open with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            // Close with Escape
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        }

        function handleOpenEvent() {
            setIsOpen(true);
        }

        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("open-search", handleOpenEvent);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("open-search", handleOpenEvent);
        };
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeydown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" && flatResults[selectedIndex]) {
                e.preventDefault();
                navigateToResult(flatResults[selectedIndex]);
            }
        },
        [flatResults, selectedIndex]
    );

    // Scroll selected item into view
    useEffect(() => {
        const container = resultsRef.current;
        const selected = container?.querySelector(`[data-index="${selectedIndex}"]`);
        if (selected) {
            selected.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    // Navigate to result
    function navigateToResult(item: SearchItem) {
        saveRecentSearch(query);
        setIsOpen(false);
        window.location.href = item.url;
    }

    // Handle recent search click
    function handleRecentClick(searchQuery: string) {
        setQuery(searchQuery);
        inputRef.current?.focus();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {/* Search input */}
                <div className="flex items-center px-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeydown}
                        placeholder="Search documentation..."
                        className="flex-1 h-14 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 px-3 outline-none text-lg"
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                    {query.trim() === "" ? (
                        // Show recent searches when no query
                        <div className="p-4">
                            {recentSearches.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                        Recent Searches
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((search, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleRecentClick(search)}
                                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-left"
                                            >
                                                <Search className="w-4 h-4" />
                                                <span>{search}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                Quick Links
                            </div>
                            <div className="space-y-1">
                                {searchData.slice(0, 5).map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <span className="text-slate-500">{sectionIcons[item.section]}</span>
                                        <span>{item.title}</span>
                                        <ArrowRight className="w-4 h-4 ml-auto text-slate-600" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        // No results
                        <div className="p-8 text-center">
                            <div className="text-slate-500 mb-2">No results found for</div>
                            <div className="text-slate-300 font-mono">"{query}"</div>
                            <div className="text-slate-600 text-sm mt-4">
                                Try different keywords or check spelling
                            </div>
                        </div>
                    ) : (
                        // Search results grouped by section
                        <div className="p-2">
                            {Object.entries(groupedResults).map(([section, sectionResults]) => (
                                <div key={section} className="mb-4">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        {sectionIcons[section as SearchItem["section"]]}
                                        {getSectionName(section as SearchItem["section"])}
                                    </div>
                                    <div className="space-y-1">
                                        {sectionResults.map((result, resultIndex) => {
                                            const globalIndex = flatResults.findIndex(
                                                (r) => r.id === result.item.id
                                            );
                                            const isSelected = globalIndex === selectedIndex;

                                            // Find title match for highlighting
                                            const titleMatch = result.matches?.find((m) => m.key === "title");

                                            return (
                                                <a
                                                    key={result.item.id}
                                                    href={result.item.url}
                                                    data-index={globalIndex}
                                                    onClick={() => {
                                                        saveRecentSearch(query);
                                                        setIsOpen(false);
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${isSelected
                                                            ? "bg-purple-500/20 border border-purple-500/30"
                                                            : "hover:bg-slate-800 border border-transparent"
                                                        }`}
                                                >
                                                    <div className="shrink-0 mt-0.5 text-slate-500">
                                                        {sectionIcons[result.item.section]}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-white truncate">
                                                            {titleMatch
                                                                ? highlightMatch(result.item.title, titleMatch.indices)
                                                                : result.item.title}
                                                        </div>
                                                        <div className="text-sm text-slate-400 truncate mt-0.5">
                                                            {result.item.description}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="shrink-0 text-purple-400">
                                                            <CornerDownLeft className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↑↓</kbd>
                            <span>Navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↵</kbd>
                            <span>Select</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">esc</kbd>
                            <span>Close</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>K to search</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
