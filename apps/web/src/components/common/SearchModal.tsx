import { useEffect, useState } from "react";
import { Search, FileText, Rocket, Hammer } from "lucide-react";

export function SearchModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        const handleOpenEvent = () => setIsOpen(true);

        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("open-search", handleOpenEvent);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("open-search", handleOpenEvent);
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center px-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search documentation..."
                        className="flex-1 h-12 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 px-3 outline-none"
                    />
                    <div className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</div>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Recent</div>
                    <div className="space-y-1">
                        <a href="/docs" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>Documentation Home</span>
                        </a>
                        <a href="/docs/quickstart" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <Rocket className="w-4 h-4 text-slate-500" />
                            <span>Quick Start Guide</span>
                        </a>
                        <a href="/builder" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <Hammer className="w-4 h-4 text-slate-500" />
                            <span>Stack Builder</span>
                        </a>
                    </div>
                </div>

                <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-center text-slate-500">
                    Search provided by AI Stack
                </div>
            </div>
        </div>
    );
}
