"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -80% 0px",
                threshold: 1.0,
            }
        );

        // Observe all headings
        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            headings.forEach(({ id }) => {
                const element = document.getElementById(id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80; // Offset for sticky header
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveId(id);
        }
    };

    return (
        <nav className={cn("space-y-1", className)}>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">On this page</h4>
            <ul className="space-y-2 text-sm">
                {headings.map((heading) => {
                    const isActive = activeId === heading.id;
                    const isH3 = heading.level === 3;
                    const isH4 = heading.level === 4;

                    return (
                        <li
                            key={heading.id}
                            className={cn(
                                isH3 && "pl-3",
                                isH4 && "pl-6"
                            )}
                        >
                            <a
                                href={`#${heading.id}`}
                                onClick={(e) => handleClick(e, heading.id)}
                                className={cn(
                                    "block py-1 text-slate-400 hover:text-white transition-colors border-l-2 -ml-px pl-3",
                                    isActive
                                        ? "text-purple-400 border-purple-500 font-medium"
                                        : "border-transparent hover:border-slate-600"
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
