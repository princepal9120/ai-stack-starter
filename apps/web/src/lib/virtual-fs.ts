import { Volume, createFsFromVolume } from "memfs";
import { join } from "pathe";

export type VirtualFile = {
    path: string;
    content: string;
};

export type VirtualFileTree = {
    name: string;
    type: "file" | "directory";
    path: string;
    children?: VirtualFileTree[];
    content?: string;
};

export class VirtualFileSystem {
    private vol: any;
    private fs: any;
    private root: string;

    constructor(root = "/app") {
        this.vol = Volume.fromJSON({});
        this.fs = createFsFromVolume(this.vol);
        this.root = root;
        this.fs.mkdirSync(root, { recursive: true });
    }

    write(path: string, content: string) {
        const fullPath = join(this.root, path);
        const dir = join(fullPath, "..");
        this.fs.mkdirSync(dir, { recursive: true });
        this.fs.writeFileSync(fullPath, content);
    }

    read(path: string): string {
        const fullPath = join(this.root, path);
        return this.fs.readFileSync(fullPath, "utf-8");
    }

    getTree(): VirtualFileTree {
        const buildTree = (path: string, name: string): VirtualFileTree => {
            const stats = this.fs.statSync(path);
            if (stats.isDirectory()) {
                const children = (this.fs.readdirSync(path) as string[])
                    .sort((a, b) => {
                        // Sort directories first, then files
                        const aStats = this.fs.statSync(join(path, a));
                        const bStats = this.fs.statSync(join(path, b));
                        if (aStats.isDirectory() && !bStats.isDirectory()) return -1;
                        if (!aStats.isDirectory() && bStats.isDirectory()) return 1;
                        return a.localeCompare(b);
                    })
                    .map((child) => buildTree(join(path, child), child));

                return {
                    name,
                    type: "directory",
                    path: path.replace(this.root, "") || "/",
                    children,
                };
            }
            return {
                name,
                type: "file",
                path: path.replace(this.root, ""),
                content: this.fs.readFileSync(path, "utf-8"),
            };
        };

        // Return contents of root, not the root directory itself as a single child
        const rootTree = buildTree(this.root, "root");
        return rootTree;
    }
}
