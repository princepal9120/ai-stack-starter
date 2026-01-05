"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { cn } from "../../lib/utils";

type TreeViewElement = {
    id: string;
    name: string;
    isSelectable?: boolean;
    children?: TreeViewElement[];
};

type TreeContextProps = {
    selectedId: string | undefined;
    expandedItems: string[] | undefined;
    indicator: boolean;
    handleExpand: (id: string) => void;
    selectItem: (id: string) => void;
    setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    openIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    direction: "rtl" | "ltr";
};

const TreeContext = createContext<TreeContextProps | null>(null);

const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error("useTree must be used within a TreeProvider");
    }
    return context;
};

type Direction = "rtl" | "ltr" | undefined;

type TreeViewProps = {
    initialSelectedId?: string;
    indicator?: boolean;
    elements?: TreeViewElement[];
    initialExpandedItems?: string[];
    openIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    dir?: Direction;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

function Tree({
    className,
    elements,
    initialSelectedId,
    initialExpandedItems,
    children,
    indicator = true,
    openIcon,
    closeIcon,
    dir,
    ...props
}: TreeViewProps) {
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(initialExpandedItems);

    const selectItem = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    const handleExpand = useCallback((id: string) => {
        setExpandedItems((prev) => {
            if (prev?.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            return [...(prev ?? []), id];
        });
    }, []);

    const expandSpecificTargetedElements = useCallback(
        (elements?: TreeViewElement[], selectId?: string) => {
            if (!elements || !selectId) return;
            const findParent = (currentElement: TreeViewElement, currentPath: string[] = []) => {
                const isSelectable = currentElement.isSelectable ?? true;
                const newPath = [...currentPath, currentElement.id];
                if (currentElement.id === selectId) {
                    if (isSelectable) {
                        setExpandedItems((prev) => [...(prev ?? []), ...newPath]);
                    } else {
                        if (newPath.includes(currentElement.id)) {
                            newPath.pop();
                            setExpandedItems((prev) => [...(prev ?? []), ...newPath]);
                        }
                    }
                    return;
                }
                if (isSelectable && currentElement.children && currentElement.children.length > 0) {
                    currentElement.children.forEach((child) => {
                        findParent(child, newPath);
                    });
                }
            };
            elements.forEach((element) => {
                findParent(element);
            });
        },
        [],
    );

    useEffect(() => {
        if (initialSelectedId) {
            expandSpecificTargetedElements(elements, initialSelectedId);
        }
    }, [initialSelectedId, elements, expandSpecificTargetedElements]);

    const direction = dir === "rtl" ? "rtl" : "ltr";

    return (
        <TreeContext.Provider
            value={{
                selectedId,
                expandedItems,
                handleExpand,
                selectItem,
                setExpandedItems,
                indicator,
                openIcon,
                closeIcon,
                direction,
            }}
        >
            <div className={cn("size-full", className)} {...props}>
                <ScrollArea className="relative h-full px-2">
                    <div className="flex flex-col gap-1">{children}</div>
                </ScrollArea>
            </div>
        </TreeContext.Provider>
    );
}

Tree.displayName = "Tree";

function TreeIndicator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { direction } = useTree();

    return (
        <div
            dir={direction}
            className={cn(
                "bg-muted absolute left-1.5 h-full w-px rounded-md py-3 duration-300 ease-in-out hover:bg-slate-300 rtl:right-1.5",
                className,
            )}
            {...props}
        />
    );
}

TreeIndicator.displayName = "TreeIndicator";

type FolderProps = {
    element?: string; // Made optional to support name prop
    name?: string; // Added alias for element
    value?: string; // Optional if derived from name
    isSelectable?: boolean;
    isSelect?: boolean;
    children?: React.ReactNode;
    defaultOpen?: boolean; // Custom prop for MDX usage convenience
} & React.HTMLAttributes<HTMLDivElement>;

function Folder({
    className,
    element,
    name,
    value,
    isSelectable = true,
    isSelect,
    children,
    defaultOpen,
    ...props
}: FolderProps) {
    const { handleExpand, expandedItems, indicator, openIcon, closeIcon, setExpandedItems } = useTree();

    const elName = name || element || "Folder";
    const val = value || elName;

    // Handle defaultOpen on mount
    useEffect(() => {
        if (defaultOpen && setExpandedItems) {
            setExpandedItems(prev => {
                if (!prev?.includes(val)) return [...(prev || []), val];
                return prev;
            });
        }
    }, [defaultOpen, val, setExpandedItems]);

    const isExpanded = expandedItems?.includes(val);

    return (
        <AccordionPrimitive.Root
            className="relative h-full overflow-hidden"
            value={isExpanded ? [val] : []}
            onValueChange={() => handleExpand(val)}
        >
            <AccordionPrimitive.Item value={val} {...props}>
                <AccordionPrimitive.Header>
                    <AccordionPrimitive.Trigger
                        className={cn(`flex items-center gap-1 rounded-md text-sm py-1 hover:bg-slate-800/50 w-full text-left transition-colors`, className, {
                            "bg-muted rounded-md": isSelect && isSelectable,
                            "cursor-pointer": isSelectable,
                            "cursor-not-allowed opacity-50": !isSelectable,
                        })}
                        disabled={!isSelectable}
                    >
                        {isExpanded
                            ? (openIcon ?? <FolderOpenIcon className="size-4 text-blue-400" />)
                            : (closeIcon ?? <FolderIcon className="size-4 text-blue-400" />)}
                        <span className="text-slate-300">{elName}</span>
                    </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Panel
                    className={cn(
                        "relative h-full overflow-hidden text-sm",
                        "data-[open]:animate-accordion-down data-[closed]:animate-accordion-up",
                    )}
                >
                    {elName && indicator && <TreeIndicator aria-hidden="true" className="bg-slate-800" />}
                    <div className="ml-5 flex flex-col gap-1 py-1 rtl:mr-5">{children}</div>
                </AccordionPrimitive.Panel>
            </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
    );
}

Folder.displayName = "Folder";

type FileProps = {
    value?: string;
    name?: string; // alias
    handleSelect?: (id: string) => void;
    isSelectable?: boolean;
    isSelect?: boolean;
    fileIcon?: React.ReactNode;
    children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function File({
    value,
    name,
    className,
    handleSelect: _handleSelect,
    isSelectable = true,
    isSelect,
    fileIcon,
    children,
    ...props
}: FileProps) {
    const { direction, selectedId, selectItem } = useTree();
    const val = value || name || "File";
    const isSelected = isSelect ?? selectedId === val;
    return (
        <button
            type="button"
            disabled={!isSelectable}
            className={cn(
                "flex w-full items-center gap-1 rounded-md pr-1 py-1 text-sm duration-200 ease-in-out rtl:pr-0 rtl:pl-1 hover:bg-slate-800/50",
                {
                    "bg-slate-800 text-white": isSelected && isSelectable,
                    "text-slate-400": !isSelected
                },
                isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                direction === "rtl" ? "rtl" : "ltr",
                className,
            )}
            onClick={() => selectItem(val)}
            {...props}
        >
            {fileIcon ?? <FileIcon className="size-4 text-slate-500" />}
            {children ?? <span className="truncate">{name}</span>}
        </button>
    );
}

File.displayName = "File";

// Files wrapper component for convenience
function Files({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("border border-slate-800 rounded-lg bg-slate-950/50 p-2 my-4", className)}>
            <Tree indicator={true}>
                {children}
            </Tree>
        </div>
    );
}

export { File, Folder, Tree, Files };
