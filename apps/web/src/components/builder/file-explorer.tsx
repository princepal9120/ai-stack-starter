import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";
import { cn } from "../../lib/utils";
import type { VirtualFileTree } from "../../lib/virtual-fs";

type FileExplorerProps = {
    tree: VirtualFileTree;
    selectedFile: string | null;
    onSelect: (path: string) => void;
    expandedPaths?: Set<string>;
    onToggleExpand?: (path: string) => void;
};

export function FileExplorer({
    tree,
    selectedFile,
    onSelect,
    expandedPaths = new Set(),
    onToggleExpand,
}: FileExplorerProps) {
    return (
        <div className="w-full text-sm">
            <FileTreeNode
                node={tree}
                selectedFile={selectedFile}
                onSelect={onSelect}
                expandedPaths={expandedPaths}
                onToggleExpand={onToggleExpand}
                level={0}
            />
        </div>
    );
}

type FileTreeNodeProps = {
    node: VirtualFileTree;
    selectedFile: string | null;
    onSelect: (path: string) => void;
    expandedPaths: Set<string>;
    onToggleExpand?: (path: string) => void;
    level: number;
};

function FileTreeNode({
    node,
    selectedFile,
    onSelect,
    expandedPaths,
    onToggleExpand,
    level,
}: FileTreeNodeProps) {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedFile === node.path;

    const handleClick = () => {
        if (node.type === "directory") {
            onToggleExpand?.(node.path);
        } else {
            onSelect(node.path);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={cn(
                    "flex w-full items-center gap-1.5 py-1 px-2 hover:bg-slate-800 text-slate-300",
                    isSelected && "bg-slate-800 text-purple-300",
                    level > 0 && "pl-[calc(0.5rem+var(--level)*1rem)]"
                )}
                style={{ "--level": level } as React.CSSProperties}
            >
                <span className="shrink-0 opacity-70">
                    {node.type === "directory" ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : (
                        <span className="w-4" />
                    )}
                </span>

                <span className="shrink-0 text-slate-400">
                    {node.type === "directory" ? (
                        <Folder className="h-4 w-4 text-blue-400" />
                    ) : (
                        <File className="h-4 w-4" />
                    )}
                </span>

                <span className="truncate">{node.name}</span>
            </button>

            {node.type === "directory" && isExpanded && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            selectedFile={selectedFile}
                            onSelect={onSelect}
                            expandedPaths={expandedPaths}
                            onToggleExpand={onToggleExpand}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
