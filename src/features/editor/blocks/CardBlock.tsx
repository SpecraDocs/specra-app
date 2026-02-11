import { createReactBlockSpec } from "@blocknote/react";
import { FileText } from "lucide-react";

export const Card = createReactBlockSpec(
  {
    type: "card" as const,
    propSchema: {
      title: {
        default: "Card Title",
      },
      href: {
        default: "",
      },
      icon: {
        default: "",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const title = props.block.props.title;

      return (
        <div className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/30">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{title}</span>
          </div>
          <div className="text-sm text-muted-foreground inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
