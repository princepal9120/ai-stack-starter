import { useState, useEffect, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { FileExplorer } from "./file-explorer";
import { CodeViewer } from "./code-viewer";
import type { StackState } from "../../lib/stack-constants";
import type { VirtualFileTree } from "../../lib/virtual-fs"; // Import type only

type PreviewPanelProps = {
    stack: StackState;
    selectedFile: string | null;
    onSelectFile: (path: string) => void;
};

export function PreviewPanel({ stack, selectedFile, onSelectFile }: PreviewPanelProps) {
    const [tree, setTree] = useState<VirtualFileTree | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["/"]));
    const [fileContent, setFileContent] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    // Find file content in tree
    function findContent(node: VirtualFileTree, path: string): string | null {
        if (node.path === path && node.type === "file") return node.content || "";
        if (node.children) {
            for (const child of node.children) {
                const found = findContent(child, path);
                if (found !== null) return found;
            }
        }
        return null;
    }

    // Toggle directory expansion
    function toggleExpand(path: string) {
        const newExpanded = new Set(expandedPaths);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedPaths(newExpanded);
    }

    // Generate preview on stack change
    useEffect(() => {
        let mounted = true;

        async function generate() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(stack),
                });

                const data = await res.json();

                if (mounted) {
                    if (data.success && data.tree) {
                        setTree(data.tree);
                        // Expand root children by default
                        if (data.tree.children) {
                            const paths = new Set<string>(["/"]);
                            // Auto expand top level dirs
                            data.tree.children.forEach((c: any) => {
                                if (c.type === "directory") paths.add(c.path);
                            });
                            setExpandedPaths(paths);
                        }
                    } else {
                        setError(data.error || "Failed to generate preview");
                    }
                }
            } catch (e) {
                if (mounted) setError("Network error generating preview");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        // Debounce generation
        const timer = setTimeout(generate, 500);
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [stack]);

    // Update content when selection changes
    useEffect(() => {
        if (tree && selectedFile) {
            const content = findContent(tree, selectedFile);
            if (content !== null) setFileContent(content);
        }
    }, [selectedFile, tree]);

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center text-red-400">
                <div>
                    <p className="mb-2 font-medium">Preview Error</p>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            {/* File Explorer Sidebar */}
            <div className="w-64 shrink-0 border-r border-slate-800 bg-slate-900 overflow-auto">
                <div className="flex items-center justify-between border-b border-slate-800 p-3">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Explorer</span>
                    {loading && <Loader2 className="h-3 w-3 animate-spin text-purple-400" />}
                </div>

                {tree ? (
                    <FileExplorer
                        tree={tree}
                        selectedFile={selectedFile}
                        onSelect={onSelectFile}
                        expandedPaths={expandedPaths}
                        onToggleExpand={toggleExpand}
                    />
                ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                        Initializing...
                    </div>
                )}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 overflow-hidden">
                {selectedFile ? (
                    <CodeViewer content={fileContent} path={selectedFile} />
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        <div className="text-center">
                            <p>Select a file to view content</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
