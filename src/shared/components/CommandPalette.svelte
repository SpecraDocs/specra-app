<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { navigate } from "@/lib/router";
  import {
    commandPaletteOpen,
    setCommandPaletteOpen,
    theme,
    setTheme,
    sidebarOpen,
    toggleSidebar,
  } from "@/shared/store/ui-store";
  import { documents } from "@/features/documents/store/document-store";
  import { activeWorkspaceId } from "@/features/workspace/store/workspace-store";
  import * as db from "@/lib/tauri/database";
  import {
    FileText,
    Plus,
    Upload,
    Settings,
    Sun,
    Moon,
    Monitor,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
  } from "lucide-svelte";

  let query = "";
  let selectedIndex = 0;
  let inputRef: HTMLInputElement;

  // All available items
  interface CommandItem {
    id: string;
    label: string;
    group: string;
    icon: typeof FileText;
    value: string;
  }

  $: actionItems = [
    { id: "new-doc", label: "New Document", group: "Actions", icon: Plus, value: "new-doc" },
    { id: "settings", label: "Open Settings", group: "Actions", icon: Settings, value: "settings" },
    { id: "projects", label: "View Projects", group: "Actions", icon: Upload, value: "projects" },
    { id: "toggle-sidebar", label: "Toggle Sidebar", group: "Actions", icon: $sidebarOpen ? PanelLeftClose : PanelLeftOpen, value: "toggle-sidebar" },
  ] as CommandItem[];

  $: themeItems = [
    { id: "theme-light", label: "Light Theme", group: "Theme", icon: Sun, value: "theme-light" },
    { id: "theme-dark", label: "Dark Theme", group: "Theme", icon: Moon, value: "theme-dark" },
    { id: "theme-system", label: "System Theme", group: "Theme", icon: Monitor, value: "theme-system" },
  ] as CommandItem[];

  $: docItems = $documents.map((doc) => ({
    id: `doc:${doc.id}`,
    label: doc.title,
    group: "Documents",
    icon: FileText,
    value: `doc:${doc.id}`,
  })) as CommandItem[];

  $: allItems = [...docItems, ...actionItems, ...themeItems];

  $: filteredItems = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  $: groups = filteredItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  $: groupOrder = ["Documents", "Actions", "Theme"].filter((g) => groups[g]);

  // Reset selectedIndex when filtered items change
  $: if (filteredItems) {
    selectedIndex = 0;
  }

  function handleSelect(value: string) {
    setCommandPaletteOpen(false);
    query = "";

    if (value.startsWith("doc:")) {
      navigate(`/workspace/${value.replace("doc:", "")}`);
    } else if (value === "new-doc") {
      if ($activeWorkspaceId) {
        const id = crypto.randomUUID();
        db.createDocument(id, $activeWorkspaceId, "Untitled").then(() => {
          navigate(`/workspace/${id}`);
        });
      }
    } else if (value === "settings") {
      navigate("/settings");
    } else if (value === "projects") {
      navigate("/projects");
    } else if (value === "theme-light") {
      setTheme("light");
    } else if (value === "theme-dark") {
      setTheme("dark");
    } else if (value === "theme-system") {
      setTheme("system");
    } else if (value === "toggle-sidebar") {
      toggleSidebar();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setCommandPaletteOpen(!$commandPaletteOpen);
      return;
    }

    if (!$commandPaletteOpen) return;

    if (e.key === "Escape") {
      setCommandPaletteOpen(false);
      query = "";
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredItems.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].value);
      }
    }
  }

  // Focus input when palette opens
  $: if ($commandPaletteOpen) {
    tick().then(() => {
      inputRef?.focus();
    });
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
</script>

{#if $commandPaletteOpen}
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50"
      on:click={() => { setCommandPaletteOpen(false); query = ""; }}
      on:keydown={(e) => e.key === "Escape" && setCommandPaletteOpen(false)}
      role="button"
      tabindex="-1"
    />

    <!-- Palette -->
    <div class="relative w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl">
      <div class="flex items-center gap-2 border-b border-border px-3">
        <Search class="h-4 w-4 text-muted-foreground" />
        <input
          bind:this={inputRef}
          bind:value={query}
          class="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search documents, actions..."
        />
      </div>
      <div class="max-h-80 overflow-auto p-2">
        {#if filteredItems.length === 0}
          <div class="px-4 py-8 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        {:else}
          {#each groupOrder as groupName}
            <div class="mb-1">
              <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {groupName}
              </div>
              {#each groups[groupName] as item, i}
                {@const globalIndex = filteredItems.indexOf(item)}
                <button
                  class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm {globalIndex === selectedIndex ? 'bg-accent' : ''}"
                  on:click={() => handleSelect(item.value)}
                  on:mouseenter={() => (selectedIndex = globalIndex)}
                >
                  <svelte:component this={item.icon} class="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </button>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
