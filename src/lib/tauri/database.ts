import Database from "@tauri-apps/plugin-sql";
import type { Document } from "@/features/documents/store/document-store";
import type { Workspace } from "@/features/workspace/store/workspace-store";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:specra.db");
    await runMigrations(db);
  }
  return db;
}

async function runMigrations(database: Database) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      remote_project_id TEXT,
      remote_org_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      parent_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      title TEXT NOT NULL DEFAULT 'Untitled',
      icon TEXT,
      cover_image TEXT,
      content TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      sidebar_position INTEGER,
      tags TEXT,
      draft INTEGER DEFAULT 0,
      slug TEXT,
      is_folder INTEGER DEFAULT 0,
      folder_label TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_published_at TEXT,
      content_hash TEXT
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS auth (
      id TEXT PRIMARY KEY DEFAULT 'default',
      api_token TEXT,
      api_url TEXT DEFAULT 'https://specra-docs.com',
      user_id TEXT,
      user_email TEXT,
      user_name TEXT,
      user_image TEXT,
      logged_in_at TEXT
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS publish_log (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id),
      project_id TEXT NOT NULL,
      deployment_id TEXT,
      status TEXT DEFAULT 'pending',
      documents_count INTEGER DEFAULT 0,
      archive_size INTEGER,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

// ---- Workspace CRUD ----

export async function createWorkspace(
  id: string,
  name: string,
  icon?: string
): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT INTO workspaces (id, name, icon) VALUES ($1, $2, $3)",
    [id, name, icon ?? null]
  );
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const database = await getDb();
  return database.select("SELECT * FROM workspaces ORDER BY created_at ASC");
}

export async function updateWorkspace(
  id: string,
  updates: { name?: string; icon?: string; remote_project_id?: string; remote_org_id?: string }
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(updates.name);
  }
  if (updates.icon !== undefined) {
    fields.push(`icon = $${idx++}`);
    values.push(updates.icon);
  }
  if (updates.remote_project_id !== undefined) {
    fields.push(`remote_project_id = $${idx++}`);
    values.push(updates.remote_project_id);
  }
  if (updates.remote_org_id !== undefined) {
    fields.push(`remote_org_id = $${idx++}`);
    values.push(updates.remote_org_id);
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = datetime('now')`);
  values.push(id);

  await database.execute(
    `UPDATE workspaces SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );
}

export async function deleteWorkspace(id: string): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM workspaces WHERE id = $1", [id]);
}

// ---- Document CRUD ----

export async function createDocument(
  id: string,
  workspaceId: string,
  title: string,
  parentId: string | null = null,
  isFolder: boolean = false
): Promise<void> {
  const database = await getDb();

  // Get next sidebar_position
  const result: { max_pos: number | null }[] = await database.select(
    "SELECT MAX(sidebar_position) as max_pos FROM documents WHERE workspace_id = $1 AND parent_id IS $2",
    [workspaceId, parentId]
  );
  const nextPos = (result[0]?.max_pos ?? -1) + 1;

  await database.execute(
    `INSERT INTO documents (id, workspace_id, parent_id, title, sidebar_position, is_folder)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, workspaceId, parentId, title, nextPos, isFolder ? 1 : 0]
  );
}

export async function getDocument(id: string): Promise<Document | null> {
  const database = await getDb();
  const rows: RawDocument[] = await database.select(
    "SELECT * FROM documents WHERE id = $1",
    [id]
  );
  if (rows.length === 0) return null;
  return mapDocument(rows[0]);
}

interface RawDocument {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  title: string;
  icon: string | null;
  cover_image: string | null;
  content: string;
  description: string | null;
  sidebar_position: number | null;
  tags: string | null;
  draft: number;
  slug: string | null;
  is_folder: number;
  folder_label: string | null;
  created_at: string;
  updated_at: string;
  last_published_at: string | null;
  content_hash: string | null;
}

function mapDocument(raw: RawDocument): Document {
  return {
    ...raw,
    icon: raw.icon ?? undefined,
    cover_image: raw.cover_image ?? undefined,
    description: raw.description ?? undefined,
    sidebar_position: raw.sidebar_position ?? undefined,
    tags: raw.tags ?? undefined,
    draft: raw.draft === 1,
    slug: raw.slug ?? undefined,
    is_folder: raw.is_folder === 1,
    folder_label: raw.folder_label ?? undefined,
    last_published_at: raw.last_published_at ?? undefined,
    content_hash: raw.content_hash ?? undefined,
  };
}

export async function listDocuments(workspaceId: string): Promise<Document[]> {
  const database = await getDb();
  const rows: RawDocument[] = await database.select(
    "SELECT * FROM documents WHERE workspace_id = $1 ORDER BY sidebar_position ASC",
    [workspaceId]
  );
  return rows.map(mapDocument);
}

export async function updateDocument(
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    description: string;
    sidebar_position: number;
    tags: string;
    draft: boolean;
    slug: string;
    icon: string;
    cover_image: string;
    parent_id: string | null;
    is_folder: boolean;
    folder_label: string;
    content_hash: string;
    last_published_at: string;
  }>
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    if (key === "draft" || key === "is_folder") {
      fields.push(`${key} = $${idx++}`);
      values.push(value ? 1 : 0);
    } else {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = datetime('now')`);
  values.push(id);

  await database.execute(
    `UPDATE documents SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );
}

export async function deleteDocument(id: string): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM documents WHERE id = $1", [id]);
}

export async function moveDocument(
  id: string,
  newParentId: string | null,
  newPosition: number
): Promise<void> {
  const database = await getDb();
  await database.execute(
    `UPDATE documents SET parent_id = $1, sidebar_position = $2, updated_at = datetime('now') WHERE id = $3`,
    [newParentId, newPosition, id]
  );
}

export async function reorderDocuments(
  orderedIds: string[]
): Promise<void> {
  const database = await getDb();
  for (let i = 0; i < orderedIds.length; i++) {
    await database.execute(
      `UPDATE documents SET sidebar_position = $1, updated_at = datetime('now') WHERE id = $2`,
      [i, orderedIds[i]]
    );
  }
}

// ---- Auth ----

export interface AuthRow {
  id: string;
  api_token: string | null;
  api_url: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  user_image: string | null;
  logged_in_at: string | null;
}

export async function getAuth(): Promise<AuthRow | null> {
  const database = await getDb();
  const rows: AuthRow[] = await database.select(
    "SELECT * FROM auth WHERE id = 'default'"
  );
  return rows[0] ?? null;
}

export async function saveAuth(auth: Omit<AuthRow, "id">): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT OR REPLACE INTO auth (id, api_token, api_url, user_id, user_email, user_name, user_image, logged_in_at)
     VALUES ('default', $1, $2, $3, $4, $5, $6, $7)`,
    [
      auth.api_token,
      auth.api_url,
      auth.user_id,
      auth.user_email,
      auth.user_name,
      auth.user_image,
      auth.logged_in_at,
    ]
  );
}

export async function clearAuthToken(): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE auth SET api_token = NULL, user_id = NULL, user_email = NULL, user_name = NULL, user_image = NULL, logged_in_at = NULL WHERE id = 'default'"
  );
}

// ---- Settings ----

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDb();
  const rows: { value: string }[] = await database.select(
    "SELECT value FROM settings WHERE key = $1",
    [key]
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
    [key, value]
  );
}

// ---- Publish Log ----

export async function createPublishLog(
  id: string,
  workspaceId: string,
  projectId: string,
  documentsCount: number
): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT INTO publish_log (id, workspace_id, project_id, documents_count)
     VALUES ($1, $2, $3, $4)`,
    [id, workspaceId, projectId, documentsCount]
  );
}

export async function updatePublishLog(
  id: string,
  updates: Partial<{
    deployment_id: string;
    status: string;
    archive_size: number;
    error_message: string;
  }>
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) return;
  values.push(id);

  await database.execute(
    `UPDATE publish_log SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );
}
