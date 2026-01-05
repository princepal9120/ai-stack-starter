import { cn } from "../../lib/utils";

type CodeViewerProps = {
    content: string;
    path: string;
};

export function CodeViewer({ content, path }: CodeViewerProps) {
    return (
        <div className="relative h-full w-full overflow-hidden bg-[#0d1117]">
            {/* Header with filename */}
            <div className="flex items-center border-b border-slate-800 bg-slate-900 px-4 py-2">
                <span className="text-xs font-medium text-slate-400">{path}</span>
            </div>

            {/* Code content */}
            <div className="h-[calc(100%-2.5rem)] overflow-auto p-4">
                <pre className="font-mono text-xs leading-relaxed text-slate-300">
                    <code>{content}</code>
                </pre>
            </div>
        </div>
    );
}
