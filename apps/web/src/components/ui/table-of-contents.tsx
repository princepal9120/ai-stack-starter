import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";

export type Heading = {
    id: string;
    text: string;
    level: number;
};

type TableOfContentsProps = {
    headings: Heading[];
    className?: string;
};

export function TableOfContents({ headings, className }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const observerRef = useRef<IntersectionObserver | null>(null);
    const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());

    const getActiveHeading = useCallback(() => {
        // Get all currently intersecting headings
        const intersecting: string[] = [];
        headingElementsRef.current.forEach((entry, id) => {
            if (entry.isIntersecting) {
                intersecting.push(id);
            }
        });

        if (intersecting.length === 0) {
            // No headings visible, keep the last active one
            return;
        }

        // Find the first visible heading in document order
        for (const heading of headings) {
            if (intersecting.includes(heading.id)) {
                setActiveId(heading.id);
                return;
            }
        }
    }, [headings]);

    useEffect(() => {
        // Create observer with better settings for scroll-spy
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    headingElementsRef.current.set(entry.target.id, entry);
                });
                getActiveHeading();
            },
            {
                // Trigger when heading enters top 20% of viewport
                rootMargin: "-80px 0px -70% 0px",
                threshold: 0,
            }
        );

        // Observe all headings
        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observerRef.current?.observe(element);
            }
        });

        // Set initial active heading
        if (headings.length > 0) {
            const hash = window.location.hash.slice(1);
            if (hash && headings.some((h) => h.id === hash)) {
                setActiveId(hash);
            } else {
                setActiveId(headings[0].id);
            }
        }

        return () => {
            observerRef.current?.disconnect();
            headingElementsRef.current.clear();
        };
    }, [headings, getActiveHeading]);

    if (headings.length === 0) {
        return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveId(id);
            // Update URL hash without scrolling
            window.history.replaceState(null, "", `#${id}`);
        }
    };

    return (
        <nav className={cn("text-sm", className)} aria-label="Table of contents">
            <h4 className="font-medium text-slate-200 mb-4 text-xs uppercase tracking-wider">
                On this page
            </h4>
            <ul className="space-y-1 border-l border-slate-800">
                {headings.map((heading) => {
                    const isActive = activeId === heading.id;
                    const indent = heading.level === 2 ? "pl-4" : heading.level === 3 ? "pl-6" : "pl-8";

                    return (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                onClick={(e) => handleClick(e, heading.id)}
                                className={cn(
                                    "block py-1.5 -ml-px border-l transition-colors duration-150",
                                    indent,
                                    isActive
                                        ? "text-slate-200 border-slate-200 font-medium"
                                        : "text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600"
                                )}
                            >
                                {heading.text}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
