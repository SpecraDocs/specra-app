# Specra App

Desktop documentation editor built with **Svelte** + **Tauri v2**.

## Tech Stack

- **Frontend:** Svelte 5, Vite, Tailwind CSS v4
- **Desktop:** Tauri v2 (Rust backend)
- **Storage:** SQLite via `@tauri-apps/plugin-sql`
- **Icons:** lucide-svelte
- **Routing:** Hash-based SPA router (custom)

## Project Structure

```
src/
├── App.svelte                  # Root component (theme, routing)
├── main.ts                     # Entry point
├── globals.css                 # Tailwind styles
├── lib/
│   ├── router.ts               # Hash-based SPA router
│   ├── api/                    # Remote API client
│   └── tauri/                  # Tauri database bindings
├── layouts/
│   ├── AppLayout.svelte        # Main layout (sidebar + content)
│   ├── ActivityBar.svelte      # Left icon bar
│   ├── Sidebar.svelte          # Contextual sidebar
│   └── Router.svelte           # Route matching
├── features/
│   ├── auth/                   # Login, token, user menu
│   ├── documents/              # Document tree sidebar
│   ├── editor/                 # Editor page + metadata panel
│   ├── workspace/              # Workspace + onboarding
│   ├── publishing/             # Publish panel + deployment
│   ├── projects/               # Project management
│   ├── settings/               # App settings
│   └── collaboration/          # Orgs, members, invites
└── shared/
    ├── components/             # CommandPalette
    ├── store/                  # UI store (theme, sidebar)
    ├── hooks/                  # Keyboard shortcuts, debounce
    └── utils/                  # cn() utility
```

## Development

```bash
# Install dependencies
npm install

# Run in development (opens Tauri window)
npm run tauri dev

# Type-check Svelte files
npm run check

# Build for production
npm run tauri build
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
