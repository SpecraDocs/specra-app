import { createReactBlockSpec } from "@blocknote/react";

export const TabGroup = createReactBlockSpec(
  {
    type: "tabGroup" as const,
    propSchema: {
      tabs: {
        default: "Tab 1,Tab 2",
      },
      activeTab: {
        default: "0",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const tabs = props.block.props.tabs.split(",").map((t) => t.trim());
      const activeIndex = parseInt(props.block.props.activeTab, 10) || 0;

      return (
        <div className="rounded-lg border border-border">
          <div className="flex border-b border-border">
            {tabs.map((tab, i) => (
              <button
                key={i}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  i === activeIndex
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  props.editor.updateBlock(props.block, {
                    props: { activeTab: String(i) },
                  });
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
