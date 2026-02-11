import type { Document } from "@/features/documents/store/document-store";
import type { Workspace } from "@/features/workspace/store/workspace-store";
import { blocksToMdx, generateFrontmatter } from "./mdx-converter";

export interface GeneratedFile {
  path: string;
  content: string;
}

interface ProjectConfig {
  siteName: string;
  version: string;
  themeColor?: string;
}

export function generateProject(
  workspace: Workspace,
  documents: Document[],
  config: ProjectConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // package.json
  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: workspace.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "latest",
          react: "latest",
          "react-dom": "latest",
          "@specra/sdk": "latest",
        },
      },
      null,
      2
    ),
  });

  // specra.config.json
  files.push({
    path: "specra.config.json",
    content: JSON.stringify(
      {
        name: config.siteName || workspace.name,
        version: config.version || "v1.0.0",
        theme: {
          primaryColor: config.themeColor || "#6d28d9",
        },
      },
      null,
      2
    ),
  });

  // next.config.mjs
  files.push({
    path: "next.config.mjs",
    content: `import { createSpecraConfig } from '@specra/sdk/config'\n\nexport default createSpecraConfig({})\n`,
  });

  // postcss.config.mjs
  files.push({
    path: "postcss.config.mjs",
    content: `export default {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n`,
  });

  // tsconfig.json
  files.push({
    path: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: false,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
        },
        include: ["**/*.ts", "**/*.tsx", "**/*.mdx"],
        exclude: ["node_modules"],
      },
      null,
      2
    ),
  });

  // Generate docs from document tree
  const version = config.version || "v1.0.0";
  const docsDir = `docs/${version}`;

  // Build a tree structure for proper folder handling
  const rootDocs = documents.filter((d) => d.parent_id === null);
  generateDocsRecursive(rootDocs, documents, docsDir, files);

  return files;
}

function generateDocsRecursive(
  docs: Document[],
  allDocs: Document[],
  basePath: string,
  files: GeneratedFile[]
) {
  for (const doc of docs) {
    const children = allDocs.filter((d) => d.parent_id === doc.id);
    const slug = doc.slug || slugify(doc.title);

    if (doc.is_folder || children.length > 0) {
      // This is a folder - create _category_.json and index
      const folderPath = `${basePath}/${slug}`;

      files.push({
        path: `${folderPath}/_category_.json`,
        content: JSON.stringify(
          {
            label: doc.folder_label || doc.title,
            position: doc.sidebar_position ?? 0,
          },
          null,
          2
        ),
      });

      // Generate the folder's own content as index.mdx
      const mdxContent = generateMdxForDoc(doc);
      if (mdxContent.trim()) {
        files.push({
          path: `${folderPath}/index.mdx`,
          content: mdxContent,
        });
      }

      // Recurse into children
      generateDocsRecursive(children, allDocs, folderPath, files);
    } else {
      // This is a regular page
      const mdxContent = generateMdxForDoc(doc);
      files.push({
        path: `${basePath}/${slug}.mdx`,
        content: mdxContent,
      });
    }
  }
}

function generateMdxForDoc(doc: Document): string {
  const frontmatter = generateFrontmatter({
    title: doc.title,
    description: doc.description,
    sidebar_position: doc.sidebar_position,
    tags: doc.tags,
    draft: doc.draft,
  });

  let blocks: unknown[] = [];
  try {
    blocks = JSON.parse(doc.content);
  } catch {
    blocks = [];
  }

  const body = blocksToMdx(blocks as Parameters<typeof blocksToMdx>[0]);
  return `${frontmatter}\n\n${body}\n`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "untitled";
}
