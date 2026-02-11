import type { SpecraSchema } from "./editor-schema";
import type { BlockNoteEditor } from "@blocknote/core";

export function getCustomSlashMenuItems(
  editor: BlockNoteEditor<typeof import("./editor-schema").schema.blockSchema, typeof import("./editor-schema").schema.inlineContentSchema, typeof import("./editor-schema").schema.styleSchema>
) {
  return [
    {
      title: "Callout",
      subtext: "Add a callout box (info, warning, tip, error)",
      group: "Specra",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "callout" as keyof typeof editor.schema.blockSchema, props: { type: "info" } as Record<string, string> }],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["callout", "note", "info", "warning", "tip"],
    },
    {
      title: "Tabs",
      subtext: "Add a tab group",
      group: "Spectra",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "tabGroup" as keyof typeof editor.schema.blockSchema, props: { tabs: "Tab 1,Tab 2" } as Record<string, string> }],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["tabs", "tab"],
    },
    {
      title: "Steps",
      subtext: "Add a step-by-step guide",
      group: "Specra",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "steps" as keyof typeof editor.schema.blockSchema, props: { stepNumber: "1", title: "Step 1" } as Record<string, string> }],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["steps", "step", "guide"],
    },
    {
      title: "Card",
      subtext: "Add a card",
      group: "Specra",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "card" as keyof typeof editor.schema.blockSchema, props: { title: "Card Title" } as Record<string, string> }],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["card"],
    },
    {
      title: "Card Grid",
      subtext: "Add a grid of cards",
      group: "Specra",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "cardGrid" as keyof typeof editor.schema.blockSchema, props: { cols: "2" } as Record<string, string> }],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["card-grid", "grid"],
    },
  ];
}
