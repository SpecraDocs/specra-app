import { createReactBlockSpec } from "@blocknote/react";

export const CardGrid = createReactBlockSpec(
  {
    type: "cardGrid" as const,
    propSchema: {
      cols: {
        default: "2",
        values: ["2", "3", "4"] as const,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const cols = props.block.props.cols;
      const gridClass =
        cols === "3"
          ? "grid-cols-3"
          : cols === "4"
            ? "grid-cols-4"
            : "grid-cols-2";

      return (
        <div className={`grid gap-4 ${gridClass}`}>
          <div className="inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
